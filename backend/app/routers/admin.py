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
from ..services.ingestion import ingest_auctioneer_software, ingest_public_surplus, ingest_bidwrangler
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation, Setting, UserBidActivity
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.ebay_store import EbayStoreClient
from ..services.valuation import calculate_valuation, run_item_valuation
from ..auth import get_current_user
from ..services.security import encrypt_value, decrypt_value
from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
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
            buyer_premium=15.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/public-surplus")
async def scrape_public_surplus(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        return await ingest_public_surplus(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scrape/dickensheet")
async def scrape_dickensheet(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        return await ingest_bidwrangler(db, "https://bid.dickensheet.com", "dickensheet", "Dickensheet Auction", 15.0)
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
        ACTIVE_JOBS["scrape"]["message"] = "Scraping Whitley..."
        await ingest_auctioneer_software(db, "https://www.whitleyauction.com", "rmeb", "Whitley Auction", 18.5)
        
        ACTIVE_JOBS["scrape"]["message"] = "Scraping Roller..."
        await ingest_auctioneer_software(db, "https://bid.rollerauction.com", "rol", "Roller Auction", 15.0)
        
        ACTIVE_JOBS["scrape"]["message"] = "Scraping Public Surplus..."
        await ingest_public_surplus(db)
        
        ACTIVE_JOBS["scrape"]["message"] = "Scraping Dickensheet..."
        await ingest_bidwrangler(db, "https://bid.dickensheet.com", "dickensheet", "Dickensheet Auction", 15.0)
    except Exception as e:
        logger.error(f"Global scrape error: {e}")
    finally:
        ACTIVE_JOBS["scrape"]["status"] = "idle"
        ACTIVE_JOBS["scrape"]["message"] = "Finished"
        db.close()

@router.post("/valuate/{item_id}")
async def valuate_item(item_id: int, target_roi: float = 0.30, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    try:
        valuation = await run_item_valuation(db, item_id, target_roi)
        if not valuation:
            raise HTTPException(status_code=400, detail="Could not calculate valuation")
        return {
            "est_market_value": valuation.est_market_value,
            "max_bid_for_target_roi": valuation.max_bid_for_target_roi,
            "target_roi_pct": valuation.target_roi_pct
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refresh-active-bids")
async def refresh_active_bids(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    results = {}
    platforms = [
        ("rmeb", "https://www.whitleyauction.com", "Whitley Auction", AuctioneerSoftwareScraper),
        ("rol", "https://bid.rollerauction.com", "Roller Auction", AuctioneerSoftwareScraper),
        ("public_surplus", "https://www.publicsurplus.com", "Public Surplus", PublicSurplusScraper),
        ("dickensheet", "https://bid.dickensheet.com", "Dickensheet", BidWranglerApiScraper),
        ("govdeals", "https://www.govdeals.com", "GovDeals", GovDealsScraper),
    ]

    for website_key, base_url, name, scraper_class in platforms:
        try:
            # 1. Get Credentials
            cookie_setting = db.query(Setting).filter(Setting.key == f"{website_key}_cookie").first()
            if not cookie_setting or not cookie_setting.value:
                results[website_key] = {"status": "skipped", "reason": "no credentials"}
                continue

            session_cookie = decrypt_value(cookie_setting.value)
            scraper = scraper_class(base_url=base_url, website_key=website_key) if scraper_class == AuctioneerSoftwareScraper else scraper_class(zip_code="00000", radius="0")
            
            # 2. Login
            await scraper.login(username="", session_cookie=session_cookie)
            
            # 3. Identify user bidder IDs
            user_bidder_ids = []
            bidder_setting = db.query(Setting).filter(Setting.key == f"{website_key}_bidder_id").first()
            if bidder_setting and bidder_setting.value: user_bidder_ids.append(str(bidder_setting.value))
            if hasattr(scraper, "fetch_my_bidder_id"):
                my_bidder_id = await scraper.fetch_my_bidder_id()
                if my_bidder_id and str(my_bidder_id) not in user_bidder_ids: user_bidder_ids.append(str(my_bidder_id))

            house = db.query(AuctionHouse).filter(AuctionHouse.website_key == website_key).first()
            if not house: continue

            # 4. Refresh Logic
            updated = 0
            if website_key == "public_surplus":
                my_bids = await scraper.fetch_my_bids()
                seen_ext_ids = set()
                for bid in my_bids:
                    bid_id = str(bid["id"])
                    seen_ext_ids.add(bid_id)
                    item = db.query(Item).filter(Item.external_id == bid_id, Item.auction_house_id == house.id).first()
                    if not item: continue
                    item.is_user_bidding = True
                    item.current_bid = bid["current_bid"]
                    if bid.get("status"):
                        item.status = bid["status"]
                    
                    if bid.get("end_time"):
                        try:
                            item.end_time = datetime.fromisoformat(bid["end_time"])
                        except:
                            pass

                    if not item.image_url:
                        item.image_url = await scraper.fetch_lot_image(bid_id)
                    
                    bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
                    if not bid_activity:
                        bid_activity = UserBidActivity(item_id=item.id)
                        db.add(bid_activity)
                    bid_activity.current_bid_amount = bid["current_bid"]
                    bid_activity.user_bid_amount = bid["user_bid"]
                    bid_activity.user_proxy_bid = bid["proxy_bid"]
                    bid_activity.user_bid_status = "winning" if bid["user_bid"] >= bid["current_bid"] else "outbid"
                    updated += 1
                
                # Mark missing items that we were bidding on as closed
                db.query(Item).filter(
                    Item.auction_house_id == house.id,
                    Item.is_user_bidding == True,
                    ~Item.external_id.in_(seen_ext_ids)
                ).update({"status": "closed"}, synchronize_session=False)
            else:
                # Whitley/Roller/Dickensheet
                auctions_data = await scraper.discover_active_auctions()
                for auction_data in auctions_data:
                    ext_id = str(auction_data.get("auction_id") or auction_data.get("id"))
                    if not ext_id or ext_id == "None": continue
                    _, lots_data = await scraper.fetch_auction_lots(ext_id)
                    for lot in lots_data:
                        lot_ext_id = str(lot.get("lot_id") or lot.get("id"))
                        item = db.query(Item).filter(Item.external_id == lot_ext_id, Item.auction_house_id == house.id).first()
                        if not item: continue
                        
                        is_winning = lot.get("isHighBidder") is True or str(lot.get("highBidderId") or "") in user_bidder_ids
                        current_bid = safe_float(lot.get("winning_bid_amount") or lot.get("starting_bid") or lot.get("price") or lot.get("required_bid"), 0.0)
                        
                        bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
                        has_bid = is_winning or (bid_activity is not None)
                        
                        if item.is_user_bidding != has_bid or item.current_bid != current_bid:
                            item.is_user_bidding = has_bid
                            item.current_bid = current_bid
                            updated += 1
                        
                        if not item.image_url and hasattr(scraper, "fetch_lot_image"):
                            # This performs the authenticated deep scrape
                            item.image_url = await scraper.fetch_lot_image(ext_id, lot_ext_id) if website_key != "dickensheet" else None
                        
                        if has_bid:
                            if not bid_activity:
                                bid_activity = UserBidActivity(item_id=item.id)
                                db.add(bid_activity)
                            proxy = safe_float(lot.get("my_max_proxy") or lot.get("my_max_bid"), current_bid)
                            bid_activity.current_bid_amount = current_bid
                            bid_activity.user_proxy_bid = proxy
                            bid_activity.user_bid_amount = safe_float(lot.get("my_bid_amount"), proxy)
                            bid_activity.user_bid_status = "winning" if is_winning else "outbid"

            db.commit()
            results[website_key] = {"status": "success", "updated": updated}
        except Exception as e:
            logger.error(f"Error refreshing {name}: {e}")
            results[website_key] = {"status": "error", "message": str(e)}
        finally:
            if 'scraper' in locals() and hasattr(scraper, "close"): await scraper.close()

    return {"status": "success", "platforms": results}
