# Archive Lost Auctions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement archival for lost auctions to declutter the Bidding View and ensure titles wrap correctly.

**Architecture:** Use a boolean flag `is_archived` on the `Item` model. Update the backend to filter items by this flag and the frontend to provide archival controls and view toggles. Fix CSS for title wrapping.

**Tech Stack:** Python (FastAPI, SQLAlchemy, Alembic), React (TypeScript, Tailwind).

---

### Task 1: Database Migration

**Files:**
- Modify: `backend/app/models.py`
- Create: `backend/app/alembic/versions/<timestamp>_add_is_archived_to_items.py`

- [ ] **Step 1: Add `is_archived` to `Item` model**
Modify `backend/app/models.py` to add the column.
```python
class Item(Base):
    # ... existing columns ...
    is_user_bidding = Column(Boolean, default=False)
    is_watched = Column(Boolean, default=False, server_default='false')
    is_archived = Column(Boolean, default=False, server_default='false') # Add this
```

- [ ] **Step 2: Generate migration**
Run: `cd backend && alembic revision --autogenerate -m "add is_archived to items"`

- [ ] **Step 3: Apply migration**
Run: `cd backend && alembic upgrade head`

- [ ] **Step 4: Verify migration**
Run: `psql -h localhost -p 5434 -U postgres -d postgres -c "\d items"` (or check logs)
Expected: `is_archived` column exists.

- [ ] **Step 5: Commit**
```bash
git add backend/app/models.py backend/app/alembic/versions/
git commit -m "db: add is_archived column to items table"
```

---

### Task 2: Backend API Updates

**Files:**
- Modify: `backend/app/routers/items.py`

- [ ] **Step 1: Update `serialize_item`**
Include `is_archived` in the dictionary.
```python
def serialize_item(item: Item) -> dict:
    # ...
    item_dict = {
        # ...
        "is_watched": getattr(item, 'is_watched', False),
        "is_user_bidding": getattr(item, 'is_user_bidding', False),
        "is_archived": getattr(item, 'is_archived', False), # Add this
        # ...
    }
    return item_dict
```

- [ ] **Step 2: Update `list_items` to support filtering**
Add `show_archived` query parameter.
```python
@router.get("/")
async def list_items(
    show_archived: bool = False, # Add this
    db: Session = Depends(get_db), 
    current_user: str = Depends(get_current_user)
):
    from sqlalchemy.sql import func
    query = db.query(Item).options(
        joinedload(Item.valuation).joinedload(Valuation.sample_cache).joinedload(EbaySampleCache.valuation_detail), 
        joinedload(Item.auction_house),
        joinedload(Item.user_bids)
    )
    
    # Filter by archived status
    if not show_archived:
        query = query.filter(Item.is_archived == False)
    
    items = query.filter(
        (Item.end_time >= func.now()) | (Item.end_time.is_(None)) | (Item.is_user_bidding == True)
    ).order_by(Item.end_time.asc()).all()
    return [serialize_item(item) for item in items]
```

- [ ] **Step 3: Add `archive_item` endpoint**
```python
class ArchiveRequest(BaseModel):
    is_archived: bool

@router.patch("/{item_id}/archive")
async def archive_item(
    item_id: int,
    archive_req: ArchiveRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_archived = archive_req.is_archived
    db.commit()
    db.refresh(item)
    
    return serialize_item(item)
```

- [ ] **Step 4: Verify with `curl`**
Run: `curl -X PATCH http://localhost:8000/api/items/1/archive -H "Content-Type: application/json" -d '{"is_archived": true}'`
Expected: Success response with `is_archived: true`.

- [ ] **Step 5: Commit**
```bash
git add backend/app/routers/items.py
git commit -m "feat: add archive item endpoint and filter list_items"
```

---

### Task 3: Frontend - Title Wrapping Fix

**Files:**
- Modify: `frontend/src/views/BiddingView.tsx`

- [ ] **Step 1: Remove truncation classes**
Find the title cell and update the span.
```tsx
// Before
<td className="title-cell">
  <span className="truncate max-w-[300px]" title={item.title}>{item.title}</span>
</td>

// After
<td className="title-cell">
  <span className="whitespace-normal break-words" title={item.title}>{item.title}</span>
</td>
```

- [ ] **Step 2: Verify visually (if possible) or check classes**
Expected: Titles should no longer have `truncate` or `max-w-[300px]`.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/views/BiddingView.tsx
git commit -m "fix: enable title text wrapping in bidding view"
```

---

### Task 4: Frontend - Archive Functionality & KPI Update

**Files:**
- Modify: `frontend/src/views/BiddingView.tsx`

- [ ] **Step 1: Add `showArchived` state and archive handler**
```tsx
const [showArchived, setShowArchived] = useState(false);

const handleArchive = async (id: number, isArchived: boolean) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/items/${id}/archive`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_archived: isArchived })
    });
    if (response.ok) {
      await fetchItems();
    }
  } catch (e) {
    console.error('Failed to archive item:', e);
  }
};
```

- [ ] **Step 2: Update `fetchItems` to pass `show_archived`**
```tsx
const fetchItems = async () => {
  try {
    const response = await fetch(`/api/items/?show_archived=${showArchived}`);
    if (response.ok) {
      const data = await response.json();
      setItems(data.filter((item: Item) => item.is_user_bidding));
    }
  } catch (error) {
    console.error('Failed to fetch bidding items:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchItems();
}, [showArchived]);
```

- [ ] **Step 3: Update KPI calculations to skip archived items**
```tsx
const { totalCurrentBids, totalUserBids, totalMaxExposure } = useMemo(() => {
  let tCurrent = 0;
  let tUser = 0;
  let tExposure = 0;
  items.forEach(item => {
    if (item.user_bids && !item.is_archived) { // Add !item.is_archived
      tCurrent += item.user_bids.current_bid_amount || 0;
      tUser += item.user_bids.user_bid_amount || 0; 
      tExposure += item.user_bids.user_proxy_bid || 0;
    }
  });
  return { totalCurrentBids: tCurrent, totalUserBids: tUser, totalMaxExposure: tExposure };
}, [items]);
```

- [ ] **Step 4: Add Archive button to table row**
Only show if item is "lost".
```tsx
<td className="text-center">
  {item.user_bids?.user_bid_status === 'lost' && (
    <button 
      onClick={(e) => { e.stopPropagation(); handleArchive(item.id, true); }}
      className="p-1 hover:text-red-500 transition-colors"
      title="Archive"
    >
      <Archive size={16} />
    </button>
  )}
  {item.is_archived && (
     <button 
      onClick={(e) => { e.stopPropagation(); handleArchive(item.id, false); }}
      className="p-1 hover:text-green-500 transition-colors"
      title="Unarchive"
    >
      <RotateCcw size={16} />
    </button>
  )}
</td>
```

- [ ] **Step 5: Add toggle to `FilterBar`**
```tsx
<button 
  className={`action-btn ${showArchived ? 'active' : ''}`}
  onClick={() => setShowArchived(!showArchived)}
>
  {showArchived ? 'Hide Archived' : 'Show Archived'}
</button>
```

- [ ] **Step 6: Commit**
```bash
git add frontend/src/views/BiddingView.tsx
git commit -m "feat: implement archive toggle and functional archive button"
```
