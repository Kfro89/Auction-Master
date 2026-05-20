import abc
from typing import Dict, List, Optional, Any

class AIProvider(abc.ABC):
    @abc.abstractmethod
    async def extract_product_name(self, title: str) -> str:
        """Extract a clean product name and model number from a noisy auction title."""
        pass

    @abc.abstractmethod
    async def extract_buyers_premium(self, auction_terms: str, default_pct: float = 15.0) -> float:
        """Extract the buyer's premium percentage from the auction terms."""
        pass

    @abc.abstractmethod
    async def generate_valuation_data(self, title: str, description: str, raw_category: str, image_urls: Optional[List[str]] = None) -> Dict[str, Any]:
        """Classify an item, generate tags, and provide eBay search queries."""
        pass

    @abc.abstractmethod
    async def enrich_item_text_only(self, title: str, description: str, raw_category: str) -> Dict[str, Any]:
        """
        Cost-optimized enrichment using only text data.
        Returns: category, type, tags, product_name, search_queries.
        """
        pass

    @abc.abstractmethod
    async def reason_valuation_multimodal(self, title: str, description: str, image_urls: List[str], ebay_comps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        High-precision valuation reasoning using multiple images and eBay search results.
        Returns: adjusted_market_value, condition_grade, reasoning_summary.
        """
        pass

    @abc.abstractmethod
    async def classify_item(self, title: str, description: str, raw_category: str) -> Dict[str, Any]:
        """Classify an item into the Category > Type hierarchy and generate tags."""
        pass
