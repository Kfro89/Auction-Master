# Auction Arbitrage Project: Progress Report & Handoff

This document summarizes the current state of the Auction Arbitrage project, capturing the architectural decisions, codebase structure, and technical context to facilitate a smooth transition to a new development environment.

## Current State

The application is **live and accessible online**. A reverse proxy is already configured, handling HTTPS and routing.

We have successfully completed **Phase 0 (Research)**, **Phase 1 (Scaffolding)**, **Phase 2 (Data Ingestion)**, **Phase 3 (Valuation Engine)**, **Phase 4 (ERP Dashboard)**, **Phase 5 (Inventory & Work Queue)**, and **Phase 6 (Store Analytics)**. This completes the entire Phase 4-6 ERP suite development cycle.

### 1. Architecture & Environment Scaffold
- **Infrastructure:** Fully operational Docker environment.
- **Glass Shell:** Multi-tab application shell with collapsible glassmorphism navigation.

### 2. Scraping Engine (Phase 2)
- **Bid Tracking:** Automatically detects user bidding status by matching Bidder IDs in the Apollo state during ingestion.

### 3. Valuation Engine (Phase 3)
- **Statistical Analysis:** ROI calculation with outlier removal and market haircuts.
- **LLM Pre-processing:** Clean query extraction using Gemma.

### 4. ERP Dashboard (Phase 4)
- **Research View:** High-ROI highlights and dense priority grid.
- **Bidding View:** Focuses on active bids and items ending today.
- **Settings View:** Credentials and Bidder ID management.

### 5. Inventory & Work Queue (Phase 5)
- **Work Queue View:** A specialized staging area for new inventory.
- **Barcode Scanning:** Support for UPC/EAN input with automatic eBay price/title lookup fallback.
- **AI Listing Drafts:** Integrated LLM service (`backend/app/services/drafting.py`) to generate SEO-optimized eBay titles and descriptions.
- **Staging Workflow:** Multi-step process from scan to drafting and manual review.
- **Persistence:** New `InventoryItem` model to track staged items.

### 6. Store Analytics (Phase 6)
- **eBay Integration:** Real-time sync of active listings and sales KPIs.
- **Traffic Metrics:** Insights into impressions, views, and watchers.
- **Store Dashboard:** High-level analytics (30/60/90/YTD sales) and split pane for shipment/history.

### 7. Polish & Production Readiness (Phase 7)
- **Automated Sweeps:** Configured APScheduler to run background scraping and valuation sweeps continuously.
- **Authentication:** Implemented a robust JWT-based backend authentication layer.
- **Frontend Security:** App Shell is secured via a glassmorphism login interceptor, protecting internal logic from unauthorized access.

---

## Major Changes & Course Corrections (Evolution to ERP)
Over the course of Phases 4-7, the project underwent a significant evolution in scope and architecture:
1. **Scope Expansion (CLI to ERP):** Initially conceived as a backend-heavy scraping tool with a basic dashboard, the project was vastly expanded into a full "Auction Master ERP Suite" to handle the entire business lifecycle: Discovery, Bidding, Staging, and Sales.
2. **UI Architecture (Glass Shell):** Adopted a modern, premium "Glass Master" aesthetic featuring a collapsible left navigation pane with `backdrop-filter` blurs, dark-mode themes, and tactile noise backgrounds.
3. **Hybrid Staging Workflow:** Introduced the "Work Queue" to bridge the physical and digital gap, allowing mobile-friendly barcode scanning (UPC/EAN) to trigger fallback eBay lookups when local research data is missing.
4. **AI-Driven Listing Generation:** Integrated local LLM capabilities not just for title cleaning (Phase 3) but also for generating complete SEO-optimized eBay drafts (titles and descriptions) in the Work Queue (Phase 5).
5. **eBay API Broadening:** Expanded from just the Browse API (for valuation) to include structural implementations for Store/Analytics and Trading API integration to support full seller dashboards.

