import httpx
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone
from .base import BaseScraper
from app.schemas.scraping import ScrapedAuction, ScrapedLot, ScrapedBid

logger = logging.getLogger(__name__)

class BidWranglerApiScraper(BaseScraper):
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json"
        }

    def _parse_date(self, date_val: Any) -> Optional[datetime]:
        if not date_val:
            return None
        try:
            if isinstance(date_val, (int, float)):
                # If it's a large number, it's likely milliseconds
                if date_val > 1e11:
                    return datetime.fromtimestamp(date_val / 1000.0, tz=timezone.utc)
                return datetime.fromtimestamp(date_val, tz=timezone.utc)
            if isinstance(date_val, str):
                # Handle ISO strings
                dt = datetime.fromisoformat(date_val.replace('Z', '+00:00'))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
        except Exception:
            pass
        return None

    async def discover_active_auctions(self) -> List[ScrapedAuction]:
        url = f"{self.base_url}/api/feed/all"
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                
                auctions_raw = []
                if isinstance(data, list):
                    auctions_raw = data
                elif isinstance(data, dict):
                    # Check for 'active.results' which Dickensheet uses
                    if "active" in data and isinstance(data["active"], dict) and "results" in data["active"]:
                        auctions_raw = data["active"]["results"]
                    else:
                        auctions_raw = data.get("auctions", []) or data.get("data", [])
                
                auctions = []
                for a in auctions_raw:
                    auctions.append(ScrapedAuction(
                        id=str(a.get("id") or a.get("auction_id")),
                        name=a.get("title") or a.get("name") or "Unknown Auction",
                        start_time=self._parse_date(a.get("starts_at") or a.get("start_at")),
                        end_time=self._parse_date(a.get("ends_at") or a.get("end_at"))
                    ))
                
                return auctions
            except Exception as e:
                logger.error(f"Error fetching active auctions from {self.base_url}: {e}")
                return []

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[ScrapedAuction, List[ScrapedLot]]:
        url = f"{self.base_url}/api/auctions/{auction_id}?page=active&include_items_data=true"
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                auction_data = response.json()
                
                auction = ScrapedAuction(
                    id=str(auction_data.get("id") or auction_id),
                    name=auction_data.get("title") or auction_data.get("name") or "Unknown Auction",
                    start_time=self._parse_date(auction_data.get("starts_at")),
                    end_time=self._parse_date(auction_data.get("ends_at"))
                )
                
                # In BidWrangler API, items are usually in 'items' or directly inside the auction object
                lots_raw = auction_data.get("items", [])
                
                lots = []
                for l in lots_raw:
                    # Construct URL if possible
                    lot_id = str(l.get("id"))
                    lot_url = l.get("url")
                    if not lot_url:
                        # Common BidWrangler pattern
                        lot_url = f"{self.base_url}/auctions/{auction_id}/lots/{lot_id}"

                    # Determine image URL
                    image_url = l.get("primary_image_url")
                    if not image_url:
                        images = l.get("images", [])
                        if images and isinstance(images, list):
                            if isinstance(images[0], dict):
                                image_url = images[0].get("url") or images[0].get("src")
                            else:
                                image_url = images[0]

                    lots.append(ScrapedLot(
                        id=lot_id,
                        lot_number=str(l.get("lot_number") or lot_id),
                        title=l.get("title") or "Unknown Lot",
                        description=l.get("description"),
                        url=lot_url,
                        image_url=image_url,
                        current_bid=float(l.get("current_bid_amount") or l.get("current_bid") or 0.0),
                        end_time=self._parse_date(l.get("ends_at"))
                    ))
                
                return auction, lots
            except Exception as e:
                logger.error(f"Error fetching lots for auction {auction_id} from {self.base_url}: {e}")
                # We need to return a dummy auction to satisfy the return type
                dummy_auction = ScrapedAuction(id=auction_id, name="Error Loading Auction")
                return dummy_auction, []

    async def health_check(self) -> bool:
        url = f"{self.base_url}/api/feed/all"
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
            try:
                response = await client.get(url)
                return response.status_code == 200
            except:
                return False

    async def login(self, username: str, password: str = None, session_cookie: str = None) -> bool:
        """
        BidWrangler API login.
        If session_cookie is provided, use it directly (Pseudo-Auth bypass).
        """
        if session_cookie:
            self.headers["Cookie"] = session_cookie.strip()
            return True
            
        raise NotImplementedError("BidWrangler API authentication not fully implemented. Use session cookie bypass.")

    async def place_bid(self, auction_id: str, lot_number: str, amount: float) -> Dict[str, Any]:
        """
        Submit a bid to BidWrangler platform.
        """
        if "Cookie" not in self.headers:
            raise PermissionError("Not authenticated. Call login() first.")
            
        raise NotImplementedError("Direct bidding structure not fully mapped for BidWrangler API yet.")

    async def fetch_my_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        if "Cookie" not in self.headers:
            raise PermissionError("No session cookie set.")
            
        url = f"{self.base_url}/api/users/me/bids"
        return await self._fetch_bids_from_url(url)

    async def fetch_closed_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        if "Cookie" not in self.headers:
            raise PermissionError("No session cookie set.")
            
        url = f"{self.base_url}/api/users/me/bids?status=ended"
        return await self._fetch_bids_from_url(url)

    async def _fetch_bids_from_url(self, url: str) -> List[ScrapedBid]:
        bidding_data = []
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                if response.status_code == 404 and "/users/me/bids" in url:
                    # Fallback to older BidWrangler endpoint
                    fallback_url = url.replace("/users/me/bids", "/account/bids")
                    response = await client.get(fallback_url)
                
                response.raise_for_status()
                data = response.json()
                bids = data.get("bids", []) or data.get("data", [])
                for bid in bids:
                    status = "closed" if bid.get("ended") or bid.get("status") == "ended" else "open"
                    
                    # Map BidWrangler winning status to our standardized won/lost for closed auctions
                    u_status = "winning" if bid.get("winning") else "outbid"
                    if status == "closed":
                        u_status = "won" if bid.get("winning") else "lost"

                    bidding_data.append(ScrapedBid(
                        id=str(bid.get("item_id") or bid.get("id")),
                        title=bid.get("title") or bid.get("item_title") or "Unknown Item",
                        status=status,
                        user_bid_status=u_status,
                        current_bid=float(bid.get("current_bid_amount") or bid.get("current_bid") or 0.0),
                        user_bid=float(bid.get("amount") or 0.0),
                        proxy_bid=float(bid.get("max_bid") or 0.0),
                        end_time=self._parse_date(bid.get("ends_at"))
                    ))
            except Exception as e:
                logger.error(f"Error fetching BidWrangler bids from {url}: {e}")
                raise e
                
        return bidding_data
