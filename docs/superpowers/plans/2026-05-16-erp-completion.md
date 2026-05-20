# ERP Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. As the Project Manager, I will orchestrate subagents for these tasks. UI/Frontend tasks MUST be implemented adhering strictly to the `saas` skill design guidelines.

**Goal:** Complete the final remaining requirements for the WorkQueue and ERP PRD: Fulfillment UI wiring, RMA end-to-end integration, Dual Transit Tracking, and the True Net Calculator.

**Architecture:** 
- Frontend modifications to `FulfillmentView.tsx`, `RmaView.tsx`, `WorkQueueView.tsx`, and `StoreView.tsx`.
- Backend modifications to ensure data models support the new fields (anti-tamper tags, local pickup details) and expose necessary endpoints.

**Tech Stack:** FastAPI, SQLAlchemy, React, Tailwind CSS, Vite, TypeScript.

---

### Task 1: Module 2 - True Net ROI Calculator

**Files:**
- Modify: `frontend/src/views/StoreView.tsx`

- [ ] **Step 1: Implement the "Ready to List" Pane True Net Calculator**
In `StoreView.tsx`, under the `ready` tab content, render each item in the `readyItems` array. For each item, add:
1. A number input for "Proposed Listing Price".
2. A dynamic text block that calculates: `[List Price] - [Total COGS] - [Est. eBay Fees (13.5%)] - [Est. Shipping (assume $8 for now if null)] = Projected True Net $`.
3. A "Check Sold Comps" button that opens `https://www.ebay.com/sch/i.html?_nkw=<encoded-title>&LH_Sold=1&LH_Complete=1` in a new tab.
4. A "List Item to eBay" button.

- [ ] **Step 2: Commit**
```bash
git add frontend/src/views/StoreView.tsx
git commit -m "feat: true net roi calculator for ready to list items"
```

### Task 2: Module 1 - Dual Transit Tracking

**Files:**
- Modify: `backend/app/models.py`
- Modify: `backend/app/routers/inventory.py`
- Modify: `frontend/src/views/WorkQueueView.tsx`

- [ ] **Step 1: Update Database Model**
In `backend/app/models.py`, add the following to `InventoryItem`:
```python
    shipping_method = Column(String, default="vendor") # vendor or local
    local_pickup_address = Column(String)
    local_pickup_deadline = Column(DateTime(timezone=True))
```
Note: Ensure Alembic migration is created or for now, just add the columns since we might be re-creating the DB in dev. Actually, for safety, just add the fields and create an alembic revision: `alembic revision --autogenerate -m "Add dual transit tracking fields"` and `alembic upgrade head`.

- [ ] **Step 2: Update WorkQueueView**
In `WorkQueueView.tsx`, when an item is in the `PAID` or `SHIPPED` status, display a toggle for "Awaiting Vendor Shipment" vs "Awaiting Local Pickup". 
- If Vendor: show the Carrier Tracking input (already there).
- If Local Pickup: show an input for Physical Address and a date picker for Pickup Deadline.
Send these updates via `handleUpdateItem`.

- [ ] **Step 3: Commit**
```bash
git add backend/app/models.py backend/app/routers/inventory.py frontend/src/views/WorkQueueView.tsx
# and the alembic migration file
git add backend/alembic/versions/
git commit -m "feat: dual transit tracking for local pickups"
```

### Task 3: Module 1 & 3 - Anti-Tamper RMA Workflow

**Files:**
- Modify: `backend/app/models.py`
- Modify: `frontend/src/views/WorkQueueView.tsx`
- Modify: `frontend/src/views/RmaView.tsx`
- Modify: `backend/app/routers/inventory.py`

- [ ] **Step 1: Add Anti-Tamper Tag to Model**
In `backend/app/models.py`, add `anti_tamper_tag = Column(String)` to `InventoryItem`. Create an Alembic migration and run it.

- [ ] **Step 2: Staging Input (WorkQueueView)**
In `WorkQueueView.tsx`, for the `STAGING` status, add an input field for "Anti-Tamper Barcode Tag". Send the update via `handleUpdateItem`.

- [ ] **Step 3: RMA Fetching (RmaView)**
Update `RmaView.tsx` to fetch a specific item's details (using a mock ID or passed prop/url param, e.g., `/api/inventory/1`) to display the actual `anti_tamper_tag` instead of the placeholder "XYZ-123".

- [ ] **Step 4: Commit**
```bash
git add backend/app/models.py backend/app/routers/inventory.py frontend/src/views/WorkQueueView.tsx frontend/src/views/RmaView.tsx
git add backend/alembic/versions/
git commit -m "feat: end-to-end anti-tamper rma workflow"
```

### Task 4: Module 3 - Fulfillment Reconciliation Modal

**Files:**
- Modify: `frontend/src/views/FulfillmentView.tsx`

- [ ] **Step 1: Implement Reconciliation Modal**
In `FulfillmentView.tsx`, clicking "Reconcile & Archive" should open a modal prompting for:
1. Actual Final eBay Fees ($)
2. Actual Shipping Cost ($)
Upon clicking "Confirm", send a POST request to `/api/inventory/{id}/reconcile` (which was built previously). Once successful, remove the item from the local state array.

- [ ] **Step 2: Commit**
```bash
git add frontend/src/views/FulfillmentView.tsx
git commit -m "feat: fulfillment reconciliation modal UI"
```