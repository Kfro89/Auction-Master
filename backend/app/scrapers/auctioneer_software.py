import re
import json
import httpx
from typing import List, Dict, Any, Tuple
from .base import BaseScraper

class AuctioneerSoftwareScraper(BaseScraper):
    """
    Multi-tenant scraper for the Auctioneer Software platform.
    Supports Whitley Auction (rmeb) and Roller Auction (rol).
    """

    def __init__(self, base_url: str, website_key: str):
        self.base_url = base_url.rstrip("/")
        self.website_key = website_key
        self.client = httpx.AsyncClient(
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
            follow_redirects=True,
            timeout=30.0
        )

    def _extract_apollo_state(self, html: str) -> Dict[str, Any]:
        """
        Extracts the window.__APOLLO_STATE__ JSON object from the HTML source.
        """
        # The object is typically embedded in a script tag like: window.__APOLLO_STATE__ = {...};
        # We use a regex to capture the JSON string until the trailing semicolon.
        pattern = re.compile(r'window\.__APOLLO_STATE__\s*=\s*(\{.*?\});', re.DOTALL)
        match = pattern.search(html)
        if not match:
            # Fallback: some platforms might use window.__INITIAL_STATE__ or slightly different formats
            # Specifically check if we got rate limited or a Cloudflare page
            if "Cloudflare" in html or "Attention Required!" in html:
                raise Exception("Blocked by Cloudflare/Anti-bot")
            raise ValueError(f"Could not find __APOLLO_STATE__ in HTML from {self.base_url}")
        
        json_str = match.group(1)
        # In JavaScript, undefined might be present, which is invalid JSON.
        # We do a basic string replacement if needed, but usually the SSR injects clean JSON.
        json_str = json_str.replace(":undefined", ":null")
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse __APOLLO_STATE__ JSON: {e}")

    async def discover_active_auctions(self) -> List[Dict[str, Any]]:
        """
        Fetch the auction calendar or homepage to extract active auctions.
        """
        # For both Whitley and Roller, the upcoming auctions are on the homepage or /auction-calendar
        url = f"{self.base_url}/auction-calendar"
        response = await self.client.get(url)
        if response.status_code == 404:
            # Roller often uses just the homepage
            url = f"{self.base_url}/"
            response = await self.client.get(url)
            
        response.raise_for_status()
        
        state = self._extract_apollo_state(response.text)
        auctions = []
        
        for key, value in state.items():
            if key.startswith("Auction."):
                auctions.append(value)
                
        return auctions

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Fetch a specific auction page and extract its lots.
        Returns a tuple: (auction_metadata, list_of_lots)
        """
        url = f"{self.base_url}/auctions/{auction_id}"
        response = await self.client.get(url)
        response.raise_for_status()
        
        state = self._extract_apollo_state(response.text)
        
        auction_metadata = state.get(f"Auction.{auction_id}", {})
        lots = []
        
        for key, value in state.items():
            if key.startswith("AuctionLot."):
                lots.append(value)
                
        # If there are multiple pages of lots, we would technically need to paginate.
        # However, the __APOLLO_STATE__ often contains the first page of 25.
        # For a full scrape without JS execution, we can query the GraphQL endpoint directly
        # by mimicking the POST request to /api, OR we iterate pagination in the URL: ?page=2
        # For Phase 1/2 pilot, extracting the embedded page state is our starting point.
                
        return auction_metadata, lots

    async def health_check(self) -> bool:
        try:
            auctions = await self.discover_active_auctions()
            return len(auctions) > 0
        except Exception:
            return False

    async def close(self):
        await self.client.aclose()
