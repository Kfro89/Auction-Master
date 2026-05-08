# Phase 4.1: The Glass Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundational multi-tab "Glass ERP" layout, including the collapsible left navigation with blur effects and the visual theme (noise background, tactile shadows).

**Architecture:** A React-based App shell using a `Layout` component that manages the navigation state (collapsed/expanded) and the active tab. Styling will use Vanilla CSS with CSS Variables for theme consistency and `backdrop-filter` for the glass effect.

**Tech Stack:** React 18, TypeScript, Vanilla CSS.

---

### Task 1: Global CSS Theme & Variables

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/App.css`

- [ ] **Step 1: Define CSS Variables and Reset**
Update `index.css` with the "Auction Master" theme variables and global resets.

```css
/* frontend/src/index.css */
:root {
  --bg-color: #0a0a0c;
  --surface-color: #16161a;
  --primary-color: #00d2ff;
  --accent-color: #ffc107;
  --text-main: #e0e0e0;
  --text-dim: #a0a0a0;
  --success-color: #00ff88;
  --warning-color: #ffcc00;
  --danger-color: #ff4444;
  
  --nav-width-expanded: 240px;
  --nav-width-collapsed: 64px;
  --glass-bg: rgba(22, 22, 26, 0.7);
  --glass-blur: blur(16px);
  --shadow-deep: 0 10px 30px rgba(0, 0, 0, 0.5);
  --noise-opacity: 0.03;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden; /* App Shell handles scrolling */
}

/* Tactile Noise Overlay */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: var(--noise-opacity);
  pointer-events: none;
  z-index: 9999;
}
```

- [ ] **Step 2: Clear default App.css**
Wipe `App.css` to prepare for the new layout.

```css
/* frontend/src/App.css */
.app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  transition: margin-left 0.3s ease;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/index.css frontend/src/App.css
git commit -m "style: initialize global CSS theme and tactile noise"
```

---

### Task 2: Implement Glass Navigation Component

**Files:**
- Create: `frontend/src/components/Navigation.tsx`
- Create: `frontend/src/components/Navigation.css`

- [ ] **Step 1: Create Navigation component**

```tsx
// frontend/src/components/Navigation.tsx
import React from 'react';
import './Navigation.css';

interface NavProps {
  isCollapsed: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggle: () => void;
}

const Navigation: React.FC<NavProps> = ({ isCollapsed, activeTab, onTabChange, onToggle }) => {
  const tabs = [
    { id: 'research', label: 'Research', icon: '🔍' },
    { id: 'bidding', label: 'Bidding', icon: '⚖️' },
    { id: 'work-queue', label: 'Work Queue', icon: '📦' },
    { id: 'store', label: 'Store', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className={`glass-nav ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-header">
        {!isCollapsed && <span className="logo-text">AUCTION MASTER</span>}
        <button onClick={onToggle} className="toggle-btn">
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      <div className="nav-items">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {!isCollapsed && <span className="nav-label">{tab.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
```

- [ ] **Step 2: Create Navigation styles**

```css
/* frontend/src/components/Navigation.css */
.glass-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--nav-width-expanded);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.glass-nav.collapsed {
  width: var(--nav-width-collapsed);
}

.nav-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-text {
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--primary-color);
}

.nav-items {
  padding: 1rem 0;
  flex: 1;
}

.nav-item {
  width: 100%;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 1rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.nav-item.active {
  background: rgba(0, 210, 255, 0.1);
  color: var(--primary-color);
  border-right: 3px solid var(--primary-color);
}

.nav-icon {
  font-size: 1.25rem;
  min-width: 24px;
  text-align: center;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1.2rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navigation.tsx frontend/src/components/Navigation.css
git commit -m "feat: implement Glass Navigation component"
```

---

### Task 3: Setup App Shell Orchestration

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Refactor App.tsx to manage tabs**

```tsx
// frontend/src/App.tsx
import { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('research');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'research':
        return <div><h1>Research</h1><p>Auction discovery and ROI analysis.</p></div>;
      case 'bidding':
        return <div><h1>Bidding</h1><p>Active bids and items ending today.</p></div>;
      case 'work-queue':
        return <div><h1>Work Queue</h1><p>Staging area for eBay listings.</p></div>;
      case 'store':
        return <div><h1>Store</h1><p>EBay inventory and performance analytics.</p></div>;
      case 'settings':
        return <div><h1>Settings</h1><p>Manage API credentials and authentication.</p></div>;
      default:
        return <div><h1>Select a Tab</h1></div>;
    }
  };

  return (
    <div className="app-shell">
      <Navigation 
        isCollapsed={isNavCollapsed} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onToggle={() => setIsNavCollapsed(!isNavCollapsed)}
      />
      <main className="main-content" style={{ 
        marginLeft: isNavCollapsed ? 'var(--nav-width-collapsed)' : 'var(--nav-width-expanded)' 
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: setup App Shell orchestration with tab switching"
```

---

### Task 4: Verify Layout and Glass Effects

**Files:**
- None (Verification)

- [ ] **Step 1: Check browser output**
Ensure the navigation pane correctly collapses/expands and the `backdrop-filter` is visible (content behind the nav should blur when nav is expanded).

- [ ] **Step 2: Verify responsive behavior**
Ensure the main content shifts correctly when the nav state changes.

- [ ] **Step 3: Final Commit (if any tweaks needed)**
```bash
git commit -m "fix: polish shell layout and transitions"
```
