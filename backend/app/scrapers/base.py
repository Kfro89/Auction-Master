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
