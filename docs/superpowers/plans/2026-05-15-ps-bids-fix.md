# Public Surplus Bids Ingestion Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure Public Surplus items that the user is actively bidding on are automatically inserted into the database and their proxy bids/statuses are tracked, even if the general ingestion hasn't discovered them.
**Architecture:** Update `fetch_my_bids` in `PublicSurplusScraper` to return a list of dictionaries with extracted table data (ID, title, current bid, proxy bid) instead of just string IDs. Update `/refresh-active-bids` in `routers/admin.py` to upsert these missing items into the `Item` table, and appropriately update `UserBidActivity`.
**Tech Stack:** Python, FastAPI, SQLAlchemy, BeautifulSoup4.

---

### Task 1: Update Public Surplus Scraper

**Files:**
- Modify: `backend/app/scrapers/public_surplus.py`

- [ ] **Step 1: Update fetch_my_bids method**
  In `PublicSurplusScraper.fetch_my_bids`, instead of returning just the IDs, parse the table `<tbody>` rows to extract all bidding data. Note the cookie string must be stripped to prevent `LocalProtocolError`.

  ```python
      async def fetch_my_bids(self) -> List[Dict[str, Any]]:
          if "Cookie" not in self.headers:
              raise PermissionError("No session cookie set. Call login() first.")
              
          url = f"{self.base_url}/sms/mys/bids?tm=m"
          
          async with httpx.AsyncClient(headers=self.headers, timeout=15.0, follow_redirects=True) as client:
              try:
                  response = await client.get(url)
                  if response.status_code in (401, 403):
                      raise PermissionError(f"Public Surplus session expired or invalid (HTTP {response.status_code})")
                  response.raise_for_status()
                  soup = BeautifulSoup(response.text, "html.parser")
                  
                  bidding_data = []
                  table = soup.find('table', {'class': 'table'})
                  if not table:
                      return []
                      
                  tbody = table.find('tbody')
                  if not tbody:
                      return []
                      
                  rows = tbody.find_all('tr')
                  for row in rows:
                      cols = row.find_all('td')
                      if len(cols) >= 8:
                          auc_id = cols[0].get_text(strip=True)
                          title_tag = cols[1].find('a')
                          title = title_tag.get_text(strip=True) if title_tag else "Unknown Title"
                          end_date = cols[3].get_text(strip=True)
                          
                          # Price columns might have a hidden percentage column before them, so use index carefully.
                          # Based on html dump:
                          # td[5] = Final Price (Current Bid)
                          # td[6] = Bid (User's Bid)
                          # td[7] = Proxy Bid (User's Proxy)
                          
                          def parse_price(text):
                              cleaned = text.replace('$', '').replace(',', '').strip()
                              try:
                                  return float(cleaned)
                              except ValueError:
                                  return 0.0
                                  
                          current_bid = parse_price(cols[5].get_text())
                          user_bid = parse_price(cols[6].get_text())
                          proxy_bid = parse_price(cols[7].get_text())
                          
                          # The item is on this page, so it's active. If it was outbid, it might still show up.
                          # The exact outbid status might require checking CSS, but for now we track the proxy
                          
                          bidding_data.append({
                              "id": auc_id,
                              "title": title,
                              "end_time": end_date,
                              "current_bid": current_bid,
                              "user_bid": user_bid,
                              "proxy_bid": proxy_bid
                          })
                          
                  return bidding_data
              except PermissionError:
                  raise
              except Exception as e:
                  logger.error(f"Error fetching Public Surplus my bids: {e}")
                  raise
  ```

- [ ] **Step 2: Update the mock in tests**
  If `tests/test_ps.py` or similar tests mock `fetch_my_bids`, ensure they are updated to return dictionaries.

- [ ] **Step 3: Commit**
  Run: `git add backend/app/scrapers/public_surplus.py`
  Run: `git commit -m "feat: parse detailed table data in public surplus my bids"`


### Task 2: Update Admin Router to Upsert Missing PS Items

**Files:**
- Modify: `backend/app/routers/admin.py`

- [ ] **Step 1: Update Public Surplus refresh block**
  In `backend/app/routers/admin.py`, replace the old `my_bid_ids` logic in the Public Surplus block with logic that upserts the `Item` if it's missing, and updates the `UserBidActivity` with the new detailed data.

  ```python
                  my_bids_data = await scraper.fetch_my_bids()
                  my_bid_ids = [b["id"] for b in my_bids_data]
                  
                  house = db.query(AuctionHouse).filter(AuctionHouse.website_key == "public_surplus").first()
                  if house:
                      # 1. First, set is_user_bidding=False for items no longer on the dashboard
                      ps_items = db.query(Item).filter(Item.auction_house_id == house.id).all()
                      updated = 0
                      for item in ps_items:
                          is_winning = item.external_id in my_bid_ids
                          bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
                          has_bid = is_winning or (bid_activity is not None)
                          
                          if item.is_user_bidding != has_bid:
                              item.is_user_bidding = has_bid
                              updated += 1
                              
                          if has_bid and not is_winning and bid_activity:
                              bid_activity.user_bid_status = "outbid"
                      
                      # 2. Next, process the items from the dashboard
                      from datetime import datetime, timedelta, timezone
                      for bid_data in my_bids_data:
                          item = db.query(Item).filter(Item.external_id == bid_data["id"], Item.auction_house_id == house.id).first()
                          
                          if not item:
                              # Upsert the missing item
                              item = Item(
                                  external_id=bid_data["id"],
                                  title=bid_data["title"],
                                  description="Public Surplus Item",
                                  lot_number=bid_data["id"],
                                  auction_house_id=house.id,
                                  current_bid=bid_data["current_bid"],
                                  end_time=datetime.now(timezone.utc) + timedelta(days=7), # Placeholder
                                  status="open",
                                  url=f"https://www.publicsurplus.com/sms/auction/view?auc={bid_data['id']}",
                                  is_user_bidding=True
                              )
                              db.add(item)
                              db.flush() # Get the new item.id
                              updated += 1
                          else:
                              item.current_bid = bid_data["current_bid"]
                              if not item.is_user_bidding:
                                  item.is_user_bidding = True
                                  updated += 1
                          
                          # Update the Bid Activity
                          bid_activity = db.query(UserBidActivity).filter(UserBidActivity.item_id == item.id).first()
                          if not bid_activity:
                              bid_activity = UserBidActivity(item_id=item.id)
                              db.add(bid_activity)
                              
                          bid_activity.current_bid_amount = bid_data["current_bid"]
                          bid_activity.user_proxy_bid = bid_data["proxy_bid"] or bid_data["current_bid"]
                          bid_activity.user_bid_amount = bid_data["user_bid"] or bid_data["current_bid"]
                          
                          # Check if outbid: User's proxy might be less than current bid, but on PS dashboard, 
                          # usually if it's here and proxy >= current bid, you're winning
                          if bid_activity.user_proxy_bid < bid_activity.current_bid_amount:
                              bid_activity.user_bid_status = "outbid"
                          else:
                              bid_activity.user_bid_status = "winning"

                      db.commit()
                      results["public_surplus"] = {"status": "success", "updated": updated, "active_bids_found": len(my_bids_data)}
  ```

- [ ] **Step 2: Run tests**
  Run: `cd backend && pytest tests/test_items.py`
  Expected: PASS

- [ ] **Step 3: Commit**
  Run: `git add backend/app/routers/admin.py`
  Run: `git commit -m "fix(ingestion): upsert missing public surplus items and parse proxies"`