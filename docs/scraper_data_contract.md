# Scraper Data Contract & Integration Guide

## Overview
To maintain the **Single Responsibility Principle (SRP)** and ensure a stable discovery pipeline, all auction scrapers must adhere to a strict data contract. Scrapers are responsible for fetching, parsing, and normalizing platform-specific data into standardized Pydantic models. 

Downstream services (Discovery, Bid Sync) must **never** handle platform-specific logic or raw dictionary keys.

## Standard Schemas
All scrapers must return instances of the following models defined in `backend/app/schemas/scraping.py`:

### ScrapedAuction
Used for discovering auction events or search results.
- `id`: (str) Unique external identifier for the auction/event.
- `name`: (str) Human-readable title of the auction.
- `start_time`: (Optional[datetime]) UTC start time.
- `end_time`: (Optional[datetime]) UTC end time.

### ScrapedLot
Used for individual items within an auction.
- `id`: (str) Unique external identifier for the lot.
- `lot_number`: (Optional[str]) The lot string (e.g., "101A").
- `title`: (str) Title of the item.
- `description`: (Optional[str]) Full description text.
- `url`: (Optional[str]) Direct link to the lot page.
- `image_url`: (Optional[str]) High-resolution primary image URL.
- `current_bid`: (float) The current high bid or starting price.
- `end_time`: (Optional[datetime]) UTC expiration time.

### ScrapedBid
Used for synchronizing user bidding activity.
- `id`: (str) External lot ID.
- `title`: (str) Item title.
- `status`: (str) Auction status (e.g., "open", "closed").
- `user_bid_status`: (str) User's state (e.g., "winning", "outbid").
- `current_bid`: (float) Current high bid.
- `user_bid`: (float) User's maximum active bid.
- `proxy_bid`: (float) User's hidden proxy/max bid.
- `end_time`: (Optional[datetime]) UTC expiration time.

---

## Requirements for New Auction Houses

When implementing a new scraper (e.g., `NewSiteScraper`), you MUST follow these rules:

### 1. Inherit from BaseScraper
Your class must inherit from `backend/app/scrapers/base.py:BaseScraper` and implement all abstract methods.

### 2. Internal Normalization
All data "massaging" must happen inside the scraper.
- **Dates**: Convert all timestamps/strings to UTC-aware `datetime` objects.
- **Images**: Resolve relative URLs to absolute URLs. Pick the highest resolution available.
- **Pricing**: Convert currency strings to `float`. Handle platform-specific fields (e.g., `starting_bid` vs `winning_bid`) internally to populate `current_bid`.

### 3. Strict Return Types
Methods must use type hints and return the standard models:
- `discover_active_auctions() -> List[ScrapedAuction]`
- `fetch_auction_lots() -> Tuple[ScrapedAuction, List[ScrapedLot]]`
- `fetch_my_bids() -> List[ScrapedBid]`

### 4. Downstream Integration
To surface the new scraper:
1. Add a handler in `backend/app/services/discovery.py`.
2. Register the platform in `backend/app/services/bid_sync.py:sync_active_bids`.
3. Use attribute access (e.g., `lot.title`) in services. **Do not use `.get()` on raw dicts.**

## Validation
Always add a test file in `backend/tests/` (e.g., `test_newsite_scraper.py`) and verify that it returns the correct Pydantic models with validated UTC dates.
