import math
import statistics
import datetime
import os
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation
from .ebay_auth import EbayAuthClient
from .ebay_browse import EbayBrowseClient
from .llm import extract_product_name

def calculate_valuation(prices: List[float], target_roi: float = 0.30, auction_premium: float = 0.0) -> Optional[Dict[str, Any]]:
    initial_sample_size = len(prices)
    if initial_sample_size < 30:
        return None

    # 1. Z-score filtering
    if len(prices) < 2:
        return None
    
    mean = statistics.mean(prices)
    stdev = statistics.stdev(prices)
    
    if stdev == 0:
        filtered_prices = prices
    else:
        filtered_prices = [p for p in prices if abs((p - mean) / stdev) <= 2]
    
    sample_size_after_zscore = len(filtered_prices)
    
    # 2. Trimming 15% from top and bottom
    filtered_prices.sort()
    trim_count = int(len(filtered_prices) * 0.15)
    if trim_count > 0:
        trimmed_prices = filtered_prices[trim_count:-trim_count]
    else:
        trimmed_prices = filtered_prices
        
    final_sample_size = len(trimmed_prices)
    if final_sample_size == 0:
        return None
        
    trimmed_median = statistics.median(trimmed_prices)
    
    # 3. Apply 0.75 market adjustment factor
    est_market_value = trimmed_median * 0.75
    
    # 4. Math for max bid
    # eBay Fees approx = 13.25% + $0.40
    ebay_fees = est_market_value * 0.1325 + 0.40
    
    # Max Bid = (est_market_value / (1 + Target ROI)) - eBay Fees - Auction Premium
    max_bid_for_target_roi = (est_market_value / (1 + target_roi)) - ebay_fees - auction_premium
    
    return {
        "initial_sample_size": initial_sample_size,
        "sample_size_after_zscore": sample_size_after_zscore,
        "final_sample_size": final_sample_size,
        "trimmed_median": trimmed_median,
        "est_market_value": est_market_value,
        "ebay_fees": ebay_fees,
        "max_bid_for_target_roi": max_bid_for_target_roi
    }

async def run_item_valuation(db: Session, item_id: int) -> Optional[Valuation]:
    """
    Performs a full valuation for a single item, including LLM extraction and eBay search.
    """
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return None
        
    auction_house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
    premium = auction_house.buyer_premium_pct if auction_house and auction_house.buyer_premium_pct else 0.0

    # 1. Extract clean query
    query = await extract_product_name(item.title)
    
    # 2. Setup eBay clients
    client_id = os.environ.get("EBAY_CLIENT_ID")
    client_secret = os.environ.get("EBAY_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise Exception("eBay credentials not configured")
        
    auth_client = EbayAuthClient(client_id=client_id, client_secret=client_secret)
    browse_client = EbayBrowseClient(auth_client=auth_client)
    
    # 3. Search eBay
    condition_ids = [item.normalized_condition_id] if item.normalized_condition_id else ["1000", "2000", "3000"]
    results = await browse_client.search_active_listings(query=query, condition_ids=condition_ids)
    
    item_summaries = results.get("itemSummaries", [])
    if not item_summaries:
        return None

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
        return None

    # 4. Calculate
    val_data = calculate_valuation(prices, target_roi=0.30, auction_premium=premium)
    if not val_data:
        return None

    # 5. Persist
    sample_cache = EbaySampleCache(
        item_id=item.id,
        query_signature=query,
        sample_size=val_data["initial_sample_size"],
        trimmed_median=val_data["trimmed_median"],
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
