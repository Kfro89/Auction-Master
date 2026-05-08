# Design Spec: Phase 3 - Automatic Valuation Engine

**Date:** 2026-05-08  
**Topic:** Automatic eBay Valuation with LLM Keyword Extraction

## 1. Overview
The goal of this phase is to automate the valuation of auction items by comparing them to real-world market data from eBay. We will use a local LLM to clean noisy auction titles into precise search queries and an asynchronous background worker to process items based on their auction end time.

## 2. Architecture

### A. Background Worker (Orchestration)
- **Library:** `APScheduler` running within the FastAPI application.
- **Trigger:** Interval-based (every 60 seconds).
- **Priority:** Items ending soonest (`end_time ASC`) that have no existing `Valuation`.
- **Batching:** Process 5 items per cycle to respect API rate limits.

### B. LLM Keyword Extraction Service
- **Provider:** Local LM Studio instance (`localhost:1234/v1/`).
- **Input:** Raw auction lot title.
- **Output:** Clean product name + model number (e.g., "Grizzly G0602 Metal Lathe").
- **Fallback:** If LLM fails or extraction is empty, use the first 50 characters of the title.

### C. eBay Market Analysis
- **API:** eBay Browse API (`v1/item_summary/search`).
- **Auth:** Client Credentials grant using provided App ID and Cert ID.
- **Filtering:** 
    - Search only `FIXED_PRICE` listings.
    - Match `conditionIds` based on the item's mapping (or default to New/Used).
- **Statistics Engine:**
    - Z-Score Outlier Removal (threshold = 2.0).
    - 15% Trimmed Median.
    - Haircut/Market Adjustment: 0.75.
    - Max Bid Calculation: `(MarketValue / (1 + ROI)) - eBayFees - AuctionPremium`.

## 3. Data Flow
1. **Discovery:** Background task identifies 5 items ending soonest without valuations.
2. **Extraction:** Titles are sent to the local LLM to generate search queries.
3. **Search:** eBay Browse API fetches up to 100 comparable listings for each query.
4. **Analysis:** Prices are processed by the stats engine.
5. **Persistence:** `EbaySampleCache` and `Valuation` records are saved to the database.
6. **Visualization:** Frontend polls or refreshes to show updated values.

## 4. UI/UX Changes
- **Item List:** Add columns for "Est. Market Value" and "Recommended Max Bid."
- **Visual Cues:** Highlight items where `MaxBid > CurrentBid * 1.5` with a "High Profit" glow.
- **Loading State:** Display "Processing Market Data..." for items in the queue.

## 5. Success Criteria
- [ ] 100+ items successfully valuated without manual intervention.
- [ ] eBay authentication tokens are cached and refreshed only when expired.
- [ ] LLM extraction successfully removes noise (e.g., "Lot 444", "Estate Sale") from 90% of tested titles.
- [ ] Background task handles connection timeouts to LM Studio gracefully.
