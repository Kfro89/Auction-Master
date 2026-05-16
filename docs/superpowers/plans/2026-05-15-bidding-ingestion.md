# Bidding Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the ingestion engine (scrapers and active-bid refresh logic) to extract user proxy bids and statuses and persist them to the new `UserBidActivity` database table.
**Architecture:** Enhance scraper returns to include proxy and bid info where possible. Update `/refresh-active-bids` in `routers/admin.py` to upsert records into `UserBidActivity` instead of just toggling `Item.is_user_bidding`.
**Tech Stack:** Python, FastAPI, SQLAlchemy, BeautifulSoup4.

---

### Task 1: Update Admin Router to Populate UserBidActivity

**Files:**
- Modify: `backend/app/routers/admin.py`

- [ ] **Step 1: Write the update logic for Auctioneer Software**
  In `refresh_active_bids` around line 370 (under `AuctioneerSoftwareScraper`), when checking if the user is bidding (`lot.get('isHighBidder')` or `high_bidder_id == user_bidder_id`), also extract proxy and current bids to create/update `UserBidActivity`.

  ```python
  from ..models import UserBidActivity
  
  # Inside the lot loop in admin.py for AuctioneerSoftware:
  is_bidding = False
  if lot.get('isHighBidder') is True:
      is_bidding = True
  else:
      high_bidder_id = str(lot.get('highBidderId') or lot.get('high_bidder_id', ''))
      if high_bidder_id in user_bidder_ids:
          is_bidding = True
          
  current_bid = float(lot.get('winning_bid_amount') or lot.get('starting_bid') or lot.get('price') or lot.get('required_bid') or 0.0)
  
  if item.is_user_bidding != is_bidding or item.current_bid != current_bid:
      item.is_user_bidding = is_bidding
      item.current_bid = current_bid
      updated += 1
  
  if is_bidding:
      # Try to extract proxy and user bid amounts (Whitley/Roller format)
      proxy = float(lot.get('my_max_proxy') or lot.get('my_max_bid') or current_bid)
      status = "winning" if (lot.get('isHighBidder') is True or str(lot.get('highBidderId')) in user_bidder_ids) else "outbid"
      
      bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
      if not bid_activity:
          bid_activity = UserBidActivity(item_id=item.id)
          db.add(bid_activity)
      
      bid_activity.current_bid_amount = current_bid
      bid_activity.user_proxy_bid = proxy
      bid_activity.user_bid_amount = proxy # Or actual if available separately
      bid_activity.user_bid_status = status
  ```

- [ ] **Step 2: Write the update logic for Public Surplus and Dickensheet**
  In `refresh_active_bids` (around line 400 for Public Surplus and 440 for Dickensheet):
  For Public Surplus, `my_bid_ids` currently only contains the IDs. Create dummy activities for now:
  ```python
  if is_bidding:
      bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
      if not bid_activity:
          bid_activity = UserBidActivity(item_id=item.id)
          db.add(bid_activity)
      bid_activity.current_bid_amount = item.current_bid
      bid_activity.user_proxy_bid = item.current_bid # Fallback since API lacks it
      bid_activity.user_bid_amount = item.current_bid
      bid_activity.user_bid_status = "winning" # Default optimistic assumption
  ```
  *(Note: A future task will involve logging into PS and extracting the proxy bids via beautifulsoup, but this wires up the database first so the dashboard doesn't crash/show blanks)*.

  Do the same for Dickensheet:
  ```python
  if is_bidding:
      bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
      if not bid_activity:
          bid_activity = UserBidActivity(item_id=item.id)
          db.add(bid_activity)
      bid_activity.current_bid_amount = current_bid
      bid_activity.user_proxy_bid = float(lot.get('max_bid') or current_bid)
      bid_activity.user_bid_amount = float(lot.get('max_bid') or current_bid)
      bid_activity.user_bid_status = "winning" if is_bidding else "outbid"
  ```

- [ ] **Step 3: Run test to verify it compiles**
  Run: `cd backend && pytest tests/test_items.py`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run: `git add backend/app/routers/admin.py`
  Run: `git commit -m "feat: populate UserBidActivity during refresh_active_bids"`
