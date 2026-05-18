import os
import datetime
import asyncio
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta

from ..database import get_db, SessionLocal
from ..services.discovery import discover_auctioneer_software, discover_public_surplus, discover_bidwrangler, discover_govdeals
from ..services.pipeline import run_full_ingestion_pipeline
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation, Setting, UserBidActivity
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.ebay_store import EbayStoreClient
from ..services.valuation import calculate_valuation, run_item_valuation
from ..services.bid_sync import sync_active_bids
from ..auth import get_current_user
from ..services.security import encrypt_value, decrypt_value
from ..scrapers.whitley_auction import WhitleyAuctionScraper
from ..scrapers.roller_auction import RollerAuctionScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from ..scrapers.govdeals import GovDealsScraper

logger = logging.getLogger(__name__)

router = APIRouter()

ACTIVE_JOBS = {
    "scrape": {"status": "idle", "step": 0, "total_steps": 0, "message": "", "new_items": 0},
    "valuate": {"status": "idle", "current": 0, "total": 0}
}

@router.get("/jobs/status")
async def get_jobs_status(current_user: str = Depends(get_current_user)):
    return ACTIVE_JOBS

def is_sensitive_key(key: str) -> bool:
    return key.endswith("_password") or key.endswith("_cookie") or key.endswith("_secret") or key.endswith("_api_key") or "secret" in key or "token" in key or "key" in key

def safe_float(val, default=0.0):
    if val is None or val == 'None' or val == '':
        return float(default)
    try:
        return float(val)
    except (ValueError, TypeError):
        return float(default)

