import os
import datetime
import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db, SessionLocal
from ..services.ingestion import ingest_auctioneer_software, ingest_public_surplus, ingest_bidwrangler
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation, Setting
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.ebay_store import EbayStoreClient
from ..services.valuation import calculate_valuation, run_item_valuation
from ..auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

ACTIVE_JOBS = {
    "scrape": {"status": "idle", "step": 0, "total_steps": 0, "message": "", "new_items": 0},
    "valuate": {"status": "idle", "current": 0, "total": 0}
}

@router.get("/jobs/status")
async def get_jobs_status(current_user: str = Depends(get_current_user)):
    return ACTIVE_JOBS

from ..services.security import encrypt_value, decrypt_value

def is_sensitive_key(key: str) -> bool:
    return key.endswith("_password") or key.endswith("_cookie") or key.endswith("_secret") or key.endswith("_api_key") or "secret" in key or "token" in key or "key" in key

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

@router.post("/scrape/public-surplus")
async def scrape_public_surplus(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        return await ingest_public_surplus(db=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/dickensheet")
async def scrape_dickensheet(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        return await ingest_bidwrangler(
            db=db,
            base_url="https://bid.dickensheet.com",
            website_key="dickensheet",
            name="Dickensheet"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def scrape_all_task():
    db = SessionLocal()
    job = ACTIVE_JOBS["scrape"]
    total_new = 0
    try:
        job.update({"status": "active", "step": 0, "total_steps": 4, "message": "Initializing scan...", "new_items": 0})
        logger.info("Starting background scrape task...")

        # Step 1: Whitley
        job.update({"step": 1, "message": "Scanning Whitley Auction..."})
        result = await ingest_auctioneer_software(db, "https://www.whitleyauction.com", "rmeb", "Whitley Auction", 18.5, progress=job)
        count = result.get("new_items", 0)
        total_new += count
        job.update({"message": f"Whitley Auction — {count} new items found", "new_items": total_new})

        # Step 2: Roller
        job.update({"step": 2, "message": "Scanning Roller Auction..."})
        result = await ingest_auctioneer_software(db, "https://bid.rollerauction.com", "rol", "Roller Auction", 13.0, progress=job)
        count = result.get("new_items", 0)
        total_new += count
        job.update({"message": f"Roller Auction — {count} new items found", "new_items": total_new})

        # Step 3: Dickensheet
        job.update({"step": 3, "message": "Scanning Dickensheet..."})
        result = await ingest_bidwrangler(db, "https://bid.dickensheet.com", "dickensheet", "Dickensheet", progress=job)
        count = result.get("new_items", 0)
        total_new += count
        job.update({"message": f"Dickensheet — {count} new items found", "new_items": total_new})

        # Step 4: Public Surplus
        job.update({"step": 4, "message": "Scanning Public Surplus..."})
        result = await ingest_public_surplus(db, progress=job)
        count = result.get("new_items", 0)
        total_new += count
        job.update({"message": f"Public Surplus — {count} new items found", "new_items": total_new})

        # Done
        job.update({"message": f"Complete — {total_new} total new items", "step": 4})
        logger.info(f"Finished background scrape task. {total_new} new items.")
    except Exception as e:
        logger.error(f"Error in background scrape: {e}")
        job["message"] = f"Error: {str(e)[:80]}"
    finally:
        job["status"] = "idle"
        db.close()

@router.post("/scrape/all")
async def scrape_all(background_tasks: BackgroundTasks, current_user: str = Depends(get_current_user)):
    if ACTIVE_JOBS["scrape"]["status"] == "active":
        return {"status": "already_running"}
    ACTIVE_JOBS["scrape"]["status"] = "active"
    background_tasks.add_task(scrape_all_task)
    return {"status": "started"}

@router.post("/valuate/{item_id}")
async def valuate_item(item_id: int, target_roi: float = 0.30, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        valuation = await run_item_valuation(db, item_id, target_roi)
        if not valuation:
            raise HTTPException(status_code=400, detail="Could not calculate valuation (insufficient data or item not found)")
        
        val_dict = {
            "est_market_value": valuation.est_market_value,
            "max_bid_for_target_roi": valuation.max_bid_for_target_roi,
            "target_roi_pct": valuation.target_roi_pct,
            "computed_at": valuation.computed_at
        }
        if valuation.sample_cache:
            val_dict["search_query"] = valuation.sample_cache.query_signature
            val_dict["sample_size"] = valuation.sample_cache.sample_size
            
        return val_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def valuate_bulk_task(mode: str, target_roi: float):
    from ..services.ingestion import _process_item_tags
    from ..services.valuation_worker import batch_ebay_valuate

    db = SessionLocal()
    job = ACTIVE_JOBS["valuate"]
    try:
        job.update({"status": "active", "current": 0, "total": 0})

        query = db.query(Item).filter(Item.status == 'open')
        if mode == 'missing':
            query = query.outerjoin(Valuation).filter(Valuation.id == None)

        items = query.all()
        job["total"] = len(items)

        if not items:
            logger.info("No items to valuate.")
            return

        logger.info(f"Starting bulk valuation for {len(items)} items (mode={mode})...")

        # Build auction house premium cache
        premium_cache = {}
        for item in items:
            if item.auction_house_id not in premium_cache:
                house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
                premium_cache[item.auction_house_id] = house.buyer_premium_pct if house and house.buyer_premium_pct else 0.0

        # Phase 1: LLM classification for items missing search_queries (batches of 6)
        needs_llm = [(item, item.description or '', item.category or 'Unknown')
                     for item in items if not item.search_queries]

        if needs_llm:
            logger.info(f"Phase 1: Classifying {len(needs_llm)} items via LLM...")
            batch_size = 6
            for i in range(0, len(needs_llm), batch_size):
                batch = needs_llm[i:i + batch_size]
                tasks = [_process_item_tags(item, desc, cat) for item, desc, cat in batch]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                for j, result in enumerate(results):
                    if isinstance(result, Exception):
                        logger.error(f"LLM classification failed for item {batch[j][0].id}: {result}")
                        continue
                    cat_name, tags, brand, search_queries = result
                    db_item = batch[j][0]
                    db_item.category = cat_name
                    db_item.tags = tags
                    if brand:
                        db_item.brand = brand
                    db_item.search_queries = search_queries

                db.commit()
                job["current"] = i + len(batch)

        # Phase 2: eBay valuation in parallel batches of 6
        items_to_valuate = [
            (item.id, premium_cache.get(item.auction_house_id, 0.0))
            for item in items if item.search_queries
        ]

        if items_to_valuate:
            phase1_done = job["current"]
            logger.info(f"Phase 2: eBay valuation for {len(items_to_valuate)} items...")
            await batch_ebay_valuate(items_to_valuate, target_roi=target_roi, progress=job, progress_offset=phase1_done)

        logger.info("Finished bulk valuation.")
    except Exception as e:
        logger.error(f"Error in bulk valuation: {e}")
    finally:
        job["status"] = "idle"
        db.close()

from pydantic import BaseModel
class ValuateBulkRequest(BaseModel):
    mode: str = "all"
    target_roi: float = 0.30

@router.post("/valuate-bulk")
async def valuate_bulk(req: ValuateBulkRequest, background_tasks: BackgroundTasks, current_user: str = Depends(get_current_user)):
    if ACTIVE_JOBS["valuate"]["status"] == "active":
        return {"status": "already_running"}
    ACTIVE_JOBS["valuate"]["status"] = "active"
    ACTIVE_JOBS["valuate"]["current"] = 0
    ACTIVE_JOBS["valuate"]["total"] = 0
    background_tasks.add_task(valuate_bulk_task, req.mode, req.target_roi)
    return {"status": "started"}

@router.get("/store/stats")
async def get_store_stats(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    from ..services.security import get_ebay_credentials
    client_id, client_secret = get_ebay_credentials(db)
    auth_client = EbayAuthClient(client_id, client_secret)
    store_client = EbayStoreClient(auth_client)
    return await store_client.get_sales_stats()

@router.get("/store/listings")
async def get_store_listings(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    from ..services.security import get_ebay_credentials
    client_id, client_secret = get_ebay_credentials(db)
    auth_client = EbayAuthClient(client_id, client_secret)
    store_client = EbayStoreClient(auth_client)
    return await store_client.get_active_listings()

from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper

@router.post("/settings/verify-login/{website_key}")
async def verify_login(website_key: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    cookie_setting = db.query(Setting).filter(Setting.key == f"{website_key}_cookie").first()
    username_setting = db.query(Setting).filter(Setting.key == f"{website_key}_username").first()
    password_setting = db.query(Setting).filter(Setting.key == f"{website_key}_password").first()
    
    session_cookie = decrypt_value(cookie_setting.value) if cookie_setting else None
    username = username_setting.value if username_setting else None
    password = decrypt_value(password_setting.value) if password_setting else None
    
    if not session_cookie and not username:
        raise HTTPException(status_code=400, detail="No credentials or session cookie found.")
        
    scraper = None
    if website_key in ["rmeb", "rol"]:
        base_url = "https://www.whitleyauction.com" if website_key == "rmeb" else "https://bid.rollerauction.com"
        scraper = AuctioneerSoftwareScraper(base_url=base_url, website_key=website_key)
    elif website_key == "public_surplus":
        scraper = PublicSurplusScraper(zip_code="00000", radius="0")
    elif website_key == "dickensheet":
        scraper = BidWranglerApiScraper(base_url="https://bid.dickensheet.com")
    else:
        raise HTTPException(status_code=400, detail=f"Login verification not supported for {website_key}")
        
    try:
        success = await scraper.login(username=username, password=password, session_cookie=session_cookie)
        if success:
            return {"status": "success", "message": f"Login successful for {website_key}!"}
        else:
             raise HTTPException(status_code=401, detail="Login failed with provided credentials.")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail={"error": "captcha_or_2fa_required", "message": str(e), "website_key": website_key})
    except NotImplementedError as e:
         raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if hasattr(scraper, 'close'):
            await scraper.close()

