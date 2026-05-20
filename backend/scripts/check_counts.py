import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SessionLocal

from app.models import ResearchItem, BidItem

def check():
    db = SessionLocal()
    try:
        r_count = db.query(ResearchItem).count()
        b_count = db.query(BidItem).count()
        print(f"Research: {r_count}, Bidding: {b_count}")
    finally:
        db.close()

if __name__ == "__main__":
    check()
