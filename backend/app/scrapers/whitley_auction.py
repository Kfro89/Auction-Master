import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from .auctioneer_software import AuctioneerSoftwareBaseScraper, parse_price, parse_date
from app.schemas.scraping import ScrapedBid

logger = logging.getLogger(__name__)

class WhitleyAuctionScraper(AuctioneerSoftwareBaseScraper):
    """
    Scraper for Whitley Auction (www.whitleyauction.com).
    Whitley uses the /account/watchlist endpoint for active bids and Redux for Auth state.
    """

    async def fetch_my_bids(self, buyer_id: str = None) -> List[ScrapedBid]:
        """
        Fetch active bids for the user from the Watchlist.
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

        # Whitley stores active bids in the Watchlist page
        url = f"{self.base_url}/account/watchlist?page=1&pageSize=1000"
        logger.info(f"WhitleySync: Fetching watchlist from {url}")
        try:
            response = await self.client.get(url)
            logger.info(f"WhitleySync: Response status: {response.status_code}")
            response.raise_for_status()
            
            state = self._extract_apollo_state(response.text)
            redux = self._extract_redux_data(response.text)
            
            logger.info(f"WhitleySync: Apollo state keys: {len(state.keys())}")
            logger.info(f"WhitleySync: Redux data keys: {list(redux.keys())}")
            
            # Extract the user ID from Redux if available
            current_user_id = redux.get("auth", {}).get("user", {}).get("user_id")
            logger.info(f"WhitleySync: Identified Current User ID: {current_user_id}")
            
            bids = []
            lot_count = 0
            bidding_count = 0
            
            for key, value in state.items():
                if (key.startswith("AuctionLot:") or key.startswith("AuctionLot.")) and isinstance(value, dict):
                    lot_count += 1
                    lot_id = key.split(":")[1] if ":" in key else key.split(".")[1]
                    
                    # On Whitley, we look for am_bidding or presence of a bid
                    am_bidding = value.get("am_bidding") or value.get("amBidding") or False
                    
                    # Resolve user bid details - could be embedded or a reference
                    user_bid_obj = {}
                    user_bid_ref = value.get("userBid") or value.get("user_bid")
                    if isinstance(user_bid_ref, dict):
                        if "__ref" in user_bid_ref:
                            user_bid_obj = state.get(user_bid_ref["__ref"], {})
                        else:
                            # Embedded object
                            user_bid_obj = user_bid_ref

                    # Check max bid (user's current high bid)
                    my_max_bid_obj = value.get("my_max_bid") or value.get("myMaxBid")
                    if isinstance(my_max_bid_obj, dict):
                        if "__ref" in my_max_bid_obj:
                            my_max_bid_obj = state.get(my_max_bid_obj["__ref"], {})
                        
                        if my_max_bid_obj and "amount" in my_max_bid_obj:
                            # This lot definitely has a bid from the user
                            am_bidding = True

                    if not am_bidding and not user_bid_obj:
                        continue
                    
                    bidding_count += 1
                    
                    # Determine lot status
                    is_ended = value.get("isEnded") or value.get("is_ended") or value.get("is_past_end_time") or False
                    # Fallback check against end_time
                    end_time_raw = value.get("endsAt") or value.get("ends_at") or value.get("endTime") or value.get("end_time")
                    end_time = parse_date(end_time_raw)
                    if not is_ended and end_time:
                        is_ended = end_time <= datetime.now(timezone.utc)
                    
                    # Filter based on requested status
                    # Note: We allow ended items through status_filter="open" so that bid_sync 
                    # can capture the final won/lost status before they drop off the list.
                    if status_filter == "closed" and not is_ended:
                        continue

                    # Determine if winning
                    am_winning = value.get("am_winning") or value.get("amWinning") or False
                    
                    # Documentation check: if winning_bidder.user_id matches current_user_id
                    winning_bidder = value.get("winning_bidder") or {}
                    winning_user_id = winning_bidder.get("user_id")
                    
                    if not am_winning and current_user_id and winning_user_id:
                        am_winning = str(winning_user_id) == str(current_user_id)

                    current_bid = parse_price(value.get("winning_bid_amount") or value.get("current_bid") or value.get("price") or 0.0)
                    
                    # Resolve bid amount
                    user_bid_amount = parse_price(user_bid_obj.get("amount") or (my_max_bid_obj.get("amount") if my_max_bid_obj else 0.0))
                    
                    # Max bid might be in my_max_proxy or my_max_bid
                    max_proxy_obj = value.get("my_max_proxy") or value.get("myMaxProxy")
                    proxy_bid = 0.0
                    if isinstance(max_proxy_obj, dict):
                        if "__ref" in max_proxy_obj:
                            max_proxy_obj = state.get(max_proxy_obj["__ref"], {})
                        proxy_bid = parse_price(max_proxy_obj.get("amount") or 0.0)

                    user_status = "winning" if am_winning else "outbid"
                    if is_ended:
                        user_status = "won" if am_winning else "lost"

                    bids.append(ScrapedBid(
                        id=lot_id,
                        title=value.get("title") or "Unknown Lot",
                        status="closed" if is_ended else "open",
                        user_bid_status=user_status,
                        current_bid=current_bid,
                        user_bid=user_bid_amount if user_bid_amount > 0 else (current_bid if am_winning else 0.0),
                        proxy_bid=proxy_bid,
                        end_time=end_time
                    ))
            
            logger.info(f"WhitleySync: Processed {lot_count} lots, found {bidding_count} bids, returning {len(bids)} matching {status_filter}")
            return bids
            
        except Exception as e:
            logger.error(f"Error fetching Whitley watchlist bids from {url}: {e}")
            raise e

    async def fetch_my_bidder_id(self) -> str:
        """
        Attempts to extract the logged-in user's Bidder Number from Redux or Apollo.
        """
        if not self.client.cookies:
            return None
            
        try:
            response = await self.client.get(f"{self.base_url}/")
            response.raise_for_status()
            
            # 1. Try Redux first as it's definitive on Whitley
            redux = self._extract_redux_data(response.text)
            user_id = redux.get("auth", {}).get("user", {}).get("user_id")
            if user_id:
                return str(user_id)

            # 2. Fallback to Apollo
            state = self._extract_apollo_state(response.text)
            root = state.get("ROOT_QUERY", {})
            for k, v in root.items():
                if ("currentUser" in k or "myUser" in k) and isinstance(v, dict) and "__ref" in v:
                    user_ref = v["__ref"]
                    user_obj = state.get(user_ref, {})
                    return str(user_obj.get("user_id") or user_obj.get("id") or user_ref.split(".")[1])
                        
        except Exception as e:
            logger.warning(f"Failed to extract Whitley bidder ID: {e}")
            
        return None
