# Implementation Plan: Auction Arbitrage & Profit Analysis Application

This plan outlines the steps to build a Dockerized, single-user web application that identifies profitable arbitrage opportunities between niche auction sites and eBay.

## 1. Objective
Build a personal tool to:
- Ingest items ending within 7 days from Public Surplus (pilot), then Whitley and Roller Auction.
- Match items to eBay **active listings** and derive a defensible market value despite the inherent biases of active-only data.
- Calculate ROI, recommend a Max Bid given a target ROI, and surface high-confidence opportunities.
- Provide a browser-based dashboard for tracking and real-time monitoring of targeted auctions, plus alerts when new high-ROI items appear.

### Operating constraints (decided)
- **Single user.** No auth/multi-tenancy in v1.
- **eBay sold-listing data is unavailable.** v1 uses active listings only; valuation methodology must compensate explicitly. Re-evaluate when Marketplace Insights becomes available.
- **Sniper / auto-bidding is deferred.** v1 surfaces opportunities; user bids manually. Auto-bid behind a feature flag in a later phase, after empirical ROI tracking validates the math.
- **Pilot site is Public Surplus** (documented API). Whitley and Roller follow only after the full loop works end-to-end on PS.

## 2. Key Components & Context
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, APScheduler (daily sweeps), asyncio worker (hot polling), HTTPX, Playwright (only where reverse-engineered HTTP fails), RapidFuzz (fuzzy matching residuals).
- **Frontend:** React (Vite/TypeScript), Tailwind CSS.
- **Database:** PostgreSQL 16.
- **Deployment:** Docker Compose (local server). Persistent Postgres volume; `.env` for secrets.
- **Observability:** Structured JSON logs + a daily summary email of scrape/match/valuation health.

## 3. Implementation Steps

### Phase 0: API Discovery & Research (Mandatory; blocks Phase 1)
*Goal: Map all data structures, auth flows, fee structures, and rate limits before any schema or code is written. Phase 1 cannot start until `docs/api_manifest.md` is complete.*

1. **Documentation Review (parallel):**
   - **Sub-agent A (eBay Browse API):** OAuth client-credentials flow, default rate limits (5,000 calls/day), available filters (`conditionIds`, `buyingOptions=FIXED_PRICE`, sort orders), response fields including `itemCreationDate`, `watchCount`/`itemViewCount` if exposed, `categoryId`, MPN/brand fields. Document keyset pagination and the largest practical page size.
   - **Sub-agent B (Public Surplus API):** Auth model, item discovery endpoints, fields available (title, description, condition, current bid, end time, fee structure metadata if any), pagination, rate limits, terms of use.
2. **Reverse Engineering (sequential, after Phase 1 pilot proves the loop):**
   - **Sub-agent C (Whitley):** Map `whitleyauction.com/api`. Identify discovery (ending-soon) and detail endpoints; capture auth tokens, CSRF, cookies, required headers; observe rate limits empirically.
   - **Sub-agent D (Roller Auction):** Map `bid.rollerauction.com/api`. Same scope as Whitley.
3. **Fee structure capture:** For each auction house, record buyer's premium tiers, payment processing fees, sales tax behavior, and any minimum fees. These go into `fee_structures` as static seed data with a `last_verified_at` timestamp.
4. **Synthesis:** Consolidate into `docs/api_manifest.md` covering schemas, auth flows, fee structures, rate-limit observations, and known anti-bot signals.

