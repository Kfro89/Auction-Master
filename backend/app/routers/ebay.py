from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import datetime
import uuid

from ..database import get_db
from .. import models
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_store import EbayStoreClient
from ..auth import get_current_user

router = APIRouter()

def get_ebay_auth_client(db: Session):
    client_id = db.query(models.Setting).filter_by(key="ebay_client_id").first()
    client_secret = db.query(models.Setting).filter_by(key="ebay_client_secret").first()
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=400, detail="eBay credentials not configured in settings")
        
    return EbayAuthClient(client_id.value, client_secret.value)

@router.get("/auth-url")
def get_ebay_auth_url(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    auth_client = get_ebay_auth_client(db)
    state = str(uuid.uuid4())
    # In a real app, you'd store this state to verify it on callback
    return {"url": auth_client.get_auth_url(state)}

@router.get("/callback")
async def ebay_callback(code: str, state: str, db: Session = Depends(get_db)):
    auth_client = get_ebay_auth_client(db)
    try:
        token_data = await auth_client.exchange_code_for_token(code)
        
        # Store tokens in settings
        # Note: In a production app, these should be encrypted and tied to a user account
        settings_to_update = {
            "ebay_user_token": token_data.get("access_token"),
            "ebay_refresh_token": token_data.get("refresh_token"),
            "ebay_token_expiry": str(datetime.datetime.utcnow() + datetime.timedelta(seconds=token_data.get("expires_in", 0)))
        }
        
        for key, value in settings_to_update.items():
            setting = db.query(models.Setting).filter_by(key=key).first()
            if setting:
                setting.value = value
            else:
                db.add(models.Setting(key=key, value=value))
        
        db.commit()
        return {"status": "success", "message": "eBay account connected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to exchange code: {str(e)}")

@router.post("/sync/listings")
async def sync_ebay_listings(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    auth_client = get_ebay_auth_client(db)
    user_token_setting = db.query(models.Setting).filter_by(key="ebay_user_token").first()
    
    if not user_token_setting:
        raise HTTPException(status_code=401, detail="eBay account not connected")
        
    store_client = EbayStoreClient(auth_client, user_token_setting.value)
    
    try:
        data = await store_client.get_active_listings()
        listings = data.get("inventoryItems", [])
        
        # Simple sync logic: Update or Create
        # In a full impl, we'd handle pagination and deletions
        for l in listings:
            sku = l.get("sku")
            ebay_item_id = l.get("listingId") # This might be null if not listed yet
            
            existing = db.query(models.EbayListing).filter_by(ebay_item_id=ebay_item_id).first()
            if existing:
                existing.title = l.get("product", {}).get("title")
                # price = l.get("price", {}).get("value")
                existing.updated_at = datetime.datetime.utcnow()
            else:
                new_listing = models.EbayListing(
                    ebay_item_id=ebay_item_id or sku,
                    title=l.get("product", {}).get("title"),
                    status="active",
                    updated_at=datetime.datetime.utcnow()
                )
                db.add(new_listing)
        
        db.commit()
        return {"status": "success", "count": len(listings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.get("/dashboard-stats")
async def get_store_dashboard(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # Calculate real stats from our DB
    total_listed = db.query(models.EbayListing).filter_by(status="active").count()
    # total_value = db.query(func.sum(models.EbayListing.price)).filter_by(status="active").scalar() or 0.0
    
    # Mock some data for the charts for now, but use real counts where possible
    return {
        "totalListed": total_listed,
        "totalValue": 0.0, # Need to fix price field mapping
        "totalSoldQty": 0,
        "totalSoldRev": 0.0,
        "strPct": 0.0,
        "avgDaysOnMarket": 0,
        "unlistedInventoryValue": 0.0,
        "salesTrend": []
    }