## Recent Refinements & Bug Fixes
Following the completion of the core phases, several critical stability and accuracy improvements were made:
- **Frontend Authentication Interceptor:** Fixed an issue where the frontend crashed due to unhandled 401 errors. A global fetch interceptor now securely attaches the JWT token to all `/api/` requests and safely redirects to the login view on session expiration.
- **Accurate Bid Extraction:** Discovered that Apollo GraphQL state hides active bids in various fields depending on auction state (`winning_bid_amount`, `starting_bid`, `price`, `required_bid`). The scraper was overhauled to aggressively check these fields to extract the true current bid instead of defaulting to $0.
- **Auction Timing Fix:** Resolved a critical issue where all items displayed "Ending Now" due to incorrect date field keys in the ingestion service. Switched to `end_time` (with `endDate`/`end_date` fallbacks) and migrated the database to `TIMESTAMPTZ` to ensure timezone-aware UTC consistency across the stack.
- **Full Auction Ingestion (Pagination):** Upgraded the `AuctioneerSoftwareScraper` to handle multi-page auctions. It now detects total lot counts and automatically iterates through all pages (using `?page=N`), ensuring that large auctions are ingested in their entirety rather than being limited to the first 50 items.
- **Image Ingestion:** Corrected the ingestion service to accurately extract and persist high-quality thumbnail images (`primary_image.url`, `small`, `thumb`) from the auctioneer software platforms.
- **Dynamic ROI & Mathematical Accuracy:** Overhauled the frontend ROI calculation to accurately project profit margins based on true Cost (Current Bid) vs Estimated Market Value, rather than the target max bid. Added divide-by-zero protection for items with no starting bids.
- **Public Surplus Active Bids Fix (Refactored):** Resolved an issue where items outside the search radius were failing to appear in the Bidding View. The system now automatically detects these "hidden" interests and performs a deep-scrape of the direct listing page to ingest full titles, descriptions, and high-resolution images.
- **Service-Oriented Ingestion Pipeline:** Refactored the monolithic `ingestion.py` into a decoupled architecture of discrete services:
    - **Discovery Engine (`discovery.py`):** Purely responsible for item record creation across all platforms.
    - **Active Bid Sync (`bid_sync.py`):** The definitive source of truth for user bidding activity and `UserBidActivity` records.
    - **AI Enrichment Service (`enrichment.py`):** Decoupled LLM categorization and tagging logic.
    - **eBay Valuation Service (`ebay_valuation.py`):** Specialized service for market comp analysis and ROI calculation.
- **Configurable Target ROI:** Upgraded the Research View with a dynamic user-configurable Target ROI setting, passing the variable directly to the valuation engine backend to recalculate max bids on the fly.
- **Valuation Reliability & Feedback:** Enhanced the LLM valuation process to classify items and automatically generate cascading fallback eBay search queries when specific queries return insufficient data. Updated the frontend to provide immediate visibility into valuation errors and provide spinning progress indicators.
- **Whitley Auction Title Wrapping:** Fixed an issue in the Bidding View table where long item titles would overlap other columns. Replaced truncation with `whitespace-normal break-words` to ensure titles wrap correctly within their cells.
- **Accurate 'Winning' Status Tracking (Phase 17):** Resolved a critical issue where ended Whitley auctions remained stuck as "Winning" in the UI even after being lost. 
    - **Scraper Fix:** Updated the Whitley and Roller scrapers to stop skipping recently ended items when fetching active bids, allowing the system to capture the final "won" or "lost" status immediately.
    - **Sync Cleanup Fix:** Enhanced the `bid_sync.py` service to automatically reset the user bid status to "lost" for any orphaned items that disappear from the active list after their end time, preventing lingering "winning" pills for unverified outcomes.


