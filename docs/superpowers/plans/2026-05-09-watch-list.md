# Watch List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Watch List feature where users can save auction items, view them in a dedicated tab sorted by end time, and have them automatically pruned 14 days after the auction ends.

**Architecture:** We will add an `is_watched` boolean to the existing `Item` database model. The backend will expose endpoints to toggle this status and fetch watched items. A daily APScheduler task will prune old items. The frontend will feature a new "Watch List" view with large image tiles, a countdown timer, and a remove button.

**Tech Stack:** Python, FastAPI, SQLAlchemy, Alembic, React, TypeScript.

---

### Task 1: Database Migration for `is_watched`

**Files:**
- Create: `backend/alembic/versions/YYYYMMDD_add_is_watched_to_items.py` (via alembic)
- Modify: `backend/app/models.py`

- [ ] **Step 1: Update the Item Model**

Add the `is_watched` column to the `Item` model in `backend/app/models.py`:

```python
    # backend/app/models.py
    # ... inside class Item(Base):
    is_user_bidding = Column(Boolean, default=False)
    is_watched = Column(Boolean, default=False, server_default='false')
```

- [ ] **Step 2: Generate the Alembic Migration**

Run the alembic autogenerate command:

```bash
cd backend
alembic revision --autogenerate -m "add_is_watched_to_items"
```
Expected: Alembic generates a new migration script in `backend/alembic/versions/`.

- [ ] **Step 3: Apply the Migration**

Run the alembic upgrade command:

```bash
cd backend
alembic upgrade head
```
Expected: Migration applies successfully to `app.db`.

- [ ] **Step 4: Commit**

```bash
git add backend/app/models.py backend/alembic/versions/
git commit -m "feat(db): add is_watched flag to Item model"
```

---

### Task 2: Backend API Endpoints

**Files:**
- Modify: `backend/app/routers/items.py`
- Test: `backend/tests/test_items.py` (assuming it exists, otherwise create it or use existing API tests)

- [ ] **Step 1: Write the failing test**

*(If no test file exists, create a minimal one. Assuming `backend/tests/test_items.py` for API testing).*

```python
# backend/tests/test_items.py (or append to existing)
def test_toggle_watch_status(client, auth_headers, db_session):
    # Assuming an item with ID 1 exists
    response = client.post("/api/items/1/watch", headers=auth_headers, json={"is_watched": True})
    assert response.status_code == 200
    assert response.json()["is_watched"] == True

def test_get_watchlist(client, auth_headers):
    response = client.get("/api/items/watchlist", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_items.py -v`
Expected: FAIL (endpoints not found)

- [ ] **Step 3: Implement Endpoints**

Update `backend/app/routers/items.py`:

```python
# backend/app/routers/items.py
# Add these imports if missing: from pydantic import BaseModel
# ... existing imports ...

class WatchStatusUpdate(BaseModel):
    is_watched: bool

@router.post("/{item_id}/watch", response_model=schemas.ItemResponse) # Assuming a schema exists, or just dict
async def toggle_watch_status(
    item_id: int,
    status: WatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_watched = status.is_watched
    db.commit()
    db.refresh(item)
    return item

@router.get("/watchlist", response_model=List[schemas.ItemResponse]) # Assuming schemas.ItemResponse
async def get_watchlist(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    items = db.query(models.Item).filter(models.Item.is_watched == True).order_by(models.Item.end_time.asc()).all()
    return items
```
*(Note: adjust `schemas.ItemResponse` if the project uses a different Pydantic schema name or returns raw dicts via another method)*

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_items.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/items.py backend/tests/test_items.py
git commit -m "feat(api): add watchlist endpoints"
```

---

### Task 3: Backend Auto-Pruning Task

**Files:**
- Modify: `backend/app/main.py` (or wherever APScheduler is configured)

- [ ] **Step 1: Write the pruning logic**

In `backend/app/main.py` (or the scheduler file), add the cleanup function:

```python
# backend/app/main.py
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import models
import pytz

def prune_watchlist():
    db: Session = SessionLocal()
    try:
        fourteen_days_ago = datetime.now(pytz.utc) - timedelta(days=14)
        
        # Find watched items that ended more than 14 days ago
        items_to_prune = db.query(models.Item).filter(
            models.Item.is_watched == True,
            models.Item.end_time < fourteen_days_ago
        ).all()
        
        count = 0
        for item in items_to_prune:
            item.is_watched = False
            count += 1
            
        if count > 0:
            db.commit()
            print(f"Pruned {count} items from the watchlist.")
            
    except Exception as e:
        db.rollback()
        print(f"Error pruning watchlist: {e}")
    finally:
        db.close()
```

- [ ] **Step 2: Schedule the task**

In the same file, add it to the scheduler:

```python
# In the startup event or scheduler configuration block:
# scheduler.add_job(prune_watchlist, 'cron', hour=0, minute=0) # Run daily at midnight UTC
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/main.py
git commit -m "feat(backend): add daily watchlist pruning task"
```

---

### Task 4: Frontend - Research View Integration

**Files:**
- Modify: `frontend/src/views/ResearchView.tsx`

- [ ] **Step 1: Add is_watched to the Item interface**

```typescript
// frontend/src/views/ResearchView.tsx
interface Item {
  // ... existing properties
  is_watched?: boolean;
}
```

- [ ] **Step 2: Add Toggle Functionality**

```typescript
// frontend/src/views/ResearchView.tsx
  const toggleWatchStatus = async (itemId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/items/${itemId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_watched: !currentStatus })
      });
      
      if (response.ok) {
        // Optimistically update the UI
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, is_watched: !currentStatus } : item
        ));
      }
    } catch (error) {
      console.error('Failed to toggle watch status:', error);
    }
  };
