from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..models import AuctionHouse, BidItem, Setting
from ..scrapers.whitley_auction import WhitleyAuctionScraper
from ..scrapers.roller_auction import RollerAuctionScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from ..scrapers.govdeals import GovDealsScraper
from .security import decrypt_value
from .llm import generate_valuation_data
import logging

logger = logging.getLogger(__name__)

PLATFORMS = [
    ("rmeb", "https://www.whitleyauction.com", "Whitley Auction", WhitleyAuctionScraper),
    ("rol", "https://bid.rollerauction.com", "Roller Auction", RollerAuctionScraper),
    ("public_surplus", "https://www.publicsurplus.com", "Public Surplus", PublicSurplusScraper),
    ("dickensheet", "https://bid.dickensheet.com", "Dickensheet", BidWranglerApiScraper),
    ("govdeals", "https://www.govdeals.com", "GovDeals", GovDealsScraper),
]

async def sync_active_bids(db: Session):
    """
    Independent service to synchronize user's active bids across all platforms.
    Writes to BidItem model.
    """
    results = {}

    for website_key, base_url, name, scraper_class in PLATFORMS:
        try:
            # 1. Get Credentials
            cookie_setting = db.query(Setting).filter(Setting.key == f"{website_key}_cookie").first()
            if not cookie_setting or not cookie_setting.value:
                results[website_key] = {"status": "skipped", "reason": "no credentials"}
                continue

            session_cookie = decrypt_value(cookie_setting.value)
            
            if scraper_class in [WhitleyAuctionScraper, RollerAuctionScraper]:
                scraper = scraper_class(base_url=base_url, website_key=website_key)
            elif scraper_class == BidWranglerApiScraper:
                scraper = scraper_class(base_url=base_url)
            else:
                scraper = scraper_class(zip_code="00000", radius="0")
            
            # 2. Login
            await scraper.login(username="", session_cookie=session_cookie)
            
            # 3. Identify user bidder IDs
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

            if website_key == "govdeals":
                b_id = user_bidder_ids[0] if user_bidder_ids else None
                my_bids = await scraper.fetch_my_bids(buyer_id=b_id)
            else:
                my_bids = await scraper.fetch_my_bids()

            seen_ext_ids = set()
            updated_count = 0
            
            for bid in my_bids:
                bid_id = bid.id
                seen_ext_ids.add(bid_id)
                
                item = db.query(BidItem).filter(BidItem.external_id == bid_id, BidItem.auction_house_id == house.id).first()
                
                if not item:
                    # AUTO-INGEST MISSING BID ITEM
                    logger.info(f"BiddingService: Auto-ingesting missing bid item {bid_id} from {name}")
                    details = None
                    if hasattr(scraper, "fetch_item_details"):
                        details = await scraper.fetch_item_details(bid_id)
                    
                    if details:
                        item = BidItem(
                            auction_house_id=house.id,
                            external_id=bid_id,
                            title=details.get("title") or bid.title or "Unknown Item",
                            description=details.get("description", ""),
                            current_bid_amount=bid.current_bid,
                            user_bid_amount=bid.user_bid,
                            user_proxy_bid=bid.proxy_bid,
                            user_bid_status=bid.user_bid_status,
                            end_time=bid.end_time,
                            image_url=details["images"][0] if details.get("images") else None,
                            images=details.get("images", []),
                            url=f"{base_url}/sms/auction/view?auc={bid_id}" if website_key == "public_surplus" else None,
                            processing_status="pending_enrichment"
                        )
                    else:
                        # Minimal stub
                        item = BidItem(
                            auction_house_id=house.id,
                            external_id=bid_id,
                            title=bid.title or "Unknown Item",
                            current_bid_amount=bid.current_bid,
                            user_bid_amount=bid.user_bid,
                            user_proxy_bid=bid.proxy_bid,
                            user_bid_status=bid.user_bid_status,
                            end_time=bid.end_time,
                            processing_status="pending_enrichment"
                        )
                    db.add(item)
                    db.flush()
                
                # Update BidItem state
                item.user_bid_status = bid.user_bid_status
                item.current_bid_amount = bid.current_bid
                item.user_bid_amount = bid.user_bid
                item.user_proxy_bid = bid.proxy_bid
                item.end_time = bid.end_time
                
                if bid.title and (not item.title or item.title == "Unknown" or len(bid.title) > len(item.title)):
                    item.title = bid.title
                
                # Inline LLM extraction if product_name is missing
                should_extract = not item.product_name or item.product_name == item.title
                if not should_extract and item.product_name:
                    p_name_lower = item.product_name.lower()
                    if len(item.product_name) > 70:
                        should_extract = True
                    elif "lot " in p_name_lower or "lot #" in p_name_lower:
                        should_extract = True
                
                if should_extract:
                    logger.info(f"BiddingService: Running inline LLM extraction for bid item {item.id}")
                    raw_category = f"Category {item.category}" if item.category else "Unknown"
                    try:
                        extraction_title = bid.title or item.title
                        classification = await generate_valuation_data(
                            extraction_title,
                            item.description or "",
                            raw_category,
                            image_url=item.image_url
                        )
                        item.category = f"{classification.get('category', 'Unknown')} > {classification.get('type', 'General')}"
                        item.product_name = classification.get("product_name", "")
                        item.condition = classification.get("condition", "Unknown")
                        item.brand = classification.get("brand", "")
                        item.tags = classification.get("tags", {})
                        item.search_queries = classification.get("search_queries", [])
                        item.normalized_condition_id = classification.get("normalized_condition_id", "3000")
                        item.processing_status = "pending_valuation"
                        db.commit()
                    except Exception as e:
                        db.rollback()
                        logger.error(f"BiddingService: Inline LLM extraction failed for bid item {item.id}: {e}")
                
                updated_count += 1

            db.commit()
            
            # 5. Cleanup: Mark as lost if they disappeared from active bids list and ended
            now = datetime.now(timezone.utc)
            orphaned_items = db.query(BidItem).filter(
                BidItem.auction_house_id == house.id,
                BidItem.user_bid_status == "winning",
                BidItem.end_time <= now,
                ~BidItem.external_id.in_(seen_ext_ids)
            ).all()
            
            for item in orphaned_items:
                item.user_bid_status = "lost"
            
            db.commit()
            results[website_key] = {"status": "success", "updated": updated_count, "lost_orphans": len(orphaned_items)}
            
            if hasattr(scraper, "close"):
                await scraper.close()

        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing bids for {name}: {e}")
            results[website_key] = {"status": "error", "message": str(e)}

    return results
