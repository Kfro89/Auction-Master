import os
import asyncio
import logging
import datetime
from sqlalchemy.orm import Session
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation
from .ebay_auth import EbayAuthClient
from .ebay_browse import EbayBrowseClient
from .valuation import calculate_valuation
from ..database import SessionLocal

logger = logging.getLogger(__name__)

BATCH_SIZE = 6


async def valuate_item_background(item_id: int, premium: float, target_roi: float = 0.30):
    """
    Session-isolated task to fetch eBay valuation for a single item.
    Tries all stored search_queries in order until a valid valuation is found.
    Upserts the valuation record (updates if exists, creates if not).
    """
    db = SessionLocal()
    try:
        item = db.query(Item).get(item_id)
        if not item or not item.search_queries:
            logger.warning(f"Item {item_id} has no search queries for valuation.")
            return

        client_id = os.environ.get("EBAY_CLIENT_ID")
        client_secret = os.environ.get("EBAY_CLIENT_SECRET")
        if not client_id or not client_secret:
            logger.error("eBay credentials not configured. Background valuation skipped.")
            return

        auth_client = EbayAuthClient(client_id=client_id, client_secret=client_secret)
        browse_client = EbayBrowseClient(auth_client=auth_client)

        is_vehicle = item.category and item.category.startswith("Motor Pool") and "Parts" not in item.category
        condition_ids = ["3000"] if is_vehicle else (
            [item.normalized_condition_id] if item.normalized_condition_id else ["1000", "2000", "3000"]
        )

        val_data = None
        used_query = None

        for query in item.search_queries:
            logger.info(f"Background valuating item {item.id} with query '{query}'")
            results = await browse_client.search_active_listings(query=query, condition_ids=condition_ids)
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

            temp_val_data = calculate_valuation(
                prices, target_roi=target_roi, auction_premium=premium, is_vehicle=bool(is_vehicle)
            )
            if temp_val_data:
                val_data = temp_val_data
                used_query = query
                break

        if not val_data:
            logger.warning(f"No valid valuation for item {item.id} across all queries")
            return

        # Save Cache
        sample_cache = EbaySampleCache(
            item_id=item.id,
            query_signature=used_query,
            sample_size=val_data["initial_sample_size"],
            trimmed_median=val_data["trimmed_median"],
            mean=val_data.get("mean", 0.0),
            fetched_at=datetime.datetime.utcnow()
        )
        db.add(sample_cache)
        db.commit()
        db.refresh(sample_cache)

        # Upsert Valuation
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
        logger.info(f"Successfully valuated item {item.id}. Max Bid: ${val_data['max_bid_for_target_roi']:.2f}")

    except Exception as e:
        logger.error(f"Error in background valuate for item {item_id}: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


async def batch_ebay_valuate(item_ids_with_premiums: list, target_roi: float = 0.30, progress: dict = None, progress_offset: int = 0):
    """
    Valuate multiple items via eBay in parallel batches of BATCH_SIZE.
    item_ids_with_premiums: list of (item_id, premium) tuples.
    """
    total = len(item_ids_with_premiums)
    for i in range(0, total, BATCH_SIZE):
        batch = item_ids_with_premiums[i:i + BATCH_SIZE]
        tasks = [valuate_item_background(item_id, premium, target_roi) for item_id, premium in batch]
        await asyncio.gather(*tasks, return_exceptions=True)
        if progress:
            progress["current"] = progress_offset + i + len(batch)


async def process_pending_valuations(db: Session):
    """
    Background worker task that identifies items without valuations and processes them.
    Priority is given to items whose auctions end soonest.
    Processes in parallel batches of BATCH_SIZE.
    """
    items = (
        db.query(Item)
        .outerjoin(Valuation, Item.id == Valuation.item_id)
        .filter(Valuation.id == None)
        .filter(Item.search_queries != None)
        .order_by(Item.end_time.asc())
        .limit(100)
        .all()
    )

    if not items:
        return

    logger.info(f"Sweeper: Processing {len(items)} items for valuation.")

    # Build premium cache
    premium_cache = {}
    for item in items:
        if item.auction_house_id not in premium_cache:
            house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
            premium_cache[item.auction_house_id] = house.buyer_premium_pct if house and house.buyer_premium_pct else 0.0

    item_ids_with_premiums = [
        (item.id, premium_cache.get(item.auction_house_id, 0.0))
        for item in items
    ]

    await batch_ebay_valuate(item_ids_with_premiums)
