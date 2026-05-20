import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Tuple, Optional
from .base import BaseScraper
from app.schemas.scraping import ScrapedAuction, ScrapedLot, ScrapedBid
import logging
import re
import uuid
import json
import base64
import time
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

def parse_gd_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        # Handle "2026-05-18T13:53:00Z" or "2026-05-18T13:53:00+00:00"
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except Exception as e:
        logger.warning(f"Failed to parse GovDeals date {date_str}: {e}")
        return None

class GovDealsScraper(BaseScraper):
    def __init__(self, zip_code: str, radius: str, buyer_id: Optional[str] = None):
        self.base_url = "https://www.govdeals.com"
        self.zip_code = zip_code
        self.radius = radius
        self.buyer_id = buyer_id
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Origin": "https://www.govdeals.com",
            "Referer": "https://www.govdeals.com/",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "X-API-Correlation-ID": str(uuid.uuid4()),
            "X-Site-Id": "1",
            "X-Business-Id": "GD",
            "Content-Type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "sec-ch-ua": '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "ocp-apim-subscription-key": "cf620d1d8f904b5797507dc5fd1fdb80",
            "x-api-key": "af93060f-337e-428c-87b8-c74b5837d6cd",
            "x-user-id": str(buyer_id) if buyer_id else "999999"
        }

    def _get_token_exp(self, token: str) -> Optional[float]:
        """
        Get the expiration timestamp of a JWT.
        """
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return None
            
            payload_b64 = parts[1]
            missing_padding = len(payload_b64) % 4
            if missing_padding:
                payload_b64 += '=' * (4 - missing_padding)
                
            payload_json = base64.b64decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
            return payload.get('exp')
        except Exception:
            return None

    def _is_jwt_expired(self, token: str) -> bool:
        """
        Check if a JWT is expired without full validation.
        """
        exp = self._get_token_exp(token)
        if not exp:
            return True
        return exp < (time.time() + 30)

    async def discover_active_auctions(self) -> List[ScrapedAuction]:
        # Treat the entire GovDeals radius search as one virtual "Auction" event
        return [ScrapedAuction(
            id=f"gd_search_{self.zip_code}_{self.radius}",
            name=f"GovDeals: {self.radius}mi around {self.zip_code}",
            start_time=None,
            end_time=None
        )]

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[ScrapedAuction, List[ScrapedLot]]:
        url = "https://maestro.lqdt1.com/search/list"
        
        all_lots = []
        page = 1
        MAX_PAGES = 50 
        
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
                    "sortField": "bestfit",
                    "sortOrder": "desc",
                    "timeType": "",
                    "zipcode": self.zip_code,
                    "proximityWithinDistance": str(self.radius)
                }
                
                try:
                    logger.debug(f"Fetching GovDeals page {page} for zip {self.zip_code} radius {self.radius}")
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
                        
                        photo = item.get("photo")
                        image_url = None
                        if photo and account_id:
                            image_url = f"https://webassets.lqdt1.com/assets/photos/{account_id}/{photo}"
                        
                        lot = ScrapedLot(
                            id=str(asset_id),
                            lot_number=str(asset_id),
                            title=item.get("assetShortDescription", ""),
                            url=detail_url,
                            current_bid=float(item.get("currentBid") or 0.0),
                            end_time=parse_gd_date(item.get("assetAuctionEndDateUtc")),
                            image_url=image_url
                        )
                        all_lots.append(lot)
                    
                    if len(results) < payload["displayRows"]:
                        break
                    page += 1
                    
                except Exception as e:
                    logger.error(f"Error fetching GovDeals lots on page {page}: {e}")
                    break

        auction = ScrapedAuction(
            id=auction_id,
            name=f"GovDeals: {self.radius}mi around {self.zip_code}"
        )
        return auction, all_lots

    async def health_check(self) -> bool:
        url = self.base_url
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
            try:
                response = await client.get(url)
                return response.status_code == 200
            except Exception:
                return False

    async def login(self, username: str, password: str = None, session_cookie: str = None) -> bool:
        if not session_cookie:
            return False
            
        session_cookie = session_cookie.strip()
        if session_cookie.startswith("Bearer "):
            self.headers["Authorization"] = session_cookie
            return True
        if session_cookie.startswith("eyJ"):
            self.headers["Authorization"] = f"Bearer {session_cookie}"
            return True
            
        self.headers["Cookie"] = session_cookie
        tkn_match = re.search(r'tkn_val=([^; ]+)', session_cookie)
        ref_match = re.search(r'ref_tkn=([^; ]+)', session_cookie)
        
        access_token = tkn_match.group(1) if tkn_match else None
        
        if access_token:
            self.headers["Authorization"] = f"Bearer {access_token}"
            return True
            
        # Fallback for generic cookies in testing
        return True

    async def fetch_my_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        if not buyer_id:
            logger.warning("No buyerId provided for GovDeals fetch_my_bids. Skipping.")
            return []
        
        return await self._fetch_govdeals_bids(buyer_id, "open")

    async def fetch_closed_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        if not buyer_id:
            logger.warning("No buyerId provided for GovDeals fetch_closed_bids. Skipping.")
            return []
            
        return await self._fetch_govdeals_bids(buyer_id, "closed")

    async def _fetch_govdeals_bids(self, buyer_id: str, status_filter: str) -> List[ScrapedBid]:
        url = f"https://maestro.lqdt1.com/buyerbids/{status_filter}"
        
        # Definitive headers from browser traffic
        call_headers = self.headers.copy()
        call_headers.update({
            "x-user-id": str(buyer_id),
            "x-ecom-session-id": str(uuid.uuid4()),
            "x-referer": "https://www.govdeals.com/en/account/mybids",
            "x-page-unique-id": base64.b64encode("https://www.govdeals.com/en/account/mybids".encode()).decode(),
            "x-user-timezone": "America/Denver"
        })

        payload = {
            "buyerId": int(buyer_id) if str(buyer_id).isdigit() else buyer_id,
            "businessId": "GD",
            "sortField": "auctionend",
            "sortOrder": "asc",
            "siteId": 1
        }

        async with httpx.AsyncClient(headers=call_headers, timeout=15.0, follow_redirects=True) as client:
            try:
                logger.debug(f"Attempting GovDeals bid fetch (API): {url}")
                response = await client.post(url, json=payload)
                
                if response.status_code == 200:
                    results = response.json()
                    if isinstance(results, list):
                        logger.info(f"Successfully fetched {len(results)} bids from API ({status_filter})")
                        return self._parse_bidding_results(results, status_filter)
                
                logger.error(f"API fetch failed with status {response.status_code}")
                
            except Exception as e:
                logger.error(f"Error during API bid fetch ({status_filter}): {e}")

        # Fallback to scraping the account page (HTML) - ONLY for open bids
        if status_filter == "open":
            account_url = "https://www.govdeals.com/en/account/mybids"
            logger.info(f"Attempting fallback to HTML scraping: {account_url}")
            
            html_headers = self.headers.copy()
            if "Authorization" in html_headers:
                del html_headers["Authorization"]
            
            async with httpx.AsyncClient(headers=html_headers, timeout=20.0, follow_redirects=True) as client:
                try:
                    response = await client.get(account_url)
                    response.raise_for_status()
                    return self._parse_html_bidding_results(response.text)
                except Exception as e:
                    logger.error(f"Error during HTML fallback: {e}")
                    raise e
        
        # If API failed for closed bids, we raise because there's no HTML fallback yet
        if status_filter == "closed":
             raise Exception("Failed to fetch closed GovDeals bids from API.")

        return []

    def _parse_html_bidding_results(self, html_content: str) -> List[ScrapedBid]:
        soup = BeautifulSoup(html_content, 'html.parser')
        markers = ['"assetId"', '"highBidAmount"', '"assetSearchResults"', '"buyerbids"']
        
        scripts = soup.find_all('script')
        for script in scripts:
            if not script.string:
                continue
            content = script.string
            if any(marker in content for marker in markers):
                try:
                    matches = re.finditer(r'\[\s*\{.*?"assetId":.*\}\s*\]', content, re.DOTALL)
                    for match in matches:
                        try:
                            results = json.loads(match.group(0))
                            if isinstance(results, list) and len(results) > 0:
                                if any('highBidAmount' in str(item) for item in results):
                                    return self._parse_bidding_results(results, "open")
                        except Exception:
                            continue
                except Exception:
                    pass
        return []

    def _parse_bidding_results(self, results: List[Dict[str, Any]], status_filter: str) -> List[ScrapedBid]:
        bidding_data = []
        for item in results:
            asset_id = item.get("assetId")
            if not asset_id:
                continue
                
            is_high_bidder = item.get("isHighBidder", False)
            high_bid = float(item.get("highBidAmount") or 0.0)
            
            buyer_highest = item.get("buyerHighestBidAmount")
            if buyer_highest is None:
                buyer_highest = high_bid if is_high_bidder else 0.0
            else:
                buyer_highest = float(buyer_highest)
                
            buyer_auto = float(item.get("buyerAutoBidAmount") or 0.0)
            
            user_status = "winning" if is_high_bidder else "outbid"
            if status_filter == "closed":
                user_status = "won" if is_high_bidder else "lost"

            bid = ScrapedBid(
                id=str(asset_id),
                title=item.get("assetShortDescription", ""),
                status="open" if status_filter == "open" else "closed",
                user_bid_status=user_status,
                current_bid=high_bid,
                user_bid=buyer_highest,
                proxy_bid=buyer_auto,
                end_time=parse_gd_date(item.get("auctionEndDateUTC"))
            )
            bidding_data.append(bid)
        return bidding_data
