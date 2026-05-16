from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import os
import datetime
import statistics
from pydantic import BaseModel

from ..database import get_db
from ..models import InventoryItem, Item, InventoryParentLot, InventoryCostLineItem
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.drafting import generate_ebay_draft
from ..auth import get_current_user

router = APIRouter()

class ScanRequest(BaseModel):
    barcode: str

class InventoryItemUpdate(BaseModel):
    title: Optional[str] = None
    drafted_title: Optional[str] = None
    drafted_description: Optional[str] = None
    ebay_category_id: Optional[str] = None
    buy_price: Optional[float] = None
    estimated_price: Optional[float] = None
    status: Optional[str] = None
    images: Optional[List[str]] = None
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    storage_location: Optional[str] = None
    tracking_number: Optional[str] = None

class LotSplitRequest(BaseModel):
    split_count: int = 1
    hammer_price: float = 0.0
    buyer_premium_pct: float = 0.0
    tax_rate: float = 0.0
    misc_fees: float = 0.0
    title: Optional[str] = None

class CostLineItemCreate(BaseModel):
    label: str
    amount: float
    category: str = "refurb"

@router.get("/")
async def list_inventory(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(InventoryItem).order_by(InventoryItem.created_at.desc()).all()

@router.post("/scan")
async def scan_barcode(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    barcode = request.barcode
    
    # 1. Check existing inventory
    existing_inventory = db.query(InventoryItem).filter(InventoryItem.barcode == barcode).first()
    if existing_inventory:
        return existing_inventory

    # 2. Check research (Item model)
    # Search for barcode in title, description, or mpn
    research_item = db.query(Item).filter(
        or_(
            Item.title.contains(barcode),
            Item.description.contains(barcode),
            Item.mpn == barcode
        )
    ).first()
    
    title = research_item.title if research_item else None
    estimated_price = None

    # 3. Trigger eBay Browse API search if title not found in research
    if not title:
        from ..services.security import get_ebay_credentials
        client_id, client_secret = get_ebay_credentials(db)
        
        if client_id and client_secret:
            try:
                auth_client = EbayAuthClient(client_id=client_id, client_secret=client_secret)
                browse_client = EbayBrowseClient(auth_client=auth_client)
                
                # Searching by barcode on eBay
                results = await browse_client.search_active_listings(query=barcode, condition_ids=["1000", "3000"])
                summaries = results.get("itemSummaries", [])
                if summaries:
                    title = summaries[0].get("title")
                    
                    prices = []
                    for s in summaries:
                        try:
                            price_val = s.get("price", {}).get("value")
                            if price_val:
                                prices.append(float(price_val))
                        except:
                            continue
                    if prices:
                        estimated_price = statistics.median(prices)
            except Exception as e:
                print(f"eBay search failed: {e}")

    # 4. Save as new InventoryItem
    new_item = InventoryItem(
        barcode=barcode,
        title=title or f"Unknown Item ({barcode})",
        estimated_price=estimated_price,
        status='staged'
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

@router.patch("/{id}")
async def update_inventory_item(id: int, update_data: InventoryItemUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Validation for status transitions
    if update_data.status:
        valid_statuses = ["WON", "PAID", "TRANSIT_VENDOR", "TRANSIT_LOCAL", "RECEIVED", "REFURBISH", "STAGING", "READY_TO_LIST", "listed", "sold", "staged"]
        if update_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status: {update_data.status}")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.post("/items/{item_id}/won")
async def mark_item_as_won(item_id: int, request: LotSplitRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # 1. Fetch Auction Item
    auction_item = db.query(Item).filter(Item.id == item_id).first()
    if not auction_item:
        raise HTTPException(status_code=404, detail="Auction item not found")

    # 2. Create Parent Lot
    parent_lot = InventoryParentLot(
        source_item_id=item_id,
        title=request.title or auction_item.title,
        hammer_price=request.hammer_price,
        buyer_premium_pct=request.buyer_premium_pct,
        tax_rate=request.tax_rate,
        misc_fees=request.misc_fees
    )
    db.add(parent_lot)
    db.commit()
    db.refresh(parent_lot)

    # 3. Create Child Inventory Items
    inventory_items = []
    for i in range(request.split_count):
        title = parent_lot.title
        if request.split_count > 1:
            title = f"{parent_lot.title} (Part {i+1})"
            
        inv_item = InventoryItem(
            parent_lot_id=parent_lot.id,
            title=title,
            status="WON",
            images=auction_item.images or []
        )
        db.add(inv_item)
        inventory_items.append(inv_item)
    
    db.commit()

    # 4. Map initial costs to InventoryCostLineItems (even distribution)
    total_acquisition_cost = (
        request.hammer_price + 
        (request.hammer_price * (request.buyer_premium_pct / 100)) +
        (request.hammer_price * (request.tax_rate / 100)) +
        request.misc_fees
    )
    
    cost_per_item = total_acquisition_cost / request.split_count
    
    for inv_item in inventory_items:
        cost_line = InventoryCostLineItem(
            inventory_item_id=inv_item.id,
            label="Initial Acquisition (Allocated)",
            amount=cost_per_item,
            category="acquisition"
        )
        db.add(cost_line)
    
    db.commit()
    
    # Update auction item status
    auction_item.status = "won"
    db.commit()

    return {"parent_lot_id": parent_lot.id, "inventory_item_ids": [it.id for it in inventory_items]}

@router.post("/{id}/costs")
async def add_cost_line_item(id: int, request: CostLineItemCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    cost_line = InventoryCostLineItem(
        inventory_item_id=id,
        label=request.label,
        amount=request.amount,
        category=request.category
    )
    db.add(cost_line)
    db.commit()
    db.refresh(item)
    
    return [{"id": c.id, "label": c.label, "amount": c.amount, "category": c.category, "created_at": c.created_at} for c in item.cost_line_items]

@router.post("/{id}/draft")
async def draft_item(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    item.status = "drafting"
    db.commit()
    
    try:
        draft = await generate_ebay_draft(item.title)
        item.drafted_title = draft["title"]
        item.drafted_description = draft["description"]
        item.status = "drafting" 
        db.commit()
        db.refresh(item)
        return item
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Drafting failed: {str(e)}")
