import asyncio
import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import or_

# Add the parent directory to sys.path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Item, InventoryItem
from app.services.llm import generate_valuation_data

async def backfill_items():
    db = SessionLocal()
    try:
        # 1. Backfill discovered Items
        items_to_backfill = db.query(Item).filter(
            or_(Item.product_name == None, Item.product_name == "")
        ).all()
        
        print(f"Found {len(items_to_backfill)} Items to backfill.")
        
        for i, item in enumerate(items_to_backfill):
            print(f"[{i+1}/{len(items_to_backfill)}] Processing Item: {item.title}")
            try:
                raw_category = f"Category {item.category}" if item.category else "Unknown"
                result = await generate_valuation_data(
                    item.title, 
                    item.description or "", 
                    raw_category,
                    image_url=item.image_url
                )
                
                item.product_name = result.get("product_name", "")
                item.condition = result.get("condition", "Unknown")
                
                # Also update brand if it was missing
                if not item.brand:
                    item.brand = result.get("brand", "")
                
                if (i + 1) % 10 == 0:
                    db.commit()
                    print("Committed batch of 10.")
            except Exception as e:
                print(f"Error processing item {item.id}: {e}")
        
        db.commit()
        print("Finished backfilling Items.")

        # 2. Backfill Inventory Items
        inv_items_to_backfill = db.query(InventoryItem).filter(
            or_(InventoryItem.product_name == None, InventoryItem.product_name == "")
        ).all()
        
        print(f"Found {len(inv_items_to_backfill)} Inventory Items to backfill.")
        
        for i, inv_item in enumerate(inv_items_to_backfill):
            print(f"[{i+1}/{len(inv_items_to_backfill)}] Processing Inventory Item: {inv_item.title}")
            try:
                # Inventory items might not have description easily accessible without joining parent lot or original item
                # but we can try with just the title.
                result = await generate_valuation_data(
                    inv_item.title, 
                    "", 
                    "Unknown"
                )
                
                inv_item.product_name = result.get("product_name", "")
                inv_item.condition = result.get("condition", "Unknown")
                
                if (i + 1) % 10 == 0:
                    db.commit()
                    print("Committed batch of 10.")
            except Exception as e:
                print(f"Error processing inventory item {inv_item.id}: {e}")
                
        db.commit()
        print("Finished backfilling Inventory Items.")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(backfill_items())
