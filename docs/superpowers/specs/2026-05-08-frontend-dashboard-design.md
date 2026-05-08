# Design Spec: Auction Master Frontend Dashboard

**Date:** 2026-05-08
**Status:** Draft
**Topic:** Phase 4 - Frontend Dashboard Implementation

## 1. Purpose
The Auction Master Dashboard provides a high-density "Command Center" for monitoring auction items, highlighting profitable opportunities, and managing the valuation lifecycle. It transitions the project from a CLI/API-only tool to a functional visual interface.

## 2. Success Criteria
- **Priority Visibility:** Users can immediately identify high-ROI items.
- **Workflow Efficiency:** Dense data presentation allows scanning 50+ items without scrolling.
- **Data Integrity:** Real-time visibility into "Processing" vs "Valuated" vs "Uncertain" states.
- **Responsiveness:** Stable layout on desktop and mobile (though optimized for desktop "power use").

## 3. User Experience (UX)

### 3.1 Layout Strategy: "Workflow View"
The application uses a split-view layout:
- **Hero Highlights (Top Section):** A horizontal strip of cards featuring the top 5-10 items with the highest projected ROI. Focuses on visual impact and immediate action.
- **Command Grid (Bottom Section):** A dense, spreadsheet-like table of all ingested items, sorted by **Ending Soonest**.

### 3.2 Visual Language
- **Aesthetic:** Dark-themed, premium tactile feel.
- **Background:** Subtle noise texture.
- **Shadows:** Multi-layered drop shadows on cards.
- **ROI Badges:** 
    - **High Profit (>25%):** Vibrant green with a glow effect.
    - **Moderate (10-25%):** Soft green/teal.
    - **Low/Negative:** Neutral/Grey.
- **Status Indicators:**
    - **Processing:** Pulsing amber/yellow.
    - **Uncertain:** Grey with an info icon (indicates insufficient eBay data).

## 4. Functional Requirements

### 4.1 Priority Feed
- Default sort: **Ending Soonest**.
- Secondary sort (optional): **ROI %**.
- Displays items in all states (Valuated, Processing, Uncertain).

### 4.2 High-Density Grid Columns
| Column | Description |
| :--- | :--- |
| **Img** | Small thumbnail (40x40). |
| **Title** | Truncated item title. |
| **Lot #** | Auctioneer lot number. |
| **House** | Auction house name (Whitley/Roller). |
| **Current Bid** | The latest bid from the scraper. |
| **Market Value** | Est. Market Value from valuation engine. |
| **Max Bid** | Recommended max bid for target ROI. |
| **ROI %** | Computed profitability percentage. |
| **Timer** | Real-time countdown to auction end. |

### 4.3 Manual Controls
- **Re-valuate:** Button/Action for "Uncertain" items to trigger a manual keyword override.
- **Scrape Now:** Header buttons to trigger Whitley or Roller ingestion cycles.
- **Refresh:** Manual global data refresh.

## 5. Technical Architecture

### 5.1 Frontend Stack
- **Framework:** React 18+ (TypeScript).
- **Styling:** Vanilla CSS (no Tailwind as per core mandates, unless requested - user has not requested).
- **API Client:** Standard `fetch` or `httpx`-equivalent.

### 5.2 Data Flow
1. **Initial Load:** Fetches `GET /api/items/` (which includes joined valuations).
2. **Polling:** The client polls every 60 seconds for updates to status and bids.
3. **Optimistic Updates:** Triggering a "Valuate" action updates the local item state to "Processing" immediately.

### 5.3 State Management
- **Local State:** `useState` / `useMemo` for the grid data.
- **Sorting/Filtering:** Handled client-side for performance on the 100-item limit.

## 6. Error Handling
- **API Failures:** Toast notifications or a header status indicator if the backend is unreachable.
- **Missing Images:** Standardized placeholder icon.
- **Valuation Errors:** Tooltip explanation for "Uncertain" status (e.g., "Insufficient eBay Comparables").

## 7. Security & Privacy
- Localhost only (single user).
- No sensitive keys exposed to the frontend.

## 8. Implementation Phases (Sub-tasks)
1. **Scaffolding:** Setup basic layout and global CSS variables (colors, shadows, noise).
2. **Data Integration:** Fetch and display real data in the dense grid.
3. **Valuation UI:** Implement status badges and "High ROI" highlights.
4. **Action Layer:** Add trigger buttons for scraping and manual valuation.
