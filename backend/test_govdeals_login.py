import asyncio
import logging
import sys
import os

# Add the backend directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.scrapers.govdeals import GovDealsScraper
from app.models import Setting
from app.services.security import decrypt_value

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def test_govdeals_login():
    db = SessionLocal()
    try:
        # Fetch credentials from settings
        cookie_setting = db.query(Setting).filter(Setting.key == "govdeals_cookie").first()
        bidder_id_setting = db.query(Setting).filter(Setting.key == "govdeals_bidder_id").first()
        zip_setting = db.query(Setting).filter(Setting.key == "govdeals_zip").first()
        radius_setting = db.query(Setting).filter(Setting.key == "govdeals_radius").first()
        
        session_cookie = decrypt_value(cookie_setting.value) if cookie_setting and cookie_setting.value else None
        bidder_id = bidder_id_setting.value if bidder_id_setting and bidder_id_setting.value else None
        zip_code = zip_setting.value if zip_setting else "00000"
        radius = radius_setting.value if radius_setting else "0"
        
        if not session_cookie:
            print("❌ No GovDeals session cookie found in settings.")
            return

        print(f"Testing GovDeals login with cookie (length: {len(session_cookie)})...")
        scraper = GovDealsScraper(zip_code=zip_code, radius=radius)
        
        # Apply cookie
        await scraper.login(username="", session_cookie=session_cookie)
        
        print("Headers being sent:")
        for k, v in scraper.headers.items():
            val = v[:30] + "..." if len(v) > 30 else v
            print(f"  {k}: {val}")
        
        if bidder_id:
            print(f"Attempting to verify login by fetching bids for bidder ID: {bidder_id}...")
            try:
                bids = await scraper.fetch_my_bids(buyer_id=bidder_id)
                print(f"✅ Login verified! Found {len(bids)} active bids.")
                for bid in bids:
                    print(f"  - {bid['title']}: ${bid['current_bid']} (Status: {bid['user_bid_status']})")
            except Exception as e:
                print(f"❌ Failed to fetch bids with current cookie: {e}")
        else:
            print("⚠️ Cookie applied, but no GovDeals Bidder ID found in settings. Cannot fully verify login.")
            # Try a simple search instead to see if we get blocked
            try:
                print("Attempting a simple search to check connectivity...")
                _, lots = await scraper.fetch_auction_lots("test")
                print(f"✅ Search successful! Found {len(lots)} lots.")
            except Exception as e:
                print(f"❌ Search failed: {e}")
                
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_govdeals_login())
