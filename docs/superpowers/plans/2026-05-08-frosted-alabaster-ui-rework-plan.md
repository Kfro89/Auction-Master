# Frosted Alabaster UI Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely transform the Auction Master ERP from a dark-themed, emoji-laden tool into a professional, light-mode "Frosted Alabaster" suite with enhanced table interactivity and Lucide iconography.

**Architecture:** 
- Centralize light-mode theme variables in `index.css`.
- Implement reusable `Modal` and `Tooltip` components to handle enhanced interactivity.
- Use a custom `useSortableData` hook to manage table state across all views.
- Overhaul `ResearchView` to include clickable KPI cards that filter the primary data grid.

**Tech Stack:** React, TypeScript, Lucide React, Tailwind CSS.

---

### Task 1: Foundation (Theme & Icons)

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Install Lucide React**
Run: `npm install lucide-react` in `frontend/`

- [ ] **Step 2: Update Global CSS Variables**
Replace the dark theme variables with the "Frosted Alabaster" light mode palette.

```css
:root {
  --bg-color: #fafafa;
  --surface-color: rgba(255, 255, 255, 0.65);
  --primary-color: #2563eb;
  --accent-color: #f59e0b;
  --text-main: #0f172a;
  --text-dim: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  
  --nav-width-expanded: 240px;
  --nav-width-collapsed: 64px;
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-blur: blur(20px);
  --glass-border: 1px solid rgba(0, 0, 0, 0.05);
  --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.05);
}

body {
  background: radial-gradient(circle at top, #ffffff 0%, #f3f4f6 100%);
  color: var(--text-main);
}
```

- [ ] **Step 3: Commit**
`git add frontend/package.json frontend/src/index.css && git commit -m "style: initialize frosted alabaster theme variables and lucide icons"`

---

### Task 2: Reusable Components (Modal & Tooltip)

**Files:**
- Create: `frontend/src/components/Modal.tsx`
- Create: `frontend/src/components/Modal.css`
- Create: `frontend/src/components/Tooltip.tsx`
- Create: `frontend/src/components/Tooltip.css`

- [ ] **Step 1: Implement Modal Component**
Create a frosted glass modal for images and iframes.

```tsx
import React from 'react';
import './Modal.css';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'md' }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${size} glass`} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        {children}
      </div>
    </div>
  );
};
export default Modal;
```

- [ ] **Step 2: Implement Tooltip Component**
Create a standardized tooltip for buttons.

```tsx
import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="tooltip-wrapper" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && <div className="tooltip-box">{text}</div>}
    </div>
  );
};
export default Tooltip;
```

- [ ] **Step 3: Commit**
`git add frontend/src/components/Modal.* frontend/src/components/Tooltip.* && git commit -m "feat: add reusable Modal and Tooltip components"`

---

### Task 3: Table Sorting Hook

**Files:**
- Create: `frontend/src/hooks/useSortableData.ts`

- [ ] **Step 1: Implement Sorting Logic**
Create a hook to handle alphanumeric and date sorting.

```ts
import { useState, useMemo } from 'react';

export const useSortableData = (items: any[], config: { key: string; direction: 'asc' | 'desc' } | null = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
```

- [ ] **Step 2: Commit**
`git add frontend/src/hooks/useSortableData.ts && git commit -m "feat: add useSortableData hook for table interactivity"`

---

### Task 4: Research View - KPI Filtering & Sorting

**Files:**
- Modify: `frontend/src/views/ResearchView.tsx`
- Modify: `frontend/src/views/ResearchView.css`

- [ ] **Step 1: Update ResearchView Logic**
Implement time-based filtering and integrate the `useSortableData` hook.

```tsx
// Inside ResearchView.tsx
const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');

const filteredItems = useMemo(() => {
  const now = new Date();
  const todayEnd = new Date(now).setHours(23, 59, 59, 999);
  const tomorrowEnd = new Date(now).setDate(now.getDate() + 1);
  const weekEnd = new Date(now).setDate(now.getDate() + 7);

  return items.filter(item => {
    const end = new Date(item.end_time).getTime();
    if (filter === 'today') return end <= todayEnd;
    if (filter === 'tomorrow') return end > todayEnd && end <= tomorrowEnd;
    if (filter === 'week') return end <= weekEnd;
    return true;
  });
}, [items, filter]);

const { items: sortedItems, requestSort, sortConfig } = useSortableData(filteredItems);
```

- [ ] **Step 2: Implement UI & Modals**
Replace Highlights Bar with KPI cards and add Image/Iframe modals to the table. Use `lucide-react` icons (Search, Calendar, etc.).

- [ ] **Step 3: Apply Light Theme CSS**
Update `ResearchView.css` to use white backgrounds, slate text, and emerald accents. Remove emojis.

- [ ] **Step 4: Commit**
`git add frontend/src/views/ResearchView.* && git commit -m "feat: overhaul ResearchView with KPI filtering and light theme"`

---

### Task 5: Global Navigation & Aesthetic Polish

**Files:**
- Modify: `frontend/src/components/Navigation.tsx`
- Modify: `frontend/src/components/Navigation.css`
- Modify: `frontend/src/views/BiddingView.tsx`
- Modify: `frontend/src/views/WorkQueueView.tsx`

- [ ] **Step 1: Update Navigation Icons**
Replace emojis with `Search`, `Gavel`, `Package`, `BarChart3`, `Settings` from `lucide-react`.

- [ ] **Step 2: Apply Light Mode to Navigation**
Update `Navigation.css` for a frosted white look.

- [ ] **Step 3: Sync Bidding and Work Queue Views**
Apply the new `useSortableData` hook and light theme CSS to all remaining views to ensure the rework is complete.

- [ ] **Step 4: Commit**
`git add . && git commit -m "style: complete frosted alabaster theme sync across all views"`