### 12. GovDeals Active Bids Integration (Phase 12)
- **Modernized Bid Tracking:** Successfully reverse-engineered and implemented the private Liquidality Maestro JSON API (`/buyerbids/open`) for GovDeals. Resolved persistent 401/403 errors by synchronizing complex browser headers (`ocp-apim-subscription-key`, `x-api-key`, `x-page-unique-id`, etc.) and matching the Chromium v148 fingerprint. The system now accurately tracks winning and outbid items with high fidelity.
- **Improved Authentication Resilience:** Implemented a multi-tier authentication strategy including automatic JWT extraction, expiration checking, and a robust HTML scraping fallback to ensure bid data is always available even if the private API becomes restrictive.
- **Enhanced Diagnostics:** Created individual, standalone login test scripts for all 5 supported auction houses (Whitley, Roller, Public Surplus, Dickensheet, GovDeals) to ensure single-responsibility design and ease of maintenance.
- **Buyer ID Support:** Updated the system to support GovDeals-specific "Buyer IDs" (e.g., 3908433), which are now configurable via the Settings dashboard.
- **Robust Bid Syncing:** Enhanced the `bid_sync.py` service to dynamically handle per-platform authentication requirements, including passing the correct Buyer ID to the GovDeals scraper.
- **Improved Scraper Stability:** Resolved several pre-existing architectural issues in the scraper suite, including initialization type errors for BidWrangler-based sites and schema mismatches in discovery services.
- **Comprehensive Validation:** Added a robust unit testing suite for the new JSON bid mapping logic, achieving 100% coverage for success and edge-case (null bid) scenarios.

### 13. Valuation Engine Refinements (Phase 13)
- **Strict Condition Matching (REQ-3.2):** Overhauled the eBay search logic in both `valuation.py` and `ebay_valuation.py` to enforce strict condition matching. The system now strictly uses the `normalized_condition_id` extracted by the LLM, preventing "Used" auction items from being valued against "New" eBay listings.
- **Automated Price Aggregation (REQ-3.3):** Refactored the valuation math into an SRP-compliant `calculate_valuation` function that automatically computes Average Asking Price, Median Asking Price, and Price Range from sample listings. This data is now consistently persisted in the `ValuationDetail` table for both on-demand and background batch runs.

### 14. Analytics & Risk Mitigation (Phase 14)
- **Total Maximum Exposure (REQ-4.1):** Implemented a real-time KPI widget that aggregates the SUM of all active highest proxy bids, providing the user with an immediate view of their total financial liability across all platforms.
- **Color-Coded Status Indicators (REQ-4.2):** Implemented a robust visual status system in the Bidding View table. Rows are now dynamically highlighted based on bid health (Winning, Outbid, Near, etc.), allowing for rapid assessment of the active portfolio.
- **Total Landed Cost Calculation (REQ-3.4):** Implemented automated landed cost calculation in the Bidding View, factoring in Current Bid, Estimated Shipping, and the 15% Auction House Buyer's Premium.
- **Margin/Profit Calculator (REQ-6.1):** Integrated a dynamic margin calculator into the Item Detail Modal, allowing users to adjust target ROI and immediately see the resulting Maximum Recommended Bid.
- **Market Saturation Indicator (REQ-6.2):** Added a visual "Supply Level" indicator to the Item Detail Modal. This dynamic badge provides instant feedback on market density (Scarcity vs Saturation) based on the total volume of active eBay listings analyzed during the valuation process.

### 15. GovDeals & Bid Sync Stability Fixes (Phase 15)
- **Accurate Bid Status Synchronization:** Resolved a critical issue in `bid_sync.py` where outbid items were prematurely marked as "lost". The service now strictly verifies that an item's `end_time` has elapsed before marking it as closed, ensuring active outbid auctions remain visible and trackable in the Bidding View.
- **Location-Aware GovDeals Search:** Restored functionality to the GovDeals location filters. The scraper now correctly passes `zipcode` and `proximityWithinDistance` to the private Maestro API, ensuring the Auction Research view only surfaces items within the user's defined radius.
- **GovDeals CDN Image Integration:** Fixed broken images for GovDeals listings by implementing absolute URL construction. The system now correctly prepends the `webassets.lqdt1.com` CDN prefix and dynamically maps the `accountId` folder structure required for asset thumbnails.
- **Regression Testing:** Verified all scraper and synchronization logic with an updated unit testing suite, confirming correct API payload structures and image URL mapping.

