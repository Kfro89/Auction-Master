import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from .auctioneer_software import AuctioneerSoftwareBaseScraper, parse_price, parse_date
from app.schemas.scraping import ScrapedBid

logger = logging.getLogger(__name__)

class RollerAuctionScraper(AuctioneerSoftwareBaseScraper):
    """
    Scraper for Roller Auction (bid.rollerauction.com).
    Uses the default Auctioneer Software /account/bids endpoint.
    """

    async def fetch_my_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        """
        Fetch active bids for the user.
        """
        return await self._fetch_account_bids(status_filter="open")

    async def fetch_closed_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        """
        Fetch closed/past bids for the user.
        """
        return await self._fetch_account_bids(status_filter="closed")

    async def _fetch_account_bids(self, status_filter: str) -> List[ScrapedBid]:
        if not self.client.cookies:
            raise PermissionError("Not authenticated. Call login() first.")

        url = f"{self.base_url}/account/bids"
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            
            state = self._extract_apollo_state(response.text)
            bids = []
            
            for key, value in state.items():
                if (key.startswith("AuctionLot:") or key.startswith("AuctionLot.")) and isinstance(value, dict):
                    lot_id = key.split(":")[1] if ":" in key else key.split(".")[1]
                    
                    # Check if user has a bid on this lot
                    user_bid_ref = value.get("userBid") or value.get("user_bid")
                    if not user_bid_ref:
                        continue
                    
                    # Resolve user bid details
                    user_bid_obj = {}
                    if isinstance(user_bid_ref, dict) and "__ref" in user_bid_ref:
                        ref_key = user_bid_ref["__ref"]
                        user_bid_obj = state.get(ref_key, {})
                    
                    # Determine lot status
                    is_ended = value.get("isEnded") or value.get("is_ended") or False
                    # Fallback check against end_time
                    end_time = parse_date(value.get("endsAt") or value.get("ends_at") or value.get("endTime") or value.get("end_time"))
                    if not is_ended and end_time:
                        is_ended = end_time <= datetime.now(timezone.utc)
                    
                    # Filter based on requested status
                    # Note: We allow ended items through status_filter="open" so that bid_sync 
                    # can capture the final won/lost status before they drop off the list.
                    if status_filter == "closed" and not is_ended:
                        continue

                    is_winning = value.get("isHighBidder") or value.get("is_high_bidder") or False
                    current_bid = parse_price(value.get("currentBid") or value.get("current_bid") or value.get("price") or 0.0)
                    user_bid_amount = parse_price(user_bid_obj.get("amount") or 0.0)
                    proxy_bid = parse_price(user_bid_obj.get("maxBid") or user_bid_obj.get("max_bid") or 0.0)
                    
                    user_status = "winning" if is_winning else "outbid"
                    if is_ended:
                        user_status = "won" if is_winning else "lost"

                    bids.append(ScrapedBid(
                        id=lot_id,
                        title=value.get("title") or "Unknown Lot",
                        status="closed" if is_ended else "open",
                        user_bid_status=user_status,
                        current_bid=current_bid,
                        user_bid=user_bid_amount,
                        proxy_bid=proxy_bid,
                        end_time=end_time
                    ))
            
            return bids
            
        except Exception as e:
            logger.error(f"Error fetching account bids from {url}: {e}")
            raise e

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
            logger.warning(f"Failed to extract bidder ID from {self.base_url} state: {e}")
            
        return None
