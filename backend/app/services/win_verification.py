import logging
import datetime
from sqlalchemy.orm import Session
from ..models import BidItem, AuctionHouse, Setting
from ..scrapers.whitley_auction import WhitleyAuctionScraper
from ..scrapers.roller_auction import RollerAuctionScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from ..scrapers.govdeals import GovDealsScraper
from .security import decrypt_value

logger = logging.getLogger(__name__)

async def verify_and_migrate_wins(db: Session):
    """
    Service to definitively verify wins for closed auctions.
    Updates BidItem status. Handover to Work Queue is now a manual 'Claim' action.
    """
    platforms = [
        ("rmeb", "https://www.whitleyauction.com", "Whitley Auction", WhitleyAuctionScraper),
        ("rol", "https://bid.rollerauction.com", "Roller Auction", RollerAuctionScraper),
        ("public_surplus", "https://www.publicsurplus.com", "Public Surplus", PublicSurplusScraper),
        ("dickensheet", "https://bid.dickensheet.com", "Dickensheet", BidWranglerApiScraper),
        ("govdeals", "https://www.govdeals.com", "GovDeals", GovDealsScraper),
    ]

    now = datetime.datetime.now(datetime.timezone.utc)
    results = {}

    for website_key, base_url, name, scraper_class in platforms:
        try:
            house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
            if not house:
                continue

            # Only check items that have ended and are not yet finalized as 'won' or 'lost'
            potential_items = db.query(BidItem).filter(
                BidItem.auction_house_id == house.id,
                ~BidItem.user_bid_status.in_(["won", "lost"]),
                BidItem.end_time <= now
            ).all()

            if not potential_items:
                continue

            logger.info(f"WinVerification: Checking {len(potential_items)} ended bid items for {name}...")

            cookie_setting = db.query(Setting).filter(Setting.key == f"{website_key}_cookie").first()
            if not cookie_setting or not cookie_setting.value:
                continue

            session_cookie = decrypt_value(cookie_setting.value)
            
            if scraper_class in [WhitleyAuctionScraper, RollerAuctionScraper]:
                scraper = scraper_class(base_url=base_url, website_key=website_key)
            elif scraper_class == BidWranglerApiScraper:
                scraper = scraper_class(base_url=base_url)
            else:
                scraper = scraper_class(zip_code="00000", radius="0")
            
            await scraper.login(username="", session_cookie=session_cookie)
            
            buyer_id = None
            bidder_setting = db.query(Setting).filter(Setting.key == f"{website_key}_bidder_id").first()
            if bidder_setting and bidder_setting.value:
                buyer_id = str(bidder_setting.value)

            closed_bids = await scraper.fetch_closed_bids(buyer_id=buyer_id)
            closed_bids_map = {str(bid.id): bid for bid in closed_bids}

            updated_count = 0
            for item in potential_items:
                if item.external_id in closed_bids_map:
                    definitive_bid = closed_bids_map[item.external_id]
                    item.user_bid_status = definitive_bid.user_bid_status
                    if definitive_bid.current_bid:
                        item.current_bid_amount = definitive_bid.current_bid
                    updated_count += 1

            db.commit()
            results[website_key] = {"status": "success", "updated": updated_count}
            
            if hasattr(scraper, "close"):
                await scraper.close()

        except Exception as e:
            db.rollback()
            logger.error(f"Error in win verification for {name}: {e}")
            results[website_key] = {"status": "error", "message": str(e)}

    return results
