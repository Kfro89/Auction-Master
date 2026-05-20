import asyncio
import httpx
from bs4 import BeautifulSoup
from app.database import SessionLocal
from app.models import Setting
from app.services.security import decrypt_value

async def main():
    db = SessionLocal()
    cookie_setting = db.query(Setting).filter(Setting.key == "public_surplus_cookie").first()
    session_cookie = decrypt_value(cookie_setting.value)
    headers = {"Cookie": session_cookie.strip(), "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
    
    async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
        url_current = "https://www.publicsurplus.com/sms/mys/bids"
        print(f"Fetching {url_current}")
        response = await client.get(url_current)
        soup = BeautifulSoup(response.text, "html.parser")
        print("TITLE:", soup.title.string)
        table = soup.find('table', {'class': 'table'})
        if table:
            tbody = table.find('tbody')
            rows = tbody.find_all('tr') if tbody else []
            for row in rows[:2]:
                cols = row.find_all('td')
                if len(cols) >= 8:
                    print("ID:", cols[0].get_text(strip=True))

if __name__ == "__main__":
    asyncio.run(main())
