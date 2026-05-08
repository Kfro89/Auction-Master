from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import os
import datetime
import statistics
from pydantic import BaseModel

from ..database import get_db
from ..models import InventoryItem, Item
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.drafting import generate_ebay_draft

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

@router.get("/")
async def list_inventory(db: Session = Depends(get_db)):
    return db.query(InventoryItem).order_by(InventoryItem.created_at.desc()).all()

@router.post("/scan")
async def scan_barcode(request: ScanRequest, db: Session = Depends(get_db)):
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
        client_id = os.environ.get("EBAY_CLIENT_ID")
        client_secret = os.environ.get("EBAY_CLIENT_SECRET")
        
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
async def update_inventory_item(id: int, update_data: InventoryItemUpdate, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.post("/{id}/draft")
async def draft_item(id: int, db: Session = Depends(get_db)):
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
