import sys
import os
from datetime import datetime, timezone

# Add the parent directory to sys.path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Item, ResearchItem, BidItem, UserBidActivity, Valuation, EbaySampleCache, ValuationDetail

def migrate():
    db = SessionLocal()
    try:
        print("Starting data migration...")
        
        # 1. Identify items to migrate to BidItem
        # Logic: is_user_bidding == True OR status == "won"
        bid_items_to_migrate = db.query(Item).filter(
            (Item.is_user_bidding == True) | (Item.status == 'won')
        ).all()
        
        print(f"Found {len(bid_items_to_migrate)} items to migrate to BidItem.")
        
        for item in bid_items_to_migrate:
            # Create BidItem
            bid_item = BidItem(
                auction_house_id=item.auction_house_id,
                auction_id=item.auction_id,
                external_id=item.external_id,
                lot_number=item.lot_number,
                title=item.title,
                description=item.description,
                url=item.url,
                image_url=item.image_url,
                images=item.images,
                end_time=item.end_time,
                category=item.category,
                product_name=item.product_name,
                condition=item.condition,
                brand=item.brand,
                tags=item.tags,
                search_queries=item.search_queries,
                normalized_condition_id=item.normalized_condition_id,
                processing_status=item.processing_status
            )
            
            # Add bid details if they exist
            if item.user_bids:
                bid_item.current_bid_amount = item.user_bids.current_bid_amount
                bid_item.user_bid_amount = item.user_bids.user_bid_amount
                bid_item.user_proxy_bid = item.user_bids.user_proxy_bid
                bid_item.user_bid_status = item.user_bids.user_bid_status
            else:
                # Fallback for won items that might not have UserBidActivity records
                bid_item.current_bid_amount = item.current_bid
                bid_item.user_bid_status = "won" if item.status == "won" else None

            db.add(bid_item)
            db.flush() # Get bid_item.id
            
            # Re-link relationships
            if item.valuation:
                item.valuation.bid_item_id = bid_item.id
            
            for cache in item.sample_caches:
                cache.bid_item_id = bid_item.id
                if cache.valuation_detail:
                    cache.valuation_detail.bid_item_id = bid_item.id

        db.commit()
        print("Successfully migrated active bids and won items.")
        
        # Note: Research items are discarded as per the plan.
        # We don't delete the old items yet to avoid breaking the current app 
        # while we refactor the services and routers.
        
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
