# Phase 4.2: Research Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Research Tab with a live data connection, featuring a "High ROI" highlights bar and a dense, sortable priority grid.

**Architecture:** Create a `ResearchView` component that handles data fetching and polling. It will split the layout into a horizontal `HighlightsBar` and a `PriorityGrid` table. Includes optimistic UI updates for manual valuation triggers.

**Tech Stack:** React 18, TypeScript, Vanilla CSS.

---

### Task 1: Create ResearchView & Data Fetching

**Files:**
- Create: `frontend/src/views/ResearchView.tsx`
- Create: `frontend/src/views/ResearchView.css`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create the basic ResearchView component**
Implement the fetching logic for `GET /api/items/`.

```tsx
// frontend/src/views/ResearchView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import './ResearchView.css';

interface Item {
  id: number;
  title: string;
  lot_number: string;
  current_bid: number;
  end_time: string;
  status: string;
  url: string;
  image_url: string;
  auction_house_id: number;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    computed_at: string;
  };
}

const ResearchView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items/');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  const highRoiItems = useMemo(() => {
    return items
      .filter(item => item.valuation && item.valuation.max_bid_for_target_roi > item.current_bid)
      .sort((a, b) => {
        const roiA = ((a.valuation?.max_bid_for_target_roi || 0) - a.current_bid) / a.current_bid;
        const roiB = ((b.valuation?.max_bid_for_target_roi || 0) - b.current_bid) / b.current_bid;
        return roiB - roiA;
      })
      .slice(0, 5);
  }, [items]);

  if (loading) return <div className="loading">Loading items...</div>;

  return (
    <div className="research-view">
      <section className="highlights-bar">
        {highRoiItems.map(item => (
          <div key={item.id} className="roi-card">
            <img src={item.image_url || '/placeholder.png'} alt="" className="roi-card-img" />
            <div className="roi-card-info">
              <span className="roi-badge">ROI: {Math.round(((item.valuation?.max_bid_for_target_roi || 0) - item.current_bid) / item.current_bid * 100)}%</span>
              <h3>{item.title}</h3>
              <p>Bid: ${item.current_bid} | Max: ${item.valuation?.max_bid_for_target_roi.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid-section">
        <table className="dense-grid">
          <thead>
            <tr>
              <th>Img</th>
              <th>Title</th>
              <th>Lot</th>
              <th>Bid</th>
              <th>Est. Market</th>
              <th>Max Bid</th>
              <th>ROI %</th>
              <th>Ending Soonest</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const roi = item.valuation ? ((item.valuation.max_bid_for_target_roi - item.current_bid) / item.current_bid * 100) : null;
              return (
                <tr key={item.id} className={roi && roi > 25 ? 'high-profit' : ''}>
                  <td><img src={item.image_url || '/placeholder.png'} width="30" height="30" alt="" /></td>
                  <td className="title-cell" title={item.title}>{item.title}</td>
                  <td>{item.lot_number}</td>
                  <td>${item.current_bid}</td>
                  <td>{item.valuation ? `$${item.valuation.est_market_value.toFixed(2)}` : '--'}</td>
                  <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                  <td>{roi !== null ? `${Math.round(roi)}%` : '--'}</td>
                  <td className="timer-cell">{new Date(item.end_time).toLocaleString()}</td>
                  <td>
                    <button className="small-btn">Valuate</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ResearchView;
```

- [ ] **Step 2: Add ResearchView styles**

```css
/* frontend/src/views/ResearchView.css */
.research-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.highlights-bar {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem;
  padding-bottom: 1.5rem;
}

.roi-card {
  min-width: 280px;
  background: var(--surface-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  box-shadow: var(--shadow-deep);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.roi-card-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.roi-badge {
  background: var(--success-color);
  color: #000;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.dense-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  background: var(--surface-color);
  border-radius: 8px;
  overflow: hidden;
}

.dense-grid th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-dim);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dense-grid td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.title-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.high-profit {
  background: rgba(0, 255, 136, 0.05);
}

.small-btn {
  background: var(--primary-color);
  color: #000;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
```

- [ ] **Step 3: Update App.tsx to use ResearchView**

```tsx
// frontend/src/App.tsx
import { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import ResearchView from './views/ResearchView';

function App() {
  const [activeTab, setActiveTab] = useState('research');
  // ... rest same ...
  case 'research':
    return <ResearchView />;
  // ... rest same ...
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/ResearchView.tsx frontend/src/views/ResearchView.css frontend/src/App.tsx
git commit -m "feat: implement ResearchView with live data and ROI highlights"
```

---

### Task 2: Action Layer (Scraping & Manual Valuation)

**Files:**
- Modify: `frontend/src/views/ResearchView.tsx`

- [ ] **Step 1: Implement trigger functions**
Add `handleScrape` and `handleValuate` functions using the `/api/admin/` endpoints.

- [ ] **Step 2: Add header buttons for global actions**
Add "Scrape Whitley" and "Scrape Roller" buttons to the ResearchView.

- [ ] **Step 3: Add loading states for triggers**
Ensure buttons show a loading indicator when an action is in progress.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/ResearchView.tsx
git commit -m "feat: add manual scraping and valuation triggers to ResearchView"
```

---

### Task 3: Polish & Error States

**Files:**
- Modify: `frontend/src/views/ResearchView.css`
- Modify: `frontend/src/views/ResearchView.tsx`

- [ ] **Step 1: Add empty/error states**
Show friendly messages when no items are found or the API fails.

- [ ] **Step 2: Refine countdown timer**
Ensure the "Ending Soonest" column correctly formats the time remaining.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/views/ResearchView.tsx
git commit -m "fix: polish research grid and add error states"
```
