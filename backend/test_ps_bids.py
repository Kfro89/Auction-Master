import asyncio
import logging
from app.database import SessionLocal
from app.scrapers.public_surplus import PublicSurplusScraper
from app.models import Setting

logging.basicConfig(level=logging.DEBUG)

async def main():
    db = SessionLocal()
    cookie_setting = db.query(Setting).filter(Setting.key == "public_surplus_cookie").first()
    if cookie_setting and cookie_setting.value:
        scraper = PublicSurplusScraper(zip_code="00000", radius="0")
        from app.routers.credentials import decrypt_value
        session_cookie = decrypt_value(cookie_setting.value)
        if session_cookie:
            scraper.headers["Cookie"] = session_cookie
            bids = await scraper.fetch_my_bids()
            print("FOUND BIDS:", bids)
            
if __name__ == "__main__":
    asyncio.run(main())