@router.get("/settings")
async def get_settings(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    settings = db.query(Setting).all()
    result = {}
    for s in settings:
        if is_sensitive_key(s.key):
            result[s.key] = decrypt_value(s.value)
        else:
            result[s.key] = s.value
    return result

@router.post("/settings")
async def update_settings(settings_data: dict, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    for key, value in settings_data.items():
        setting = db.query(Setting).filter(Setting.key == key).first()
        str_value = str(value) if value is not None else None

        if str_value and is_sensitive_key(key):
            str_value = encrypt_value(str_value)

        if setting:
            setting.value = str_value
        else:
            setting = Setting(key=key, value=str_value)
            db.add(setting)
    db.commit()
    return {"status": "success"}

@router.post("/settings/verify-login/{website_key}")
async def verify_login(website_key: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    # 1. Fetch credentials from settings
    cookie_setting = db.query(Setting).filter(Setting.key == f"{website_key}_cookie").first()
    username_setting = db.query(Setting).filter(Setting.key == f"{website_key}_username").first()
    password_setting = db.query(Setting).filter(Setting.key == f"{website_key}_password").first()
    
    session_cookie = decrypt_value(cookie_setting.value) if cookie_setting and cookie_setting.value else None
    username = username_setting.value if username_setting and username_setting.value else None
    password = decrypt_value(password_setting.value) if password_setting and password_setting.value else None
    
    if not session_cookie and not username:
        raise HTTPException(status_code=400, detail="No credentials or session cookie found for this website.")

    scraper = None
    if website_key == "rmeb":
        base_url = "https://www.whitleyauction.com"
        scraper = WhitleyAuctionScraper(base_url=base_url, website_key=website_key)
    elif website_key == "rol":
        base_url = "https://bid.rollerauction.com"
        scraper = RollerAuctionScraper(base_url=base_url, website_key=website_key)
    elif website_key == "public_surplus":
        scraper = PublicSurplusScraper(zip_code="00000", radius="0")
    elif website_key == "dickensheet":
        scraper = BidWranglerApiScraper(base_url="https://bid.dickensheet.com")
    elif website_key == "govdeals":
        # Get zip/radius from settings
        zip_setting = db.query(Setting).filter(Setting.key == "govdeals_zip").first()
        radius_setting = db.query(Setting).filter(Setting.key == "govdeals_radius").first()
        scraper = GovDealsScraper(
            zip_code=zip_setting.value if zip_setting else "00000",
            radius=radius_setting.value if radius_setting else "0"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported website: {website_key}")

    try:
        authenticated = await scraper.login(username=username, password=password, session_cookie=session_cookie)
        if not authenticated:
            raise HTTPException(status_code=401, detail="Authentication failed")
            
        # Optional: Further verification
        # For GovDeals, we MUST use the bidder id to verify the session
        if website_key == "govdeals":
            bidder_id_setting = db.query(Setting).filter(Setting.key == "govdeals_bidder_id").first()
            if bidder_id_setting and bidder_id_setting.value:
                try:
                    bids = await scraper.fetch_my_bids(buyer_id=bidder_id_setting.value)
                    return {"status": "success", "message": f"Login verified. Found {len(bids)} active bids."}
                except Exception as e:
                    logger.error(f"GovDeals bid verification failed: {e}")
                    raise HTTPException(status_code=401, detail=f"Session invalid or expired: {e}")
            else:
                # Even if we can't fetch bids, the login() method succeeded (it's pseudo-auth)
                return {"status": "success", "message": "Cookie applied, but Bidder ID missing for full verification."}
        
        # For Public Surplus, try fetching bids
        if website_key == "public_surplus":
            try:
                bids = await scraper.fetch_my_bids()
                return {"status": "success", "message": f"Login verified. Found {len(bids)} active bids."}
            except Exception:
                return {"status": "success", "message": "Cookie accepted, but could not fetch bids (session might be limited)."}

        return {"status": "success", "message": "Login successful!"}

    except PermissionError as e:
        raise HTTPException(status_code=403, detail={
            "error": "captcha_or_2fa_required",
            "message": str(e),
            "website_key": website_key
        })
    except Exception as e:
        logger.error(f"Login verification error for {website_key}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if hasattr(scraper, 'close'):
            await scraper.close()

@router.post("/scrape/whitley")
async def scrape_whitley(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        new_items = await discover_auctioneer_software(
            db=db,
            base_url="https://www.whitleyauction.com",
            website_key="rmeb",
            name="Whitley Auction",
            buyer_premium=18.5
        )
        return {"status": "success", "new_items": new_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/roller")
async def scrape_roller(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        new_items = await discover_auctioneer_software(
            db=db,
            base_url="https://bid.rollerauction.com",
            website_key="rol",
            name="Roller Auction",
            buyer_premium=15.0
        )
        return {"status": "success", "new_items": new_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/public-surplus")
async def scrape_public_surplus(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        new_items = await discover_public_surplus(db)
        await sync_active_bids(db)
        return {"status": "success", "new_items": new_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/dickensheet")
async def scrape_dickensheet(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        new_items = await discover_bidwrangler(db, "https://bid.dickensheet.com", "dickensheet", "Dickensheet Auction", 15.0)
        return {"status": "success", "new_items": new_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/all")
async def scrape_all(background_tasks: BackgroundTasks, current_user: str = Depends(get_current_user)):
    if ACTIVE_JOBS["scrape"]["status"] == "active":
        return {"status": "already_running"}
    ACTIVE_JOBS["scrape"]["status"] = "active"
    background_tasks.add_task(run_all_scrapes)
    return {"status": "started"}

async def run_all_scrapes():
    db = SessionLocal()
    try:
        def update_job_status(status_payload: dict):
            # Update the global ACTIVE_JOBS dict with keys from the payload
            for key, value in status_payload.items():
                if key in ACTIVE_JOBS["scrape"]:
                    ACTIVE_JOBS["scrape"][key] = value
                else:
                    # Allow dynamic extension if payload has new useful keys
                    ACTIVE_JOBS["scrape"][key] = value
        
        await run_full_ingestion_pipeline(db, update_status_callback=update_job_status)
    except Exception as e:
        logger.error(f"Global scrape error: {e}")
        ACTIVE_JOBS["scrape"]["message"] = f"Critical error: {str(e)}"
    finally:
        ACTIVE_JOBS["scrape"]["status"] = "idle"
        # Preserve the final completion message set by the pipeline
        db.close()

@router.post("/valuate/{item_id}")
async def valuate_item(item_id: int, type: str = "research", target_roi: float = 0.30, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        from ..models import ResearchItem, BidItem, Item
        model_class = {"research": ResearchItem, "bid": BidItem, "item": Item}.get(type, ResearchItem)
        
        # Note: run_item_valuation needs to be updated to support model_class or we use the background task's logic
        # For simplicity in this refactor, we'll use the background valuate logic synchronously if needed, 
        # but run_item_valuation currently only takes item_id and assumes Item.
        
        # Let's use the background worker's logic which is already polymorphic
        from ..services.valuation_worker import valuate_item_background
        
        # We need the house premium
        item = db.query(model_class).get(item_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"{type} item not found")
            
        house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
        premium = house.buyer_premium_pct if house else 0.15
        
        await valuate_item_background(item_id, premium, target_roi, model_name=model_class.__name__)
        
        # Refetch
        db.refresh(item)
        
        if type == "research":
            from .research import serialize_research_item
            serialized = serialize_research_item(item)
        elif type == "bid":
            from .bidding import serialize_bid_item
            serialized = serialize_bid_item(item)
        else:
            from .items import serialize_item
            serialized = serialize_item(item)
            
        return serialized.get("valuation")
    except Exception as e:
        logger.error(f"Valuation error for item {item_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refresh-active-bids")
async def refresh_active_bids(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        results = await sync_active_bids(db)
        return {"status": "success", "platforms": results}
    except Exception as e:
        logger.error(f"Error in refresh active bids: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-wins")
async def verify_wins_manual(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        from ..services.win_verification import verify_and_migrate_wins
        results = await verify_and_migrate_wins(db)
        return {"status": "success", "platforms": results}
    except Exception as e:
        logger.error(f"Error in manual win verification: {e}")
        raise HTTPException(status_code=500, detail=str(e))
