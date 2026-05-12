from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseScraper(ABC):
    """
    Abstract base class for auction site scrapers.
    Defines the contract for discovery and extraction.
    """

    @abstractmethod
    async def discover_active_auctions(self) -> List[Dict[str, Any]]:
        """
        Discover active or upcoming auctions on the platform.
        Returns a list of standardized dictionary representations of auctions.
        """
        pass

    @abstractmethod
    async def fetch_auction_lots(self, auction_id: str) -> List[Dict[str, Any]]:
        """
        Fetch all lots for a given auction.
        Returns a list of standardized dictionary representations of items.
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the scraper can successfully reach the site and parse the expected format.
        """
        pass

    async def login(self, username: str, password: str = None, session_cookie: str = None) -> bool:
        """
        Attempt to authenticate the scraper session.
        If a session_cookie is provided, use it directly (Pseudo-Auth bypass).
        Raises specific exceptions on CAPTCHA / 2FA requirements.
        Returns True on success.
        """
        raise NotImplementedError("Login not implemented for this platform.")

    async def place_bid(self, auction_id: str, lot_number: str, amount: float) -> Dict[str, Any]:
        """
        Place a manual bid on a specific lot.
        Returns a dictionary with status, message, and any updated bid details.
        """
        raise NotImplementedError("Bidding not implemented for this platform.")
