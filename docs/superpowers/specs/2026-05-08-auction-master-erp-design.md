# Design Spec: Auction Master ERP Suite

**Date:** 2026-05-08
**Status:** Draft
**Topic:** Phase 4 - Frontend ERP Dashboard & Multi-Tab Architecture

## 1. Purpose
The Auction Master ERP Suite is a comprehensive business management platform for auction arbitrage. It manages the entire lifecycle of an item: from discovery (Research) and acquisition (Bidding) to preparation (Work Queue) and final sale (Store).

## 2. Success Criteria
- **Multi-State Management:** Seamlessly track items across four distinct business states.
- **Data Density:** Maintain "Power User" high-density grids while adding rich KPI visualizations.
- **Hybrid Workflow:** Support mobile-friendly staging and desktop-heavy listing refinement.
- **Glassmorphism UI:** Implement a premium, modern "Glass" navigation system.

## 3. User Experience (UX)

### 3.1 App Shell: "Glass" Navigation
- **Left Pane:** Collapsible navigation with icons. When expanded, it uses `backdrop-filter: blur(16px)` and partial transparency to overlay the underlying UI.
- **Navigation Tabs:**
    1.  **Research:** The primary discovery engine (Current Phase 4 work).
    2.  **Bidding:** Active auction management (items bid on, ending soon).
    3.  **Work Queue:** Inventory staging and prep (scanning, photos, AI drafting).
    4.  **Store:** eBay business dashboard and active listing performance.
    5.  **Settings:** API credentials and auth management.

### 3.2 View Architectures
- **Research:** Split-view with "High ROI" hero cards on top and a dense "Ending Soonest" grid below.
- **Store:** Dashboard layout with top-row KPI cards, middle-row split pane (Sold/Pending), and bottom-row traffic table.
- **Work Queue:** A specialized staging UI supporting barcode input and multi-step listing progress (Scan -> Photo -> Draft -> Review).

### 3.3 Visual Style
- **Theme:** Dark mode, deep shadows, "Tactile" noise background.
- **Glass Effect:** High-blur overlays for navigation and modals.
- **Color Coding:**
    - Green: Profitable/Active.
    - Amber: Processing/Pending.
    - Grey: Uncertain/Draft.

## 4. Functional Requirements

### 4.1 Research & Bidding
- **Automatic Bid Tracking:** Backend logic to detect user bids in auctioneer software data.
- **ROI Tracking:** Real-time updates to profitability based on latest bids and eBay market data.

### 4.2 Work Queue (The "Staging" Workflow)
- **Scanning:** Input for barcode (EAN/UPC).
- **On-Demand Search:** If item data is missing, trigger an immediate eBay Browse API search.
- **AI Drafting:** Use local LLM to generate:
    - SEO-optimized Titles.
    - Product Descriptions.
    - Taxonomy/Category suggestions.
- **Staging:** Support for photo uploads and manual metadata editing.

### 4.3 Store (eBay Dashboard)
- **KPIs:** Inventory Value, Sales (30/60/90/YTD/Total), Total Listings.
- **Traffic Metrics:** Impressions, Views, Cart Additions, Wishlist Count.
- **Fulfillment:** Lists for "Pending Shipment" and "Recently Sold."

### 4.4 Settings & Auth
- Fields for `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`.
- OAuth flow trigger for eBay Store access.
- LLM configuration (Base URL, Model name).

## 5. Technical Architecture

### 5.1 Frontend Architecture
- **State Management:** Context API or simple state lifting for global auction data.
- **Routing:** React-based tab routing (stateless or persisted in URL).
- **Styling:** Vanilla CSS with CSS Variables for theme consistency.

### 5.2 Backend Extensions (Future)
- **Store Service:** Integration with eBay Trading API and Analytics API.
- **Staging Service:** Endpoints for barcode lookup and image storage.

## 6. Implementation Phases (Revised)
1.  **Phase 4.1: The Glass Shell:** Build the layout, navigation, and CSS theme.
2.  **Phase 4.2: Research Tab:** Implement the ROI highlights and priority grid (connecting existing backend).
3.  **Phase 4.3: Bidding & Settings:** Implement the active bid view and credential management.
4.  **Phase 5+: Store & Work Queue:** Build the inventory management and AI drafting modules.
