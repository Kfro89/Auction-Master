import math
import statistics
import datetime
import os
import re
import httpx
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation
from .ebay_auth import EbayAuthClient
from .ebay_browse import EbayBrowseClient
from .llm import extract_product_name, generate_valuation_data
import logging

logger = logging.getLogger(__name__)

def calculate_valuation(prices: List[float], target_roi: float = 0.30, auction_premium: float = 0.0, is_vehicle: bool = False) -> Optional[Dict[str, Any]]:
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
    
    # 3. Market adjustment factor
    # For vehicles, we take 90% of the trimmed median (active asking prices)
    est_market_value = trimmed_median * 0.90 if is_vehicle else trimmed_median * 0.75
    
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
    
    return {
        "initial_sample_size": initial_sample_size,
        "sample_size_after_zscore": sample_size_after_zscore,
        "final_sample_size": final_sample_size,
        "trimmed_median": trimmed_median,
        "mean": mean,
        "est_market_value": est_market_value,
        "ebay_fees": ebay_fees,
        "max_bid_for_target_roi": max_bid_for_target_roi
    }

async def extract_and_decode_vin(item: Item, val_meta: dict) -> None:
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
        item.vin = vin
        if not item.vehicle_make:
            # Decode VIN
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

async def _persist_valuation(db: Session, item: Item, val_data: dict, used_query: str, target_roi: float) -> Valuation:
    is_vehicle = item.category and item.category.startswith("Motor Pool") and "Parts" not in item.category
    
    # Persist sample cache
    sample_cache = EbaySampleCache(
        item_id=item.id,
        query_signature=used_query,
        sample_size=val_data["initial_sample_size"],
        trimmed_median=val_data["trimmed_median"],
        mean=val_data["mean"],
        fetched_at=datetime.datetime.utcnow()
    )
    db.add(sample_cache)
    db.commit()
    db.refresh(sample_cache)

    # Check if valuation exists
    valuation = db.query(Valuation).filter(Valuation.item_id == item.id).first()
    if not valuation:
        valuation = Valuation(item_id=item.id)
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

async def run_item_valuation(db: Session, item_id: int, target_roi: float = 0.30) -> Optional[Valuation]:
    """
    Performs a full valuation for a single item, including LLM extraction and eBay search.
    """
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        return None
        
    auction_house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
    premium = auction_house.buyer_premium_pct if auction_house and auction_house.buyer_premium_pct else 0.0

    # 1. Extract queries and metadata
    val_meta = await generate_valuation_data(item.title, item.description, item.category or "")
    
    if val_meta.get("category") == "Unknown" and item.image_url:
        logger.info(f"Category unknown for '{item.title}' in valuation, retrying with image evaluation...")
        val_meta = await generate_valuation_data(
            item.title,
            item.description,
            item.category or "",
            image_url=item.image_url
        )
        
    queries = val_meta.get("search_queries", [item.title[:50]])
    if not queries:
        queries = [item.title[:50]]
        
    # Optionally update classification on the item
    if val_meta.get("category") and val_meta.get("category") != "Unknown":
        item.category = val_meta["category"]
        item.tags = val_meta.get("tags", [])
        db.commit()
        
    is_vehicle = item.category and item.category.startswith("Motor Pool") and "Parts" not in item.category
    
    if is_vehicle:
        await extract_and_decode_vin(item, val_meta)
        db.commit()

        # Try MarketCheck first for individual valuations
        if item.vin:
            mc_price = await fetch_marketcheck_valuation(db, item.vin)
            if mc_price:
                logger.info(f"Using MarketCheck price ${mc_price} for VIN {item.vin}")
                ebay_fees = mc_price * 0.1325 + 0.40
                premium_decimal = premium / 100.0
                revenue = mc_price - ebay_fees
                max_bid = max(0.0, revenue / ((1 + target_roi) * (1 + premium_decimal)))
                
                val_data = {
                    "initial_sample_size": 1,
                    "sample_size_after_zscore": 1,
                    "final_sample_size": 1,
                    "trimmed_median": mc_price,
                    "mean": mc_price,
                    "est_market_value": mc_price,
                    "ebay_fees": ebay_fees,
                    "max_bid_for_target_roi": max_bid
                }
                used_query = f"MARKETCHECK:{item.vin}"
                return await _persist_valuation(db, item, val_data, used_query, target_roi)
    
    # 2. Setup eBay clients
    from .security import get_ebay_credentials
    client_id, client_secret = get_ebay_credentials(db)
    if not client_id or not client_secret:
        raise Exception("eBay credentials not configured")
        
    auth_client = EbayAuthClient(client_id=client_id, client_secret=client_secret)
    browse_client = EbayBrowseClient(auth_client=auth_client)
    
    # 3. Determine eBay Category ID and refine queries for vehicles
    item_class = val_meta.get("item_class", "other")
    category_id = None
    buying_options = ["FIXED_PRICE"]
    
    if is_vehicle:
        category_id = "6001" 
        condition_ids = ["3000"]
        buying_options = ["FIXED_PRICE", "AUCTION"]
        
        new_queries = []
        negatives = "-parts -salvage -rebuilt -wrecked -engine"
        
        if item.vehicle_year and item.vehicle_make and item.vehicle_model:
            base_q = f"{item.vehicle_year} {item.vehicle_make} {item.vehicle_model}"
            if item.vehicle_trim:
                new_queries.append(f"{base_q} {item.vehicle_trim} {negatives}")
            new_queries.append(f"{base_q} {negatives}")
        
        for q in queries:
            if negatives not in q:
                new_queries.append(f"{q} {negatives}")
        
        queries = new_queries
    else:
        if item_class == "car_part":
            category_id = "6030"
        condition_ids = [item.normalized_condition_id] if item.normalized_condition_id else ["1000", "2000", "3000"]
    
    val_data = None
    used_query = None
    
    for query in queries:
        results = await browse_client.search_active_listings(
            query=query, 
            condition_ids=condition_ids, 
            category_ids=category_id,
            buying_options=buying_options
        )
        item_summaries = results.get("itemSummaries", [])
        
        if not item_summaries:
            continue
            
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
            continue
            
        temp_val_data = calculate_valuation(prices, target_roi=target_roi, auction_premium=premium, is_vehicle=bool(is_vehicle))
        if temp_val_data:
            val_data = temp_val_data
            used_query = query
            break

    if not val_data:
        return None

    return await _persist_valuation(db, item, val_data, used_query, target_roi)
