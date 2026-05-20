import math
import statistics
import datetime
import os
import re
import httpx
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models import AuctionHouse, EbaySampleCache, Valuation, ValuationDetail
from .ebay_auth import EbayAuthClient
from .ebay_browse import EbayBrowseClient
from .llm import extract_product_name, generate_valuation_data
import logging

logger = logging.getLogger(__name__)

def calculate_valuation(prices: List[float], raw_listings: List[Dict[str, Any]] = None, target_roi: float = 0.30, auction_premium: float = 0.0, is_vehicle: bool = False) -> Optional[Dict[str, Any]]:
    initial_sample_size = len(prices)
    min_size = 5 if is_vehicle else 30
    if initial_sample_size < min_size:
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
    
    # 2. Trimming
    filtered_prices.sort()
    trim_pct = 0.20 if is_vehicle else 0.15
    trim_count = int(len(filtered_prices) * trim_pct)
    if trim_count > 0:
        trimmed_prices = filtered_prices[trim_count:-trim_count]
    else:
        trimmed_prices = filtered_prices
        
    final_sample_size = len(trimmed_prices)
    if final_sample_size == 0:
        return None
        
    trimmed_median = statistics.median(trimmed_prices)
    
    # 3. Use trimmed median directly as est_market_value (removed market adjustment factor)
    est_market_value = trimmed_median
    
    # 4. Math for max bid
    # eBay Fees approx = 13.25% + $0.40
    ebay_fees = est_market_value * 0.1325 + 0.40
    
    # Total Cost = Max Bid * (1 + Auction Premium %)
    # Revenue = Est Market Value - eBay Fees
    # Target ROI = (Revenue - Total Cost) / Total Cost
    # Max Bid = Revenue / ((1 + Target ROI) * (1 + Auction Premium %))
    premium_decimal = auction_premium / 100.0
    revenue = est_market_value - ebay_fees
    max_bid_for_target_roi = revenue / ((1 + target_roi) * (1 + premium_decimal))
    
    # Ensure we don't return negative bids for items worth less than eBay fees
    max_bid_for_target_roi = max(0.0, max_bid_for_target_roi)
    
    # REQ-3.3: Automated Price Aggregation
    agg_metrics = {}
    if raw_listings:
        raw_prices = [listing["price"] for listing in raw_listings if isinstance(listing.get("price"), (int, float))]
        if raw_prices:
            agg_metrics = {
                "avg_asking_price": sum(raw_prices) / len(raw_prices),
                "median_asking_price": statistics.median(raw_prices),
                "price_range_low": min(raw_prices),
                "price_range_high": max(raw_prices),
                "raw_listings": raw_listings
            }

    return {
        "initial_sample_size": initial_sample_size,
        "sample_size_after_zscore": sample_size_after_zscore,
        "final_sample_size": final_sample_size,
        "trimmed_median": trimmed_median,
        "mean": mean,
        "est_market_value": est_market_value,
        "ebay_fees": ebay_fees,
        "max_bid_for_target_roi": max_bid_for_target_roi,
        **agg_metrics
    }

async def extract_and_decode_vin(item: Any, val_meta: dict) -> None:
    text_to_search = f"{item.title} {item.description or ''}"
    
    # 1. Search for VIN preceded by "VIN"
    vin_match = re.search(r'\bVIN\s*[:#-]?\s*([A-HJ-NPR-Z0-9]{17})\b', text_to_search, re.IGNORECASE)
    vin = None
    if vin_match:
        vin = vin_match.group(1).upper()
    else:
        # 2. Standalone 17 char
        vin_match = re.search(r'\b([A-HJ-NPR-Z0-9]{17})\b', text_to_search, re.IGNORECASE)
        if vin_match:
            # basic check to avoid all numbers
            candidate = vin_match.group(1).upper()
            if not candidate.isdigit():
                vin = candidate
    
    # 3. LLM fallback
    if not vin and val_meta and "tags" in val_meta and "VIN" in val_meta["tags"]:
        vin_candidate = str(val_meta["tags"]["VIN"]).upper()
        if re.match(r'^[A-HJ-NPR-Z0-9]{17}$', vin_candidate):
            vin = vin_candidate
            
    if vin:
        if hasattr(item, "vin"):
            item.vin = vin
            
        # Decode VIN if we have somewhere to put the results
        if hasattr(item, "vehicle_make"):
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json")
                    if resp.status_code == 200:
                        data = resp.json()
                        results = data.get("Results", [])
                        if results:
                            res = results[0]
                            item.vehicle_make = res.get("Make")
                            item.vehicle_model = res.get("Model")
                            item.vehicle_trim = res.get("Trim")
                            try:
                                if hasattr(item, "vehicle_year"):
                                    item.vehicle_year = int(res.get("ModelYear"))
                            except (ValueError, TypeError):
                                pass
            except Exception as e:
                logger.error(f"Failed to decode VIN {vin}: {e}")

