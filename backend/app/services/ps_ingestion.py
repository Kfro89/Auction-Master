import asyncio
import random
import logging
from datetime import datetime, timezone
from typing import Dict

from sqlalchemy.orm import Session

from ..models import AuctionHouse, Item, UserSettings
from ..scrapers.public_surplus import PublicSurplusScraper, PS_CATEGORIES
from .category_classifier import classify_item

logger = logging.getLogger(__name__)


def _get_or_create_settings(db: Session) -> UserSettings:
    """Return the single UserSettings row, creating it with defaults if missing."""
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    if not settings:
        settings = UserSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


async def ingest_public_surplus(db: Session) -> Dict:
    """
    Orchestrates the full PS scrape → parse → persist pipeline.

    1. Read settings (zip, radius, region, end_hours, category).
    2. Initialize scraper with those settings.
    3. Paginate search results for the item list.
    4. For each item, upsert into items table.
    5. For new items (detail_scraped_at is None), fetch the detail page.
    6. Return a summary dict.
    """
    settings = _get_or_create_settings(db)

    if not settings.ps_enabled:
        return {"status": "skipped", "message": "Public Surplus scraping is disabled"}

    # Ensure AuctionHouse row exists
    house = db.query(AuctionHouse).filter(AuctionHouse.website_key == "ps").first()
    if not house:
        house = AuctionHouse(
            name="Public Surplus",
            website_key="ps",
            base_url="https://www.publicsurplus.com",
            buyer_premium_pct=0.0,
            cash_discount_pct=0.0,
            tax_rate=0.0,
        )
        db.add(house)
        db.commit()
        db.refresh(house)

    scraper = PublicSurplusScraper(
        zip_code=settings.ps_zip_code or "",
        radius_miles=settings.ps_radius_miles,
        region=settings.ps_region or "",
        end_hours=settings.ps_end_hours,
        category_id=settings.ps_category_id,
    )

    stats = {"items_seen": 0, "items_new": 0, "items_updated": 0, "details_fetched": 0, "errors": 0}

    # Resolve category name if filtering by a specific catId
    search_category = None
    if settings.ps_category_id > 0 and settings.ps_category_id in PS_CATEGORIES:
        search_category = PS_CATEGORIES[settings.ps_category_id]

    try:
        # Pass 1: search results
        _, items_data = await scraper.fetch_auction_lots("public_surplus_search")
        stats["items_seen"] = len(items_data)
        logger.info(f"PS search returned {len(items_data)} items")

        new_item_ids = []

        for item_data in items_data:
            ext_id = item_data.get("external_id")
            if not ext_id:
                continue

            item = (
                db.query(Item)
                .filter(Item.external_id == ext_id, Item.auction_house_id == house.id)
                .first()
            )

            now = datetime.now(timezone.utc)

            if not item:
                item = Item(
                    auction_house_id=house.id,
                    external_id=ext_id,
                    title=item_data.get("title", ""),
                    current_bid=item_data.get("current_bid", 0.0),
                    end_time=item_data.get("end_time"),
                    status="open",
                    url=item_data.get("url", ""),
                    image_url=item_data.get("image_url", ""),
                    location_state=item_data.get("state", ""),
                    is_dutch_auction=item_data.get("is_dutch", False),
                    category=search_category,  # Pre-assign if filtering by category
                    first_seen_at=now,
                    last_seen_at=now,
                )
                db.add(item)
                db.flush()  # Get the id without committing
                stats["items_new"] += 1
                new_item_ids.append(ext_id)
            else:
                item.current_bid = item_data.get("current_bid", item.current_bid)
                item.end_time = item_data.get("end_time") or item.end_time
                item.last_seen_at = now
                if item_data.get("image_url"):
                    item.image_url = item_data["image_url"]
                stats["items_updated"] += 1

                # Also re-fetch detail if it's stale (never scraped)
                if item.detail_scraped_at is None:
                    new_item_ids.append(ext_id)

        db.commit()

        # Pass 2: detail pages for new / un-detailed items
        for ext_id in new_item_ids:
            try:
                # Rate-limit detail page requests
                await asyncio.sleep(random.uniform(1.5, 3.0))

                detail = await scraper.fetch_item_detail(ext_id)
                item = (
                    db.query(Item)
                    .filter(Item.external_id == ext_id, Item.auction_house_id == house.id)
                    .first()
                )
                if item and detail:
                    item.description = detail.get("description", item.description)
                    item.agency_name = detail.get("agency_name", item.agency_name)
                    item.bid_count = detail.get("bid_count", item.bid_count)
                    item.current_bid = detail.get("current_bid", item.current_bid)
                    item.pickup_address = detail.get("pickup_address")
                    item.pickup_city = detail.get("pickup_city")
                    item.pickup_zip = detail.get("pickup_zip")
                    item.pickup_name = detail.get("pickup_name")
                    item.location_state = detail.get("location_state", item.location_state)
                    item.may_extend = detail.get("may_extend", False)
                    item.detail_scraped_at = datetime.now(timezone.utc)

                    # Category: prefer detail page extraction, then classifier
                    if detail.get("category"):
                        item.category = detail["category"]
                    elif not item.category:
                        item.category = classify_item(
                            item.title, item.description or ""
                        )

                    stats["details_fetched"] += 1

            except Exception as e:
                logger.warning(f"Failed to fetch detail for PS item {ext_id}: {e}")
                stats["errors"] += 1

        db.commit()

    finally:
        await scraper.close()

    logger.info(f"PS ingestion complete: {stats}")
    return {"status": "success", "stats": stats}
