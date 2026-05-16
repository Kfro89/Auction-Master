import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from .base import BaseScraper
import logging
import re
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

class PublicSurplusScraper(BaseScraper):
    def __init__(self, zip_code: str, radius: str):
        self.base_url = "https://www.publicsurplus.com"
        self.zip_code = zip_code
        self.radius = radius
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }

    async def discover_active_auctions(self) -> List[Dict[str, Any]]:
        # Treat the entire Public Surplus radius search as one virtual "Auction" event
        return [{
            "id": f"ps_search_{self.zip_code}_{self.radius}",
            "name": f"Public Surplus: {self.radius}mi around {self.zip_code}",
            "start_time": None,
            "end_time": None
        }]

    async def fetch_auction_lots(self, auction_id: str) -> tuple[Dict[str, Any], List[Dict[str, Any]]]:
        url = f"{self.base_url}/sms/browse/search"
        
        all_lots = []
        seen_aucs = set()
        page = 0
        MAX_PAGES = 100 # Safety limit
        
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0, follow_redirects=True) as client:
            while page < MAX_PAGES:
                params = {
                    "posting": "y",
                    "milesLocation": self.radius,
                    "zipCode": self.zip_code,
                    "page": str(page)
                }
                
                try:
                    logger.debug(f"Fetching Public Surplus page {page} for zip {self.zip_code}")
                    response = await client.get(url, params=params)
                    response.raise_for_status()
                    html = response.text
                    
                    soup = BeautifulSoup(html, "html.parser")
                    page_lots_count = 0
                    
                    # Public surplus shows items in a grid or list. 
                    # We can find all links to individual auctions.
                    # We use a generic selector to catch auctions from any region.
                    auction_links = soup.select('a[href*="/auction/view?auc="]')
                    
                    if not auction_links:
                        logger.info(f"No more auction links found on page {page}. Stopping.")
                        break
                        
                    for link in auction_links:
                        href = link.get("href", "")
                        match = re.search(r"auc=(\d+)", href)
                        if not match:
                            continue
                            
                        auc_id = match.group(1)
                        if auc_id in seen_aucs:
                            continue
                        
                        title = link.get("title", "").replace(f"#{auc_id} - ", "").strip()
                        if not title:
                            title = link.get_text(strip=True).replace(f"#{auc_id} - ", "").strip()
                            if not title or title.isdigit():
                                # Sometimes the link is just the image wrapper or the ID
                                continue
                        
                        seen_aucs.add(auc_id)
                        page_lots_count += 1
                        
                        # Try to find price
                        price = 0.0
                        price_b = soup.find("b", id=f"val_{auc_id}searchGrid")
                        if price_b:
                            price_text = price_b.get_text(strip=True).replace("$", "").replace(",", "")
                            try:
                                price = float(price_text)
                            except ValueError:
                                pass
                                
                        # Try to find image
                        image_url = None
                        img_tag = soup.select_one(f'a[href*="auc={auc_id}"] img')
                        if img_tag and img_tag.get("src"):
                            image_url = img_tag.get("src")
                            if not image_url.startswith("http"):
                                image_url = self.base_url + image_url

                        all_lots.append({
                            "id": auc_id,
                            "lot_number": auc_id,
                            "title": title,
                            "description": f"Public Surplus Item #{auc_id}",
                            "price": price,
                            "current_bid": price,
                            "end_time": None, # Should be parsed from the search results if possible
                            "status": "open",
                            "url": f"{self.base_url}{href}",
                            "primary_image": {"url": image_url} if image_url else None
                        })
                    
                    logger.info(f"Parsed {page_lots_count} new items from Public Surplus page {page}.")
                    
                    if page_lots_count == 0:
                        logger.info(f"All items on page {page} were already seen. Stopping.")
                        break
                        
                    page += 1
                    
                except Exception as e:
                    logger.error(f"Error fetching Public Surplus lots on page {page}: {e}")
                    break

        logger.info(f"Finished Public Surplus search. Total items: {len(all_lots)}")
        return {"id": auction_id}, all_lots

    async def health_check(self) -> bool:
        url = f"{self.base_url}/sms/browse/search"
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
            try:
                response = await client.get(url)
                return response.status_code == 200
            except:
                return False

    async def login(self, username: str, password: str = None, session_cookie: str = None) -> bool:
        """
        Public Surplus frequently uses CAPTCHAs on login.
        If a session_cookie is provided, validate it by hitting a protected page.
        """
        if session_cookie:
            self.headers["Cookie"] = session_cookie.strip()
            # Validate the cookie by requesting the "My Bids" dashboard
            url = f"{self.base_url}/sms/mys/bids?tm=m"
            async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
                try:
                    response = await client.get(url)
                    if response.status_code == 401 or response.status_code == 403:
                        logger.warning("Public Surplus cookie validation failed: session expired or invalid.")
                        del self.headers["Cookie"]
                        return False
                    response.raise_for_status()
                    return True
                except httpx.HTTPStatusError as e:
                    logger.warning(f"Public Surplus cookie validation HTTP error: {e}")
                    del self.headers["Cookie"]
                    return False
                except Exception as e:
                    logger.error(f"Public Surplus cookie validation error: {e}")
                    # Network error — can't determine validity, assume ok to avoid false negatives
                    return True
            
        # Stub for standard HTTP login
        raise NotImplementedError("HTTP login not fully implemented. Session cookie bypass recommended for Public Surplus due to CAPTCHAs.")

    async def place_bid(self, auction_id: str, lot_number: str, amount: float) -> Dict[str, Any]:
        """
        Submit a bid to Public Surplus.
        """
        if "Cookie" not in self.headers:
            raise PermissionError("Not authenticated. Call login() first.")
            
        # Stub for bid submission
        raise NotImplementedError("Direct bidding structure not fully mapped for Public Surplus yet.")

    async def fetch_my_bids(self) -> List[Dict[str, Any]]:
        """
        Fetches the user's active bids dashboard using the session cookie 
        and extracts bidding data.
        Raises PermissionError if the cookie is rejected (401/403).
        """
        if "Cookie" not in self.headers:
            raise PermissionError("No session cookie set. Call login() first.")
            
        url = f"{self.base_url}/sms/mys/bids?tm=m"
        
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                if response.status_code in (401, 403):
                    raise PermissionError(f"Public Surplus session expired or invalid (HTTP {response.status_code})")
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                
                bidding_data = []
                table = soup.find('table', {'class': 'table'})
                if not table:
                    return []
                    
                tbody = table.find('tbody')
                if not tbody:
                    return []
                    
                rows = tbody.find_all('tr')
                for row in rows:
                    cols = row.find_all('td')
                    if len(cols) >= 8:
                        auc_id = cols[0].get_text(strip=True)
                        title_tag = cols[1].find('a')
                        title = title_tag.get_text(strip=True) if title_tag else "Unknown Title"
                        end_date = cols[3].get_text(strip=True)
                        
                        def parse_price(text):
                            cleaned = text.replace('$', '').replace(',', '').strip()
                            try:
                                return float(cleaned)
                            except ValueError:
                                return 0.0
                                
                        current_bid = parse_price(cols[5].get_text())
                        user_bid = parse_price(cols[6].get_text())
                        proxy_bid = parse_price(cols[7].get_text())
                        
                        # Try to parse end_time
                        end_time_val = end_date
                        is_closed = "closed" in end_date.lower() or "ended" in end_date.lower()
                        for fmt in ["%b %d, %Y %I:%M %p", "%m/%d/%Y %I:%M %p", "%m/%d/%Y %H:%M"]:
                            try:
                                dt = datetime.strptime(end_date, fmt)
                                end_time_val = dt.isoformat()
                                break
                            except:
                                continue

                        bidding_data.append({
                            "id": auc_id,
                            "title": title,
                            "end_time": end_time_val,
                            "status": "closed" if is_closed else "open",
                            "current_bid": current_bid,
                            "user_bid": user_bid,
                            "proxy_bid": proxy_bid
                        })
                        
                return bidding_data
            except PermissionError:
                raise
            except Exception as e:
                logger.error(f"Error fetching Public Surplus my bids: {e}")
                raise

    async def fetch_lot_image(self, auc_id: str) -> str:
        url = f"{self.base_url}/sms/auction/view?auc={auc_id}"
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                # Public Surplus image selector for auction lots
                img_tag = soup.select_one('img.img-thumbnail, img[src*="/sms/docviewer/aucdoc/"]')
                if img_tag:
                    url = img_tag.get('src')
                    if url:
                        # Ensure we get a reasonably sized image, not just a tiny thumb
                        if 'thumb=b' in url:
                            url = url.replace('thumb=b', 'thumb=n')
                        if not url.startswith('http'):
                            url = self.base_url + url
                        return url
        return None

    async def close(self):
        # The AsyncClient context manager is used in methods, nothing to close here specifically
        # unless we move to a persistent self.client.
        pass
