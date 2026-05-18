from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from ..database import get_db
from ..models import BidItem, InventoryItem, InventoryParentLot, Valuation, EbaySampleCache, Setting
from ..auth import get_current_user
from ..services.security import get_ebay_credentials
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient

router = APIRouter()

class HideStatusUpdate(BaseModel):
    is_hidden: bool

class MarginUpdate(BaseModel):
    target_roi_pct: float

def serialize_bid_item(item: BidItem) -> dict:
    base_url = item.auction_house.base_url.rstrip("/") if item.auction_house else ""
    
    def ensure_absolute(url):
        if not url: return url
        if url.startswith("http"): return url
        if url.startswith("//"): return f"https:{url}"
        return f"{base_url}/{url.lstrip('/')}"

    image_url = ensure_absolute(item.image_url)
    images = [ensure_absolute(img) for img in getattr(item, 'images', [])] if getattr(item, 'images', None) else []

    item_dict = {
        "id": item.id,
        "title": item.title,
        "lot_number": item.lot_number,
        "current_bid_amount": item.current_bid_amount,
        "user_bid_amount": item.user_bid_amount,
        "user_proxy_bid": item.user_proxy_bid,
        "user_bid_status": item.user_bid_status,
        "end_time": item.end_time,
        "url": item.url,
        "image_url": image_url,
        "images": images,
        "auction_house_id": item.auction_house_id,
        "auction_house_key": item.auction_house.website_key if item.auction_house else None,
        "auction_house_name": item.auction_house.name if item.auction_house else None,
        "category": item.category,
        "product_name": item.product_name,
        "condition": item.condition,
        "tags": item.tags,
        "is_hidden_from_active": getattr(item, 'is_hidden_from_active', False),
        "valuation": None,
        "user_bids": {
            "current_bid_amount": item.current_bid_amount,
            "user_bid_amount": item.user_bid_amount,
            "user_proxy_bid": item.user_proxy_bid,
            "user_bid_status": item.user_bid_status
        }
    }
    
    if item.valuation:
        val_dict = {
            "est_market_value": item.valuation.est_market_value,
            "max_bid_for_target_roi": item.valuation.max_bid_for_target_roi,
            "target_roi_pct": item.valuation.target_roi_pct,
            "computed_at": item.valuation.computed_at
        }
        if item.valuation.sample_cache:
            val_dict["search_query"] = item.valuation.sample_cache.query_signature
            val_dict["sample_size"] = item.valuation.sample_cache.sample_size
            val_dict["mean"] = item.valuation.sample_cache.mean
            val_dict["trimmed_median"] = item.valuation.sample_cache.trimmed_median
        item_dict["valuation"] = val_dict
        
    return item_dict

@router.get("/")
async def list_bidding_items(show_hidden: bool = False, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    query = db.query(BidItem).options(
        joinedload(BidItem.valuation).joinedload(Valuation.sample_cache),
        joinedload(BidItem.auction_house)
    )
    if not show_hidden:
        query = query.filter(BidItem.is_hidden_from_active == False)
    
    items = query.order_by(BidItem.end_time.asc()).all()
    return [serialize_bid_item(item) for item in items]

@router.post("/{item_id}/hide")
async def toggle_hide_status(
    item_id: int,
    status: HideStatusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(BidItem).filter(BidItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_hidden_from_active = status.is_hidden
    db.commit()
    return {"id": item.id, "is_hidden_from_active": item.is_hidden_from_active}

@router.post("/{item_id}/claim")
async def claim_won_bid(item_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    bid_item = db.query(BidItem).options(joinedload(BidItem.auction_house)).filter(BidItem.id == item_id).first()
    if not bid_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if bid_item.user_bid_status != "won":
        # Check if current_bid matches status? Scraper might not have updated status to string "won" yet
        # But for now we trust the status.
        pass

    # 1. Create Parent Lot
    parent_lot = InventoryParentLot(
        source_item_id=None, # Decoupled from old Item
        title=bid_item.title,
        hammer_price=bid_item.current_bid_amount,
        buyer_premium_pct=bid_item.auction_house.buyer_premium_pct if bid_item.auction_house else 0.15,
        tax_rate=bid_item.auction_house.tax_rate if bid_item.auction_house else 0.0
    )
    db.add(parent_lot)
    db.flush()
    
    # 2. Create Inventory Item
    inv_item = InventoryItem(
        parent_lot_id=parent_lot.id,
        title=bid_item.title,
        product_name=bid_item.product_name,
        condition=bid_item.condition,
        buy_price=bid_item.current_bid_amount,
        images=bid_item.images,
        status='staged'
    )
    db.add(inv_item)
    
    # 3. Mark BidItem as hidden since it's now in Work Queue
    bid_item.is_hidden_from_active = True
    
    db.commit()
    return {"status": "success", "inventory_item_id": inv_item.id}

@router.get("/{item_id}/comparables")
async def get_comparables(item_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    item = db.query(BidItem).filter(BidItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    search_queries = getattr(item, 'search_queries', [])
    search_query = search_queries[0] if search_queries else item.title[:50]

    client_id, client_secret = get_ebay_credentials(db)
    auth_client = EbayAuthClient(client_id, client_secret)
    browse_client = EbayBrowseClient(auth_client)

    condition_ids = [item.normalized_condition_id] if getattr(item, "normalized_condition_id", None) else ["3000"]
    
    try:
        results = await browse_client.search_active_listings(query=search_query, condition_ids=condition_ids)
        item_summaries = results.get("itemSummaries", [])[:20]
        mapped_listings = [{
            "title": l.get("title", ""),
            "price": l.get("price", {}).get("value", "0.00"),
            "url": l.get("itemWebUrl", ""),
            "condition": l.get("condition", {}).get("conditionDisplayName", "Unknown") if isinstance(l.get("condition"), dict) else str(l.get("condition", "Unknown"))
        } for l in item_summaries]

        return {"sample_listings": mapped_listings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comparables: {str(e)}")

@router.patch("/{item_id}/valuation/margin")
async def update_valuation_margin(
    item_id: int,
    margin_req: MarginUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(BidItem).options(joinedload(BidItem.valuation)).filter(BidItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    valuation = item.valuation
    if not valuation:
        raise HTTPException(status_code=400, detail="Item has no valuation to update")
        
    valuation.target_roi_pct = margin_req.target_roi_pct
    est_market_value = valuation.est_market_value or 0.0
    valuation.max_bid_for_target_roi = max(0.0, (est_market_value * (1 - valuation.target_roi_pct)))
    
    db.commit()
    db.refresh(valuation)
    return serialize_bid_item(item)
