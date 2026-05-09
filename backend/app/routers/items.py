from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..models import Item, Valuation
from ..auth import get_current_user

router = APIRouter()

class WatchStatusUpdate(BaseModel):
    is_watched: bool

def serialize_item(item: Item) -> dict:
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
        "is_watched": getattr(item, 'is_watched', False),
        "valuation": None
    }
    
    if item.valuation:
        item_dict["valuation"] = {
            "est_market_value": item.valuation.est_market_value,
            "max_bid_for_target_roi": item.valuation.max_bid_for_target_roi,
            "target_roi_pct": item.valuation.target_roi_pct,
            "computed_at": item.valuation.computed_at
        }
        
    return item_dict

@router.get("/")
async def list_items(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Fetch items with their valuations
    items = db.query(Item).options(joinedload(Item.valuation)).order_by(Item.end_time.asc()).limit(100).all()
    return [serialize_item(item) for item in items]

@router.post("/{item_id}/watch")
async def toggle_watch_status(
    item_id: int,
    status: WatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_watched = status.is_watched
    db.commit()
    db.refresh(item)
    
    return {"id": item.id, "is_watched": item.is_watched}

@router.get("/watchlist")
async def get_watchlist(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    items = db.query(Item).options(joinedload(Item.valuation)).filter(Item.is_watched.is_(True)).order_by(Item.end_time.asc()).all()
    return [serialize_item(item) for item in items]
