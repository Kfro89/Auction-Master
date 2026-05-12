import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Item
from app.services.valuation import extract_and_decode_vin

async def main():
    db = SessionLocal()
    try:
        items = db.query(Item).filter(
            Item.category.startswith("Motor Pool"),
            Item.category.notilike("Motor Pool Parts%")
        ).all()
        
        print(f"Found {len(items)} Motor Pool vehicles to migrate.")
        
        for item in items:
            if item.vin:
                print(f"Item {item.id} already has VIN: {item.vin}. Skipping.")
                continue
                
            print(f"Processing Item {item.id}: {item.title}")
            # we don't have val_meta here, so pass empty dict
            await extract_and_decode_vin(item, {})
            db.commit()
            
            if item.vin:
                print(f" -> Found VIN: {item.vin}, Make: {item.vehicle_make}, Model: {item.vehicle_model}")
            else:
                print(" -> No VIN found.")
                
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