### Phase 1: Project Scaffolding
1. **Directory Structure:** `backend/`, `frontend/`, `docker-compose.yml`, `docs/`.
2. **Database Schema (Sub-agent E):** First-pass tables — adjust as Phase 0 findings dictate.
   - `auction_houses` — id, name, url, fee structure ref, default tax rate, ToS notes.
   - `fee_structures` — tiered buyer's premium, payment fees, last_verified_at.
   - `items` — auction_house_id, external_id, title, raw_description, parsed condition, normalized_condition_id (eBay enum), brand, mpn, current_bid, end_time, url, first_seen_at, last_seen_at, status.
   - `condition_map` — auction_house_id, raw_pattern → eBay `conditionId` (1000/1500/2000/2500/3000/4000/5000/6000/7000).
   - `ebay_sample_cache` — item_id, query_signature, sample_size, trimmed_median, iqr, mean, age_distribution, confidence_score, fetched_at, ttl.
   - `valuations` — item_id, sample_cache_id, est_market_value, market_adjustment_factor_applied, max_bid_for_target_roi, computed_at.
   - `watchlist` — item_id, target_roi_pct, max_bid_override, notes.
   - `alerts` — item_id, rule_id, channel, sent_at, payload.
   - `alert_rules` — saved searches/criteria (category, keyword, min ROI, max bid).
   - `bids` — item_id, planned_max_bid, actual_bid, placed_at, outcome (won/lost/passed), realized_proceeds, notes.
   - `price_outcomes` — item_id, valuation snapshot, auction close price, eventual flip price (if known). Used to empirically tune `market_adjustment_factor`.
   - `scrape_runs` — site, started_at, finished_at, items_seen, items_new, items_updated, errors, status.
3. **Docker Setup:** FastAPI, React, Postgres containers. Persistent named volume for Postgres. Healthchecks. Internal network plus exposed dashboard port. Confirm `docker compose down` does not destroy the volume.

### Phase 2: Data Ingestion (Pilot: Public Surplus first)
*Pilot Public Surplus end-to-end through Phase 5 before adding more sources.*
1. **Base Scraper Interface:** Abstract class with `discover_ending_within(days)`, `fetch_detail(item)`, `health_check()`. Returns a normalized `Item` DTO.
2. **Public Surplus client (Sub-agent F):** Official API integration. Daily discovery sweep for items ending within 7 days. Stores into `items`, updates `last_seen_at`.
3. **Whitley + Roller clients (Sub-agent G, after pilot):** Reverse-engineered HTTP clients. Persistent session per site, header replay, jittered polling, exponential backoff on 4xx/5xx, alert on session/auth failures.
4. **Anti-bot posture:** Per-site request budget; fail closed (skip rather than retry hard) on 429/403; rotate User-Agents minimally; no proxies in v1 unless empirically required.
5. **Scheduler:** APScheduler runs daily discovery; hot-polling worker (Phase 4) is separate.

### Phase 3: eBay Analysis Engine
1. **eBay Browse client:** OAuth client-credentials, token refresh, retry/backoff. Configurable per-call sample size; default 100 results paginated.
2. **Query construction & condition mapping:**
   - Parse auction title/description into `{brand, model, mpn, normalized_condition_id, residual_keywords}`.
   - Build Browse query with explicit `conditionIds`, `buyingOptions=FIXED_PRICE`, brand/MPN filters where available, residuals as keyword query.
   - **Hard gate:** if brand/MPN cannot be extracted with confidence, mark item "low-confidence match" rather than fall through to bare keyword search.
3. **Matching pipeline (after eBay returns candidates):**
   - Filter to matching `conditionId`.
   - Require brand match where extracted.
   - RapidFuzz score ≥ threshold on normalized residual tokens.
   - De-duplicate by (sellerId, normalized_title) to drop relistings.
4. **Valuation Service (active-only methodology):**
   - **Minimum sample size:** require ≥ 30 valid comparables post-filter; otherwise return `valuation_confidence='insufficient'` and skip ROI calc.
   - **Outlier removal:** drop entries with z-score > 2 from the post-filter pool; trim top/bottom 15% of what remains.
   - **Aggregate:** trimmed median is the headline; also report IQR and sample age distribution.
   - **Active-to-sold haircut:** apply `market_adjustment_factor` (default 0.75, configurable per category, tunable from `price_outcomes` over time).
   - **Confidence score:** function of (sample_size, IQR/median ratio, median listing age, brand-match coverage). Surface this prominently in the UI.
   - Cache the sample for the item's `query_signature` with a 12–24h TTL to preserve quota.
5. **Profit / Bid Recommender:**
   - Forward: given Max Bid → est_proceeds − eBay fees − auction premium − tax − inbound shipping − outbound shipping = est_net_profit, ROI%.
   - Inverse (the headline feature per Goal 5B): given target ROI → solve for Max Bid by working backward. Surface as the primary dashboard number.
   - Shipping inputs: per-item override, with a default per auction house (e.g., PS items often heavy/freight) and per-eBay-category outbound default.

