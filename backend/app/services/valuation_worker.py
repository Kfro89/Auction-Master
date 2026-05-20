import os
import asyncio
import logging
import datetime
from sqlalchemy.orm import Session
from ..models import AuctionHouse, EbaySampleCache, Valuation
from .ebay_auth import EbayAuthClient
from .ebay_browse import EbayBrowseClient
from .valuation import calculate_valuation, _persist_valuation
from ..database import SessionLocal

logger = logging.getLogger(__name__)

BATCH_SIZE = 6


async def valuate_item_background(item_id: int, premium: float, target_roi: float = 0.30, model_name: str = "ResearchItem"):
    """
    Session-isolated task to fetch eBay valuation for a single item.
    Supports ResearchItem, BidItem.
    """
    from ..models import ResearchItem, BidItem
    db = SessionLocal()
    try:
        model_class = {"ResearchItem": ResearchItem, "BidItem": BidItem}.get(model_name, ResearchItem)
        item = db.query(model_class).get(item_id)
        if not item:
            logger.warning(f"{model_name} {item_id} not found.")
            return

        # If not enriched, run enrichment inline first
        if not item.search_queries:
            from .enrichment import _enrich_single_item
            from .ai_providers import get_active_provider
            provider = get_active_provider(db)
            logger.info(f"Item {item_id} missing search queries, enriching first...")
            cat_name, tags, brand, search_queries, condition_id, prod_name, condition, is_multimodal = await _enrich_single_item(item, provider)
            item.category = cat_name
            item.tags = tags
            item.brand = brand
            item.search_queries = search_queries
            item.normalized_condition_id = condition_id
            item.product_name = prod_name
            item.condition = condition
            item.processing_status = "pending_valuation"
            db.commit()
            db.refresh(item)

        if not item.search_queries:
            logger.warning(f"{model_name} {item_id} has no search queries for valuation even after enrichment attempt.")
            return

        from .security import get_ebay_credentials
        client_id, client_secret = get_ebay_credentials(db)
        if not client_id or not client_secret:
            logger.error("eBay credentials not configured. Background valuation skipped.")
            return

        auth_client = EbayAuthClient(client_id=client_id, client_secret=client_secret)
        browse_client = EbayBrowseClient(auth_client=auth_client)

        is_vehicle = item.category and item.category.startswith("Motor Pool") and "Parts" not in item.category
        
        # REQ-3.2: Strict Condition Matching
        condition_ids = [item.normalized_condition_id] if item.normalized_condition_id else ["1000", "2000", "3000"]
        buying_options = ["FIXED_PRICE", "AUCTION"] if is_vehicle else ["FIXED_PRICE"]

        val_data = None
        used_query = None

        # Prepare queries: for vehicles, append negative keywords
        queries_to_try = item.search_queries
        if is_vehicle:
            condition_ids = ["3000"]
            negatives = "-parts -salvage -rebuilt -wrecked -engine"
            refined_queries = []
            
            # If we have year/make/model, add a super-specific one first
            v_year = getattr(item, "vehicle_year", None)
            v_make = getattr(item, "vehicle_make", None)
            v_model = getattr(item, "vehicle_model", None)
            v_trim = getattr(item, "vehicle_trim", None)

            if v_year and v_make and v_model:
                base_q = f"{v_year} {v_make} {v_model}"
                if v_trim:
                    refined_queries.append(f"{base_q} {v_trim} {negatives}")
                refined_queries.append(f"{base_q} {negatives}")
            
            for q in item.search_queries:
                if negatives not in q:
                    refined_queries.append(f"{q} {negatives}")
                else:
                    refined_queries.append(q)
            queries_to_try = refined_queries

        for query in queries_to_try:
            logger.info(f"Background valuating {model_name} {item.id} with query '{query}'")
            try:
                results = await browse_client.search_active_listings(
                    query=query, 
                    condition_ids=condition_ids,
                    buying_options=buying_options
                )
                item_summaries = results.get("itemSummaries", [])

                if not item_summaries:
                    continue

                prices = []
                raw_listings = []
                for summary in item_summaries:
                    price_obj = summary.get("price", {})
                    val = price_obj.get("value")
                    if val:
                        try:
                            price_float = float(val)
                            prices.append(price_float)
                            if len(raw_listings) < 20:
                                raw_listings.append({
                                    "url": summary.get("itemWebUrl", ""),
                                    "title": summary.get("title", ""),
                                    "price": price_float,
                                    "condition": summary.get("condition", {}).get("conditionDisplayName", "")
                                })
                        except ValueError:
                            pass

                if not prices:
                    continue

                temp_val_data = calculate_valuation(
                    prices, raw_listings=raw_listings, target_roi=target_roi, auction_premium=premium, is_vehicle=bool(is_vehicle)
                )
                if temp_val_data:
                    val_data = temp_val_data
                    used_query = query
                    break
            except Exception as e:
                logger.error(f"Search failed for query '{query}': {e}")
                continue

        if not val_data:
            logger.warning(f"No valid valuation for {model_name} {item.id} across all queries")
            return

        await _persist_valuation(db, item, val_data, used_query, target_roi)
        logger.info(f"Successfully valuated {model_name} {item.id}. Max Bid: ${val_data['max_bid_for_target_roi']:.2f}")

    except Exception as e:
        logger.error(f"Error in background valuate for {model_name} {item_id}: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


async def batch_ebay_valuate(item_tasks: list, target_roi: float = 0.30, progress: dict = None, progress_offset: int = 0):
    """
    Valuate multiple items via eBay in parallel batches of BATCH_SIZE.
    item_tasks: list of (item_id, premium, model_name) tuples.
    """
    total = len(item_tasks)
    for i in range(0, total, BATCH_SIZE):
        batch = item_tasks[i:i + BATCH_SIZE]
        tasks = [valuate_item_background(item_id, premium, target_roi, model_name) for item_id, premium, model_name in batch]
        await asyncio.gather(*tasks, return_exceptions=True)
        if progress:
            progress["current"] = progress_offset + i + len(batch)


async def process_pending_valuations(db: Session, batch_size: int = 30):
    """
    Background worker task that identifies items without valuations and processes them.
    Supports ResearchItem and BidItem.
    """
    from ..models import ResearchItem, BidItem, Valuation
    
    # Priority order
    model_types = [BidItem, ResearchItem]
    
    all_item_tasks = []
    
    for model in model_types:
        if len(all_item_tasks) >= batch_size:
            break
            
        remaining_slots = batch_size - len(all_item_tasks)
        
        # Link to correct column in Valuation
        val_fk = {
            ResearchItem: Valuation.research_item_id,
            BidItem: Valuation.bid_item_id
        }[model]
        
        items = (
            db.query(model)
            .outerjoin(Valuation, model.id == val_fk)
            .filter(Valuation.id == None)
            .filter(model.search_queries != None)
            .filter(model.processing_status == "pending_valuation")
            .order_by(model.end_time.asc())
            .limit(remaining_slots)
            .all()
        )
        
        if not items:
            continue
            
        # Build premium cache
        premium_cache = {}
        for item in items:
            if item.auction_house_id not in premium_cache:
                house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
                premium_cache[item.auction_house_id] = house.buyer_premium_pct if house and house.buyer_premium_pct else 0.0

            all_item_tasks.append((item.id, premium_cache.get(item.auction_house_id, 0.0), model.__name__))

    if not all_item_tasks:
        return 0

    logger.info(f"Sweeper: Processing {len(all_item_tasks)} items for valuation.")
    await batch_ebay_valuate(all_item_tasks)
    return len(all_item_tasks)
