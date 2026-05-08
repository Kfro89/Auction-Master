# **Project Title: Auction Arbitrage & Profit Analysis Application**

## **1\. Executive Summary**

The goal of this project is to develop a single-user application designed to identify profitable arbitrage opportunities on niche auction websites. The application will crawl designated target auction platforms, extract active listing data, cross-reference these items with eBay's marketplace to estimate market value, and calculate estimated net profits based on simulated bid amounts and specific auction house buyer's premiums/fees.

Because some target auction sites lack public API documentation, the core data ingestion strategy will rely on reverse-engineering network requests (XHR/Fetch) from browser interactions where official APIs are not available.

### v1 Scope Decisions
- **Single-user, personal tool.** No multi-tenancy, auth, or sharing in v1.
- **Pilot site is Public Surplus** (documented API). Whitley and Roller follow only after the full ingest → match → valuate → display loop works end-to-end on PS.
- **Active-listing data only.** eBay's sold-listing data (Marketplace Insights API) is not available to us for the foreseeable future. The valuation methodology is built around active listings with explicit bias compensation — see §5A and the implementation plan for details.
- **Auto-bidding (sniper) is deferred** to a post-v1 phase behind a feature flag. v1 surfaces opportunities; bids are placed manually by the user.

## **2\. Core Objectives**

- **Data Ingestion (Target Site):** Successfully monitor and extract data from target auction sites using reverse-engineered API calls (bypassing the need for heavy, brittle HTML scraping where possible).
- **Data Points Required:** Item Title/Description, Current Bid, Time Remaining, Number of Bids, Item ID, and Auction House ID/Fee Structure.
- **Market Validation (eBay):** Programmatically query eBay to find identical or highly similar items to determine the average market value.
- **Financial Modeling:** Allow the user to input a "Max Bid" and calculate the estimated net profit by subtracting the Max Bid, Auction House Fees (buyer's premium, taxes), and eBay seller fees from the estimated eBay market value.

## **3\. Technical Constraints & Challenges**

- **Undocumented APIs:** The crawler will require capturing network requests, analyzing payloads, and replicating headers (e.g., Auth tokens, User-Agents, CSRF tokens) to interact with the target site's backend.
- **Anti-Scraping Measures:** The application must be designed to handle potential rate-limiting, IP blocking, and session invalidation.
- **Data Matching:** Accurately matching a potentially vaguely titled auction item to a specific eBay product catalog or search query.
- **Dynamic Fee Structures:** Different auction houses have varying buyer's premiums (e.g., 15% vs 18%), tiered fees, and varying tax implications.

## **4\. Required Workflow for the AI Planning Phase**

When the LLM generates a technical plan based on this document, it should provide specific guidance on:

1. **Tech Stack Selection:** (e.g., Python/Scrapy vs. Node.js/Playwright/Axios).
2. **Reverse Engineering Toolkit:** Methods for identifying and replicating the target API calls.
3. **Authentication Management:** How to handle session cookies and tokens for the target site.
4. **Database Schema:** Storing item data, historical API responses, and fee structures.
5. **eBay API Integration:** Best practices for utilizing the eBay Developer Program APIs (Finding API / Browse API).

## **5\. Recommended Features & Enhancements (For User Success)**

To make this application a true power-tool for flipping and arbitrage, the following features should be considered during development:

### **A. Active-Listing Valuation Methodology (Critical)**

- **Reality:** Sold-listing data via eBay's Marketplace Insights API is not available to us for the foreseeable future. v1 must derive defensible market value from active listings alone, knowing that active listings are systematically biased upward (overpriced listings accumulate while quick-selling listings disappear).
- **Required compensation strategy:**
  - **Sample size:** pull 100–200 results, require a minimum of 30 valid comparables after filtering before producing a valuation; otherwise mark "insufficient data" rather than guess.
  - **Hard filters:** matching `conditionId`, brand/MPN match where extractable, "Buy It Now" only (active auctions are noise), de-duplicate by seller+title to drop relistings.
  - **Outlier handling:** drop entries with z-score > 2 from the post-filter pool, then trim top/bottom 15%.
  - **Aggregate:** trimmed median is the headline; report IQR and sample age distribution alongside.
  - **Active-to-sold haircut:** apply a configurable `market_adjustment_factor` (default 0.75, per-category) since active medians clear at roughly 60–85% of asking price depending on category.
  - **Confidence score:** every valuation carries a confidence indicator (a function of sample size, IQR/median ratio, listing age, brand-match coverage). Surface this prominently — never let a low-confidence number drive a bid.
  - **Empirical calibration:** log auction close prices and realized flip prices to a `price_outcomes` table. Over time, regress estimated vs. realized to tune `market_adjustment_factor` per category. This calibration loop is what makes active-only data trustworthy.

### **B. Desired ROI "Bid Recommender"**

- **Recommendation:** Instead of just calculating profit based on a manual bid, allow the user to set a target Return on Investment (ROI) or minimum dollar profit (e.g., "I want at least 30% ROI"). The app works backward from the eBay sold price, deducts eBay fees, deducts auction house fees, and outputs the absolute **Maximum Bid** the user should place to hit their margin.

### **C. Automated Last-Second Bidding (Sniper) — Deferred to Post-v1**

- **Aspiration:** Place the calculated Max Bid 3–5 seconds before auction close via the reverse-engineered APIs, avoiding the price escalation and attention that early bidding causes.
- **Why deferred:** (1) Auto-bidding likely violates Whitley/Roller ToS and risks account bans; (2) the math behind Max Bid recommendations needs empirical validation against `price_outcomes` data before automating real money decisions; (3) v1 must prove the valuation loop is trustworthy before adding execution.
- **v1 substitute:** The hot-polling worker keeps the dashboard's current bid live during the closing minutes so the user can manually place a calculated Max Bid at the right moment.
- **Post-v1 gating criteria** (before sniper ships): at least 30 days of `price_outcomes` data validating valuation accuracy, per-site ToS review documented, explicit per-item user arming required, and a hard kill switch.

### **D. Condition Normalization**

- **Recommendation:** A $500 item "New in Box" might only be worth $100 "For Parts/Not Working". Implement basic NLP or Regex to parse the target auction's condition description and pass that exact condition filter to the eBay API search to ensure apples-to-apples price comparisons.

### **E. Shipping & Freight Cost Factoring**

- **Recommendation:** Heavy items (like industrial equipment or furniture) can completely erase profit margins due to freight costs. Include a field to estimate inbound shipping (from auction to user) and outbound shipping (from user to eBay buyer) in the profit calculation.

### **F. Watchlist Alerts**

- **Recommendation:** Allow the user to save searches. The crawler runs on a cron job, and if an item appears on the target auction site that historically sells well on eBay, it sends a push notification, SMS, or email alert immediately.

## **6\. Target Sites & Pilot Order**

Documentation for some sites may not be available and will need to be reverse engineered.

1. **Public Surplus (v1 pilot — official API)** — https://www.publicsurplus.com/ — API documentation: https://catalog.data.gov/dataset/auctions-api. Pilot the full ingest → match → valuate → display loop here before adding reverse-engineered sources.
2. **Whitley Auction (post-pilot, reverse engineered)** — https://www.whitleyauction.com/ → https://www.whitleyauction.com/api
3. **Roller Auction (post-pilot, reverse engineered)** — https://www.rollerauction.com → https://bid.rollerauction.com/api/
4. **eBay Developer Program (Browse API)** — https://developer.ebay.com/api-docs/ — used for active-listing comparables. Note: the legacy Finding API is deprecated; use Browse. Marketplace Insights (sold data) is unavailable to us for the foreseeable future.
