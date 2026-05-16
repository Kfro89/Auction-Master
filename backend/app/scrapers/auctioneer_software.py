import re
import json
import httpx
import asyncio
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
        # We use a regex to capture the JSON string until the trailing semicolon before the closing script tag.
        pattern = re.compile(r'window\.__APOLLO_STATE__\s*=\s*(\{.*?\});\s*</script>', re.DOTALL)
        match = pattern.search(html)
        if not match:
            # Fallback for slightly different formats
            pattern = re.compile(r'window\.__APOLLO_STATE__\s*=\s*(\{.*?)\s*</script>', re.DOTALL)
            match = pattern.search(html)
        
        if not match:
            if "Cloudflare" in html or "Attention Required!" in html:
                raise Exception("Blocked by Cloudflare/Anti-bot")
            raise ValueError(f"Could not find __APOLLO_STATE__ in HTML from {self.base_url}")
        
        json_str = match.group(1).strip()
        if json_str.endswith(";"):
            json_str = json_str[:-1]
        
        # In JavaScript, undefined might be present, which is invalid JSON.
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
        for attempt in range(3):
            try:
                response = await self.client.get(url)
                if response.status_code == 404:
                    # Roller often uses just the homepage
                    url = f"{self.base_url}/"
                    response = await self.client.get(url)
                    
                response.raise_for_status()
                break
            except Exception as e:
                if attempt == 2:
                    raise
                await asyncio.sleep(2)
        
        state = self._extract_apollo_state(response.text)
        auctions = []
        
        for key, value in state.items():
            if key.startswith("Auction."):
                auction_id = key.split(".")[1]
                if isinstance(value, dict):
                    auction_data = value.copy()
                    if 'id' not in auction_data:
                        auction_data['id'] = auction_id
                    auctions.append(auction_data)
                
        return auctions

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Fetch all lots for a specific auction by iterating through pagination.
        """
        first_page_url = f"{self.base_url}/auctions/{auction_id}?pageSize=10000"
        response = await self.client.get(first_page_url)
        response.raise_for_status()
        
        first_page_state = self._extract_apollo_state(response.text)
        auction_metadata = first_page_state.get(f"Auction.{auction_id}", {})
        
        total_lots = auction_metadata.get("front_visible_lot_count")
        if total_lots is None:
            # Fallback: if we can't find the count, just return the first page
            lots = self._extract_lots_from_state(first_page_state)
            return auction_metadata, lots
            
        all_lots_dict = {} # Use dict to avoid duplicates by ID
        
        # Add first page lots
        for lot in self._extract_lots_from_state(first_page_state):
            all_lots_dict[lot['id']] = lot
            
        # Determine how many pages we need. 
        # The default pageSize seems to be 50 from our metadata inspection.
        page_size = 50
        current_page = 2
        
        while len(all_lots_dict) < total_lots:
            # Safety break to avoid infinite loops
            if current_page > 100: 
                break
                
            page_url = f"{self.base_url}/auctions/{auction_id}?pageSize=10000&page={current_page}"
            try:
                await asyncio.sleep(1.0) # Rate limiting courtesy
                response = await self.client.get(page_url)
                response.raise_for_status()
                
                page_state = self._extract_apollo_state(response.text)
                new_lots = self._extract_lots_from_state(page_state)
                
                if not new_lots:
                    break # No more lots found
                    
                for lot in new_lots:
                    all_lots_dict[lot['id']] = lot
                    
                current_page += 1
            except Exception as e:
                print(f"Error fetching page {current_page} for auction {auction_id}: {e}")
                break
                
        return auction_metadata, list(all_lots_dict.values())

    def _extract_lots_from_state(self, state: Dict[str, Any]) -> List[Dict[str, Any]]:
        lots = []
        for key, value in state.items():
            if key.startswith("AuctionLot."):
                lot_id = key.split(".")[1]
                if isinstance(value, dict):
                    lot_data = value.copy()
                    if 'id' not in lot_data:
                        lot_data['id'] = lot_id
                    
                    # Resolve primary_image reference
                    p_img = lot_data.get("primary_image") or lot_data.get("primaryImage")
                    if isinstance(p_img, dict) and "__ref" in p_img:
                        ref_key = p_img["__ref"]
                        if ref_key in state:
                            lot_data["primary_image"] = state[ref_key]
                    
                    # Resolve images list references
                    imgs = lot_data.get("images")
                    if isinstance(imgs, list):
                        resolved_imgs = []
                        for img_ref in imgs:
                            if isinstance(img_ref, dict) and "__ref" in img_ref:
                                r_key = img_ref["__ref"]
                                if r_key in state:
                                    resolved_imgs.append(state[r_key])
                            else:
                                resolved_imgs.append(img_ref)
                        lot_data["images"] = resolved_imgs

                    lots.append(lot_data)
        return lots

    async def health_check(self) -> bool:
        try:
            auctions = await self.discover_active_auctions()
            return len(auctions) > 0
        except Exception:
            return False

    async def login(self, username: str, password: str = None, session_cookie: str = None) -> bool:
        """
        Auctioneer Software (Whitley/Roller) login.
        If session_cookie is provided, use it directly (Pseudo-Auth bypass).
        """
        if session_cookie:
            self.client.cookies.set("connect.sid", session_cookie) # Typical session cookie, might vary
            return True
            
        raise NotImplementedError("Standard HTTP login not implemented yet. Use session cookie bypass.")

    async def fetch_my_bidder_id(self) -> str:
        """
        Attempts to extract the logged-in user's Bidder Number from the Apollo State.
        """
        if not self.client.cookies:
            return None
            
        try:
            for attempt in range(3):
                try:
                    response = await self.client.get(f"{self.base_url}/")
                    response.raise_for_status()
                    break
                except Exception as e:
                    if attempt == 2:
                        raise
                    await asyncio.sleep(2)
            
            state = self._extract_apollo_state(response.text)
            
            # 1. Look for currentUser to get the ID
            root = state.get("ROOT_QUERY", {})
            user_ref = None
            for k, v in root.items():
                if ("currentUser" in k or "me" in k or "viewer" in k) and isinstance(v, dict) and "__ref" in v:
                    user_ref = v["__ref"]
                    break
                    
            if user_ref and user_ref in state:
                user_obj = state[user_ref]
                return str(user_obj.get("bidderNumber") or user_obj.get("id") or user_ref.split(":")[1])
                
            # 2. Fallback: Search all User objects
            for key, value in state.items():
                if key.startswith("User:") and isinstance(value, dict):
                    if "bidderNumber" in value and value["bidderNumber"]:
                        return str(value["bidderNumber"])
                    if "id" in value and value["id"]:
                        return str(value["id"])
                        
        except Exception as e:
            print(f"Failed to extract bidder ID from {self.base_url} state:", e)
            
        return None

    async def place_bid(self, auction_id: str, lot_number: str, amount: float) -> Dict[str, Any]:
        """
        Submit a bid to the platform.
        """
        # We check if we have cookies set on the client
        if not self.client.cookies:
            raise PermissionError("Not authenticated. Call login() first.")
            
        raise NotImplementedError("Direct bidding structure not fully mapped for Auctioneer Software yet.")

    async def fetch_lot_image(self, auction_id: str, lot_id: str) -> str:
        url = f"{self.base_url}/auctions/{auction_id}/lot/{lot_id}"
        resp = await self.client.get(url)
        if resp.status_code == 200:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(resp.text, 'html.parser')
            img_tag = soup.select_one('img.lot-image, .lot-details-gallery img, [property="og:image"]')
            if img_tag:
                url = img_tag.get('src') or img_tag.get('content')
                if url and not url.startswith('http'):
                    url = self.base_url + url
                return url
        return None

    async def close(self):
        await self.client.aclose()
