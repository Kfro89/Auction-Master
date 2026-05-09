from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models import Item, Valuation
from ..auth import get_current_user

router = APIRouter()

@router.get("/")
async def list_items(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Fetch items with their valuations
    items = db.query(Item).options(joinedload(Item.valuation)).order_by(Item.end_time.asc()).limit(100).all()
    
    result = []
    for item in items:
        item_dict = {
            "id": item.id,
            "title": item.title,
            "lot_number": item.lot_number,
            "current_bid": item.current_bid,
            "end_time": item.end_time,
            "status": item.status,
            "url": item.url,
            "image_url": item.image_url,
            "auction_house_id": item.auction_house_id,
            "category": item.category,
            "tags": item.tags,
            "valuation": None
        }
        
        if item.valuation:
            item_dict["valuation"] = {
                "est_market_value": item.valuation.est_market_value,
                "max_bid_for_target_roi": item.valuation.max_bid_for_target_roi,
                "target_roi_pct": item.valuation.target_roi_pct,
                "computed_at": item.valuation.computed_at
            }
            
        result.append(item_dict)
        
    return result