### 16. Scraper Architecture & Whitley Active Bids (Phase 16)
- **Scraper Decoupling:** Successfully split the multi-tenant `AuctioneerSoftwareScraper` into a modular architecture. Created `AuctioneerSoftwareBaseScraper` for shared Apollo parsing logic, with specialized `RollerAuctionScraper` and `WhitleyAuctionScraper` subclasses to handle platform-specific bidding interfaces.
- **Whitley Active Bids Integration:** Resolved a critical deficiency where Whitley active bids were failing to appear. Transitioned the Whitley scraper to use the `/account/watchlist` endpoint and implemented parsing of `window.REDUX_DATA` to definitively identify the logged-in user ID, ensuring 100% accurate "Winning" vs "Outbid" status mapping.
- **Improved Data Fidelity:** Enhanced the Whitley parser to cross-reference `winning_bidder.user_id` against the Redux auth state and accurately extract proxy bids from the `my_max_proxy` Apollo fields.
- **Comprehensive Refactoring:** Updated all backend services (`discovery.py`, `bid_sync.py`, `win_verification.py`) and routers (`admin.py`, `items.py`) to utilize the new decoupled scraper classes, improving maintainability and SRP compliance.
- **Updated Test Suite:** Synchronized the test suite and experimental scripts to match the new class structure, ensuring continuous verification capability for both Roller and Whitley platforms.

---

## Next Steps

### Deployment & CI
- **Continuous Integration (CI):** Implement a CI/CD pipeline to automate testing and deployment for future updates.


### 8. Frosted Alabaster UI Rework (Phase 8)
- Completely overhauled the UI from dark/textured to a light-mode "Frosted Alabaster" aesthetic.
- Implemented dynamic KPI filtering (Today, Tomorrow, This Week) in the Research View.
- Replaced all emojis with professional `lucide-react` icons.
- Added sortable column headers to tables via a new `useSortableData` custom hook.
- Created reusable `Modal` and `Tooltip` components to enhance interactivity (Image Lightboxes and Iframe previews).

### 9. SaaS Command Center UI Rework (Phase 9)
- Transitioned the frontend to an "Ultra-Minimalist SaaS Command Center".
- Relies heavily on a central Command Palette for navigation and actions.
- Introduced edge-to-edge content areas, maximizing whitespace and clarity.
- Utilizes the Inter font and a single Emerald accent color.

### 10. Watch List Integration (Phase 10)
- Implemented a Watch List feature to track items across auctions.
- Added `is_watched` backend tracking and dedicated `WatchListView` in frontend.
- Added APScheduler automated cleanup to prune items older than 14 days.

### 11. Vehicle Valuation & Secure Settings (Phase 11)
- **GovDeals Scraper Overhaul:** Fixed a critical issue where no items were being returned from GovDeals. The scraper was transitioned from a brittle HTML/Angular shell scraping approach to an efficient POST-based integration with the internal `maestro.lqdt1.com` JSON API, ensuring high-fidelity data extraction for SPA-based listings.
- **Valuation Table (REQ-3.1):** Implemented a detailed valuation table within a modal that appears when an item is clicked, providing market context and comparable listings.
- **High-Precision Vehicle Valuation:** 
    - Overhauled vehicle pricing logic with reduced sample size (5 items) and aggressive outlier trimming (20%).
    - Expanded eBay search to include both `FIXED_PRICE` and `AUCTION` listings for vehicles.
    - Integrated **MarketCheck API** for on-demand, high-accuracy VIN-based market stats.
    - Added automated negative keyword filtering (`-parts -salvage`, etc.) to clean search results.
- **Secure Settings Management:**
    - Implemented a robust "Settings" dashboard in the frontend for managing API keys (eBay, MarketCheck) and bidder credentials.
    - Added **Application-Layer Encryption** (Fernet) for all sensitive database records.
    - Updated backend to automatically recognize and encrypt keys ending in `_secret`, `_api_key`, or `_password`.
    - Integrated helpful descriptions and direct developer links for all required API keys to improve user onboarding.
