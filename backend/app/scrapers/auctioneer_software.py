import re
import json
import httpx
import asyncio
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone
from .base import BaseScraper
from app.schemas.scraping import ScrapedAuction, ScrapedLot, ScrapedBid

logger = logging.getLogger(__name__)

def parse_date(date_val: Any) -> Optional[datetime]:
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

def parse_price(val: Any) -> float:
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        try:
            return float(val.replace('$', '').replace(',', '').strip())
        except ValueError:
            return 0.0
    return 0.0

class AuctioneerSoftwareBaseScraper(BaseScraper):
    """
    Base scraper for the Auctioneer Software platform.
    Provides common logic for Apollo state extraction and lot discovery.
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

    def _extract_redux_data(self, html: str) -> Dict[str, Any]:
        """
        Extracts the window.REDUX_DATA JSON object from the HTML source.
        """
        pattern = re.compile(r'window\.REDUX_DATA\s*=\s*(\{.*?\});\s*</script>', re.DOTALL)
        match = pattern.search(html)
        if not match:
            return {}
        
        json_str = match.group(1).strip()
        if json_str.endswith(";"):
            json_str = json_str[:-1]
        
        # In JavaScript, undefined might be present, which is invalid JSON.
        json_str = json_str.replace(":undefined", ":null")
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse REDUX_DATA JSON: {e}")
            return {}

    def _get_image_url(self, img_obj: Any) -> Optional[str]:
        if not img_obj:
            return None
        url = None
        if isinstance(img_obj, str):
            url = img_obj
        elif isinstance(img_obj, dict):
            # Try various common fields for Auctioneer Software
            for field in ["url", "original_url", "large_url", "medium_url", "src"]:
                if img_obj.get(field):
                    url = img_obj.get(field)
                    break
        
        if url and not url.startswith("http"):
            url = f"{self.base_url}{url}" if url.startswith("/") else f"{self.base_url}/{url}"
        return url

    async def discover_active_auctions(self) -> List[ScrapedAuction]:
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
                    auctions.append(ScrapedAuction(
                        id=auction_id,
                        name=value.get("name") or value.get("title") or "Unknown Auction",
                        start_time=parse_date(value.get("starts_at") or value.get("startsAt")),
                        end_time=parse_date(value.get("ends_at") or value.get("endsAt"))
                    ))
                
        return auctions

    async def fetch_auction_lots(self, auction_id: str) -> Tuple[ScrapedAuction, List[ScrapedLot]]:
        """
        Fetch all lots for a specific auction by iterating through pagination.
        """
        first_page_url = f"{self.base_url}/auctions/{auction_id}?pageSize=10000"
        response = await self.client.get(first_page_url)
        response.raise_for_status()
        
        first_page_state = self._extract_apollo_state(response.text)
        auction_metadata_raw = first_page_state.get(f"Auction.{auction_id}", {})
        
        auction_metadata = ScrapedAuction(
            id=auction_id,
            name=auction_metadata_raw.get("name") or auction_metadata_raw.get("title") or "Unknown Auction",
            start_time=parse_date(auction_metadata_raw.get("starts_at") or auction_metadata_raw.get("startsAt")),
            end_time=parse_date(auction_metadata_raw.get("ends_at") or auction_metadata_raw.get("endsAt"))
        )
        
        total_lots = auction_metadata_raw.get("front_visible_lot_count")
        if total_lots is None:
            # Fallback: if we can't find the count, just return the first page
            lots = self._extract_lots_from_state(first_page_state, auction_id)
            return auction_metadata, lots
            
        all_lots_dict = {} # Use dict to avoid duplicates by ID
        
        # Add first page lots
        for lot in self._extract_lots_from_state(first_page_state, auction_id):
            all_lots_dict[lot.id] = lot
            
        # Determine how many pages we need. 
        # The default pageSize seems to be 50 from our metadata inspection.
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
                new_lots = self._extract_lots_from_state(page_state, auction_id)
                
                if not new_lots:
                    break # No more lots found
                    
                for lot in new_lots:
                    all_lots_dict[lot.id] = lot
                    
                current_page += 1
            except Exception as e:
                print(f"Error fetching page {current_page} for auction {auction_id}: {e}")
                break
                
        return auction_metadata, list(all_lots_dict.values())

    def _extract_lots_from_state(self, state: Dict[str, Any], auction_id: str = None) -> List[ScrapedLot]:
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

                    # Determine image_url
                    image_url = self._get_image_url(lot_data.get("primary_image"))
                    if not image_url and lot_data.get("images"):
                        image_url = self._get_image_url(lot_data["images"][0])
                    
                    # Use provided auction_id or try to find it in lot_data
                    actual_auction_id = auction_id or lot_data.get("auction_id") or lot_data.get("auctionId")
                    lot_url = f"{self.base_url}/auctions/{actual_auction_id}/lot/{lot_id}" if actual_auction_id else None

                    lots.append(ScrapedLot(
                        id=lot_id,
                        lot_number=str(lot_data.get("lot_number") or lot_data.get("lotNumber") or ""),
                        title=lot_data.get("title") or "Unknown Lot",
                        description=lot_data.get("description"),
                        url=lot_url,
                        image_url=image_url,
                        current_bid=parse_price(lot_data.get("current_bid") or lot_data.get("high_bid") or lot_data.get("high_bid_amount") or 0.0),
                        end_time=parse_date(lot_data.get("ends_at") or lot_data.get("endsAt"))
                    ))
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

    async def close(self):
        await self.client.aclose()

# Backward compatibility alias
AuctioneerSoftwareScraper = AuctioneerSoftwareBaseScraper
