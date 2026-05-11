from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import Item, Category, AuctionHouse, WatchlistItem
from ..scrapers.public_surplus import PS_CATEGORIES
from datetime import timezone

router = APIRouter()


# ---------- Pydantic schemas ----------

class ItemSummary(BaseModel):
    id: int
    external_id: str
    title: str
    current_bid: float
    bid_count: Optional[int]
    end_time: Optional[datetime]
    status: Optional[str]
    url: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    agency_name: Optional[str]
    location_state: Optional[str]
    auction_house_name: Optional[str] = None

    class Config:
        from_attributes = True


class ItemDetail(ItemSummary):
    description: Optional[str]
    pickup_address: Optional[str]
    pickup_city: Optional[str]
    pickup_zip: Optional[str]
    pickup_name: Optional[str]
    is_dutch_auction: bool
    may_extend: bool
    first_seen_at: Optional[datetime]
    last_seen_at: Optional[datetime]
    detail_scraped_at: Optional[datetime]

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    ps_cat_id: int
    name: str

    class Config:
        from_attributes = True


# ---------- Item endpoints ----------

@router.get("", response_model=List[ItemSummary])
def list_items(
    source: Optional[str] = Query(None, description="Filter by auction house website_key (ps, rmeb, rol)"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    search: Optional[str] = Query(None, description="Keyword search in title"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Item)

    if source:
        house = db.query(AuctionHouse).filter(AuctionHouse.website_key == source).first()
        if house:
            query = query.filter(Item.auction_house_id == house.id)

    if category:
        query = query.filter(Item.category == category)

    if search:
        query = query.filter(Item.title.ilike(f"%{search}%"))

    if min_price is not None:
        query = query.filter(Item.current_bid >= min_price)

    if max_price is not None:
        query = query.filter(Item.current_bid <= max_price)

    items = (
        query
        .order_by(desc(Item.last_seen_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Build response with auction house name
    result = []
    house_cache = {}
    for item in items:
        if item.auction_house_id not in house_cache:
            house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
            house_cache[item.auction_house_id] = house.name if house else "Unknown"

        summary = ItemSummary.model_validate(item)
        summary.auction_house_name = house_cache[item.auction_house_id]
        result.append(summary)

    return result


@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """Return all PS categories (the universal taxonomy)."""
    cats = db.query(Category).order_by(Category.name).all()
    if not cats:
        # Return from the static constant if DB not seeded yet
        return [
            CategoryOut(ps_cat_id=k, name=v)
            for k, v in sorted(PS_CATEGORIES.items(), key=lambda x: x[1])
        ]
    return cats


@router.get("/{item_id}", response_model=ItemDetail)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# ---------- Watchlist endpoints ----------

class WatchlistEntry(BaseModel):
    id: int
    item_id: int
    added_at: datetime
    notes: str
    item: ItemSummary

    class Config:
        from_attributes = True


@router.get("/watchlist/list", response_model=List[WatchlistEntry])
def list_watchlist(db: Session = Depends(get_db)):
    entries = db.query(WatchlistItem).all()
    result = []
    house_cache = {}
    for entry in entries:
        item = entry.item
        if item.auction_house_id not in house_cache:
            house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
            house_cache[item.auction_house_id] = house.name if house else "Unknown"

        item_summary = ItemSummary.model_validate(item)
        item_summary.auction_house_name = house_cache[item.auction_house_id]
        result.append(WatchlistEntry(
            id=entry.id,
            item_id=entry.item_id,
            added_at=entry.added_at,
            notes=entry.notes or "",
            item=item_summary,
        ))
    return result


@router.post("/watchlist/{item_id}")
def add_to_watchlist(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    existing = db.query(WatchlistItem).filter(WatchlistItem.item_id == item_id).first()
    if existing:
        return {"status": "already_exists", "watchlist_id": existing.id}

    entry = WatchlistItem(
        item_id=item_id,
        added_at=datetime.now(timezone.utc),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"status": "added", "watchlist_id": entry.id}


@router.delete("/watchlist/{item_id}")
def remove_from_watchlist(item_id: int, db: Session = Depends(get_db)):
    entry = db.query(WatchlistItem).filter(WatchlistItem.item_id == item_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Item not on watchlist")
    db.delete(entry)
    db.commit()
    return {"status": "removed"}
