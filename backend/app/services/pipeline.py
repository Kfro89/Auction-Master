import asyncio
import logging
from typing import Dict, Any, Optional, Callable, Coroutine
from sqlalchemy.orm import Session
from .research_service import (
    discover_auctioneer_software, 
    discover_public_surplus, 
    discover_bidwrangler, 
    discover_govdeals,
    prune_expired_items
)
from .bidding_service import sync_active_bids
from .enrichment import enrich_pending_items
from .valuation_worker import process_pending_valuations as process_ebay_valuations

logger = logging.getLogger(__name__)

class PipelineStatus:
    def __init__(self, callback: Optional[Callable[[Dict[str, Any]], Coroutine]] = None):
        self.callback = callback
        self.message = "Initializing..."
        self.new_items = 0
        self.enriched_text = 0
        self.enriched_multimodal = 0
        self.valuated = 0
        self.errors = []
        self.current_stage = "idle"

    async def update(self, message: str = None, stage: str = None, new_items: int = 0, enriched_text: int = 0, enriched_multimodal: int = 0, valuated: int = 0, error: str = None):
        if message: self.message = message
        if stage: self.current_stage = stage
        if new_items: self.new_items += new_items
        if enriched_text: self.enriched_text += enriched_text
        if enriched_multimodal: self.enriched_multimodal += enriched_multimodal
        if valuated: self.valuated += valuated
        if error:
            self.errors.append(error)
            self.message = f"Error: {error}"
            logger.error(f"Pipeline Error: {error}")
        
        # Log for server-side debugging
        status_log = f"[{self.current_stage.upper()}] {self.message}"
        total_enriched = self.enriched_text + self.enriched_multimodal
        if new_items or total_enriched or valuated:
            status_log += f" (New: {self.new_items}, Enriched: {total_enriched} [Text: {self.enriched_text}, MM: {self.enriched_multimodal}], Valuated: {self.valuated})"
        logger.info(status_log)

        if self.callback:
            payload = {
                "message": self.message,
                "stage": self.current_stage,
                "new_items": self.new_items,
                "enriched": self.enriched_text + self.enriched_multimodal,
                "enriched_text": self.enriched_text,
                "enriched_multimodal": self.enriched_multimodal,
                "valuated": self.valuated,
                "error_count": len(self.errors),
                "last_error": self.errors[-1] if self.errors else None
            }
            try:
                if asyncio.iscoroutinefunction(self.callback):
                    await self.callback(payload)
                else:
                    self.callback(payload)
            except Exception as e:
                logger.error(f"Failed to execute pipeline status callback: {e}")

async def run_full_ingestion_pipeline(db: Session, update_status_callback=None):
    """
    Orchestrates the full intake pipeline with granular status reporting.
    Flow: Discovery -> Bid Sync -> AI Enrichment -> eBay Valuation
    """
    status = PipelineStatus(callback=update_status_callback)
    
    try:
        # --- PHASE 1: DISCOVERY ---
        status.current_stage = "discovery"
        
        # Whitley
        await status.update(message="Scanning Whitley Auction...")
        count = await discover_auctioneer_software(db, "https://www.whitleyauction.com", "rmeb", "Whitley Auction", 18.5)
        await status.update(new_items=count)
        
        # Roller
        await status.update(message="Scanning Roller Auction...")
        count = await discover_auctioneer_software(db, "https://bid.rollerauction.com", "rol", "Roller Auction", 15.0)
        await status.update(new_items=count)
        
        # Dickensheet
        await status.update(message="Scanning Dickensheet Auction...")
        count = await discover_bidwrangler(db, "https://bid.dickensheet.com", "dickensheet", "Dickensheet Auction", 15.0)
        await status.update(new_items=count)
        
        # Public Surplus
        await status.update(message="Scanning Public Surplus...")
        count = await discover_public_surplus(db)
        await status.update(new_items=count)
        
        # GovDeals
        await status.update(message="Scanning GovDeals...")
        count = await discover_govdeals(db)
        await status.update(new_items=count)
        
        # --- PHASE 2: BID SYNC ---
        await status.update(stage="bid_sync", message="Synchronizing active bids...")
        await sync_active_bids(db)
        
        # --- PHASE 3: AI ENRICHMENT ---
        from ..models import ResearchItem, BidItem
        from .ai_providers import get_ai_concurrency_limit
        
        # Sum pending items across all models
        pending_enrich = (
            db.query(ResearchItem).filter(ResearchItem.processing_status == "pending_enrichment").count() +
            db.query(BidItem).filter(BidItem.processing_status == "pending_enrichment").count()
        )
        
        if pending_enrich > 0:
            await status.update(stage="enrichment", message=f"Classifying {pending_enrich} items via AI...")
            processed_enrich = 0
            concurrency = get_ai_concurrency_limit(db)
            while True:
                # Process in batches equal to concurrency limit
                text_count, mm_count = await enrich_pending_items(db, batch_size=concurrency)
                if text_count + mm_count == 0: break
                processed_enrich += (text_count + mm_count)
                await status.update(message=f"Enriched {processed_enrich}/{pending_enrich} items...", enriched_text=text_count, enriched_multimodal=mm_count)
                await asyncio.sleep(0.1) # Yield for other tasks
            
        # --- PHASE 4: EBAY VALUATION ---
        pending_val = (
            db.query(ResearchItem).filter(ResearchItem.processing_status == "pending_valuation").count() +
            db.query(BidItem).filter(BidItem.processing_status == "pending_valuation").count()
        )
        
        if pending_val > 0:
            await status.update(stage="valuation", message=f"Valuating {pending_val} items via eBay...")
            processed_val = 0
            while True:
                # eBay is more sensitive to concurrency, so we stick to a reasonable batch or use same limit
                val_batch = min(get_ai_concurrency_limit(db), 15) 
                count = await process_ebay_valuations(db, batch_size=val_batch)
                if count == 0: break
                processed_val += count
                await status.update(message=f"Valuated {processed_val}/{pending_val} items...", valuated=count)
                await asyncio.sleep(0.1)

        # --- FINISH ---
        total_enriched = status.enriched_text + status.enriched_multimodal
        final_msg = f"Completed. Found {status.new_items} new items, Enriched {total_enriched} [Text: {status.enriched_text}, MM: {status.enriched_multimodal}], Valuated {status.valuated}."
        await status.update(stage="idle", message=final_msg)
        return True

    except Exception as e:
        error_msg = f"Pipeline failed: {str(e)}"
        await status.update(error=error_msg)
        return False
