import logging
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from .ai_providers import get_active_provider, LocalProvider

logger = logging.getLogger(__name__)

async def extract_product_name(title: str, db: Optional[Session] = None) -> str:
    """
    Extract a clean, professional product name from this auction title.
    """
    provider = get_active_provider(db) if db else LocalProvider()
    return await provider.extract_product_name(title)

async def extract_buyers_premium(auction_terms: str, default_pct: float = 15.0, db: Optional[Session] = None) -> float:
    """
    Extract the buyer's premium percentage from the auction terms.
    """
    provider = get_active_provider(db) if db else LocalProvider()
    return await provider.extract_buyers_premium(auction_terms, default_pct)

async def generate_valuation_data(title: str, description: str, raw_category: str, image_urls: Optional[List[str]] = None, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Uses AI to classify an item, generate tags, and provide a list of eBay search queries.
    """
    provider = get_active_provider(db) if db else LocalProvider()
    return await provider.generate_valuation_data(title, description, raw_category, image_urls)

async def classify_item(title: str, description: str, raw_category: str, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Uses AI to classify an item into the Category > Type hierarchy and generate tags.
    """
    provider = get_active_provider(db) if db else LocalProvider()
    return await provider.classify_item(title, description, raw_category)

async def generate_tags_for_item(title: str, description: str, category: str, db: Optional[Session] = None) -> List[str]:
    result = await classify_item(title, description, category, db=db)
    return result.get("tags", [])
