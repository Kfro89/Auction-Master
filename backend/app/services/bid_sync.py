from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..models import AuctionHouse, Item, Setting, UserBidActivity
from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from ..scrapers.govdeals import GovDealsScraper
from .security import decrypt_value
from .valuation_worker import valuate_item_background
import logging

logger = logging.getLogger(__name__)

async def sync_active_bids(db: Session):
    """
    Independent service to synchronize user's active bids across all platforms.
    Definitive source of truth for is_user_bidding and UserBidActivity.
    """
    platforms = [
        ("rmeb", "https://www.whitleyauction.com", "Whitley Auction", AuctioneerSoftwareScraper),
        ("rol", "https://bid.rollerauction.com", "Roller Auction", AuctioneerSoftwareScraper),
        ("public_surplus", "https://www.publicsurplus.com", "Public Surplus", PublicSurplusScraper),
        ("dickensheet", "https://bid.dickensheet.com", "Dickensheet", BidWranglerApiScraper),
        ("govdeals", "https://www.govdeals.com", "GovDeals", GovDealsScraper),
    ]

    results = {}

    for website_key, base_url, name, scraper_class in platforms:
        try:
            # 1. Get Credentials
            cookie_setting = db.query(Setting).filter(Setting.key == f"{website_key}_cookie").first()
            if not cookie_setting or not cookie_setting.value:
                results[website_key] = {"status": "skipped", "reason": "no credentials"}
                continue

            session_cookie = decrypt_value(cookie_setting.value)
            
            if scraper_class == AuctioneerSoftwareScraper:
                scraper = scraper_class(base_url=base_url, website_key=website_key)
            elif scraper_class == BidWranglerApiScraper:
                scraper = scraper_class(base_url=base_url)
            else:
                scraper = scraper_class(zip_code="00000", radius="0")
            
            # 2. Login
            await scraper.login(username="", session_cookie=session_cookie)
            
            # 3. Identify user bidder IDs (for platforms that use IDs instead of just session state)
            user_bidder_ids = []
            bidder_setting = db.query(Setting).filter(Setting.key == f"{website_key}_bidder_id").first()
            if bidder_setting and bidder_setting.value: 
                user_bidder_ids.append(str(bidder_setting.value))
            
            if hasattr(scraper, "fetch_my_bidder_id"):
                my_bidder_id = await scraper.fetch_my_bidder_id()
                if my_bidder_id and str(my_bidder_id) not in user_bidder_ids: 
                    user_bidder_ids.append(str(my_bidder_id))

            house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
            if not house: 
                logger.warning(f"AuctionHouse {website_key} not found in database.")
                continue

            # 4. Fetch Active Bids
            if not hasattr(scraper, "fetch_my_bids"):
                logger.warning(f"Scraper {name} does not implement fetch_my_bids. Skipping sync.")
                results[website_key] = {"status": "skipped", "reason": "not implemented"}
                continue

            # Check if GovDeals and pass buyer_id
            if website_key == "govdeals":
                b_id = user_bidder_ids[0] if user_bidder_ids else None
                my_bids = await scraper.fetch_my_bids(buyer_id=b_id)
            else:
                my_bids = await scraper.fetch_my_bids()

            seen_ext_ids = set()
            updated_count = 0
            
            for bid in my_bids:
                bid_id = str(bid["id"])
                seen_ext_ids.add(bid_id)
                
                item = db.query(Item).filter(Item.external_id == bid_id, Item.auction_house_id == house.id).first()
                
                if not item:
                    # AUTO-INGEST MISSING ITEM
                    logger.info(f"BidSync: Auto-ingesting missing item {bid_id} from {name}")
                    details = None
                    if hasattr(scraper, "fetch_item_details"):
                        details = await scraper.fetch_item_details(bid_id)
                    
                    if details:
                        item = Item(
                            auction_house_id=house.id,
                            external_id=bid_id,
                            title=details.get("title", bid.get("title", "Unknown Item")),
                            description=details.get("description", ""),
                            current_bid=bid["current_bid"],
                            end_time=datetime.fromisoformat(bid["end_time"]) if bid.get("end_time") else None,
                            status="open",
                            image_url=details["images"][0] if details.get("images") else None,
                            images=details.get("images", []),
                            url=f"{base_url}/sms/auction/view?auc={bid_id}" if website_key == "public_surplus" else None,
                            first_seen_at=datetime.now(timezone.utc),
                            last_seen_at=datetime.now(timezone.utc),
                            is_user_bidding=True,
                            processing_status="pending_enrichment"
                        )
                    else:
                        # Minimal stub
                        item = Item(
                            auction_house_id=house.id,
                            external_id=bid_id,
                            title=bid.get("title", "Unknown Item"),
                            current_bid=bid["current_bid"],
                            end_time=datetime.fromisoformat(bid["end_time"]) if bid.get("end_time") else None,
                            status="open",
                            first_seen_at=datetime.now(timezone.utc),
                            last_seen_at=datetime.now(timezone.utc),
                            is_user_bidding=True,
                            processing_status="pending_enrichment"
                        )
                    db.add(item)
                    db.flush() # Ensure we have item.id
                
                # Update Item state
                item.is_user_bidding = True
                item.status = bid.get("status", "open")
                item.current_bid = bid["current_bid"]
                if bid.get("end_time"):
                    try:
                        item.end_time = datetime.fromisoformat(bid["end_time"])
                    except:
                        pass
                
                # Update UserBidActivity
                bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
                if not bid_activity:
                    bid_activity = UserBidActivity(item_id=item.id)
                    db.add(bid_activity)
                
                bid_activity.current_bid_amount = bid["current_bid"]
                bid_activity.user_bid_amount = bid["user_bid"]
                bid_activity.user_proxy_bid = bid["proxy_bid"]
                
                if "user_bid_status" in bid:
                    bid_activity.user_bid_status = bid["user_bid_status"]
                else:
                    bid_activity.user_bid_status = "winning" if bid["user_bid"] >= bid["current_bid"] else "outbid"
                
                updated_count += 1

            db.commit()
            
            # 5. Cleanup: Mark items as closed if they are no longer in the active bids list
            # ONLY for items we were previously bidding on
            closed_count = db.query(Item).filter(
                Item.auction_house_id == house.id,
                Item.is_user_bidding == True,
                Item.status == "open",
                ~Item.external_id.in_(seen_ext_ids)
            ).update({"status": "closed"}, synchronize_session=False)
            
            db.commit()
            results[website_key] = {"status": "success", "updated": updated_count, "closed": closed_count}
            
            if hasattr(scraper, "close"):
                await scraper.close()

        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing bids for {name}: {e}")
            results[website_key] = {"status": "error", "message": str(e)}

    return results
