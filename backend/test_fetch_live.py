import asyncio
import httpx
from bs4 import BeautifulSoup
from app.database import SessionLocal
from app.models import Setting
from app.services.security import decrypt_value

async def main():
    db = SessionLocal()
    cookie_setting = db.query(Setting).filter(Setting.key == "public_surplus_cookie").first()
    if not cookie_setting or not cookie_setting.value:
        print("No cookie found")
        return
        
    session_cookie = decrypt_value(cookie_setting.value)
    headers = {"Cookie": session_cookie.strip(), "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    
    async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
        res = await client.get("https://www.publicsurplus.com/sms/mys/bids?tm=m")
        with open("live_bids_tmm.html", "w") as f:
            f.write(res.text)
        print("Saved live_bids.html")

if __name__ == "__main__":
    asyncio.run(main())
