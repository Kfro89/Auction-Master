import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import InventoryItem

def verify():
    db = SessionLocal()
    items = db.query(InventoryItem).filter(InventoryItem.barcode.like("TEST-BC-%")).all()
    print("Verification Results:")
    for i in items:
        print(f"Barcode: {i.barcode}, Status: {i.status}")
    db.close()

if __name__ == "__main__":
    verify()
