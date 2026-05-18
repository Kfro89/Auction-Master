# Design Spec: Auction Research vs Bids Refactor

**Date:** 2026-05-17
**Status:** Approved

## Background & Motivation
Currently, the application utilizes a single `Item` model and `items` table for both broad auction research (discovery) and focused live auction bidding. This coupling forces services to handle both broad collection and precise management of active bids, resulting in convoluted schemas, bloated data, and difficulty in managing distinct schedules and lifecycles. The goal is to decouple these domains into entirely separate systems.

## Scope & Impact
This refactor affects the core database schema, the backend service layer (discovery and sync services), the API routers (`/api/items`), and the frontend views (ResearchView, WatchListView, BiddingView). Data migration is required to retain only active user bids and discard legacy research data.

## Proposed Solution
The system will be split into two distinct and independent domains: **Research** and **Bidding**.

### 1. Database Schema Split
*   **`ResearchItem` (Table: `research_items`)**:
    *   Purpose: Broad record collection, discovery, and Watchlist management.
    *   Fields: Metadata (title, description, images), auction info, valuation/enrichment relationships, `is_watched`, `is_archived`.
    *   Pruning: Aggressively purged once `end_time` passes, *unless* `is_watched` is true.
*   **`BidItem` (Table: `bid_items`)**:
    *   Purpose: Focused management of items the user is actively bidding on.
    *   Fields: Fully independent copy of metadata (title, images, etc.), auction info, `current_bid_amount`, `user_bid_amount`, `user_proxy_bid`, `user_bid_status` (winning, outbid, won, lost), `is_hidden_from_active`.
    *   Independence: Populated solely by the Bidding Service scraping "My Bids" pages. No foreign key relation to `research_items`.

### 2. Service Separation
*   **`ResearchService`**: Discovers broad auction listings. Writes only to `research_items`. Manages the aggressive pruning of expired, non-watched items.
*   **`BiddingService`**: Independently discovers and synchronizes active user bids. Writes only to `bid_items`. Identifies when an item is won or lost. Both services share access to `EnrichmentService` and `ValuationService`.

### 3. Work Queue Handover & Lifecycle
*   **Active View**: The Bidding View only displays active bids and pending outcomes.
*   **Lost Items**: Items marked as "lost" can be flagged (`is_hidden_from_active`) to remove them from the active view while retaining the record.
*   **Manual "Claim"**: When a `BidItem` is confirmed "won", a "Move to Work Queue" action becomes available in the UI. Triggering this creates the `InventoryParentLot` and `InventoryItem` records, migrating the final financial data (hammer price) and metadata.

### 4. API & UI Refactor
*   Split the monolithic `/api/items` router into `/api/research` and `/api/bidding`.
*   Update frontend data fetching and types in `ResearchView`, `WatchListView`, and `BiddingView` to target the new endpoints.

## Alternatives Considered
*   *Maintaining a unified `items` table with strict typing/flags:* Rejected because it fails to separate the lifecycle, pruning rules, and scaling needs of the two distinct domains.

## Phased Implementation Plan

1.  **Phase 1: Schema & Data Migration**
    *   Create SQLAlchemy models for `ResearchItem` and `BidItem`.
    *   Generate Alembic migration to create new tables.
    *   Write a data migration script to copy items with `is_user_bidding == True` or a status indicating the item was "Won" into `bid_items`.
    *   Update shared schema relationships (e.g., Valuation, EbaySampleCache) to support linking to either Research or Bid items (via polymorphic associations or dual nullable foreign keys).
    *   Drop the old `items` table and `user_bid_activity` table (logic absorbed by `BidItem`).

2.  **Phase 2: Service Refactor**
    *   Refactor `discovery.py` into `ResearchService`, targeting `ResearchItem`. Implement aggressive pruning logic.
    *   Refactor `bid_sync.py` into `BiddingService`, targeting `BidItem`.
    *   Adapt `ValuationService` and `EnrichmentService` to process both entity types seamlessly.

3.  **Phase 3: API Routing & Work Queue Handover**
    *   Create `/api/research` routers for broad discovery and Watchlist endpoints.
    *   Create `/api/bidding` routers for active bids.
    *   Implement the "Claim" endpoint to transition a won `BidItem` into the Work Queue (`InventoryParentLot`/`InventoryItem`).
    *   Implement the "Hide" endpoint for lost bids.

4.  **Phase 4: Frontend Integration**
    *   Update `ResearchView` and `WatchListView` to use the `/api/research` endpoints.
    *   Update `BiddingView` to use the `/api/bidding` endpoints.
    *   Implement the "Move to Work Queue" button and flow for won items.
    *   Implement filtering for hidden/lost items in the active view.

## Verification
*   Run the backend test suite, ensuring `test_valuation.py` and other critical tests pass with the new schema.
*   Manually verify a discovery cycle populates only research items.
*   Manually verify a sync cycle populates bidding items independently.
*   Test the "Claim" workflow end-to-end to ensure inventory items are created accurately from a won bid.

## Migration & Rollback
*   **Migration**: The script will retain only active bids and currently "Won" items. All other research data will be permanently discarded.
*   **Rollback**: Standard database backup before applying Alembic migrations. Reverting involves restoring the DB snapshot and rolling back Git commits.