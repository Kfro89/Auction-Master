# Phase 3 - Automatic Valuation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate eBay valuation using a local LLM for keyword extraction and a background scheduler for priority-based processing.

**Architecture:** 
1. **LLM Service:** Extracts clean product names from auction titles via a local LM Studio instance.
2. **Background Worker:** Uses `APScheduler` to process items ending soonest that lack valuations.
3. **eBay Client:** Uses real credentials to fetch market data and computes arbitrage scores.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, APScheduler, OpenAI-compatible API (LM Studio), eBay Browse API.

---

### Task 1: Environment Configuration

**Files:**
- Create: `.env` (in root)
- Modify: `backend/app/routers/admin.py` (to use env vars)

- [ ] **Step 1: Create `.env` in root with real credentials**

Create `.env` in the project root:
```env
EBAY_CLIENT_ID=your_ebay_client_id_here
EBAY_CLIENT_SECRET=your_ebay_client_secret_here
LLM_BASE_URL=http://192.168.0.63:1234/v1
```

- [ ] **Step 2: Update `admin.py` to use environment variables**

```python
# backend/app/routers/admin.py
client_id = os.environ.get("EBAY_CLIENT_ID")
client_secret = os.environ.get("EBAY_CLIENT_SECRET")
```

- [ ] **Step 3: Commit**
```bash
git add backend/app/routers/admin.py
git commit -m "feat(config): use real eBay credentials from environment"
```

---

### Task 2: LLM Keyword Extraction Service

**Files:**
- Create: `backend/app/services/llm.py`
- Create: `backend/tests/test_llm.py`

- [ ] **Step 1: Write failing test**
```python
# backend/tests/test_llm.py
import pytest
from app.services.llm import extract_product_name

@pytest.mark.asyncio
async def test_extract_product_name(httpx_mock):
    httpx_mock.add_response(
        url="http://192.168.0.63:1234/v1/chat/completions",
        json={"choices": [{"message": {"content": "Grizzly G0602 Lathe"}}]}
    )
    name = await extract_product_name("Lot 123 - Huge Grizzly G0602 Metal Lathe, Cheyenne Estate")
    assert name == "Grizzly G0602 Lathe"
```

- [ ] **Step 2: Run test to verify failure**
Run: `docker compose exec backend bash -c "PYTHONPATH=. pytest tests/test_llm.py"`

- [ ] **Step 3: Implement `extract_product_name`**
```python
# backend/app/services/llm.py
import os
import httpx
import logging

logger = logging.getLogger(__name__)

async def extract_product_name(title: str) -> str:
    base_url = os.getenv("LLM_BASE_URL", "http://localhost:1234/v1")
    prompt = f"Extract only the core product name and model number from this auction title, removing all auction-specific noise (lot numbers, locations, adjectives like 'Huge'). Title: {title}"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                json={
                    "model": "local-model",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1
                }
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()
            # Remove quotes if LLM added them
            return content.strip('"').strip("'")
    except Exception as e:
        logger.error(f"LLM extraction failed: {e}")
        return title[:50] # Fallback
```

- [ ] **Step 4: Verify test passes**
Run: `docker compose exec backend bash -c "PYTHONPATH=. pytest tests/test_llm.py"`

- [ ] **Step 5: Commit**
```bash
git add backend/app/services/llm.py backend/tests/test_llm.py
git commit -m "feat(llm): add product name extraction service"
```

---

### Task 3: Background Valuation Worker

**Files:**
- Create: `backend/app/services/valuation_worker.py`
- Modify: `backend/app/main.py` (to start scheduler)

- [ ] **Step 1: Implement the worker logic**
Create `backend/app/services/valuation_worker.py` with a function `process_pending_valuations(db: Session)`.
It should:
1. Query 5 items: `db.query(Item).filter(Item.id.notin_(db.query(Valuation.item_id))).order_by(Item.end_time.asc()).limit(5)`.
2. For each item:
   - Call `extract_product_name(item.title)`.
   - Call existing `valuate_item` logic (or refactor shared logic).
   - Save `Valuation`.

- [ ] **Step 2: Configure APScheduler in `main.py`**
```python
# backend/app/main.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .services.valuation_worker import process_pending_valuations
from .database import SessionLocal

@app.on_event("startup")
async def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(lambda: process_pending_valuations(SessionLocal()), "interval", seconds=60)
    scheduler.start()
```

- [ ] **Step 3: Manual Verification**
1. Check logs: `docker compose logs -f backend`.
2. Observe "Processing auction item..." logs every minute.
3. Verify DB: `SELECT count(*) FROM valuations;`.

- [ ] **Step 4: Commit**
```bash
git add backend/app/services/valuation_worker.py backend/app/main.py
git commit -m "feat(worker): implement background valuation worker with priority queue"
```

---

### Task 4: Frontend Visualization

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add Valuation columns to the table**
Display `est_market_value` and `max_bid_for_target_roi`.

- [ ] **Step 2: Add "Arbitrage Score" styling**
Highlight items where `max_bid_for_target_roi` is significantly higher than `current_bid`.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/App.tsx
git commit -m "feat(ui): display market value and arbitrage recommendations"
```
