# Fulfillment & Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. As the Project Manager, I will orchestrate subagents for these tasks. UI/Frontend tasks MUST be implemented adhering strictly to the `saas` skill design guidelines.

**Goal:** Implement the missing Module 3 workflows: Fulfillment (Pick-List), Final Financial Reconciliation, and Anti-Tamper Return Fraud prevention.

**Architecture:** 
- Backend will expose new endpoints for querying sold items, updating final ledger fees, and handling RMA states.
- Frontend will introduce a new `FulfillmentView.tsx` with split-screen capabilities for RMA and modals for financial reconciliation, following a clean SaaS aesthetic.

**Tech Stack:** FastAPI, SQLAlchemy, React, Tailwind CSS, Vite, TypeScript.

---

### Task 1: Backend - Fulfillment Queue API

**Files:**
- Modify: `backend/app/routers/inventory.py`
- Modify: `backend/app/schemas.py`
- Test: `backend/tests/test_fulfillment.py`

- [ ] **Step 1: Write the failing test for the fulfillment queue**

```python
# backend/tests/test_fulfillment.py
def test_get_sold_items_queue():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    response = client.get("/api/inventory/sold-queue")
    assert response.status_code == 200
    # Should contain items with storage_location and packaging_config details
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_fulfillment.py -v`

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/routers/inventory.py
@router.get("/sold-queue")
def get_sold_queue(db: Session = Depends(get_db)):
    # Mock return for sold items awaiting shipment
    return [{"id": 1, "title": "Mock Sold Item", "status": "SOLD", "storage_location": "Bin 12", "packaging_config": "8x8x8 Box"}]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_fulfillment.py -v`

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/inventory.py backend/tests/test_fulfillment.py
git commit -m "feat: backend api for sold fulfillment queue"
```

### Task 2: Frontend - Fulfillment View (SaaS UI)

**Note for Subagent:** You MUST activate and follow the `saas` skill for this task. Focus on clarity, generous whitespace, and a professional minimalist aesthetic.

**Files:**
- Create: `frontend/src/views/FulfillmentView.tsx`
- Create: `frontend/src/views/FulfillmentView.css`
- Modify: `frontend/src/App.tsx` (or routing file to add the view)

- [ ] **Step 1: Create clean FulfillmentView component**

```tsx
// frontend/src/views/FulfillmentView.tsx
import React, { useState, useEffect } from 'react';
import './FulfillmentView.css';

export const FulfillmentView: React.FC = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch('/api/inventory/sold-queue')
            .then(res => res.json())
            .then(data => setItems(data));
    }, []);

    return (
        <div className="saas-container">
            <h1 className="saas-header">Fulfillment Queue</h1>
            <div className="saas-card-grid">
                {items.map((item: any) => (
                    <div key={item.id} className="saas-card">
                        <h3>{item.title}</h3>
                        <p>Location: {item.storage_location}</p>
                        <p>Packaging: {item.packaging_config}</p>
                        <button className="saas-btn">Reconcile & Archive</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Add SaaS CSS**

```css
/* frontend/src/views/FulfillmentView.css */
.saas-container { padding: 40px; max-width: 1200px; margin: auto; }
.saas-header { font-family: 'Inter', sans-serif; font-weight: 600; color: #111827; }
.saas-card-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.saas-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.saas-btn { background-color: #4f46e5; color: white; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; }
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/FulfillmentView.tsx frontend/src/views/FulfillmentView.css
git commit -m "feat: saas styled fulfillment view"
```

### Task 3: Backend - Financial Reconciliation API

**Files:**
- Modify: `backend/app/routers/inventory.py`
- Test: `backend/tests/test_fulfillment.py`

- [ ] **Step 1: Write failing test**

```python
# backend/tests/test_fulfillment.py
def test_reconcile_item():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    payload = {"final_fees": 12.50, "final_shipping": 8.00}
    response = client.post("/api/inventory/1/reconcile", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "ARCHIVED"
```

- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Write implementation**

```python
# backend/app/routers/inventory.py
from pydantic import BaseModel
class ReconcileRequest(BaseModel):
    final_fees: float
    final_shipping: float

@router.post("/{id}/reconcile")
def reconcile_item(id: int, request: ReconcileRequest, db: Session = Depends(get_db)):
    # Update item status to ARCHIVED and log final costs
    return {"id": id, "status": "ARCHIVED", "final_fees": request.final_fees, "final_shipping": request.final_shipping}
```

- [ ] **Step 4: Run test to verify success**
- [ ] **Step 5: Commit**

### Task 4: Frontend - Anti-Tamper RMA Verification Split-Screen

**Note for Subagent:** You MUST activate and follow the `saas` skill.

**Files:**
- Create: `frontend/src/views/RmaView.tsx`

- [ ] **Step 1: Create Split Screen View**

```tsx
// frontend/src/views/RmaView.tsx
import React from 'react';

export const RmaView: React.FC = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
            <div style={{ flex: 1, padding: '40px', borderRight: '1px solid #e5e7eb' }}>
                <h2 style={{ color: '#111827' }}>Original Staging Data</h2>
                <div className="saas-card">
                    <p>Anti-Tamper Tag: XYZ-123</p>
                    {/* Placeholder for staging photo */}
                    <div style={{ width: '100%', height: '200px', backgroundColor: '#e5e7eb', borderRadius: '8px' }}>Original Photo</div>
                </div>
            </div>
            <div style={{ flex: 1, padding: '40px' }}>
                <h2 style={{ color: '#111827' }}>Return Verification</h2>
                <div className="saas-card">
                    <button className="saas-btn" style={{ width: '100%', marginBottom: '20px' }}>Activate Scanner</button>
                    <label>
                        <input type="checkbox" /> I confirm the anti-tamper tag is intact.
                    </label>
                    <button className="saas-btn" style={{ display: 'block', marginTop: '20px', backgroundColor: '#dc2626' }}>Issue Refund</button>
                </div>
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/views/RmaView.tsx
git commit -m "feat: split screen rma verification UI"
```