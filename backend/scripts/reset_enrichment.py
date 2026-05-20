import sys
import os
import asyncio
import logging

# Add the parent directory to sys.path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import ResearchItem, BidItem, Item, InventoryItem
from app.services.llm import generate_valuation_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reset_enrichment")

async def reset_and_reenrich():
    db = SessionLocal()
    try:
        # 1. Reset ResearchItem, BidItem, Item
        # These will be picked up by the background worker (Phase 3 of the pipeline)
        print("Resetting statuses for ResearchItem, BidItem, and Item...")
        res_count = db.query(ResearchItem).update({"processing_status": "pending_enrichment"})
        bid_count = db.query(BidItem).update({"processing_status": "pending_enrichment"})
        item_count = db.query(Item).update({"processing_status": "pending_enrichment"})
        db.commit()
        print(f"Reset {res_count} ResearchItems, {bid_count} BidItems, and {item_count} Items to 'pending_enrichment'.")
        print("They will be processed by the background worker during the next ingestion sweep.")

        # 2. Re-enrich Inventory Items directly
        # InventoryItems don't have a background worker, so we process them here.
        inv_items = db.query(InventoryItem).all()
        print(f"\nDirectly re-enriching {len(inv_items)} Inventory Items...")
        for i, item in enumerate(inv_items):
            print(f"[{i+1}/{len(inv_items)}] Processing Inventory Item: {item.title}")
            try:
                # Use title for enrichment
                classification = await generate_valuation_data(
                    item.title, 
                    item.drafted_description or "", 
                    "Unknown"
                )
                
                new_product_name = classification.get("product_name", "")
                old_product_name = item.product_name
                
                item.product_name = new_product_name
                item.condition = classification.get("condition", "Unknown")
                item.brand = classification.get("brand", "")
                
                print(f"    -> Updated: '{old_product_name}' to '{new_product_name}'")
                
                if (i + 1) % 5 == 0:
                    db.commit()
                    print("    (Committed batch)")
            except Exception as e:
                print(f"    [ERROR] Failed to process inventory item {item.id}: {e}")
        
        db.commit()
        print("\nFinished re-enriching Inventory Items.")
        print("\nSUCCESS: All items reset or updated. Click 'Check for New Items' in the UI to start the background enrichment for Research and Bid items.")
        
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(reset_and_reenrich())