```

- [ ] **Step 3: Add Eye Icon to Table Rows**

Import the Eye icon from lucide-react:
```typescript
import { CalendarDays, Clock, TrendingUp, ArrowUpDown, ExternalLink, ImageIcon, Loader2, Eye, EyeOff } from 'lucide-react';
```

Add a column or action button in the table rendering:
```tsx
{/* Inside the table row rendering */}
<td>
  <button 
    onClick={() => toggleWatchStatus(item.id, !!item.is_watched)}
    className="icon-button"
    title={item.is_watched ? "Remove from Watch List" : "Add to Watch List"}
  >
    {item.is_watched ? <Eye size={18} className="text-emerald-500" /> : <EyeOff size={18} className="text-slate-400" />}
  </button>
</td>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/ResearchView.tsx
git commit -m "feat(ui): add watch toggle to research view"
```

---

### Task 5: Frontend - Watch List View Components

**Files:**
- Create: `frontend/src/views/WatchListView.tsx`
- Create: `frontend/src/views/WatchListView.css`

- [ ] **Step 1: Create the WatchListView component**

```tsx
// frontend/src/views/WatchListView.tsx
import React, { useState, useEffect } from 'react';
import './WatchListView.css';
import { X, ExternalLink } from 'lucide-react';

interface WatchedItem {
  id: number;
  title: string;
  auction_house_id: number;
  current_bid: number;
  end_time: string | null;
  image_url: string;
  url: string;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
  };
}

const CountdownTimer: React.FC<{ endTime: string | null }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else if (mins > 0) setTimeLeft(`${mins}m ${secs}s`);
      else setTimeLeft(`${secs}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return <span className={`watch-timer ${timeLeft === 'Ended' ? 'ended' : ''}`}>{timeLeft}</span>;
};

const WatchListView: React.FC = () => {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/items/watchlist');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const removeFromWatchlist = async (itemId: number) => {
    try {
      const response = await fetch(`/api/items/${itemId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_watched: false })
      });
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (loading) return <div className="p-8">Loading Watch List...</div>;

  return (
    <div className="watchlist-container">
      <h2 className="watchlist-header">Watch List</h2>
      <div className="watchlist-grid">
        {items.length === 0 ? (
          <p className="empty-state">Your watch list is empty.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="watch-card">
              <button 
                className="remove-btn" 
                onClick={() => removeFromWatchlist(item.id)}
                title="Remove from Watch List"
              >
                <X size={16} />
              </button>
              
              <div className="watch-card-image-container">
                 {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="watch-card-image" />
                 ) : (
                    <div className="watch-card-no-image">No Image</div>
                 )}
                 <div className="watch-timer-overlay">
                    <CountdownTimer endTime={item.end_time} />
                 </div>
              </div>
              
              <div className="watch-card-content">
                <h3 className="watch-title" title={item.title}>{item.title}</h3>
                
                <div className="watch-details">
                  <div className="watch-metric">
                    <span className="metric-label">Current Bid</span>
                    <span className="metric-value font-semibold">${item.current_bid?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  {item.valuation && (
                    <>
                      <div className="watch-metric">
                        <span className="metric-label">Est. Value</span>
                        <span className="metric-value text-emerald-600">${item.valuation.est_market_value?.toFixed(2)}</span>
                      </div>
                      <div className="watch-metric">
                        <span className="metric-label">Max Bid</span>
                        <span className="metric-value text-blue-600">${item.valuation.max_bid_for_target_roi?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="watch-actions">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="external-link">
                    View Auction <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WatchListView;
```

- [ ] **Step 2: Create the Styles**

```css
/* frontend/src/views/WatchListView.css */
.watchlist-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.watchlist-header {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--text-primary, #111827);
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  color: var(--text-secondary, #6b7280);
  font-size: 1rem;
}

.watch-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.watch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: #6b7280;
  transition: background 0.2s, color 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.watch-card-image-container {
  position: relative;
  height: 200px;
  width: 100%;
  background: #f3f4f6;
}

.watch-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.watch-card-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.watch-timer-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.875rem;
}

.watch-timer.ended {
  color: #fca5a5;
}

.watch-card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.watch-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.watch-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 8px;
}

.watch-metric {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 0.9rem;
}

.watch-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.external-link:hover {
  text-decoration: underline;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/WatchListView.tsx frontend/src/views/WatchListView.css
git commit -m "feat(ui): create watch list view component"
```

---

### Task 6: Frontend - Navigation Integration

**Files:**
- Modify: `frontend/src/components/Navigation.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add the Eye icon to Navigation**

```typescript
// frontend/src/components/Navigation.tsx
import { Search, Gavel, Package, BarChart3, Settings, Eye } from 'lucide-react';

// ... inside getIcon:
      case 'watchlist': return <Eye size={22} />;

// ... inside tabs array:
    { id: 'research', label: 'Research' },
    { id: 'watchlist', label: 'Watch List' }, // Add here
    { id: 'bidding', label: 'Bidding' },
```

- [ ] **Step 2: Add Route to App.tsx**

```tsx
// frontend/src/App.tsx
import WatchListView from './views/WatchListView';

// ... inside renderContent function:
      case 'watchlist':
        return <WatchListView />;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navigation.tsx frontend/src/App.tsx
git commit -m "feat(ui): add watchlist tab to navigation"
```
