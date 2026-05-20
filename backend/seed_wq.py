import sys
import os
import random
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import InventoryItem, InventoryParentLot

def seed_db():
    db = SessionLocal()
    
    stages = [
        'WON',
        'PAID',
        'TRANSIT_VENDOR',
        'RECEIVED',
        'REFURBISH',
        'STAGING',
        'READY_TO_LIST'
    ]
    
    try:
        parent_lot = InventoryParentLot(
            title="Test Parent Lot for UI Validation",
            hammer_price=100.0,
            buyer_premium_pct=15.0,
            tax_rate=8.0
        )
        db.add(parent_lot)
        db.commit()
        db.refresh(parent_lot)
        
        for i, stage in enumerate(stages):
            item = InventoryItem(
                barcode=f"TEST-BC-{i}-{stage}",
                title=f"Test Item - {stage} Stage",
                buy_price=25.0 + i,
                estimated_price=100.0 + i * 10,
                status=stage,
                parent_lot_id=parent_lot.id,
                shipping_method="vendor",
                created_at=datetime.utcnow()
            )
            db.add(item)
            print(f"Adding item in stage: {stage}")
        
        db.commit()
        print("Test items added successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
