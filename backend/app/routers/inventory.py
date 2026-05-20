import os
import datetime
import statistics
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from pydantic import BaseModel

from ..database import get_db
from ..models import InventoryItem, InventoryParentLot, InventoryCostLineItem, ResearchItem
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.drafting import generate_ebay_draft
from ..auth import get_current_user

router = APIRouter()

class InventoryItemUpdate(BaseModel):
    title: Optional[str] = None
    product_name: Optional[str] = None
    condition: Optional[str] = None
    drafted_title: Optional[str] = None
    drafted_description: Optional[str] = None
    buy_price: Optional[float] = None
    estimated_price: Optional[float] = None
    status: Optional[str] = None
    storage_location: Optional[str] = None
    shipping_carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    anti_tamper_tag: Optional[str] = None
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None

class CostLineItemRequest(BaseModel):
    label: str
    amount: float
    category: str = "misc"

@router.get("/")
async def list_inventory(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    items = db.query(InventoryItem).options(
        joinedload(InventoryItem.parent_lot),
        joinedload(InventoryItem.cost_line_items)
    ).all()
    
    # Simple serialization
    results = []
    for item in items:
        item_dict = {c.name: getattr(item, c.name) for c in item.__table__.columns}
        item_dict["cost_line_items"] = [
            {"id": c.id, "label": c.label, "amount": c.amount, "category": c.category} 
            for c in item.cost_line_items
        ]
        if item.parent_lot:
            item_dict["hammer_price"] = item.parent_lot.hammer_price
            item_dict["buyer_premium_pct"] = item.parent_lot.buyer_premium_pct
            item_dict["tax_rate"] = item.parent_lot.tax_rate
        results.append(item_dict)
        
    return results

@router.post("/barcode/{barcode}")
async def create_item_from_barcode(barcode: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # 1. Search ResearchItems for MPN match
    research_item = db.query(ResearchItem).filter(
        or_(
            ResearchItem.lot_number == barcode,
            ResearchItem.external_id == barcode
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
        raise HTTPException(status_code=404, detail="Item not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Status validation
    if "status" in update_dict:
        valid_statuses = ["WON", "PAID", "SHIPPED", "STAGING", "REFURBISH", "DRAFTING", "LISTED", "SOLD"]
        if update_dict["status"] not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status: {update_dict['status']}")
    
    # Special handling for hammer price/premium if linked to parent lot
    parent_lot_keys = ["hammer_price", "buyer_premium_pct", "tax_rate"]
    if any(k in update_dict for k in parent_lot_keys) and item.parent_lot:
        for k in parent_lot_keys:
            if k in update_dict:
                setattr(item.parent_lot, k, update_dict[k])
        
        # Update acquisition cost line item if it exists
        acq_cost = db.query(InventoryCostLineItem).filter(
            InventoryCostLineItem.inventory_item_id == item.id,
            InventoryCostLineItem.category == "acquisition"
        ).first()
        
        if acq_cost:
            # Re-calculate
            hammer = item.parent_lot.hammer_price
            premium = hammer * (item.parent_lot.buyer_premium_pct / 100)
            tax = (hammer + premium) * (item.parent_lot.tax_rate / 100)
            
            # If multiple items share this lot, we'd need to divide, 
            # but for now we assume 1:1 or simplified allocation
            # Let's count siblings
            sibling_count = db.query(InventoryItem).filter(InventoryItem.parent_lot_id == item.parent_lot_id).count()
            cost_per_item = (hammer + premium + tax) / max(1, sibling_count)
            acq_cost.amount = cost_per_item
    
    for key, value in update_dict.items():
        if key not in parent_lot_keys:
            setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item

@router.post("/{id}/costs")
async def add_cost_line_item(id: int, cost: CostLineItemRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    new_cost = InventoryCostLineItem(
        inventory_item_id=item.id,
        parent_lot_id=item.parent_lot_id,
        label=cost.label,
        amount=cost.amount,
        category=cost.category
    )
    db.add(new_cost)
    db.commit()
    db.refresh(new_cost)
    
    # Return all costs for this item
    return db.query(InventoryCostLineItem).filter(InventoryCostLineItem.inventory_item_id == item.id).all()

@router.delete("/{item_id}/costs/{cost_id}")
async def delete_cost_line_item(item_id: int, cost_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    cost = db.query(InventoryCostLineItem).filter(
        InventoryCostLineItem.id == cost_id,
        InventoryCostLineItem.inventory_item_id == item_id
    ).first()
    if not cost:
        raise HTTPException(status_code=404, detail="Cost item not found")
        
    db.delete(cost)
    db.commit()
    return {"status": "success"}

@router.post("/{id}/draft")
async def draft_item(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.status = "drafting"
    db.commit()
    
    try:
        draft = await generate_ebay_draft(item.product_name or item.title)
        item.drafted_title = draft["title"]
        item.drafted_description = draft["description"]
        item.status = "drafting" 
        db.commit()
        db.refresh(item)
        return item
    except Exception as e:
        item.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/auto-package")
async def auto_package_item(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    from ..services.ai_staging import select_best_packaging
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    result = await select_best_packaging(item, db)
    if not result:
        raise HTTPException(status_code=400, detail="Could not find suitable packaging")
        
    return result

@router.get("/sold-queue")
async def list_sold_queue(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Mock for fulfillment
    return [{"id": 1, "title": "Mock Sold Item", "status": "SOLD", "storage_location": "Bin 12", "packaging_config": "8x8x8 Box"}]

class ReconcileRequest(BaseModel):
    final_fees: float
    final_shipping: float

@router.post("/{id}/reconcile")
async def reconcile_sold_item(id: int, req: ReconcileRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Mock
    return {"status": "success"}
