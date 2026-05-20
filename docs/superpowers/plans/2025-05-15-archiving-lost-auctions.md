# Archiving Lost Auctions Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Backend API to support archiving items, serializing the archive status, and filtering by it.

**Architecture:** Extend the existing `items` router with a new archiving endpoint and update serialization and listing logic.

**Tech Stack:** Python, FastAPI, SQLAlchemy, Pydantic

---

### Task 1: Update Item Serialization

**Files:**
- Modify: `backend/app/routers/items.py`

- [ ] **Step 1: Update `serialize_item` function**
Modify `serialize_item` to include `"is_archived": getattr(item, 'is_archived', False)` in the dictionary.

```python
def serialize_item(item: Item) -> dict:
    # ... existing code ...
    item_dict = {
        # ...
        "is_user_bidding": getattr(item, 'is_user_bidding', False),
        "is_archived": getattr(item, 'is_archived', False),  # Add this
        "vin": getattr(item, 'vin', None),
        # ...
    }
    # ...
```

- [ ] **Step 2: Verify serialization (Manual check or wait for TDD)**

### Task 2: Support Filtering in `list_items`

**Files:**
- Modify: `backend/app/routers/items.py`

- [ ] **Step 1: Update `list_items` function signature**
Add `show_archived: bool = False` as a query parameter.

- [ ] **Step 2: Update query logic**
Filter out archived items if `show_archived` is `False`.

```python
@router.get("/", response_model=List[dict])
def list_items(
    # ... existing params ...
    show_archived: bool = False,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    query = db.query(Item).options(joinedload(Item.auction_house), joinedload(Item.valuation))
    
    # ... existing filters ...

    if not show_archived:
        query = query.filter(Item.is_archived == False)

    # ...
```

### Task 3: Implement Archive Endpoint

**Files:**
- Modify: `backend/app/routers/items.py`

- [ ] **Step 1: Add `ArchiveRequest` Pydantic model**

```python
class ArchiveRequest(BaseModel):
    is_archived: bool
```

- [ ] **Step 2: Add `archive_item` endpoint**

```python
@router.patch("/{item_id}/archive")
def archive_item(
    item_id: int,
    request: ArchiveRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_archived = request.is_archived
    db.commit()
    db.refresh(item)
    return serialize_item(item)
```

### Task 4: Verification with TDD

**Files:**
- Create: `backend/tests/test_archiving.py`

- [ ] **Step 1: Write tests for archiving**
  - Test that `list_items` excludes archived items by default.
  - Test that `list_items` includes archived items when `show_archived=True`.
  - Test that `PATCH /{item_id}/archive` updates the status.

- [ ] **Step 2: Run tests**
Run: `pytest backend/tests/test_archiving.py`

### Task 5: Final Commit

- [ ] **Step 1: Commit changes**
```bash
git add backend/app/routers/items.py backend/tests/test_archiving.py
git commit -m "feat: implement item archiving API"
```
