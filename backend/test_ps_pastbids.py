import asyncio
import logging
from app.database import SessionLocal
from app.models import Setting
from app.services.security import decrypt_value
import httpx
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)

async def main():
    db = SessionLocal()
    cookie_setting = db.query(Setting).filter(Setting.key == "public_surplus_cookie").first()
    if cookie_setting and cookie_setting.value:
        session_cookie = decrypt_value(cookie_setting.value)
        if session_cookie:
            headers = {"Cookie": session_cookie.strip(), "User-Agent": "Mozilla/5.0"}
            url = "https://www.publicsurplus.com/sms/mys/pastbids?tm=m"
            async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:
                res = await client.get(url)
                soup = BeautifulSoup(res.text, "html.parser")
                table = soup.find('table', {'class': 'table'})
                if table:
                    # just print the rows so we can see columns
                    rows = table.find_all('tr')
                    for r in rows[:5]:
                        print("--- ROW ---")
                        for i, col in enumerate(r.find_all(['th', 'td'])):
                            print(f"[{i}]: {col.get_text(strip=True)}")
                    with open("ps_pastbids.html", "w") as f:
                        f.write(str(table))
                else:
                    print("Table not found in pastbids")
        else:
            print("No cookie found")

if __name__ == "__main__":
    asyncio.run(main())
