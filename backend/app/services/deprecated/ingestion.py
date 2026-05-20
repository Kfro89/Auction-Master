from sqlalchemy.orm import Session
from .discovery import discover_auctioneer_software, discover_public_surplus, discover_bidwrangler, discover_govdeals
from .bid_sync import sync_active_bids
from .enrichment import enrich_pending_items
from .ebay_valuation import process_pending_valuations as process_ebay_valuations
import logging

logger = logging.getLogger(__name__)

async def ingest_auctioneer_software(db: Session, base_url: str, website_key: str, name: str, buyer_premium: float):
    """Refactored wrapper for Auctioneer Software ingestion."""
    new_items = await discover_auctioneer_software(db, base_url, website_key, name, buyer_premium)
    # We don't automatically trigger enrichment/valuation here anymore, 
    # it's handled by the orchestrator in main.py or manually.
    return {"status": "success", "new_items": new_items}

async def ingest_public_surplus(db: Session):
    """Refactored wrapper for Public Surplus ingestion."""
    new_items = await discover_public_surplus(db)
    # Also sync bids as it's high priority for this platform
    await sync_active_bids(db)
    return {"status": "success", "new_items": new_items}

async def ingest_bidwrangler(db: Session, base_url: str, website_key: str, name: str, buyer_premium: float = 15.0):
    """Refactored wrapper for BidWrangler ingestion."""
    new_items = await discover_bidwrangler(db, base_url, website_key, name, buyer_premium)
    return {"status": "success", "new_items": new_items}

async def ingest_govdeals(db: Session):
    """Refactored wrapper for GovDeals ingestion."""
    new_items = await discover_govdeals(db)
    return {"status": "success", "new_items": new_items}
