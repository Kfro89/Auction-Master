import os
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.ingestion import ingest_auctioneer_software
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation, Setting
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.ebay_store import EbayStoreClient
from ..services.valuation import calculate_valuation, run_item_valuation
from ..auth import get_current_user

router = APIRouter()

@router.get("/settings")
async def get_settings(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    settings = db.query(Setting).all()
    return {s.key: s.value for s in settings}

@router.post("/settings")
async def update_settings(settings_data: dict, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    for key, value in settings_data.items():
        setting = db.query(Setting).filter(Setting.key == key).first()
        str_value = str(value) if value is not None else None
        if setting:
            setting.value = str_value
        else:
            setting = Setting(key=key, value=str_value)
            db.add(setting)
    db.commit()
    return {"status": "success"}

@router.post("/scrape/whitley")
async def scrape_whitley(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        return await ingest_auctioneer_software(
            db=db,
            base_url="https://www.whitleyauction.com",
            website_key="rmeb",
            name="Whitley Auction",
            buyer_premium=18.5
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/roller")
async def scrape_roller(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        return await ingest_auctioneer_software(
            db=db,
            base_url="https://bid.rollerauction.com",
            website_key="rol",
            name="Roller Auction",
            buyer_premium=13.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/valuate/{item_id}")
async def valuate_item(item_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        valuation = await run_item_valuation(db, item_id)
        if not valuation:
            raise HTTPException(status_code=400, detail="Could not calculate valuation (insufficient data or item not found)")
        return valuation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/store/stats")
async def get_store_stats(current_user: str = Depends(get_current_user)):
    client_id = os.getenv("EBAY_CLIENT_ID", "dummy")
    client_secret = os.getenv("EBAY_CLIENT_SECRET", "dummy")
    auth_client = EbayAuthClient(client_id, client_secret)
    store_client = EbayStoreClient(auth_client)
    return await store_client.get_sales_stats()

@router.get("/store/listings")
async def get_store_listings(current_user: str = Depends(get_current_user)):
    client_id = os.getenv("EBAY_CLIENT_ID", "dummy")
    client_secret = os.getenv("EBAY_CLIENT_SECRET", "dummy")
    auth_client = EbayAuthClient(client_id, client_secret)
    store_client = EbayStoreClient(auth_client)
    return await store_client.get_active_listings()
