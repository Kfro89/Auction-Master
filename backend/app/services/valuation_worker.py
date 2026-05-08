import os
import logging
import datetime
from sqlalchemy.orm import Session
from ..models import Item, AuctionHouse, EbaySampleCache, Valuation
from .ebay_auth import EbayAuthClient
from .ebay_browse import EbayBrowseClient
from .valuation import calculate_valuation
from .llm import extract_product_name

logger = logging.getLogger(__name__)

async def process_pending_valuations(db: Session):
    """
    Background worker task that identifies items without valuations and processes them.
    Priority is given to items whose auctions end soonest.
    """
    # 1. Find 5 items ending soonest without a valuation
    items = (
        db.query(Item)
        .outerjoin(Valuation, Item.id == Valuation.item_id)
        .filter(Valuation.id == None)
        .order_by(Item.end_time.asc())
        .limit(100)
        .all()
    )

    if not items:
        return

    logger.info(f"Background worker: Processing {len(items)} items for valuation.")

    # 2. Setup eBay clients
    client_id = os.environ.get("EBAY_CLIENT_ID")
    client_secret = os.environ.get("EBAY_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        logger.error("eBay credentials not configured. Background valuation skipped.")
        return

    auth_client = EbayAuthClient(client_id=client_id, client_secret=client_secret)
    browse_client = EbayBrowseClient(auth_client=auth_client)

    for item in items:
        try:
            logger.info(f"Valuating item {item.id}: {item.title}")
            
            # Extract clean query
            query = await extract_product_name(item.title)
            logger.info(f"Extracted query: '{query}' for title: '{item.title}'")
            
            # Fetch auction house for premium
            auction_house = db.query(AuctionHouse).filter(AuctionHouse.id == item.auction_house_id).first()
            premium = auction_house.buyer_premium_pct if auction_house and auction_house.buyer_premium_pct else 0.0
            
            # Search eBay
            condition_ids = [item.normalized_condition_id] if item.normalized_condition_id else ["1000", "2000", "3000"]
            results = await browse_client.search_active_listings(query=query, condition_ids=condition_ids)
            
            item_summaries = results.get("itemSummaries", [])
            if not item_summaries:
                logger.warning(f"No eBay results for item {item.id} with query '{query}'")
                # We save an empty/failed valuation attempt to avoid retrying immediately
                # (Or we could handle this by setting a flag)
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

            val_data = calculate_valuation(prices, target_roi=0.30, auction_premium=premium)
            if not val_data:
                logger.warning(f"Insufficient sample size ({len(prices)}) for item {item.id}")
                continue

            # Save Cache
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

            # Save Valuation
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
            
            logger.info(f"Successfully valuated item {item.id}. Max Bid: ${val_data['max_bid_for_target_roi']:.2f}")

        except Exception as e:
            logger.error(f"Error valuating item {item.id}: {e}", exc_info=True)
            db.rollback()
