# API Manifest — Auction Arbitrage Application

> **Phase 0 Deliverable.** This document consolidates all API research and must be reviewed before Phase 1 begins.
> Last updated: 2026-05-07

---

## Table of Contents

1. [eBay Browse API](#1-ebay-browse-api)
2. [Public Surplus (Pilot) — HTML Scraping](#2-public-surplus-pilot--html-scraping)
3. [Whitley Auction (Post-Pilot)](#3-whitley-auction-post-pilot)
4. [Roller Auction (Post-Pilot)](#4-roller-auction-post-pilot)
5. [Fee Structures (All Sources)](#5-fee-structures)
6. [eBay Condition ID Enum](#6-ebay-condition-id-enum)
7. [Open Questions & Risks](#7-open-questions--risks)

---

## 1. eBay Browse API

### 1.1 Overview

The Browse API is eBay's current-generation RESTful API for searching and retrieving item listings. It replaces the deprecated Finding API. We use the `item_summary/search` method exclusively for fetching active-listing comparables.

- **Base URL (Production):** `https://api.ebay.com/buy/browse/v1/`
- **Base URL (Sandbox):** `https://api.sandbox.ebay.com/buy/browse/v1/`
- **Documentation:** https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search

### 1.2 Authentication

| Parameter | Value |
|---|---|
| **Grant type** | `client_credentials` (Application Access Token) |
| **Token endpoint (prod)** | `https://api.ebay.com/identity/v1/oauth2/token` |
| **Token endpoint (sandbox)** | `https://api.sandbox.ebay.com/identity/v1/oauth2/token` |
| **Auth header** | `Basic <base64(client_id:client_secret)>` |
| **Content-Type** | `application/x-www-form-urlencoded` |
| **Required scope** | `https://api.ebay.com/oauth/api_scope` |
| **Token lifetime** | ~7200 seconds (2 hours); refresh proactively |

**Implementation notes:**
- Credentials come from the eBay Developer Portal keyset (App ID = `client_id`, Cert ID = `client_secret`).
- Production access requires eligibility review and contract signing with eBay.
- Store `client_id` and `client_secret` in `.env`; never commit.

### 1.3 Search — `GET /item_summary/search`

#### Key Query Parameters

| Parameter | Notes |
|---|---|
| `q` | Keyword query (title search). Max ~350 chars. |
| `category_ids` | Comma-separated eBay category IDs. |
| `filter` | Compound filter string. Key filters below. |
| `sort` | e.g., `price`, `-price`, `newlyListed`. |
| `limit` | Items per page. Max **200**. |
| `offset` | Items to skip. **Hard ceiling:** `offset + limit ≤ 10,000`. |
| `fieldgroups` | `EXTENDED` for extra seller/image data; `ASPECT_REFINEMENTS` for facets. |

#### Filter Syntax (within `filter=` parameter)

```
filter=buyingOptions:{FIXED_PRICE},conditionIds:{3000|4000|5000},price:[50..500],priceCurrency:USD
```

| Filter | Usage |
|---|---|
| `buyingOptions:{FIXED_PRICE}` | **Critical.** Active auctions are noise for valuation; use BIN only. This is the API default, but we specify explicitly for clarity. |
| `conditionIds:{ID\|ID}` | Pipe-delimited condition IDs. Maps from auction item condition. |
| `price:[min..max]` | Optional price range bracket. |
| `priceCurrency:USD` | Force USD. |
| `itemLocationCountry:US` | Limit to domestic for shipping-cost relevance. |

#### Pagination Constraint

> **Hard limit:** You can never retrieve more than 10,000 items per query (`offset + limit ≤ 10,000`). For our use case (100–200 results per valuation query), this is not a concern. If we ever need >10,000 for a single query, we must partition by price range or category.

### 1.4 Response Fields (ItemSummary)

Key fields returned per item in `itemSummaries[]`:

| Field | Type | Description |
|---|---|---|
| `itemId` | string | Unique listing ID. Used for `getItem` calls. |
| `title` | string | Full listing title. |
| `price.value` | string | Current price. |
| `price.currency` | string | ISO currency code. |
| `condition` | string | Human-readable condition label. |
| `conditionId` | string | Numeric condition enum (see §6). |
| `categoryId` | string | eBay leaf category. |
| `itemCreationDate` | string (ISO 8601) | When listing was first published. **Critical for age-distribution analysis.** |
| `seller.username` | string | Seller handle. Used for de-duplication. |
| `seller.feedbackScore` | int | Aggregate feedback count. |
| `seller.feedbackPercentage` | string | Positive feedback %. |
| `image.imageUrl` | string | Primary image URL. |
| `buyingOptions` | string[] | `FIXED_PRICE`, `AUCTION`, etc. |
| `itemLocation` | object | Country, city (for shipping estimates). |
| `shippingOptions` | array | Shipping cost/type when available. |
| `bidCount` | int | Bids (auction items only). |
| `currentBidPrice` | object | Current bid (auction items only). |

**Fields NOT in `item_summary/search`:**
- `watchCount` — **Not available** in search summaries. Requires `getItem` per-item call (expensive). Deprioritize for v1.
- `itemViewCount` — Same; not in summary.
- Brand/MPN — Available via `localizedAspects` in `getItem` detail, or partially via `ASPECT_REFINEMENTS` fieldgroup. **We must extract brand/MPN from the auction item title/description ourselves** and use them as search keywords rather than relying on eBay's aspect filters in the search call.

### 1.5 Rate Limits

| Metric | Value |
|---|---|
| **Default daily quota** | Application-specific; check via Analytics API `getRateLimits`. Plan assumed 5,000/day as working estimate. |
| **Burst limit** | Not publicly documented; watch for HTTP 429. |
| **Quota increase** | Requires "Application Growth Check" via eBay Developers Program. |

**Quota management strategy:**
- Cache aggressively: 12–24h TTL on `ebay_sample_cache` keyed by `query_signature`.
- De-duplicate query signatures across auction items that map to the same product.
- Batch queries by category/brand to maximize hits per call.
- Monitor daily usage via `getRateLimits` endpoint; alert at 80% consumption.

### 1.6 Production Access Requirements

- Register at https://developer.ebay.com/
- Create an application keyset
- Complete the Application Growth Check if default limits are insufficient
- Sign eBay's API License Agreement
- Obtain production OAuth credentials

---

## 2. Public Surplus (Pilot) — HTML Scraping

> **CORRECTION (2026-05-08):** Chrome DevTools network capture confirmed Public Surplus is **NOT backed by the GSA Auctions API**. It is a standalone Java web application using Freemarker templates (`.ftlh`). There is no JSON/REST API — all data is server-rendered HTML. Data ingestion requires **HTML scraping**.

### 2.1 Overview

Public Surplus (publicsurplus.com) is a server-rendered auction platform built on Java/Freemarker, served at `69.160.80.45:443`. All endpoints return `text/html;charset=UTF-8` with `no-cache/no-store` headers. There is no public API.

- **Platform:** Java web app, Freemarker templates, Bootstrap 5.2.3, Prototype.js
- **CDN:** `d37qv0n5b4mbzm.cloudfront.net` (CloudFront for images)
- **Content-Type:** `text/html;charset=UTF-8` (all endpoints)
- **Session cookies:** Yes — standard Java session. No CSRF token observed in search requests.
- **No JSON API whatsoever.** All data is embedded in server-rendered HTML.

### 2.2 Authentication (Scraping)

| Parameter | Value |
|---|---|
| **Auth model** | None required for search/browse pages |
| **Cookies** | Session cookie set automatically; required for view mode persistence |
| **CSRF** | None observed on read-only endpoints |
| **Rate limiting** | None observed; respect `robots.txt` crawl-delay (5s for bots) |

> **Note:** No login is required to search or view auction listings. Registration is only needed to place bids.

### 2.3 Discovered Endpoints (from Chrome DevTools)

#### 2.3.1 Search/Browse — `GET /sms/{region}/browse/search`

The primary discovery endpoint. Returns full HTML page with auction listings.

**URL pattern:**
```
https://www.publicsurplus.com/sms/{scope},{state}/browse/search?posting=y&slth=&page={N}&sortBy={field}&sortDesc={Y|N}&keyWord={term}&catId={ID}&endHours={hours}&startHours={hours}&lowerPrice={N}&higherPrice={N}&milesLocation={miles}&zipCode={zip}&region={scope},{state}&search=
```

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `posting` | string | `y` | Must be `y` for active auction results |
| `page` | int | `0` | Zero-indexed page number |
| `sortBy` | string | `""` | Sort field: `id`, `title`, `timeLeft`, `price` |
| `sortDesc` | string | `N` | `Y` for descending, `N` for ascending |
| `keyWord` | string | `""` | Full-text keyword search |
| `catId` | int | `-1` | Category filter. `-1` = All Categories |
| `endHours` | int | `240` | Ending within N hours. `-1` = No Limit |
| `startHours` | int | `-1` | Started in last N hours. `-1` = All |
| `lowerPrice` | int | `0` | Minimum price filter |
| `higherPrice` | int | `0` | Maximum price filter (0 = no max) |
| `milesLocation` | int | `-1` | Radius in miles. `-1` = All |
| `zipCode` | string | `""` | Center zip for radius search |
| `region` | string | `all,co` | Scope filter: `all,{state_code}` or `""` for national |
| `slth` | string | `""` | Image visibility toggle (`n` = hide) |
| `scope` | string | `""` | `all` for national search |

**Scope/region format in URL path:**
- National: `/sms/browse/search` (no scope)
- State-filtered: `/sms/all,co/browse/search` (Colorado)
- Agency-specific: `/sms/{agencySlug},{state}/browse/search`

**Category IDs (observed):**

| ID | Category | ID | Category |
|---|---|---|---|
| -1 | All Categories | 14 | Furniture |
| 1 | Computers | 15 | Real Estate |
| 2 | Electronics | 16 | Clothing |
| 3 | Office Equipment | 17 | Heavy Equipment |
| 4 | Motor Pool | 18 | Collectibles |
| 5 | Sporting Goods | 19 | Aviation |
| 6 | Industrial Equipment | 20 | Marine |
| 8 | Food Supply | 21 | Motor Pool Parts |
| 9 | School Supplies | 22 | Airport |
| 10 | Building | 23 | Medical |
| 11 | Jewelry | 24 | Animals and Livestock |
| 12 | Outdoor Equipment | 25 | Scrap |
| 13 | Music and Arts | 26 | Storage |
| | | 27 | Housewares |
| | | 28 | For Children |
| | | 29 | Heavy Equipment Parts |

#### 2.3.2 Item Detail — `GET /sms/{scope},{state}/auction/view`

**URL pattern:**
```
https://www.publicsurplus.com/sms/all,co/auction/view?auc={auctionId}
```

Returns full auction detail page with description, images, bid history, terms.

#### 2.3.3 AJAX Image Loader — `GET /sms/{scope},{state}/auction/ajaxpicloader`

```
https://www.publicsurplus.com/sms/all,co/auction/ajaxpicloader?auctionId={id}
```

Returns image gallery data for lightbox display.

#### 2.3.4 Extended Time — `GET /sms/{scope},{state}/auction/extendedTime`

```
/sms/all,co/auction/extendedTime
```

Polls for auction end-time extensions (anti-sniping). Used by client-side JS.

#### 2.3.5 View Mode Persistence — `POST /sms/{scope},{state}/mys/avmc`

```
POST /sms/all,co/mys/avmc
body: view={g|l}&tab={search|browse}
```

Saves user's grid/list view preference. Not needed for scraping.

### 2.4 Data Extraction — DOM Selectors

The search response embeds listings in **two parallel formats**: grid view and table (list) view. The table view is the most reliable for bulk parsing.

#### 2.4.1 Grid View Cards (CSS selectors)

Each auction is a `div.auction-item` with id `{auctionId}searchGrid`:

```
Container:      section#auctionsListContainer > div.auction-item
Auction ID:     div.auction-item[id] → extract digits from id (e.g., "4000349searchGrid" → 4000349)
Title:          h6.ps-card-feat__body--title > a[title]  (full title in title attribute)
Detail URL:     h6.ps-card-feat__body--title > a[href]  (e.g., "/sms/all,co/auction/view?auc=4000349")
Price:          b[id^="val_"]  (e.g., "$150.00")
State:          span.auction-item-state  (e.g., "CO")
Thumbnail:      img.lazy-img-loading[src]  (CloudFront CDN URL)
Time Left:      span[id^="timeLeftValue"]  (human-readable, e.g., "16 hours 58 mins")
Dutch Auction:  img[title="Dutch Auction"]  (present when listing is Dutch-style)
New Listing:    i[title="Newly Listed Item"]  (present on fresh listings)
```

#### 2.4.2 Table/List View (more reliable for parsing)

```html
<tr id="{auctionId}searchList">
  <td>{auctionId}</td>                          <!-- column 1: Auction ID -->
  <td class="text-start"><a href="...">{title}</a></td>  <!-- column 2: Title + link -->
  <td><!-- thumbnail --></td>                   <!-- column 3: Image -->
  <td class="text-center">{state}</td>          <!-- column 4: State code -->
  <td nowrap><!-- time left span --></td>        <!-- column 5: Time left -->
  <td class="text-end" id="val_{id}searchList">{price}</td> <!-- column 6: Price -->
</tr>
```

#### 2.4.3 Precise End Time (from inline JavaScript)

**Critical finding:** The exact end time (as a Unix timestamp in milliseconds) is embedded in inline `<script>` blocks:

```javascript
updateTimeLeftSpan(timeLeftInfoMap, {auctionId}, "{auctionId}searchGrid",
    {serverTimeMs}, {endTimeMs}, {extensionMs}, "{extensionType}",
    "{status}", "{viewType}", timeLeftCallback);
```

**Parameters:**
| Position | Name | Example | Description |
|---|---|---|---|
| 1 | map | `timeLeftInfoMap` | Global reference |
| 2 | auctionId | `4000349` | Numeric auction ID |
| 3 | elementId | `"4000349searchGrid"` | DOM element suffix |
| 4 | serverTimeMs | `1778212888297` | Server's current time (Unix ms) |
| 5 | endTimeMs | `1778274000000` | **Auction end time (Unix ms)** ✅ |
| 6 | extensionMs | `0` | Extension time (anti-sniping) |
| 7 | extensionType | `""` | Extension type identifier |
| 8 | status | `""` | Auction status |
| 9 | viewType | `"searchList"` | Companion DOM element type |
| 10 | callback | `timeLeftCallback` | JS callback reference |

> **This resolves Open Question #2 from the original manifest.** End times are available with **millisecond precision** directly in the search results HTML. No supplemental scraping needed for closing times.

**Regex for extraction:**
```python
import re
pattern = r'updateTimeLeftSpan\(timeLeftInfoMap,\s*(\d+),\s*"[^"]+",\s*\d+,\s*(\d+),'
# group 1 = auctionId, group 2 = endTimeMs
```

#### 2.4.4 Image CDN URL Pattern

```
https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/{auctionId}/{imageId}
```

- `thumb-b` = standard thumbnail. Other sizes may be available (explore `/thumb-s/`, `/thumb-l/`, or full-size paths).
- `imageId` is a sequential internal asset ID.

### 2.5 Pagination

The search results page includes pagination controls. From the captured response:
- Page 1 shows 25 items (grid view) and 25 items (list view)
- Pagination is **page-based, zero-indexed**: `page=0`, `page=1`, etc.
- Pagination JS function: `srchPage('1')` → sets `document.search.page.value = 1` and submits form
- Total results count: inspect pagination links to determine last page

> **This resolves Open Question #1.** Public Surplus uses standard page-based pagination, ~25 items per page.

### 2.6 Data Available per Listing (Search Page)

| Field | Available on Search? | Extraction Method |
|---|---|---|
| **Auction ID** | ✅ | DOM element `id` attribute or table `<td>` |
| **Title** | ✅ | `<a>` tag `title` attribute (full, untruncated) |
| **Current Price/Bid** | ✅ | `<b id="val_{id}...">` text content |
| **End Time (precise)** | ✅ | `updateTimeLeftSpan()` JS — param 5 (Unix ms) |
| **State** | ✅ | `span.auction-item-state` or table column |
| **Thumbnail URL** | ✅ | `img.lazy-img-loading[src]` (CloudFront CDN) |
| **Auction Type** | ✅ | `img[title="Dutch Auction"]` presence |
| **New Listing Flag** | ✅ | `i[title="Newly Listed Item"]` presence |
| **Detail Page URL** | ✅ | `<a>` href attribute |
| **Category** | ❌ | Not in results; must filter via `catId` parameter |
| **Condition** | ❌ | Not in search results; requires detail page scrape |
| **Description** | ❌ | Not in search results; requires detail page scrape |
| **Seller/Agency** | ❌ | Not in search results; available in agency-scoped URLs |
| **Buyer's Premium** | ❌ | Not in search results; per-agency, from detail page terms |

### 2.7 Scraping Strategy (Recommended)

```
1. Discovery:  GET /sms/browse/search?catId={cat}&endHours=240&page={N}
               Parse all pages, extract: auctionId, title, price, endTimeMs, thumbnailUrl
               Rate: 1 request per 2 seconds (conservative, above robots.txt 5s delay)

2. Filtering:  Apply keyword/price/time filters on scraped data in our DB

3. Enrichment: For filtered candidates only:
               GET /sms/all,co/auction/view?auc={auctionId}
               Extract: full description, condition text, agency, buyer's premium, bid history
               Rate: 1 request per 3 seconds

4. Storage:    Upsert into auction_items table with source='PUBLIC_SURPLUS'
```

### 2.8 Anti-Bot Considerations

| Factor | Details |
|---|---|
| **robots.txt** | Blocks ~200+ named bots. General `User-agent: *` only blocks `/images/`. Crawl-delay: 5s for specific bots. |
| **Session tracking** | Java session cookie (`JSESSIONID`). Not required for read-only access but may help avoid rate limiting. |
| **User-Agent** | Use a standard browser UA string. Avoid bot-like strings. |
| **IP banning** | Unknown threshold. Use conservative rate limits. Consider rotating proxies for production. |
| **JavaScript** | Core listing data is in the initial HTML response. No client-side rendering required. |

---

## 3. Whitley Auction — GraphQL API (via Apollo SSR Hydration)

> **Status:** ✅ **RESEARCH COMPLETE** (2026-05-08). Full entity schemas captured via `window.__APOLLO_STATE__` from Chrome DevTools. Whitley Auction runs on the **Auctioneer Software** SaaS platform (React/Next.js + Apollo Client + GraphQL backend).
>
> **Source file:** `docs/Whitley Auction.md` — raw Apollo state dump from browser console.

- **Website:** https://www.whitleyauction.com/
- **Business name:** Rocky Mountain Estate Brokers Inc. (RMEB)
- **Platform:** Auctioneer Software SaaS (shared platform with other auction companies)
- **Fee structure:** See §5.3.

### 3.1 Architecture Overview

| Property | Value |
|---|---|
| **Frontend** | React + Next.js (SSR) + Apollo Client |
| **API endpoint** | `https://www.whitleyauction.com/api` (GraphQL) |
| **Internal API** | `http://rmeb-api.rmeb:4001/api` (SSR-side, not externally accessible) |
| **Subscriptions** | `wss://` WebSocket (real-time bid updates) |
| **WEBSITE_KEY** | `rmeb` (tenant identifier) |
| **CDN** | CloudFront: `https://d3j17a2r8lnfte.cloudfront.net/rmeb/` |
| **State hydration** | `window.__APOLLO_STATE__` embedded in SSR HTML |

### 3.2 Data Extraction Strategy

**Primary approach: Parse `window.__APOLLO_STATE__` from page source.**

Unlike Public Surplus (which requires DOM scraping), Whitley's SSR pages embed the **complete GraphQL response** as a JSON object in a `<script>` tag. This gives us structured, high-fidelity data without any DOM parsing:

```
1. HTTP GET the auction catalog page URL
2. Extract the __APOLLO_STATE__ JSON from the <script> tag
3. Parse the JSON → get Auction and AuctionLot entities directly
4. No DOM parsing required for core data fields
```

**Fallback approach:** If they move to client-side rendering, we can POST GraphQL queries directly to `/api`. The query shapes are discoverable from the Apollo cache keys.

### 3.3 URL Patterns

| Page | URL Pattern | Example |
|---|---|---|
| **Upcoming auctions** | `/auction-calendar` | Lists active/upcoming auctions |
| **Past auctions** | `/past-auctions` | Lists completed auctions (for historical data) |
| **Auction catalog** | `/auctions/{auction_id}-{slug}` | `/auctions/29249-huge-studio-production-and-estate-liquidation` |
| **Lot detail** | `/auctions/{auction_id}/lot/{lot_id}-{slug}` | `/auctions/29249/lot/325237-modern-style-wooden-side-table-w-2-shelves-30x16x13` |
| **API (GraphQL)** | `/api` | POST with GraphQL query body |
| **Asset proxy** | `/asset/image/{attachment_id}/{variant}` | `/asset/image/15591641/large` |

### 3.4 Entity Schema — `Auction`

Key in Apollo cache: `Auction.{auction_id}` (e.g., `Auction.29249`)

| Field | Type | Notes |
|---|---|---|
| `auction_id` | string | Primary key (e.g., `"29249"`) |
| `auction_ref` | string | Date-based ref (e.g., `"20260430"`) |
| `title` | string | Auction event title |
| `type` | string | `"online"`, `"live"`, `"multipar"`, `"real-estate-listing"` |
| `auction_status` | int | `300` = completed/closed |
| `description` | string | HTML content |
| `description_plain` | string | Plain text version |
| `terms` | string | Full T&C HTML (contains buyer's premium info) |
| `preview` | string | Preview/inspection HTML |
| `preview_plain` | string | Plain text version |
| `removal_times` | string | Pickup/shipping instructions HTML |
| `start_time` | ISO 8601 | Auction opens (UTC, e.g., `"2026-04-13T01:00:00.000Z"`) |
| `end_time` | ISO 8601 | Auction closes (UTC) |
| `preview_start_time` | ISO 8601 | In-person preview window start |
| `preview_end_time` | ISO 8601 | In-person preview window end |
| `front_visible_lot_count` | int | Total lots visible (e.g., `744`) |
| `public_url` | string | Canonical URL for this auction |
| `auction_location` | object | See location sub-schema below |
| `primary_image` | object | See image sub-schema below |
| `hide_winning_info` | bool | Whether to obscure winner details |
| `hide_winning_user` | bool | Whether to obscure winner username |
| `hide_bid_history` | bool | Whether bid history is visible |
| `is_approval_required` | bool | Registration approval needed |
| `require_terms_approval` | bool | Must accept terms before bidding |
| `per_unit_bidding` | string | `"never"` for standard lots |
| `has_featured_lots` | bool | Whether auction has featured/highlighted lots |
| `sort_by_sale_order` | bool | Lot ordering mode |
| `alert_text` | string | HTML banner text |
| `alert_type` | string | `"danger"`, `"info"`, etc. |
| `documents` | array | Attached PDF/docs |
| `highlights` | array | Gallery images for auction overview |
| `banner_image` | array | Optional banner images |

**Location sub-schema (`auction_location`):**

| Field | Type | Example |
|---|---|---|
| `line_1` | string | `"2335 Winding Drive"` |
| `line_2` | string \| null | |
| `city` | string | `"Longmont"` |
| `state_name` | string | `"Colorado"` |
| `state.abbreviation` | string | `"CO"` |
| `zip_code` | string | `"80504"` |
| `country_id` | string | `"236"` (US) |
| `coordinates` | object \| null | Lat/lng when available |
| `map_link` | string \| null | Google Maps link |

### 3.5 Entity Schema — `AuctionLot`

Key in Apollo cache: `AuctionLot.{auction_lot_id}` (e.g., `AuctionLot.325237`)

#### Core identification

| Field | Type | Notes |
|---|---|---|
| `auction_lot_id` | string | Primary key (e.g., `"325237"`) |
| `auction_id` | string | FK to parent Auction |
| `lot_number` | string | Display lot # (e.g., `"1"`, `"25"`) |
| `lot_ref` | string \| null | Internal reference |
| `title` | string | Lot title/description |
| `description` | string | Additional description HTML (often empty) |
| `category_id` | string | FK to category (e.g., `"2795"` = Furniture) |
| `lot_location` | string \| null | Specific lot location if different from auction |

#### Pricing & bidding

| Field | Type | Notes |
|---|---|---|
| `starting_bid` | number | Opening bid amount (e.g., `1`) |
| `bid_count` | int | Total bids placed (e.g., `33`) |
| `bid_increment_amount` | number | Current increment (e.g., `1`, `2.5`, `5`, `10`) |
| `required_bid` | number | Next valid bid amount |
| `winning_bid_amount` | number \| null | Current/final winning bid. `null` if no bids. |
| `price` | number | Final sale price (mirrors `winning_bid_amount`, or `0` for no-sale) |
| `quantity` | int | Number of units (`1` = standard, `>1` = "times the money") |
| `buy_it_now_active` | bool | Whether BIN is available |
| `buy_it_now_price` | number \| null | BIN price if active |
| `allow_offers` | bool | Whether offers are accepted |

#### Timing

| Field | Type | Notes |
|---|---|---|
| `start_time` | ISO 8601 | Bidding opens (UTC) |
| `end_time` | ISO 8601 | Current closing time (may be extended) |
| `original_end_time` | ISO 8601 \| null | Original close time before extensions. `null` if not extended. |
| `is_past_end_time` | bool | Whether lot has closed |

> **Staggered closing:** Lots close at **12-second intervals** (end_time increments by 12s per lot: `01:12:00`, `01:12:12`, `01:12:24`...). Any bid in the last 2 minutes extends closing by 2 minutes (tracked via `original_end_time`).

#### Status & sale outcome

| Field | Type | Notes |
|---|---|---|
| `auction_lot_status` | int | `200` = closed/completed |
| `auction_type` | string | `"online"` |
| `is_no_sale` | bool | `true` if lot received no winning bid |
| `no_sale_status` | string | `"no-bid"` or `""` |
| `is_passed` | bool | Whether lot was passed/withdrawn |
| `reserve_met` | bool \| null | Whether reserve price was met |
| `has_reserve` | bool \| null | Whether lot has a reserve |
| `pending_confirmation` | bool \| null | Awaiting auctioneer confirmation |

#### Winner info

| Field | Type | Notes |
|---|---|---|
| `winning_bidder.user_id` | string | Winner's user ID |
| `winning_bidder.user_display` | string | Obscured username (e.g., `"S****g"`) |
| `winning_bidder.country_code` | string | `"US"` |

#### Media

| Field | Type | Notes |
|---|---|---|
| `primary_image.attachment_id` | int | Image asset ID |
| `primary_image.url` | string | Original image URL on CloudFront |
| `primary_image.thumb` | string | 175x175 thumbnail |
| `primary_image.small` | string | 125x180 |
| `primary_image.medium` | string | ~400x576 |
| `primary_image.large` | string | ~1400x2000 |
| `image_count` | int | Total images for this lot |
| `has_video` | bool | Whether lot has video |

#### Misc

| Field | Type | Notes |
|---|---|---|
| `watch_count` | int | Number of users watching |
| `is_watched` | bool | Whether current user is watching |
| `tax_type` | string \| null | Tax classification |
| `dynamic_fields` | array | Custom fields (usually empty) |
| `inventory.inventory_ref` | string | Internal inventory reference |
| `image_tag` | string | Badge/label text for tile display |
| `group_key` | string | Lot grouping key (for grouped closing) |

### 3.6 Image CDN

Images are served from CloudFront with the following pattern:

```
Base: https://d3j17a2r8lnfte.cloudfront.net/rmeb/{year}/{month}/
Variants:
  Original:  {base}/{hash}.jpeg
  Large:     {base}/large/{hash}.jpeg    (~1400x2000)
  Medium:    {base}/medium/{hash}.jpeg   (~400x576)
  Small:     {base}/small/{hash}.jpeg    (~125x180)
  Thumb:     {base}/thumb/{hash}.jpeg    (175x175)

Alt proxy (goes through app server):
  https://www.whitleyauction.com/asset/image/{attachment_id}/{variant}
```

> **For scraping:** Use the CloudFront URLs directly — they're faster and don't count against the app server rate limit.

### 3.7 Pagination

Auction catalog pages load **25 lots per page** by default. Pagination is embedded in the Apollo cache query key:

```
lots({
  "filter": {
    "auction_id": "29249",
    "auction_lot_status": [200, 300],
    "is_visible": true
  },
  "order": [{"column": "lot_number", "direction": "asc"}],
  "pagination": {"page": 1, "pageSize": 25},
  "search": {"text": ""}
})
```

The response includes `total` (e.g., `744`) for calculating total pages.

### 3.8 Bid Increment Table

Whitley uses a **scaled bid increment** system (captured from the lot detail XHR):

| Price Range | Increment |
|---|---|
| $0 – $5 | $1.00 |
| $5 – $30 | $2.50 |
| $30 – $75 | $5.00 |
| $75 – $1,000 | $10.00 |
| $1,000 – $2,500 | $25.00 |
| $2,500 – $5,000 | $50.00 |
| $5,000 – $100,000 | $100.00 |
| $100,000 – $250,000 | $250.00 |
| $250,000 – $500,000 | $500.00 |
| $500,000 – $1,000,000 | $1,000.00 |
| $1,000,000 – $5,000,000 | $5,000.00 |

### 3.9 Anti-Bot Considerations

| Factor | Details |
|---|---|
| **Rate limiting** | Aggressive — returns HTTP 429 for non-browser requests (even `robots.txt` blocked for raw HTTP clients). |
| **robots.txt** | Returns 429 for programmatic access. Assume restrictive. |
| **Session/cookies** | Standard browser session. No CSRF tokens observed for read-only GraphQL queries. |
| **User-Agent** | **Must** use a browser-like UA string. Non-browser UAs get 429'd immediately. |
| **JavaScript** | Full data is in SSR HTML (`__APOLLO_STATE__`), so no JS execution required for data extraction. |
| **Strategy** | Use `requests` + browser UA headers. Parse HTML for the embedded JSON. Do NOT hit the GraphQL endpoint directly unless mimicking the full browser request chain. |

### 3.10 Research To-Do (Remaining)

- [x] Identify API type and endpoint → **GraphQL at `/api`**
- [x] Capture entity schemas → **`Auction` + `AuctionLot` fully documented**
- [x] Understand pagination → **25/page, page-based**
- [x] Document image CDN → **CloudFront with 4 variants**
- [x] Capture fee structure → **18.5% buyer's premium (15% cash)**
- [x] Document bid increment table → **11-tier scaled increments**
- [ ] Identify category taxonomy (map `category_id` to names)
- [ ] Confirm whether `/api` accepts direct GraphQL POST requests without SSR context
- [ ] Review Terms of Use for automated access prohibitions

---

## 4. Roller Auction — GraphQL API (via Apollo SSR Hydration)

> **Status:** ✅ **RESEARCH COMPLETE** (2026-05-08). Full entity schemas captured via `window.__APOLLO_STATE__` from Chrome DevTools. Confirmed: **same Auctioneer Software SaaS platform as Whitley Auction.**
>
> **Source file:** `docs/Roller Auction.md` — raw Apollo state dump from browser console.

- **Website:** https://www.rollerauction.com/ (marketing site, returns 403 to non-browser clients)
- **Bid platform:** https://bid.rollerauction.com/ (React SPA, returns 429 to non-browser clients)
- **Business name:** Roller Auctions
- **Platform:** Auctioneer Software SaaS (same platform as Whitley Auction)
- **Fee structure:** See §5.4.

### 4.1 Architecture Overview

| Property | Value |
|---|---|
| **Frontend** | React SPA + Apollo Client (uses `#app` root div, **not** Next.js SSR) |
| **API endpoint** | `https://bid.rollerauction.com/api` (GraphQL) |
| **Internal API** | `http://rol-api.rol:4001/api` (server-side, not externally accessible) |
| **Subscriptions** | `wss://` WebSocket |
| **WEBSITE_KEY** | `rol` (tenant identifier) |
| **CDN** | CloudFront: `https://d3j17a2r8lnfte.cloudfront.net/rol/` |
| **State hydration** | `window.__APOLLO_STATE__` embedded in page HTML |
| **Polling** | **Disabled** (`AS2_PUBLIC_DISABLE_AUCTION_LOT_POLLING: "true"`) |

> **Key difference from Whitley:** Roller uses a React **SPA** (not Next.js SSR). The `#app` root div and lack of `__NEXT_DATA__` confirm this. However, `__APOLLO_STATE__` is still embedded in the HTML, so the same extraction strategy applies.

### 4.2 Data Extraction Strategy

**Same approach as Whitley:** Parse `window.__APOLLO_STATE__` from the page HTML. Entity types (`Auction`, `AuctionLot`) are structurally identical.

### 4.3 URL Patterns

| Page | URL Pattern | Example |
|---|---|---|
| **Upcoming auctions** | Homepage grid | `https://bid.rollerauction.com/` |
| **Past auctions** | `/past-auctions` | Historical data |
| **Auction catalog** | `/auctions/{auction_id}` | `/auctions/24953` |
| **Lot detail** | `/auctions/{auction_id}/lot/{lot_id}-{slug}` | `/auctions/24953/lot/562445-ion-audio-total-pa-apex-...` |
| **Print view** | `/asset/front/print-lot-details/{lot_id}` | `/asset/front/print-lot-details/562445` |
| **API (GraphQL)** | `/api` | POST with GraphQL query body |
| **Asset proxy** | `/asset/image/{attachment_id}/{variant}` | `/asset/image/16782892/large` |

### 4.4 Entity Schema — Differences from Whitley

Since Roller runs on the same platform, the `Auction` and `AuctionLot` schemas are **structurally identical** to Whitley (§3.4–3.5). Only platform-specific differences are documented here:

#### AuctionLot — fields unique to or different from Whitley

| Field | Type | Notes |
|---|---|---|
| `auction_lot_status` | int | `100` = active/open, `200` = closed (Whitley data showed `200` because we captured a closed auction) |
| `winning_bidder.user_display` | string | Shows **numeric bidder ID** (e.g., `"90530"`) vs. Whitley's obscured format (`"S****g"`) |
| `show_appointments` | bool | Roller uses appointment-based pickup scheduling |
| `allow_donations` | bool/null | Donation support (not used in captured auction) |
| `is_donation` | bool | Whether lot is a donation item |
| `add_on_total` | number/null | Add-on pricing |
| `estimate` / `estimate_max` / `estimate_min` | number/null | Estimated value range (not used in captured auction) |
| `dutch_drop_amount` / `dutch_minimum` | number/null | Dutch auction support (not used in captured auction) |
| `ai_applied_at` | ISO 8601/null | AI-generated content timestamp |
| `auction_lot_badges` | array | Badge metadata (empty in captured data) |
| `consignor_seller_premium` | number/null | Consignor-specific premium override |
| `same_as_auction_location` | bool | Whether lot location matches auction location |
| `front_lot_location` | object | Full location with `state_id`, `country_name`, `contact`, `phone` (more fields than Whitley's `lot_location`) |
| `prevLot` / `nextLot` | object | Navigation links (`auction_lot_id` + `title`) |
| `image_tag_color` / `image_tag_text_color` | string/null | Custom badge colors |
| `no_sale_text` / `no_sale_hide_price` | string/null | Custom no-sale display |
| `rating` | number/null | Item rating |
| `bid_with_premium` | number/null | Bid amount including premium |

#### Auction — fields unique to or different from Whitley

| Field | Type | Notes |
|---|---|---|
| `premium.type` | string | `"fixed"` — Roller uses a flat percentage (13%) |
| `premium.amount` | number | `13` (the buyer's premium percentage) |
| `auction_tabs` | object | Custom content tabs (keyed by timestamp, contains HTML + plain text) |
| `footer_alert_text` / `footer_alert_type` | string | Footer banner content |
| `alert_display_on_lot_details` | bool | Whether alert shows on lot pages |
| `tax_type` | string | `"exclusive"` — tax is added on top |
| `payment_authorization_amount` | number | `0` for this auction |
| `disable_cart` | bool/null | Cart feature toggle |
| `enable_online_chat` | bool | Live chat toggle |
| `livestream` | object/null | Livestream configuration |
| `appointment_booking_start_time` | ISO 8601/null | When pickup scheduling opens |
| `enable_bid_premium_price_paid_on_front` | bool/null | Show premium-included price |

### 4.5 Image CDN

Same CloudFront CDN as Whitley, with `rol` tenant prefix:

```
Base: https://d3j17a2r8lnfte.cloudfront.net/rol/{year}/{month}/
Variants: large/, medium/, small/, thumb/ (same sizes as Whitley)
S3 Bucket: "auctioneersoftware" (shared bucket, partitioned by tenant key)
```

### 4.6 Bid Increment Table (Roller-specific)

Different from Whitley — **10 tiers** with different breakpoints:

| Price Range | Increment |
|---|---|
| $0 – $10 | $1.00 |
| $10 – $25 | $2.50 |
| $25 – $100 | $5.00 |
| $100 – $250 | $10.00 |
| $250 – $500 | $25.00 |
| $500 – $1,500 | $50.00 |
| $1,500 – $5,000 | $100.00 |
| $5,000 – $10,000 | $250.00 |
| $10,000 – $50,000 | $500.00 |
| $50,000 – $9,999,999 | $1,000.00 |

### 4.7 Extended Bidding

Roller uses **1-minute** extended bidding (vs. Whitley's 2-minute). From their terms:
> "If a bid is placed when an item has less than one minute remaining, the countdown timer will automatically reset to one minute."

### 4.8 Anti-Bot Considerations

Same as Whitley (§3.9). Both `rollerauction.com` (403) and `bid.rollerauction.com` (429) block non-browser HTTP clients. Use browser UA headers and parse `__APOLLO_STATE__` from the HTML response.

### 4.9 Platform Unification Implications

Since Whitley and Roller share the Auctioneer Software platform, we can build a **single scraper module** parameterized by:

| Parameter | Whitley | Roller |
|---|---|---|
| `WEBSITE_KEY` | `rmeb` | `rol` |
| `base_url` | `whitleyauction.com` | `bid.rollerauction.com` |
| `cdn_prefix` | `rmeb` | `rol` |
| `buyer_premium_pct` | 18.5% (15% cash) | 13% (10% cash) |
| `extended_bidding` | 2 minutes | 1 minute |
| `winner_display` | Obscured (`S****g`) | Numeric ID (`90530`) |

Any future Auctioneer Software sites can be added by providing just these parameters.

### 4.10 Research To-Do (Remaining)

- [x] Identify platform → **Auctioneer Software SaaS (same as Whitley)**
- [x] Confirm `__APOLLO_STATE__` extraction → **Works identically**
- [x] Capture entity schemas → **Identical base, differences documented**
- [x] Document bid increment table → **10-tier scaled increments**
- [x] Capture fee structure → **13% premium (10% cash)**
- [x] Document image CDN → **Same CloudFront, `rol` prefix**
- [ ] Confirm pagination approach (likely same 25/page as Whitley)
- [ ] Review Terms of Use for automated access prohibitions

---

## 5. Fee Structures

### 5.1 eBay Seller Fees (for profit calculation)

These are the fees **we pay** when flipping on eBay:

| Fee Type | Amount | Notes |
|---|---|---|
| **Insertion fee** | $0.00 (first 250/month), then $0.35/listing | |
| **Final Value Fee (FVF)** | **13.25%–15%** of total sale (item + shipping) | Varies by category. Most categories 13.25%. |
| **Per-order fee** | $0.30 (sale ≤ $10) / $0.40 (sale > $10) | On top of percentage FVF. |
| **International fee** | Additional % for cross-border sales | Exclude cross-border in v1 queries. |

> **Implementation:** Store a default FVF of **13.25% + $0.40** and allow per-category overrides in `fee_structures`. Check eBay Seller Center quarterly for updates.

### 5.2 Public Surplus — Buyer Fees

| Fee | Amount | Notes |
|---|---|---|
| **Buyer's premium** | **Varies by agency** — 0% to ~15% | No site-wide standard. Each selling agency sets its own terms. |
| **Sales tax** | Varies by jurisdiction | Applied on (bid + premium) in most states. |
| **Payment processing** | Varies | Some agencies accept only cash/check; others accept cards with surcharge. |

> **Implementation:** Default buyer's premium to **10%** as a conservative middle estimate. Allow per-item override in watchlist. Scrape the actual premium from individual listing terms pages when available. Store in `fee_structures` with `last_verified_at`.

### 5.3 Whitley Auction — Buyer Fees

| Fee | Amount | Notes |
|---|---|---|
| **Buyer's premium (card/check)** | **18.5%** | Standard online rate |
| **Buyer's premium (cash)** | **15%** | Same-day cash/guaranteed check discount |
| **Sales tax** | Applicable | On (bid + premium) |
| **Real estate premium** | **10%** | Different from personal property — not relevant for us |

### 5.4 Roller Auction — Buyer Fees

| Fee | Amount | Notes |
|---|---|---|
| **Buyer's premium (card)** | **13%** | Standard rate |
| **Buyer's premium (cash/wire/cashier's check)** | **10%** | Cash-equivalent discount |
| **Sales tax** | Applicable | On (bid + premium) |

---

## 6. eBay Condition ID Enum

Reference for `condition_map` table and Browse API `conditionIds` filter:

| Condition ID | General Label | Inventory API Enum |
|---|---|---|
| 1000 | New | `NEW` |
| 1500 | New other (see details) | `NEW_OTHER` |
| 2000 | Certified Refurbished | `CERTIFIED_REFURBISHED` |
| 2500 | Seller Refurbished | `SELLER_REFURBISHED` |
| 3000 | Used | `USED_EXCELLENT` |
| 4000 | Very Good | `USED_VERY_GOOD` |
| 5000 | Good | `USED_GOOD` |
| 6000 | Acceptable | `USED_ACCEPTABLE` |
| 7000 | For parts or not working | `FOR_PARTS_OR_NOT_WORKING` |

**Notes:**
- Supported condition IDs vary by eBay category. Use `GetCategoryFeatures` (Trading API) or Metadata API to get the valid set for a given category.
- Some categories (trading cards, apparel) have specialized sub-conditions (e.g., 2750 = "Graded").
- Our `condition_map` table will map raw auction-site text patterns (regex) → one of these IDs.

---

## 7. Open Questions & Risks

### Resolved (by Chrome DevTools research, 2026-05-08)

| # | Question | Resolution |
|---|---|---|
| ~~1~~ | ~~PS pagination~~ | ✅ **RESOLVED.** Page-based, zero-indexed (`page=0`, `page=1`…), ~25 items per page. No GSA API involved. |
| ~~2~~ | ~~End time precision~~ | ✅ **RESOLVED.** `updateTimeLeftSpan()` JS embeds Unix ms timestamps. Millisecond precision available on search pages. |

### Must-resolve before Phase 1

| # | Question | Impact | Proposed Resolution |
|---|---|---|---|
| 3 | **eBay daily quota:** What is our actual default Browse API limit? | Caching TTL, query dedup aggressiveness | Register app, call `getRateLimits` endpoint, document actual number. |
| 4 | **eBay production access timeline:** How long does eligibility review take? | Project schedule | Apply immediately; sandbox for development in parallel. |
| 5 | **PS detail page structure:** What fields are available on the auction detail page (`/auction/view?auc=`)? | Enrichment worker design | Capture a detail page via DevTools; document DOM selectors for description, condition, agency, buyer's premium, bid history. |

### Known risks (documented for tracking)

| Risk | Severity | Mitigation |
|---|---|---|
| **Active-listing valuation bias** | HIGH | 0.75 haircut + confidence scores + empirical calibration via `price_outcomes`. See plan §5. |
| **HTML scraping fragility** | HIGH | PS has no API contract. DOM structure can change without notice. Implement selector-based parsers with validation; alert on parse failures exceeding 10% threshold. Pin known-good template version (`/sms/20240825/`). |
| **PS buyer's premium variability** | MEDIUM | Default 10%, allow per-item override, scrape when available from detail page terms. |
| **PS anti-bot escalation** | MEDIUM | Currently no aggressive blocking observed. Use browser UA, session cookies, 2-5s request intervals. Monitor for CAPTCHAs or IP blocks. |
| **eBay quota exhaustion** | MEDIUM | Aggressive caching (12–24h TTL), query dedup, monitor at 80%. |
| **Brand/MPN extraction quality** | HIGH | Gates matching precision. Build labeled corpus early; iterate extractor. |
| **Whitley/Roller ToS** | MEDIUM | Personal use only. Document ToS review before writing client. Respect rate limits. |

---

## Appendix A: Quick-Reference URLs

| Resource | URL |
|---|---|
| eBay Developer Portal | https://developer.ebay.com/ |
| eBay Browse API Docs | https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search |
| eBay OAuth Guide | https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html |
| eBay Condition IDs | https://developer.ebay.com/devzone/finding/callref/Enums/conditionIdList.html |
| eBay Seller Fees | https://www.ebay.com/sellercenter/selling/selling-fees |
| Public Surplus (search) | https://www.publicsurplus.com/sms/browse/search |
| Public Surplus (item detail) | https://www.publicsurplus.com/sms/all,co/auction/view?auc={id} |
| PS Image CDN | https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/{aucId}/{imgId} |
| Whitley Auction | https://www.whitleyauction.com/ |
| Whitley GraphQL API | https://www.whitleyauction.com/api |
| Whitley Image CDN | https://d3j17a2r8lnfte.cloudfront.net/rmeb/ |
| Whitley Auction Calendar | https://www.whitleyauction.com/auction-calendar |
| Whitley Past Auctions | https://www.whitleyauction.com/past-auctions |
| Roller Auction (marketing) | https://www.rollerauction.com/ |
| Roller Bid Platform | https://bid.rollerauction.com/ |
| Roller GraphQL API | https://bid.rollerauction.com/api |
| Roller Image CDN | https://d3j17a2r8lnfte.cloudfront.net/rol/ |
