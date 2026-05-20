# GovDeals Active Bids Integration Spec

## 1. Objective
Update the GovDeals scraper to fetch user active bids using their new internal JSON endpoint (`/buyerbids/open`) instead of HTML parsing, and ensure `bid_sync.py` accurately ingests this data. To support the new endpoint, the application will be updated to allow users to input their GovDeals "Buyer ID" in the frontend settings, which will be passed to the scraper.

## 2. Architecture & Data Flow
1. **Frontend Settings**: `SettingsView.tsx` will include a new input for `govdeals_bidder_id` under the GovDeals integration pane. The `saveSettings` function posts this to `/admin/settings`.
2. **Settings Storage**: The backend `admin.py` router already dynamically saves key-value pairs to the `Setting` table, requiring no schema changes.
3. **Bid Synchronization (`bid_sync.py`)**: 
   - `bid_sync.py` currently fetches `govdeals_bidder_id` from the database.
   - It will pass this ID to `GovDealsScraper.fetch_my_bids(buyer_id)`.
4. **GovDeals Scraper (`govdeals.py`)**:
   - `fetch_my_bids` will be updated to accept `buyer_id`.
   - It will make an authenticated `POST` request to `https://maestro.lqdt1.com/buyerbids/open`.
   - Payload: `{"buyerId": buyer_id, "businessId": "GD", "sortField": "auctionend", "sortOrder": "asc", "siteId": 1}`.
   - The JSON response will be mapped to the standard dictionary schema expected by `bid_sync.py`.

## 3. Data Mapping & Handling
From the GovDeals JSON response, fields map as follows:
- `id`: `assetId` (as a string).
- `title`: `assetShortDescription`.
- `status`: Always `"open"` (as the endpoint explicitly only returns open bids).
- `user_bid_status`: `"winning"` if `isHighBidder` is true, otherwise `"outbid"`.
- `current_bid`: `highBidAmount`.
- `user_bid`: 
  - If `buyerHighestBidAmount` is provided, use it.
  - If null, but `isHighBidder` is true, use `highBidAmount`.
  - Otherwise, `0.0`.
- `proxy_bid`: `buyerAutoBidAmount` (or `0.0` if null).
- `end_time`: `auctionEndDateUTC`. The `bid_sync.py` service will parse this ISO string using `datetime.fromisoformat()`.

## 4. Error Handling
- If `buyer_id` is missing when `fetch_my_bids` is called, it should log a warning and return an empty list gracefully.
- If the HTTP request fails or the JSON is invalid, log the exception and return an empty list to prevent crashing the `bid_sync.py` sync pipeline for other sites.

## 5. Testing Strategy
- Update `backend/tests/test_govdeals_scraper.py`.
- Add a new test case `test_fetch_my_bids`.
- Mock `httpx.AsyncClient.post` with the provided snippet payload to ensure correct mapping of null values (like `buyerHighestBidAmount`) and proper boolean handling (`isHighBidder`).
- Ensure no real network requests are made during testing.
