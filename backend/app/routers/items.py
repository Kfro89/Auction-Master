from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..models import Item, Valuation, EbaySampleCache
from ..auth import get_current_user

router = APIRouter()

class WatchStatusUpdate(BaseModel):
    is_watched: bool

def serialize_item(item: Item) -> dict:
    item_dict = {
        "id": item.id,
        "title": item.title,
        "lot_number": item.lot_number,
        "current_bid": item.current_bid,
        "end_time": item.end_time,
        "status": item.status,
        "url": item.url,
        "image_url": item.image_url,
        "auction_house_id": item.auction_house_id,
        "auction_house_key": item.auction_house.website_key if item.auction_house else None,
        "auction_house_name": item.auction_house.name if item.auction_house else None,
        "category": item.category,
        "tags": item.tags,
        "is_watched": getattr(item, 'is_watched', False),
        "is_user_bidding": getattr(item, 'is_user_bidding', False),
        "vin": getattr(item, 'vin', None),
        "vehicle_year": getattr(item, 'vehicle_year', None),
        "vehicle_make": getattr(item, 'vehicle_make', None),
        "vehicle_model": getattr(item, 'vehicle_model', None),
        "vehicle_trim": getattr(item, 'vehicle_trim', None),
        "valuation": None
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
            
            if getattr(item.valuation.sample_cache, "valuation_detail", None):
                val_detail = item.valuation.sample_cache.valuation_detail
                item_dict["valuation_detail"] = {
                    "avg_asking_price": val_detail.avg_asking_price,
                    "median_asking_price": val_detail.median_asking_price,
                    "price_range_low": val_detail.price_range_low,
                    "price_range_high": val_detail.price_range_high,
                    "sample_listings": val_detail.sample_listings,
                }
        item_dict["valuation"] = val_dict
        
    if getattr(item, "user_bids", None):
        item_dict["user_bids"] = {
            "current_bid_amount": item.user_bids.current_bid_amount,
            "user_bid_amount": item.user_bids.user_bid_amount,
            "user_proxy_bid": item.user_bids.user_proxy_bid,
            "user_bid_status": item.user_bids.user_bid_status,
            "updated_at": item.user_bids.updated_at
        }
        
    return item_dict

@router.get("/")
async def list_items(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    from sqlalchemy.sql import func
    # Fetch items with their valuations and auction house, filtering out expired ones
    items = db.query(Item).options(
        joinedload(Item.valuation).joinedload(Valuation.sample_cache).joinedload(EbaySampleCache.valuation_detail), 
        joinedload(Item.auction_house),
        joinedload(Item.user_bids)
    ).filter(
        (Item.end_time >= func.now()) | (Item.end_time.is_(None))
    ).order_by(Item.end_time.asc()).all()
    return [serialize_item(item) for item in items]

@router.post("/{item_id}/watch")
async def toggle_watch_status(
    item_id: int,
    status: WatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_watched = status.is_watched
    db.commit()
    db.refresh(item)
    
    return {"id": item.id, "is_watched": item.is_watched}

@router.get("/watchlist")
async def get_watchlist(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    items = db.query(Item).options(
        joinedload(Item.valuation).joinedload(Valuation.sample_cache).joinedload(EbaySampleCache.valuation_detail),
        joinedload(Item.auction_house),
        joinedload(Item.user_bids)
    ).filter(Item.is_watched.is_(True)).order_by(Item.end_time.asc()).all()
    return [serialize_item(item) for item in items]

from pydantic import BaseModel
class BidRequest(BaseModel):
    amount: float

from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from ..services.security import decrypt_value
from ..models import Setting

@router.post("/{item_id}/bid")
async def place_bid(
    item_id: int,
    bid_req: BidRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(Item).options(joinedload(Item.auction_house)).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    house = item.auction_house
    if not house:
        raise HTTPException(status_code=400, detail="Item is not associated with an auction house")
        
    # Fetch credentials
    cookie_setting = db.query(Setting).filter(Setting.key == f"{house.website_key}_cookie").first()
    username_setting = db.query(Setting).filter(Setting.key == f"{house.website_key}_username").first()
    password_setting = db.query(Setting).filter(Setting.key == f"{house.website_key}_password").first()
    
    session_cookie = decrypt_value(cookie_setting.value) if cookie_setting else None
    username = username_setting.value if username_setting else None
    password = decrypt_value(password_setting.value) if password_setting else None
    
    if not session_cookie and not username:
        raise HTTPException(status_code=401, detail={
            "error": "authentication_required",
            "message": f"No credentials or session cookie found for {house.name}."
        })
        
    scraper = None
    if house.website_key in ["rmeb", "rol"]:
        scraper = AuctioneerSoftwareScraper(base_url=house.base_url, website_key=house.website_key)
    elif house.website_key == "public_surplus":
        # We don't need zip/radius for bidding, just base url
        scraper = PublicSurplusScraper(zip_code="00000", radius="0")
    elif house.website_key == "dickensheet":
        scraper = BidWranglerApiScraper(base_url=house.base_url)
    else:
        raise HTTPException(status_code=400, detail=f"Bidding not supported for {house.name}")
        
    try:
        await scraper.login(username=username, password=password, session_cookie=session_cookie)
        result = await scraper.place_bid(str(item.auction.external_id if item.auction else ""), item.external_id, bid_req.amount)
        
        # In a real implementation we might update item.current_bid here if successful
        # item.current_bid = result.get('new_bid')
        # db.commit()
        
        return {"status": "success", "result": result}
        
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except PermissionError as e:
        # Translates to CAPTCHA/Auth UI flow trigger
        raise HTTPException(status_code=403, detail={
            "error": "captcha_or_2fa_required",
            "message": str(e),
            "website_key": house.website_key
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if hasattr(scraper, 'close'):
            await scraper.close()