### Phase 4: Backend API & Real-time Logic
1. **CRUD endpoints:** items, watchlist, alert rules, valuations, settings (target ROI default, market adjustment factors per category, fee overrides).
2. **Hot polling worker:** asyncio task pool. For items ending in < 30 min, refresh current bid every 30–60s. For items ending in < 5 min, refresh every 10–15s with jitter. Reuses persistent session from the scraper layer. Backs off immediately on any 4xx/5xx.
3. **On-demand refresh endpoint:** when the user opens an item, trigger immediate refresh (rate-limited per item).
4. **Alerts:** evaluate `alert_rules` against newly-discovered items each sweep; deliver via email (Resend or SES) for v1. SMS/push deferred.

### Phase 5: Frontend Development (Sub-agent H)
1. **Main Dashboard:** ROI-sorted table; columns include est. market value, recommended Max Bid, **confidence score**, sample size, time remaining. Filter by confidence threshold.
2. **Item Detail View:** matched eBay listings table, fee + shipping breakdown, sample-distribution chart (price histogram, age distribution), valuation history if multiple snapshots exist.
3. **Watchlist Page:** real-time current bid via polling, planned Max Bid, "should I bid now?" indicator.
4. **Alerts Page:** rule editor (keyword, category, min ROI, max bid) + history of alerts fired.
5. **Settings:** API keys, target ROI default, market adjustment factors per category, condition-map editor, fee-structure overrides.
6. **Outcome logging UI:** quick form to log auction close price and (later) realized flip price — feeds `price_outcomes` for tuning.

### Phase 6: Deployment & Verification
1. **Environment Config:** `.env` for eBay OAuth, Resend/SES key, Postgres credentials. Never committed.
2. **Networking:** Cross-container DNS works; dashboard reachable on local network.
3. **Persistence:** Verify Postgres data survives `docker compose down && up`.
4. **Observability:**
   - Structured JSON logs with request IDs across services.
   - Daily summary email: scrape success/failure per site, match precision sample, alerts fired, items discovered, valuations computed, exceptions.
   - On-call signal: send email on consecutive scrape failures or eBay auth expiry.

### Phase 7 (deferred): Sniper / Auto-bidding
Behind a feature flag. Requires (a) at least 30 days of `price_outcomes` data validating the model, (b) per-site ToS review documented, (c) explicit per-item arming by the user. Not in v1 scope — listed here only so the schema/UI hooks are designed with this future in mind.

## 4. Verification & Testing
- **Unit tests:** condition parser, query builder, matching pipeline, sample filtering, trimmed-median + haircut math, forward ROI, inverse Max Bid.
- **Recorded fixtures (VCR-style):** snapshot live API responses per source so tests don't depend on live sites or burn quota.
- **Integration tests:** API connectivity smoke checks for each external source; run nightly.
- **Matching precision harness:** maintain a small labeled set (20–50 auction items with hand-curated eBay matches). Track precision/recall on every change to matching code; fail CI if precision drops.
- **Manual verification:** spot-check valuations against manual eBay searches on randomly sampled items each week during early operation.
- **Outcome backtest:** once `price_outcomes` has data, regress estimated vs. realized proceeds; surface the calibration curve in the settings UI and use it to recommend `market_adjustment_factor` tweaks.

## 5. Risks & Open Questions
- **Active-listing bias is the single largest risk.** The methodology in Phase 3.4 is necessary but not sufficient — calibration via `price_outcomes` is what actually makes it trustworthy. Until that data exists, treat all ROI numbers as directional, not absolute.
- **ToS exposure on Whitley/Roller.** Personal use only; no resale of scraped data; respect robots.txt and any explicit ToS prohibitions discovered in Phase 0. If a site's ToS prohibits automated access, document the decision to proceed (or not) before writing the client.
- **eBay quota.** 5,000 Browse calls/day is tight if every new item triggers a fresh sample. Cache aggressively (Phase 3.4) and de-duplicate query signatures across items.
- **Brand/MPN extraction quality** gates matching precision. Plan to iterate on the extractor with a labeled corpus from Phase 1 onward.
- **Shipping cost defaults** are a known fudge factor for v1 — track realized shipping in `price_outcomes` to refine.
