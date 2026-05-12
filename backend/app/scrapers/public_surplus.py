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
                            "end_time": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(), # Default end time if we can't parse it
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
        If a session_cookie is provided, we can bypass login.
        """
        if session_cookie:
            self.headers["Cookie"] = session_cookie
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
