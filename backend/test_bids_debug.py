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
    headers = {"Cookie": session_cookie.strip(), "User-Agent": "Mozilla/5.0"}
    
    async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
        # 1. Fetch Current Bids
        url_current = "https://www.publicsurplus.com/sms/mys/bids?tm=m"
        response = await client.get(url_current)
        soup = BeautifulSoup(response.text, "html.parser")
        table = soup.find('table', {'class': 'table'})
        print("BIDS TABLE FOUND?", table is not None)
        if table:
            tbody = table.find('tbody')
            rows = tbody.find_all('tr') if tbody else []
            print(f"BIDS ROWS: {len(rows)}")
            
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 8:
                    auc_id = cols[0].get_text(strip=True)
                    print(f"BIDS parsed auc_id: {auc_id}")
        else:
            print("NO BIDS TABLE!")

        # 2. Fetch Past Bids
        url_past = "https://www.publicsurplus.com/sms/mys/pastbids"
        response_past = await client.get(url_past)
        soup_past = BeautifulSoup(response_past.text, "html.parser")
        table_past = soup_past.find('table', {'class': 'table'})
        print("PAST BIDS TABLE FOUND?", table_past is not None)
        if table_past:
            tbody_past = table_past.find('tbody')
            rows_past = tbody_past.find_all('tr') if tbody_past else []
            print(f"PAST BIDS ROWS: {len(rows_past)}")
            
            for row in rows_past:
                cols = row.find_all('td')
                if len(cols) >= 9:
                    auc_id = cols[0].get_text(strip=True)
                    print(f"PAST BIDS parsed auc_id: {auc_id}")

if __name__ == "__main__":
    asyncio.run(main())
