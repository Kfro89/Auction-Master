import asyncio
import logging
import sys
import os

# Add the backend directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.scrapers.roller_auction import RollerAuctionScraper
from app.models import Setting
from app.services.security import decrypt_value

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_roller_login():
    db = SessionLocal()
    try:
        # Fetch credentials from settings
        cookie_setting = db.query(Setting).filter(Setting.key == "rol_cookie").first()
        
        session_cookie = decrypt_value(cookie_setting.value) if cookie_setting and cookie_setting.value else None
        
        if not session_cookie:
            print("❌ No Roller (rol) session cookie found in settings.")
            return

        print(f"Testing Roller login with cookie...")
        scraper = RollerAuctionScraper(base_url="https://bid.rollerauction.com", website_key="rol")
        
        # Apply cookie
        await scraper.login(username="", session_cookie=session_cookie)
        
        print("Attempting to verify login by fetching active bids...")
        try:
            bids = await scraper.fetch_my_bids()
            print(f"✅ Login verified! Found {len(bids)} active bids.")
            for bid in bids:
                print(f"  - [{bid.user_bid_status.upper()}] {bid.title}: Current: ${bid.current_bid}, Your Bid: ${bid.user_bid}, Proxy: ${bid.proxy_bid}")
        except Exception as e:
            print(f"❌ Failed to fetch bids with current cookie: {e}")
                
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_roller_login())
