import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Tuple
from .base import BaseScraper
from app.schemas.scraping import ScrapedAuction, ScrapedLot, ScrapedBid
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

    async def discover_active_auctions(self) -> List[ScrapedAuction]:
        # Treat the entire Public Surplus radius search as one virtual "Auction" event
        return [ScrapedAuction(
            id=f"ps_search_{self.zip_code}_{self.radius}",
            name=f"Public Surplus: {self.radius}mi around {self.zip_code}",
            start_time=None,
            end_time=None
        )]

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[ScrapedAuction, List[ScrapedLot]]:
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

                        all_lots.append(ScrapedLot(
                            id=auc_id,
                            lot_number=auc_id,
                            title=title,
                            description=f"Public Surplus Item #{auc_id}",
                            current_bid=price,
                            end_time=None, # Should be parsed from the search results if possible
                            url=f"{self.base_url}{href}",
                            image_url=image_url
                        ))
                    
                    logger.info(f"Parsed {page_lots_count} new items from Public Surplus page {page}.")
                    
                    if page_lots_count == 0:
                        logger.info(f"All items on page {page} were already seen. Stopping.")
                        break
                        
                    page += 1
                    
                except Exception as e:
                    logger.error(f"Error fetching Public Surplus lots on page {page}: {e}")
                    break

        logger.info(f"Finished Public Surplus search. Total items: {len(all_lots)}")
        
        auction = ScrapedAuction(
            id=auction_id,
            name=f"Public Surplus: {self.radius}mi around {self.zip_code}",
            start_time=None,
            end_time=None
        )
        
        return auction, all_lots

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

    async def fetch_my_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        if "Cookie" not in self.headers:
            raise PermissionError("No session cookie set. Call login() first.")
        
        url_active = f"{self.base_url}/sms/mys/bids"
        return await self._fetch_ps_bids(url_active, "open")

    async def fetch_closed_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        if "Cookie" not in self.headers:
            raise PermissionError("No session cookie set. Call login() first.")
            
        url_past = f"{self.base_url}/sms/mys/pastbids"
        return await self._fetch_ps_bids(url_past, "closed")

    async def _fetch_ps_bids(self, url: str, status_filter: str) -> List[ScrapedBid]:
        bidding_data = []
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                if response.status_code in (401, 403):
                    raise PermissionError(f"Public Surplus session expired or invalid (HTTP {response.status_code})")
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                
                table = soup.find('table', {'class': 'table'})
                if table and table.find('tbody'):
                    for row in table.find('tbody').find_all('tr'):
                        cols = row.find_all('td')
                        if len(cols) >= 8:
                            auc_id = cols[0].get_text(strip=True)
                            
                            # Check for winning status
                            # In active bids, winning.gif means currently winning.
                            # In past bids, it might indicate won.
                            is_winning = bool(cols[1].find('img', title='Winning') or cols[1].find('img', alt='Winning'))
                            
                            title_tag = cols[1].find('a')
                            title = title_tag.get_text(strip=True) if title_tag else "Unknown Title"
                            
                            # Extract end_time from script tag updateTimeLeftSpan
                            end_time_val = None
                            script_tag = row.find('script')
                            if script_tag and script_tag.string:
                                import re
                                match = re.search(r'updateTimeLeftSpan[^,]+,[^,]+,[^,]+,[^,]+,\s*(\d{13})', script_tag.string)
                                if match:
                                    end_time_val = datetime.fromtimestamp(int(match.group(1))/1000.0, tz=timezone.utc)
                            
                            def parse_price(text):
                                cleaned = text.replace('$', '').replace(',', '').strip()
                                try: return float(cleaned)
                                except ValueError: return 0.0
                                    
                            current_bid = parse_price(cols[5].get_text())
                            user_bid = parse_price(cols[6].get_text())
                            proxy_bid = parse_price(cols[7].get_text())
                            
                            user_status = "winning" if is_winning else "outbid"
                            if status_filter == "closed":
                                user_status = "won" if is_winning else "lost"

                            bidding_data.append(ScrapedBid(
                                id=auc_id,
                                title=title,
                                end_time=end_time_val,
                                status=status_filter,
                                current_bid=current_bid,
                                user_bid=user_bid,
                                proxy_bid=proxy_bid,
                                user_bid_status=user_status
                            ))
            except PermissionError:
                raise
            except Exception as e:
                logger.error(f"Error fetching Public Surplus bids from {url}: {e}")
                raise e

        return bidding_data

    async def fetch_item_details(self, auc_id: str) -> Dict[str, Any]:
        url = f"{self.base_url}/sms/auction/view?auc={auc_id}"
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Title extraction
                title = "Unknown Title"
                title_tag = soup.select_one('span.text-wrap')
                if title_tag:
                    title_text = title_tag.get_text(strip=True)
                    # Often looks like "Auction #4005533 -  Item Title"
                    if " - " in title_text:
                        title = title_text.split(" - ", 1)[1].strip()
                    else:
                        title = title_text
                
                # Description extraction
                description = ""
                desc_div = soup.select_one('div.description')
                if desc_div:
                    description = desc_div.get_text(separator="\n", strip=True)
                
                # Images extraction
                images = []
                img_tags = soup.select('img.img-thumbnail')
                for img in img_tags:
                    src = img.get('src')
                    if src:
                        # Convert thumbnail URL to full size if possible
                        if 'thumb=b' in src:
                            src = src.replace('thumb=b', 'thumb=n')
                        if not src.startswith('http'):
                            src = self.base_url + src
                        if src not in images:
                            images.append(src)
                
                return {
                    "id": auc_id,
                    "title": title,
                    "description": description,
                    "images": images,
                    "primary_image": {"url": images[0]} if images else None,
                    "status": "open" # If we can reach the page, it's likely open
                }
            except Exception as e:
                logger.error(f"Error fetching Public Surplus item details for {auc_id}: {e}")
                return None

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
