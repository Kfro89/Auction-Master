import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Tuple
from .base import BaseScraper
import logging
import re

logger = logging.getLogger(__name__)

class GovDealsScraper(BaseScraper):
    def __init__(self, zip_code: str, radius: str):
        self.base_url = "https://www.govdeals.com"
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
        # Treat the entire GovDeals radius search as one virtual "Auction" event
        return [{
            "id": f"gd_search_{self.zip_code}_{self.radius}",
            "name": f"GovDeals: {self.radius}mi around {self.zip_code}",
            "start_time": None,
            "end_time": None
        }]

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        url = "https://maestro.lqdt1.com/search/list"
        
        all_lots = []
        page = 1
        MAX_PAGES = 50 # Safety limit
        
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0, follow_redirects=True) as client:
            while page <= MAX_PAGES:
                payload = {
                    "businessId": "GD",
                    "searchText": "*",
                    "isQAL": False,
                    "locationId": None,
                    "model": "",
                    "accountIds": [],
                    "auctionTypeId": None,
                    "displayRows": 120,
                    "facets": [
                        "categoryName", "auctionTypeID", "condition", "saleEventName", "sellerDisplayName",
                        "product_pricecents", "isReserveMet", "hasBuyNowPrice", "isReserveNotMet", "sellerType",
                        "warehouseId", "region", "currencyTypeCode", "tierId"
                    ],
                    "facetsFilter": [],
                    "makebrand": "",
                    "page": page,
                    "requestType": "search",
                    "responseStyle": "productsOnly",
                    "sellerTypeId": None,
                    "sessionId": "55803892-158f-45a8-afbd-540b4d95afba",
                    "sortField": "bestfit",
                    "sortOrder": "desc",
                    "timeType": ""
                }
                
                try:
                    logger.debug(f"Fetching GovDeals page {page} for zip {self.zip_code}")
                    response = await client.post(url, json=payload)
                    response.raise_for_status()
                    
                    data = response.json()
                    results = data.get("assetSearchResults", [])
                    
                    if not results:
                        break
                    
                    for item in results:
                        asset_id = item.get("assetId")
                        account_id = item.get("accountId")
                        
                        detail_url = f"https://www.govdeals.com/asset/{asset_id}/{account_id}"
                        
                        lot_data = {
                            "id": str(asset_id),
                            "title": item.get("assetShortDescription", ""),
                            "detail_url": detail_url,
                            "price": float(item.get("currentBid") or 0.0),
                            "end_time": item.get("assetAuctionEndDateUtc"),
                            "thumbnail_url": item.get("photo"),
                            "state": item.get("locationState")
                        }
                        
                        all_lots.append(lot_data)
                    
                    if len(results) < payload["displayRows"]:
                        break
                        
                    page += 1
                    
                except Exception as e:
                    logger.error(f"Error fetching GovDeals lots on page {page}: {e}")
                    break

        return {"id": auction_id}, all_lots

    async def health_check(self) -> bool:
        url = self.base_url
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
            try:
                response = await client.get(url)
                return response.status_code == 200
            except:
                return False

    async def login(self, username: str, password: str = None, session_cookie: str = None) -> bool:
        """
        Use session_cookie parameter to validate pseudo-auth.
        """
        if session_cookie:
            self.headers["Cookie"] = session_cookie.strip()
            return True
        return False

    async def fetch_my_bids(self) -> List[Dict[str, Any]]:
        if "Cookie" not in self.headers:
            raise PermissionError("No session cookie set. Call login() first.")
            
        url = f"{self.base_url}/en/account/mybids"
        bidding_data = []
        
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Find the bids grid or table. GovDeals uses modern card grids or tables.
                # Since exact HTML varies, we will look for common bid card wrappers or rows.
                rows = soup.select('table tr')
                if not rows:
                    rows = soup.select('div.bid-row, div.card, div.list-group-item')
                
                for row in rows:
                    # Basic extraction strategy - adapt based on actual GovDeals HTML
                    links = row.find_all('a', href=re.compile(r'auc=\d+'))
                    if not links: continue
                    
                    href = links[0]['href']
                    import re
                    match = re.search(r'auc=(\d+)', href)
                    if not match: continue
                    auc_id = match.group(1)
                    
                    text_content = row.get_text(" ", strip=True).lower()
                    
                    is_winning = "winning" in text_content or "highest bidder" in text_content
                    is_closed = "closed" in text_content or "ended" in text_content or "lost" in text_content or "won" in text_content
                    
                    status = "closed" if is_closed else "open"
                    if is_closed:
                        user_bid_status = "won" if ("won" in text_content or "paid" in text_content or "pay" in text_content) else "lost"
                    else:
                        user_bid_status = "winning" if is_winning else "outbid"

                    bidding_data.append({
                        "id": auc_id,
                        "title": links[0].get_text(strip=True),
                        "status": status,
                        "user_bid_status": user_bid_status,
                        "current_bid": 0.0, # To be refined with exact selectors
                        "user_bid": 0.0,
                        "proxy_bid": 0.0,
                    })
            except Exception as e:
                logger.error(f"Error fetching GovDeals my bids: {e}")
                
        return bidding_data
