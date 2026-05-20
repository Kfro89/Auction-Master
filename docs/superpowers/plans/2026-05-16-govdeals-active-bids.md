# GovDeals Active Bids Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Update the GovDeals scraper to use the `/buyerbids/open` JSON endpoint and integrate it into the `bid_sync.py` service.

**Architecture:** Use a `POST` request to the Liquidality Maestro API with the user's Buyer ID. Map the JSON response to the system's internal bid schema. Update the frontend to allow Buyer ID configuration.

**Tech Stack:** Python 3.12, FastAPI, React 19, httpx.

---

### Task 1: Frontend Settings Update

**Files:**
- Modify: `frontend/src/views/SettingsView.tsx`

- [x] **Step 1: Add GovDeals Buyer ID field**

Search for `govdeals_cookie` in `frontend/src/views/SettingsView.tsx` and add the `govdeals_bidder_id` field.

```tsx
{/* ... after govdeals_cookie input ... */}
<label htmlFor="govdeals_bidder_id">Buyer ID (Required for Active Bids)</label>
<input 
  id="govdeals_bidder_id" 
  name="govdeals_bidder_id" 
  type="text" 
  value={settings.govdeals_bidder_id || ''} 
  onChange={handleChange} 
  placeholder="e.g. 3908433" 
/>
```

- [x] **Step 2: Update saveSettings call**

Update the `onClick` handler for the GovDeals save button to include the new field.

```tsx
onClick={() => saveSettings(['govdeals_zip', 'govdeals_radius', 'govdeals_username', 'govdeals_password', 'govdeals_cookie', 'govdeals_bidder_id'], 'ah_govdeals')}
```

- [x] **Step 3: Commit**

```bash
git add frontend/src/views/SettingsView.tsx
git commit -m "feat(frontend): add govdeals_bidder_id to settings"
```

---

### Task 2: GovDeals Scraper Implementation

**Files:**
- Modify: `backend/app/scrapers/govdeals.py`

- [x] **Step 1: Update fetch_my_bids signature and logic**

Replace the existing `fetch_my_bids` method in `GovDealsScraper` with the new JSON-based implementation.

```python
    async def fetch_my_bids(self, buyer_id: str = None) -> List[Dict[str, Any]]:
        if not buyer_id:
            logger.warning("No buyerId provided for GovDeals fetch_my_bids. Skipping.")
            return []
            
        url = "https://maestro.lqdt1.com/buyerbids/open"
        
        # Ensure buyer_id is an integer if possible
        try:
            b_id = int(buyer_id)
        except (ValueError, TypeError):
            b_id = buyer_id

        payload = {
            "buyerId": b_id,
            "businessId": "GD",
            "sortField": "auctionend",
            "sortOrder": "asc",
            "siteId": 1
        }
        
        bidding_data = []
        
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                
                results = response.json()
                if not isinstance(results, list):
                    logger.error(f"Unexpected response format from GovDeals: {results}")
                    return []
                    
                for item in results:
                    asset_id = item.get("assetId")
                    if not asset_id:
                        continue
                        
                    is_high_bidder = item.get("isHighBidder", False)
                    high_bid = float(item.get("highBidAmount") or 0.0)
                    
                    # If buyerHighestBidAmount is null, use highBid if we are high bidder
                    buyer_highest = item.get("buyerHighestBidAmount")
                    if buyer_highest is None:
                        buyer_highest = high_bid if is_high_bidder else 0.0
                    else:
                        buyer_highest = float(buyer_highest)
                        
                    buyer_auto = float(item.get("buyerAutoBidAmount") or 0.0)
                    
                    bidding_data.append({
                        "id": str(asset_id),
                        "title": item.get("assetShortDescription", ""),
                        "status": "open",
                        "user_bid_status": "winning" if is_high_bidder else "outbid",
                        "current_bid": high_bid,
                        "user_bid": buyer_highest,
                        "proxy_bid": buyer_auto,
                        "end_time": item.get("auctionEndDateUTC")
                    })
            except Exception as e:
                logger.error(f"Error fetching GovDeals my bids: {e}")
                
        return bidding_data
```

- [x] **Step 2: Commit**

```bash
git add backend/app/scrapers/govdeals.py
git commit -m "feat(scraper): update govdeals to use buyerbids/open JSON endpoint"
```

---

### Task 3: Bid Sync Service Integration

**Files:**
- Modify: `backend/app/services/bid_sync.py`

- [x] **Step 1: Update sync_active_bids to pass buyer_id**

Modify `sync_active_bids` to pass the `buyer_id` to `fetch_my_bids` if the scraper supports it or specifically for GovDeals.

```python
            # 4. Fetch Active Bids
            # Check if GovDeals and pass buyer_id
            if website_key == "govdeals":
                b_id = user_bidder_ids[0] if user_bidder_ids else None
                my_bids = await scraper.fetch_my_bids(buyer_id=b_id)
            else:
                my_bids = await scraper.fetch_my_bids()
```

- [x] **Step 2: Commit**

```bash
git add backend/app/services/bid_sync.py
git commit -m "feat(service): pass buyer_id to govdeals scraper during sync"
```

---

### Task 4: Unit Testing & Validation

**Files:**
- Modify: `backend/tests/test_govdeals_scraper.py`

- [x] **Step 1: Add test_fetch_my_bids**

Add a test case to verify the JSON mapping logic, especially the null handling for `buyerHighestBidAmount`.

```python
@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
async def test_fetch_my_bids(mock_post, govdeals_scraper):
    # Mocking GovDeals API response
    mock_json = [
        {
            "assetId": 17891,
            "assetShortDescription": "10 HP Elitebook 840 G8 i5",
            "highBidAmount": 510.00,
            "buyerHighestBidAmount": None,
            "buyerAutoBidAmount": 550.00,
            "isHighBidder": True,
            "auctionEndDateUTC": "2026-05-18T13:53:00Z"
        },
        {
            "assetId": 17892,
            "assetShortDescription": "Outbid Item",
            "highBidAmount": 625.00,
            "buyerHighestBidAmount": 600.00,
            "buyerAutoBidAmount": None,
            "isHighBidder": False,
            "auctionEndDateUTC": "2026-05-18T13:54:00Z"
        }
    ]
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_json
    mock_response.raise_for_status = MagicMock()
    mock_post.return_value = mock_response

    my_bids = await govdeals_scraper.fetch_my_bids(buyer_id="3908433")
    
    assert len(my_bids) == 2
    
    # Check winning item with null buyerHighestBidAmount
    assert my_bids[0]["id"] == "17891"
    assert my_bids[0]["user_bid_status"] == "winning"
    assert my_bids[0]["user_bid"] == 510.00 # Derived from highBidAmount
    assert my_bids[0]["proxy_bid"] == 550.00
    assert my_bids[0]["end_time"] == "2026-05-18T13:53:00Z"
    
    # Check outbid item
    assert my_bids[1]["id"] == "17892"
    assert my_bids[1]["user_bid_status"] == "outbid"
    assert my_bids[1]["user_bid"] == 600.00
    assert my_bids[1]["proxy_bid"] == 0.0
```

- [x] **Step 2: Run tests**

Run: `pytest backend/tests/test_govdeals_scraper.py`
Expected: ALL PASS

- [x] **Step 3: Commit**

```bash
git add backend/tests/test_govdeals_scraper.py
git commit -m "test: add unit test for govdeals fetch_my_bids"
```
