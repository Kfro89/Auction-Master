# Auction Research vs Bids Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple auction discovery (Research) from user bidding (Bidding) into two independent systems with separate database schemas and services.

**Architecture:** Split the monolithic `Item` model into `ResearchItem` and `BidItem`. Create specialized `ResearchService` and `BiddingService`. Implement a manual "Claim" handover from Bidding to the Work Queue.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, Alembic, React 19.

---

### Task 1: New Database Models

**Files:**
- Modify: `backend/app/models.py`

- [ ] **Step 1: Define `ResearchItem` and `BidItem` models**

```python
# backend/app/models.py

class ResearchItem(Base):
    __tablename__ = "research_items"
    id = Column(Integer, primary_key=True, index=True)
    auction_house_id = Column(Integer, ForeignKey("auction_houses.id"), nullable=False)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=True)
    external_id = Column(String, index=True, nullable=False)
    lot_number = Column(String)
    title = Column(String, nullable=False)
    description = Column(String)
    current_bid = Column(Float, default=0.0)
    end_time = Column(DateTime(timezone=True))
    url = Column(String)
    image_url = Column(String)
    images = Column(JSON, default=list)
    first_seen_at = Column(DateTime(timezone=True))
    last_seen_at = Column(DateTime(timezone=True))
    category = Column(String)
    product_name = Column(String)
    condition = Column(String)
    brand = Column(String)
    tags = Column(JSON, default=list)
    search_queries = Column(JSON, default=list)
    normalized_condition_id = Column(String)
    is_watched = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    processing_status = Column(String, default='pending_enrichment')

class BidItem(Base):
    __tablename__ = "bid_items"
    id = Column(Integer, primary_key=True, index=True)
    auction_house_id = Column(Integer, ForeignKey("auction_houses.id"), nullable=False)
    auction_id = Column(Integer, ForeignKey("auctions.id"), nullable=True)
    external_id = Column(String, index=True, nullable=False)
    lot_number = Column(String)
    title = Column(String, nullable=False)
    description = Column(String)
    url = Column(String)
    image_url = Column(String)
    images = Column(JSON, default=list)
    current_bid_amount = Column(Float, default=0.0)
    user_bid_amount = Column(Float, default=0.0)
    user_proxy_bid = Column(Float, default=0.0)
    user_bid_status = Column(String) # winning, outbid, won, lost
    end_time = Column(DateTime(timezone=True))
    is_hidden_from_active = Column(Boolean, default=False)
    category = Column(String)
    product_name = Column(String)
    condition = Column(String)
    brand = Column(String)
    tags = Column(JSON, default=list)
    search_queries = Column(JSON, default=list)
    normalized_condition_id = Column(String)
    processing_status = Column(String, default='pending_enrichment')
```

- [ ] **Step 2: Update shared relationships**
Update `Valuation`, `EbaySampleCache`, and `ValuationDetail` to link to either `research_item_id` or `bid_item_id`.

- [ ] **Step 3: Commit**
```bash
git add backend/app/models.py
git commit -m "feat: add ResearchItem and BidItem models"
```

### Task 2: Data Migration and Table Creation

**Files:**
- Create: `backend/alembic/versions/2026_05_17_research_bid_split.py`
- Create: `backend/scripts/migrate_bids.py`

- [ ] **Step 1: Generate and apply migrations**
Run `alembic revision --autogenerate -m "split items into research and bid"` and review the generated script. Run `alembic upgrade head`.

- [ ] **Step 2: Write data migration script**
Migrate items from the old `items` table to the new `bid_items` table where `is_user_bidding == True` or `status == "won"`.

- [ ] **Step 3: Verify migration**
Check the `bid_items` table count in the DB.

### Task 3: Refactor Services (Research & Bidding)

**Files:**
- Create: `backend/app/services/research_service.py`
- Create: `backend/app/services/bidding_service.py`
- Modify: `backend/app/services/discovery.py` (redirect logic)
- Modify: `backend/app/services/bid_sync.py` (redirect logic)

- [ ] **Step 1: Implement `ResearchService`**
Copy discovery logic from `discovery.py` but target `ResearchItem`. Implement aggressive pruning: `DELETE FROM research_items WHERE end_time < NOW() AND is_watched = False`.

- [ ] **Step 2: Implement `BiddingService`**
Copy sync logic from `bid_sync.py` but target `BidItem`. Use the scraper's `fetch_my_bids` to populate it independently.

- [ ] **Step 3: Update `EnrichmentService` and `ValuationService`**
Ensure they can handle both `ResearchItem` and `BidItem` objects by checking type or using a shared interface.

### Task 4: API Routers

**Files:**
- Create: `backend/app/routers/research.py`
- Create: `backend/app/routers/bidding.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Implement `/api/research` endpoints**
List, watch, archive, comparables (targeting `ResearchItem`).

- [ ] **Step 2: Implement `/api/bidding` endpoints**
List active bids, hide lost bids, and the **"Claim"** handover endpoint.

- [ ] **Step 3: Implement the "Claim" handover logic**
```python
# backend/app/routers/bidding.py

@router.post("/{bid_item_id}/claim")
async def claim_won_bid(bid_item_id: int, db: Session = Depends(get_db)):
    bid_item = db.query(BidItem).filter(BidItem.id == bid_item_id).first()
    if not bid_item or bid_item.user_bid_status != "won":
        raise HTTPException(status_code=400, detail="Item not won or not found")
        
    parent_lot = InventoryParentLot(
        source_item_id=None, # No longer linked to old Item
        title=bid_item.title,
        hammer_price=bid_item.current_bid_amount,
        buyer_premium_pct=bid_item.auction_house.buyer_premium_pct,
        tax_rate=bid_item.auction_house.tax_rate
    )
    db.add(parent_lot)
    db.flush()
    
    inv_item = InventoryItem(
        parent_lot_id=parent_lot.id,
        title=bid_item.title,
        product_name=bid_item.product_name,
        condition=bid_item.condition,
        buy_price=bid_item.current_bid_amount,
        images=bid_item.images,
        status='staged'
    )
    db.add(inv_item)
    db.commit()
    return {"status": "success", "inventory_item_id": inv_item.id}
```

### Task 5: Frontend Refactor

**Files:**
- Modify: `frontend/src/views/ResearchView.tsx`
- Modify: `frontend/src/views/WatchListView.tsx`
- Modify: `frontend/src/views/BiddingView.tsx`

- [ ] **Step 1: Update API calls**
Change base URLs from `/api/items` to `/api/research` or `/api/bidding`.

- [ ] **Step 2: Implement "Claim" button in `BiddingView`**
Only show for items with status "Won". Trigger the `/claim` endpoint.

- [ ] **Step 3: Implement "Hide" button for lost items in `BiddingView`**
Exclude items from the main list if `is_hidden_from_active` is true.

### Task 6: Final Verification & Cleanup

- [ ] **Step 1: Run full ingestion pipeline**
Verify `ResearchItem` is populated.

- [ ] **Step 2: Run bid sync pipeline**
Verify `BidItem` is populated independently.

- [ ] **Step 3: Verify Work Queue transition**
Claim a test won bid and check `WorkQueueView`.

- [ ] **Step 4: Cleanup legacy code**
Remove the old `items` table and `Item` model once migration is confirmed stable.