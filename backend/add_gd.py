from app.database import SessionLocal
from app.models import AuctionHouse

def run():
    db = SessionLocal()
    try:
        house = db.query(AuctionHouse).filter(AuctionHouse.website_key == 'govdeals').first()
        if not house:
            gd = AuctionHouse(
                name='GovDeals', 
                website_key='govdeals', 
                base_url='https://www.govdeals.com', 
                buyer_premium_pct=12.5
            )
            db.add(gd)
            db.commit()
            print("Successfully added GovDeals AuctionHouse")
        else:
            print("GovDeals already exists")
    finally:
        db.close()

if __name__ == "__main__":
    run()
