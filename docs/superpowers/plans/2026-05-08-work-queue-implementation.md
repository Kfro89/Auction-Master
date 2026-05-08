# Phase 5: Work Queue & Inventory Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the inventory staging workflow, including barcode scanning, AI-powered listing drafts, and photo management.

**Architecture:** A new `InventoryItem` model tracks items from scan to listing. The Work Queue view provides a multi-step staging interface (mobile-friendly scanning and desktop-heavy drafting). A specialized AI service connects to the local LLM for generating SEO-optimized eBay content.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, React 18, TypeScript, Vanilla CSS.

---

### Task 1: Backend Inventory & Work Queue API

**Files:**
- Modify: `backend/app/models.py`
- Create: `backend/app/routers/inventory.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Update models.py with InventoryItem**
Add the `InventoryItem` model to track staged items.

```python
class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, index=True)
    title = Column(String)
    drafted_title = Column(String)
    drafted_description = Column(String)
    ebay_category_id = Column(String)
    buy_price = Column(Float)
    estimated_price = Column(Float)
    images = Column(JSON, default=list) # List of local paths/URLs
    status = Column(String, default="staged") # staged, drafting, reviewed, listed
    created_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 2: Generate and apply migration**
Run: `docker compose exec backend alembic revision --autogenerate -m "Add inventory items model"`
Run: `docker compose exec backend alembic upgrade head`

- [ ] **Step 3: Create inventory router**
Implement `GET /api/inventory/` and `POST /api/inventory/scan` (handles barcode lookup via eBay).

- [ ] **Step 4: Commit**

```bash
git add backend/app/models.py backend/app/routers/inventory.py
git commit -m "feat(inventory): add inventory model and basic API"
```

---

### Task 2: AI Drafting Service (LLM Integration)

**Files:**
- Create: `backend/app/services/drafting.py`
- Modify: `backend/app/routers/inventory.py`

- [ ] **Step 1: Implement drafting service**
Create a service that uses the local LLM to generate titles and descriptions based on product names.

```python
async def generate_ebay_draft(product_name: str) -> dict:
    # prompt local LLM for title (max 80 chars) and description
    # return { "title": "...", "description": "..." }
```

- [ ] **Step 2: Add draft endpoint**
Add `POST /api/inventory/{id}/draft` to trigger the AI generation.

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/drafting.py
git commit -m "feat(inventory): implement AI drafting service"
```

---

### Task 4: Frontend Work Queue UI

**Files:**
- Create: `frontend/src/views/WorkQueueView.tsx`
- Create: `frontend/src/views/WorkQueueView.css`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create WorkQueueView**
Implement the staging UI with:
- Barcode input (text field for USB scanners, with mobile camera toggle placeholder).
- List of staged items with status badges.
- Detail view for "Drafting" (showing AI results and photo upload zone).

- [ ] **Step 2: Implement Photo Upload (Simulated)**
Add a file input that stores "blob" URLs in the local state/DB for now.

- [ ] **Step 3: Integrate into App shell**
Update `App.tsx` to render `WorkQueueView` in the 'work-queue' tab.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/WorkQueueView.tsx frontend/src/views/WorkQueueView.css
git commit -m "feat(frontend): implement Work Queue staging UI"
```
