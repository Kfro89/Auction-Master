import httpx
import logging
from typing import List, Dict, Any, Tuple
from .base import BaseScraper

logger = logging.getLogger(__name__)

class BidWranglerApiScraper(BaseScraper):
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json"
        }

    async def discover_active_auctions(self) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/api/feed/all"
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                
                auctions = []
                if isinstance(data, list):
                    auctions = data
                elif isinstance(data, dict):
                    # Check for 'active.results' which Dickensheet uses
                    if "active" in data and isinstance(data["active"], dict) and "results" in data["active"]:
                        auctions = data["active"]["results"]
                    else:
                        auctions = data.get("auctions", []) or data.get("data", [])
                
                return auctions
            except Exception as e:
                logger.error(f"Error fetching active auctions from {self.base_url}: {e}")
                return []

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        url = f"{self.base_url}/api/auctions/{auction_id}?page=active&include_items_data=true"
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0, follow_redirects=True) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()
                auction_data = response.json()
                
                # In BidWrangler API, items are usually in 'items' or directly inside the auction object
                lots = auction_data.get("items", [])
                
                return auction_data, lots
            except Exception as e:
                logger.error(f"Error fetching lots for auction {auction_id} from {self.base_url}: {e}")
                return {}, []

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
