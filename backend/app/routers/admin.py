import os
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.ingestion import ingest_auctioneer_software
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation
from ..services.ebay_auth import EbayAuthClient
from ..services.ebay_browse import EbayBrowseClient
from ..services.valuation import calculate_valuation

router = APIRouter()

@router.post("/scrape/whitley")
async def scrape_whitley(db: Session = Depends(get_db)):
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
async def scrape_roller(db: Session = Depends(get_db)):
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
async def valuate_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    auction_house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
    if not auction_house:
        raise HTTPException(status_code=404, detail="Auction house not found")

    query = item.title[:50]

    client_id = os.environ.get("EBAY_CLIENT_ID")
    client_secret = os.environ.get("EBAY_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="eBay credentials not configured")
    
    auth_client = EbayAuthClient(client_id=client_id, client_secret=client_secret)
    browse_client = EbayBrowseClient(auth_client=auth_client)
    
    condition_ids = [item.normalized_condition_id] if item.normalized_condition_id else ["1000", "2000", "3000"]
        
    try:
        results = await browse_client.search_active_listings(query=query, condition_ids=condition_ids)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch from eBay: {str(e)}")

    item_summaries = results.get("itemSummaries", [])
    if not item_summaries:
        raise HTTPException(status_code=400, detail="No eBay results found")

    prices = []
    for summary in item_summaries:
        price_obj = summary.get("price", {})
        val = price_obj.get("value")
        if val:
            try:
                prices.append(float(val))
            except ValueError:
                pass
                
    if not prices:
        raise HTTPException(status_code=400, detail="Could not extract prices from eBay results")

    premium = auction_house.buyer_premium_pct if auction_house.buyer_premium_pct else 0.0
    val_data = calculate_valuation(prices, target_roi=0.30, auction_premium=premium)
    if not val_data:
        raise HTTPException(status_code=400, detail="Insufficient sample size to calculate valuation")

    sample_cache = EbaySampleCache(
        item_id=item.id,
        query_signature=query,
        sample_size=val_data["initial_sample_size"],
        trimmed_median=val_data["trimmed_median"],
        iqr=0.0,
        mean=0.0,
        confidence_score=0.0,
        fetched_at=datetime.datetime.utcnow()
    )
    db.add(sample_cache)
    db.commit()
    db.refresh(sample_cache)

    valuation = Valuation(
        item_id=item.id,
        sample_cache_id=sample_cache.id,
        est_market_value=val_data["est_market_value"],
        market_adjustment_factor_applied=0.75,
        max_bid_for_target_roi=val_data["max_bid_for_target_roi"],
        target_roi_pct=0.30,
        computed_at=datetime.datetime.utcnow()
    )
    db.add(valuation)
    db.commit()
    db.refresh(valuation)

    return valuation
