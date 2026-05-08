# eBay Valuation Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the eBay Browse API to calculate estimated market values and max bid recommendations for ingested auction items, completing Phase 3.

**Architecture:** A stateless eBay client handles OAuth and active-listing search. An analysis pipeline extracts brand/condition from titles, fetches comparables, applies filters (z-score outlier drop, 15% trim), and computes a trimmed median with a market adjustment factor to determine the estimated value and recommended max bid. Results are cached and stored in the database.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, HTTPX, Pytest, SciPy/NumPy (for stats if needed, or pure Python).

---

### Task 1: Add Valuation Database Models

**Files:**
- Modify: `backend/app/models.py`

**Step 1: Add models to `backend/app/models.py`**
Append the new valuation and caching models:

```python
class EbaySampleCache(Base):
    __tablename__ = "ebay_sample_cache"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    query_signature = Column(String, index=True, nullable=False)
    sample_size = Column(Integer)
    trimmed_median = Column(Float)
    iqr = Column(Float)
    mean = Column(Float)
    confidence_score = Column(Float)
    fetched_at = Column(DateTime)
    ttl = Column(DateTime)

class Valuation(Base):
    __tablename__ = "valuations"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False, index=True)
    sample_cache_id = Column(Integer, ForeignKey("ebay_sample_cache.id"))
    est_market_value = Column(Float)
    market_adjustment_factor_applied = Column(Float)
    max_bid_for_target_roi = Column(Float)
    target_roi_pct = Column(Float)
    computed_at = Column(DateTime)
```

**Step 2: Generate and apply migration**
Run: `docker compose exec backend alembic revision --autogenerate -m "Add valuation models"`
Run: `docker compose exec backend alembic upgrade head`
Expected: Migration created and applied successfully.

**Step 3: Commit**
```bash
git add backend/app/models.py backend/alembic/versions/
git commit -m "feat(db): add EbaySampleCache and Valuation models"
```

---

### Task 2: Implement eBay OAuth Client

**Files:**
- Create: `backend/app/services/ebay_auth.py`
- Create: `backend/tests/test_ebay_auth.py`

**Step 1: Write the failing test in `backend/tests/test_ebay_auth.py`**
```python
import pytest
from app.services.ebay_auth import EbayAuthClient

@pytest.mark.asyncio
async def test_get_token(httpx_mock):
    httpx_mock.add_response(json={"access_token": "mock_token", "expires_in": 7200})
    client = EbayAuthClient(client_id="test", client_secret="test")
    token = await client.get_token()
    assert token == "mock_token"
```

**Step 2: Verify test fails**
Run: `docker compose exec backend pytest tests/test_ebay_auth.py -v`
Expected: FAIL with ModuleNotFoundError or NameError.

**Step 3: Implement `backend/app/services/ebay_auth.py`**
Implement the `EbayAuthClient` that uses `httpx.AsyncClient` with the `client_credentials` grant to fetch the token from `https://api.ebay.com/identity/v1/oauth2/token`. Implement basic in-memory caching of the token until it expires.

**Step 4: Verify test passes**
Run: `docker compose exec backend pytest tests/test_ebay_auth.py -v`
Expected: PASS

**Step 5: Commit**
```bash
git add backend/app/services/ebay_auth.py backend/tests/test_ebay_auth.py
git commit -m "feat(api): implement eBay OAuth client"
```

---

### Task 3: Implement eBay Browse API Search Client

**Files:**
- Create: `backend/app/services/ebay_browse.py`
- Create: `backend/tests/test_ebay_browse.py`

**Step 1: Write failing test in `backend/tests/test_ebay_browse.py`**
Test that `search_active_listings("laptop", ["3000"])` correctly formats the eBay Browse API URL and filter string (`filter=buyingOptions:{FIXED_PRICE},conditionIds:{3000}`).

**Step 2: Verify test fails**
Run: `docker compose exec backend pytest tests/test_ebay_browse.py -v`
Expected: FAIL

**Step 3: Implement `backend/app/services/ebay_browse.py`**
Create `EbayBrowseClient` injecting `EbayAuthClient`. Implement `search_active_listings` fetching up to 100-200 results from `/buy/browse/v1/item_summary/search`.

**Step 4: Verify test passes**
Run: `docker compose exec backend pytest tests/test_ebay_browse.py -v`
Expected: PASS

**Step 5: Commit**
```bash
git add backend/app/services/ebay_browse.py backend/tests/test_ebay_browse.py
git commit -m "feat(api): implement eBay Browse API client"
```

---

### Task 4: Valuation Math & Analysis Engine

**Files:**
- Create: `backend/app/services/valuation.py`
- Create: `backend/tests/test_valuation.py`

**Step 1: Write failing test in `backend/tests/test_valuation.py`**
Create a test array of 40 prices with outliers. Test that the calculation correctly removes z-score > 2, trims top/bottom 15%, computes the median, and applies the 0.75 haircut.

**Step 2: Verify test fails**
Run: `docker compose exec backend pytest tests/test_valuation.py -v`
Expected: FAIL

**Step 3: Implement `backend/app/services/valuation.py`**
Implement the mathematical filtering.
- Filter minimum sample size (>= 30 valid comparables).
- Calculate z-scores and remove > 2.
- Trim top/bottom 15%.
- Calculate trimmed median and IQR.
- Apply `market_adjustment_factor` (default 0.75).
- Compute `max_bid_for_target_roi` (e.g., Target 30% ROI: Max Bid = (Trimmed Median / 1.30) - eBay Fees - Auction Premium).

**Step 4: Verify test passes**
Run: `docker compose exec backend pytest tests/test_valuation.py -v`
Expected: PASS

**Step 5: Commit**
```bash
git add backend/app/services/valuation.py backend/tests/test_valuation.py
git commit -m "feat(valuation): implement mathematical filtering and valuation engine"
```

---

### Task 5: Orchestration & Admin Endpoint

**Files:**
- Modify: `backend/app/routers/admin.py`

**Step 1: Add Endpoint in `backend/app/routers/admin.py`**
Add `POST /api/admin/valuate/{item_id}`.
- Fetch Item and AuctionHouse from DB.
- Extract basic keywords from Item title.
- Call `EbayBrowseClient.search_active_listings`.
- Run Valuation math (`valuation.py`).
- Save `EbaySampleCache` and `Valuation` to the database.
- Return the Valuation object.

**Step 2: Verify Endpoint**
Run the backend.
Execute: `curl -X POST http://localhost:8000/api/admin/valuate/1`
Expected: JSON response with the computed valuation, or a message indicating insufficient sample size.

**Step 3: Commit**
```bash
git add backend/app/routers/admin.py
git commit -m "feat(api): add admin endpoint to trigger eBay valuation"
```