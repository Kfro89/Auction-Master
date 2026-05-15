import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Setting
from app.services.security import decrypt_value
from app.scrapers.public_surplus import PublicSurplusScraper

# Use the local DB for testing (assuming it replicates or is connected)
DATABASE_URL = "postgresql://postgres:postgres@localhost:5434/auctionmaster" # From Gemini.md
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def test():
    db = SessionLocal()
    cookie_setting = db.query(Setting).filter(Setting.key == "public_surplus_cookie").first()
    if not cookie_setting:
        print("No cookie found in local DB.")
        return
        
    cookie = decrypt_value(cookie_setting.value)
    print(f"Cookie starts with: {cookie[:10]}...")
    
    scraper = PublicSurplusScraper(zip_code="80202", radius="50")
    await scraper.login(username="", session_cookie=cookie)
    
    bids = await scraper.fetch_my_bids()
    print(f"Found {len(bids)} bids: {bids}")

if __name__ == "__main__":
    asyncio.run(test())
