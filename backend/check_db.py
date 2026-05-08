from app.database import SessionLocal
from app.models import Item, Valuation

db = SessionLocal()
bmw = db.query(Item).filter(Item.title.contains("BMW 5 Series 525xi")).first()
if bmw:
    print(f"Title: {bmw.title}")
    print(f"Current Bid in DB: {bmw.current_bid}")
    if bmw.valuation:
        print(f"Est Market Value: {bmw.valuation.est_market_value}")
        print(f"Max Bid: {bmw.valuation.max_bid_for_target_roi}")
else:
    print("BMW not found in DB")
db.close()