async def fetch_marketcheck_valuation(db: Session, vin: str) -> Optional[float]:
    """
    Fetches market value from MarketCheck API based on VIN.
    """
    from ..models import Setting
    from .security import decrypt_value
    
    api_key_setting = db.query(Setting).filter(Setting.key == "marketcheck_api_key").first()
    api_key = decrypt_value(api_key_setting.value) if api_key_setting else os.getenv("MARKETCHECK_API_KEY")
    
    if not api_key:
        return None
    
    try:
        url = f"https://mc-api.marketcheck.com/v2/stats/car?api_key={api_key}&vin={vin}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                retail_stats = data.get("retail", {})
                median = retail_stats.get("median")
                if median:
                    return float(median)
    except Exception as e:
        logger.error(f"MarketCheck API call failed: {e}")
    
    return None

async def _persist_valuation(db: Session, item: Any, val_data: dict, used_query: str, target_roi: float) -> Valuation:
    from ..models import ResearchItem, BidItem
    is_vehicle = item.category and item.category.startswith("Motor Pool") and "Parts" not in item.category
    
    # Persist sample cache
    sample_cache = EbaySampleCache(
        query_signature=used_query,
        sample_size=val_data["initial_sample_size"],
        trimmed_median=val_data["trimmed_median"],
        mean=val_data["mean"],
        fetched_at=datetime.datetime.utcnow()
    )
    
    if isinstance(item, ResearchItem):
        sample_cache.research_item_id = item.id
    elif isinstance(item, BidItem):
        sample_cache.bid_item_id = item.id
        
    db.add(sample_cache)
    db.flush()
    db.refresh(sample_cache)
    
    # REQ-3.3: Store pre-calculated aggregation metrics and sample listings
    if "raw_listings" in val_data:
        val_detail = ValuationDetail(
            sample_cache_id=sample_cache.id,
            sample_listings=val_data["raw_listings"],
            avg_asking_price=val_data.get("avg_asking_price", 0),
            median_asking_price=val_data.get("median_asking_price", 0),
            price_range_low=val_data.get("price_range_low", 0),
            price_range_high=val_data.get("price_range_high", 0)
        )
        if isinstance(item, ResearchItem):
            val_detail.research_item_id = item.id
        elif isinstance(item, BidItem):
            val_detail.bid_item_id = item.id
            
        db.add(val_detail)
        db.flush()

    # Check if valuation exists
    if isinstance(item, ResearchItem):
        valuation = db.query(Valuation).filter(Valuation.research_item_id == item.id).first()
        if not valuation:
            valuation = Valuation(research_item_id=item.id)
            db.add(valuation)
    elif isinstance(item, BidItem):
        valuation = db.query(Valuation).filter(Valuation.bid_item_id == item.id).first()
        if not valuation:
            valuation = Valuation(bid_item_id=item.id)
            db.add(valuation)

    valuation.sample_cache_id = sample_cache.id
    valuation.est_market_value = val_data["est_market_value"]
    valuation.market_adjustment_factor_applied = 1.0 if is_vehicle else 0.75
    valuation.max_bid_for_target_roi = val_data["max_bid_for_target_roi"]
    valuation.target_roi_pct = target_roi
    valuation.computed_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(valuation)

    return valuation
