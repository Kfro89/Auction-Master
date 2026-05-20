# AI Enrichment Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Diagnose and fix the failure of AI enrichment requests during the "Update Bids" workflow.

**Architecture:** Use remote log analysis to distinguish between logic bypasses and network connectivity issues, then apply targeted fixes to `bid_sync.py` or `.env` configuration.

**Tech Stack:** Python (FastAPI), Docker, Expect scripts for remote SSH, local LLM server (Gemma).

---

### Task 1: Remote Log Analysis

**Files:**
- Test: `backend/check_logs.exp`

- [ ] **Step 1: Search remote logs for enrichment attempts**
  Run: `./backend/check_logs.exp | grep "BidSync: Running inline LLM extraction"`
  Expected: Output showing attempts for specific item IDs.

- [ ] **Step 2: Determine root cause from logs**
  - If output exists: The logic is working, but the network request is likely failing silently or hitting the wrong host. Proceed to Task 3.
  - If no output exists: The items are bypassing the trigger logic. Proceed to Task 2.

---

### Task 2: Fix Trigger Logic (Conditional)

**Files:**
- Modify: `backend/app/services/bid_sync.py`

- [ ] **Step 1: Relax `should_extract` conditions**
  If items already have a `product_name` that is "good enough" according to the current heuristic but the user wants them re-enriched, update the logic.
  
  ```python
  # backend/app/services/bid_sync.py
  # Old:
  should_extract = not item.product_name or item.product_name == item.title
  # New (Example):
  should_extract = not item.product_name or item.product_name == item.title or "lot" in item.product_name.lower()
  ```

- [ ] **Step 2: Sync and deploy changes**
  Run: `./backend/deploy_rsync.exp && ./backend/deploy.exp`

---

### Task 3: Fix Network Configuration (Conditional)

**Files:**
- Modify: `.env` (Remote)

- [ ] **Step 1: Identify local IP of Mac laptop**
  Run: `ifconfig | grep "inet " | grep -v 127.0.0.1`

- [ ] **Step 2: Update `LLM_BASE_URL` on remote host**
  Update `.env` on `192.168.0.16` to use the Mac's IP instead of `localhost`.
  Example: `LLM_BASE_URL=http://192.168.0.100:1234/v1`

- [ ] **Step 3: Rebuild containers**
  Run: `./backend/deploy.exp`

---

### Task 4: End-to-End Verification

- [ ] **Step 1: Trigger Update Bids from UI**
  Click "Update Bids" in the Bidding View.

- [ ] **Step 2: Monitor LLM Server**
  Confirm requests are received in the LLM server logs/monitor.

- [ ] **Step 3: Verify Data in UI**
  Refresh the Bidding View and confirm `product_name` and `tags` are updated for active bids.
