from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from ..database import get_db
from ..models import Item, Valuation, EbaySampleCache, Setting
from ..auth import get_current_user
from ..scrapers.auctioneer_software import AuctioneerSoftwareScraper
from ..scrapers.public_surplus import PublicSurplusScraper
from ..scrapers.bid_wrangler import BidWranglerApiScraper
from ..services.security import decrypt_value, get_ebay_credentials
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient

router = APIRouter()

class WatchStatusUpdate(BaseModel):
    is_watched: bool

class BidRequest(BaseModel):
    amount: float

class MarginUpdate(BaseModel):
    target_roi_pct: float

def serialize_item(item: Item) -> dict:
    base_url = item.auction_house.base_url.rstrip("/") if item.auction_house else ""
    
    def ensure_absolute(url):
        if not url: return url
        if url.startswith("http"): return url
        if url.startswith("//"): return f"https:{url}"
        return f"{base_url}/{url.lstrip('/')}"

    image_url = ensure_absolute(item.image_url)
    images = [ensure_absolute(img) for img in getattr(item, 'images', [])] if getattr(item, 'images', None) else []

    item_dict = {
        "id": item.id,
        "title": item.title,
        "lot_number": item.lot_number,
        "current_bid": item.current_bid,
        "end_time": item.end_time,
        "status": item.status,
        "url": item.url,
        "image_url": image_url,
        "images": images,
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
        user_bid_status = item.user_bids.user_bid_status
        
        # Infer won/loss if the auction is over
        is_over = item.status == "closed"
        if not is_over and item.end_time:
            now = datetime.now(timezone.utc)
            # Handle naive vs aware comparison
            if item.end_time.tzinfo is None:
                now = now.replace(tzinfo=None)
            if item.end_time <= now:
                is_over = True
                
        if is_over:
            if user_bid_status == "winning":
                user_bid_status = "won"
            elif user_bid_status in ["outbid", "outbid_near"]:
                user_bid_status = "lost"

        item_dict["user_bids"] = {
            "current_bid_amount": item.user_bids.current_bid_amount,
            "user_bid_amount": item.user_bids.user_bid_amount,
            "user_proxy_bid": item.user_bids.user_proxy_bid,
            "user_bid_status": user_bid_status,
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
        (Item.end_time >= func.now()) | (Item.end_time.is_(None)) | (Item.is_user_bidding == True)
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

@router.get("/{item_id}/comparables")
async def get_comparables(item_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    search_queries = getattr(item, 'search_queries', [])
    if not search_queries:
        search_query = item.title[:50]
    else:
        search_query = search_queries[0]

    client_id, client_secret = get_ebay_credentials(db)
    auth_client = EbayAuthClient(client_id, client_secret)
    browse_client = EbayBrowseClient(auth_client)

    condition_ids = ["3000"]
    if getattr(item, "normalized_condition_id", None):
        condition_ids = [item.normalized_condition_id]
    elif getattr(item, "vehicle_year", None):
        condition_ids = ["3000"] # Vehicles are almost always used
    else:
        condition_ids = ["1000", "2000", "3000"]
    
    try:
        results = await browse_client.search_active_listings(query=search_query, condition_ids=condition_ids)
        item_summaries = results.get("itemSummaries", [])[:20]
        
        # Calculate price metrics
        prices = [float(listing.get("price", {}).get("value", 0)) for listing in item_summaries if listing.get("price", {}).get("value")]
        avg_price = sum(prices) / len(prices) if prices else 0
        median_price = sorted(prices)[len(prices)//2] if prices else 0
        price_low = min(prices) if prices else 0
        price_high = max(prices) if prices else 0
        
        mapped_listings = []
        for listing in item_summaries:
            condition = "Unknown"
            if "condition" in listing:
                # Sometimes condition is a string, sometimes a dict
                if isinstance(listing["condition"], dict):
                     condition = listing["condition"].get("conditionDisplayName", "Unknown")
                else:
                     condition = str(listing["condition"])
                     
            mapped_listings.append({
                "title": listing.get("title", ""),
                "price": listing.get("price", {}).get("value", "0.00"),
                "url": listing.get("itemWebUrl", ""),
                "condition": condition
            })

        return {
            "avg_asking_price": avg_price,
            "median_asking_price": median_price,
            "price_range_low": price_low,
            "price_range_high": price_high,
            "sample_listings": mapped_listings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch comparables: {str(e)}")

class MarginUpdate(BaseModel):
    target_roi_pct: float

@router.patch("/{item_id}/valuation/margin")
async def update_valuation_margin(
    item_id: int,
    margin_req: MarginUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(Item).options(joinedload(Item.valuation)).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    valuation = item.valuation
    if not valuation:
        raise HTTPException(status_code=400, detail="Item has no valuation to update")
        
    valuation.target_roi_pct = margin_req.target_roi_pct
    
    # Recalculate max_bid_for_target_roi
    # Formula: (est_market_value * 0.85 * (1 - target_roi_pct)) - shipping_cost_est
    est_market_value = valuation.est_market_value or 0.0
    shipping_cost_est = item.shipping_cost_est or 0.0
    
    valuation.max_bid_for_target_roi = (est_market_value * 0.85 * (1 - valuation.target_roi_pct)) - shipping_cost_est
    valuation.max_bid_for_target_roi = max(0.0, valuation.max_bid_for_target_roi)
    
    db.commit()
    db.refresh(valuation)
    
    return serialize_item(item)
