# SaaS Command Center UI Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the frontend into an "Ultra-Minimalist SaaS Command Center" featuring a floating pill navigation, an edge-to-edge content area, and a global Cmd+K Command Palette, prioritizing whitespace, the Inter font, and a single Emerald accent color.

**Architecture:** We are moving away from the collapsible "glass" sidebar towards a strict minimal layout. The `App` component will hold the global `Cmd+K` listener to summon the `CommandPalette`. `Navigation` becomes a floating icon-only pill. View components will absorb their own local filters (previously passed to the sidebar) into a minimal header.

**Tech Stack:** React, Tailwind CSS, raw CSS (for existing components), `lucide-react` icons.

---

### Task 1: Foundation and Global Styling

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/index.html`

- [ ] **Step 1: Add Inter font to index.html**

```html
<!-- In frontend/index.html, inside <head> -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update index.css for SaaS base variables**

Modify `frontend/src/index.css` to update the font family, background, and default text color. Replace or append the root styles:

```css
:root {
  font-family: 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: light;
  color: #111827; /* Dark slate */
  background-color: #FAFAFA; /* Off-white SaaS background */

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background-color: #FAFAFA;
}

/* Global utility classes for the new aesthetic */
.emerald-btn {
  background-color: #059669;
  color: white;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}
.emerald-btn:hover {
  background-color: #047857;
  transform: translateY(-1px);
}
```

- [ ] **Step 3: Commit Foundation**

```bash
cd frontend && git add index.html src/index.css && git commit -m "style: Apply SaaS global font and colors"
```

### Task 2: Floating Pill Navigation

**Files:**
- Modify: `frontend/src/components/Navigation.tsx`
- Modify: `frontend/src/components/Navigation.css`

- [ ] **Step 1: Rewrite Navigation.tsx**

Replace `Navigation.tsx` content to render only a floating pill without the expand/collapse toggle and labels.

```tsx
import React from 'react';
import './Navigation.css';
import { Search, Gavel, Package, BarChart3, Settings } from 'lucide-react';

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavProps> = ({ activeTab, onTabChange }) => {
  const getIcon = (id: string) => {
    switch(id) {
      case 'research': return <Search size={22} />;
      case 'bidding': return <Gavel size={22} />;
      case 'work-queue': return <Package size={22} />;
      case 'store': return <BarChart3 size={22} />;
      case 'settings': return <Settings size={22} />;
      default: return <Search size={22} />;
    }
  };

  const tabs = [
    { id: 'research', label: 'Research' },
    { id: 'bidding', label: 'Bidding' },
    { id: 'work-queue', label: 'Work Queue' },
    { id: 'store', label: 'Store' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="floating-pill-nav">
      <div className="nav-items">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
          >
            <span className="nav-icon">{getIcon(tab.id)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
```

- [ ] **Step 2: Update Navigation.css**

Replace `Navigation.css` to style the floating pill.

```css
.floating-pill-nav {
  position: fixed;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  border-radius: 9999px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 12px 8px;
  z-index: 50;
  border: 1px solid #F3F4F6;
}

.floating-pill-nav .nav-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.floating-pill-nav .nav-item {
  background: transparent;
  border: none;
  color: #9CA3AF;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.floating-pill-nav .nav-item:hover {
  color: #111827;
  background-color: #F9FAFB;
}

.floating-pill-nav .nav-item.active {
  color: #059669; /* Emerald */
  background-color: #ECFDF5;
}
```

- [ ] **Step 3: Commit Navigation**

```bash
cd frontend && git add src/components/Navigation* && git commit -m "feat: Implement floating pill navigation"
```

### Task 3: App Shell & Command Palette Infrastructure

**Files:**
- Create: `frontend/src/components/CommandPalette.tsx`
- Create: `frontend/src/components/CommandPalette.css`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.css`

- [ ] **Step 1: Create CommandPalette.tsx**

```tsx
import React, { useState, useEffect, useRef } from 'react';
import './CommandPalette.css';
import { Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleAction = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  const filteredCommands = [
    { label: 'Go to Research', tab: 'research' },
    { label: 'Go to Bidding', tab: 'bidding' },
    { label: 'Go to Work Queue', tab: 'work-queue' },
    { label: 'Go to Store', tab: 'store' },
    { label: 'Go to Settings', tab: 'settings' },
  ].filter(cmd => cmd.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="cmd-header">
          <Search size={20} className="cmd-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="cmd-results">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <div key={cmd.tab} className="cmd-item" onClick={() => handleAction(cmd.tab)}>
                {cmd.label}
              </div>
            ))
          ) : (
            <div className="cmd-empty">No commands found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
```

- [ ] **Step 2: Create CommandPalette.css**

```css
.cmd-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.cmd-modal {
  width: 100%;
  max-width: 640px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid #E5E7EB;
  overflow: hidden;
}

.cmd-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F3F4F6;
}

.cmd-icon {
  color: #9CA3AF;
  margin-right: 12px;
}

.cmd-input {
  flex: 1;
  font-size: 1.25rem;
  border: none;
  outline: none;
  color: #111827;
  font-family: inherit;
  background: transparent;
}

.cmd-input::placeholder {
  color: #D1D5DB;
}

.cmd-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.cmd-item {
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
  font-size: 0.95rem;
}

.cmd-item:hover {
  background-color: #F3F4F6;
  color: #059669; /* Emerald on hover */
}

.cmd-empty {
  padding: 24px;
  text-align: center;
  color: #9CA3AF;
}
```

- [ ] **Step 3: Modify App.tsx**

Replace `App.tsx` entirely to remove the old sidebar state, use the new `Navigation`, and add the `CommandPalette` global listener.

```tsx
import { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import CommandPalette from './components/CommandPalette';
import ResearchView from './views/ResearchView';
import SettingsView from './views/SettingsView';
import BiddingView from './views/BiddingView';
import WorkQueueView from './views/WorkQueueView';
import StoreView from './views/StoreView';
import LoginView from './views/LoginView';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('am_token'));
  const [activeTab, setActiveTab] = useState('research');
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!token) {
    return <LoginView onLogin={setToken} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'research':
        return <ResearchView />;
      case 'bidding':
        return <BiddingView />;
      case 'work-queue':
        return <WorkQueueView />;
      case 'store':
        return <StoreView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <div><h1>Select a Tab</h1></div>;
    }
  };

  return (
    <div className="app-shell">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        <div className="cmd-hint" onClick={() => setIsCmdOpen(true)}>
          Press ⌘K to open Command Palette
        </div>
        {renderContent()}
      </main>
      <CommandPalette 
        isOpen={isCmdOpen} 
        onClose={() => setIsCmdOpen(false)} 
        onNavigate={setActiveTab} 
      />
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Modify App.css**

Replace `App.css` content to support the edge-to-edge layout and the `cmd-hint`.

```css
.app-shell {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  padding: 40px;
  padding-left: 100px; /* Space for the floating pill */
  max-width: 100vw;
  box-sizing: border-box;
}

.cmd-hint {
  position: absolute;
  top: 16px;
  right: 24px;
  font-size: 0.85rem;
  color: #9CA3AF;
  background-color: white;
  border: 1px solid #E5E7EB;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.cmd-hint:hover {
  border-color: #D1D5DB;
  color: #4B5563;
}
```

- [ ] **Step 5: Commit App Shell**

```bash
cd frontend && git add src/App* src/components/Command* && git commit -m "feat: Add Cmd+K Command Palette and edge-to-edge shell"
```

### Task 4: ResearchView SaaS Clean up

**Files:**
- Modify: `frontend/src/views/ResearchView.tsx`
- Modify: `frontend/src/views/ResearchView.css`

- [ ] **Step 1: Move Sidebar Filters to View Header in ResearchView.tsx**

Remove the `setSidebarContent` prop. Add a new `saas-view-header` section inside the main return of `ResearchView.tsx` (above the table) to hold the Category, Tag, and Search inputs. Also remove the frosted class names.

In `ResearchView.tsx`, modify the signature to `const ResearchView: React.FC = () => {` and remove the `useEffect` that calls `setSidebarContent`. Then insert the filter UI at the top of the return:

*(Note to subagent: Since this is a large file, manually edit it using `replace` or rewrite the component to inject the filter bar at the top of `.research-view` container).*

*Insert above the table:*
```tsx
<div className="saas-view-header">
  <h1 className="saas-title">Research</h1>
  <div className="saas-filters">
    <input 
      type="text" 
      className="saas-input"
      placeholder="Search title or lot..." 
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <select 
      className="saas-input"
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
    >
      <option value="">All Categories</option>
      {uniqueCategories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
    <select 
      className="saas-input"
      value={tagFilter}
      onChange={(e) => setTagFilter(e.target.value)}
    >
      <option value="">All Tags</option>
      {uniqueTags.map(tag => (
        <option key={tag} value={tag}>{tag}</option>
      ))}
    </select>
  </div>
</div>
```

- [ ] **Step 2: Update ResearchView.css for SaaS Tables**

Overwrite table styles in `ResearchView.css` to be borderless and ultra-clean.

```css
/* Add to frontend/src/views/ResearchView.css */

.saas-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.saas-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.saas-filters {
  display: flex;
  gap: 12px;
}

.saas-input {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background-color: white;
  color: #374151;
  font-size: 0.9rem;
  outline: none;
}

.saas-input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.1);
}

/* Table overrides */
.research-table {
  width: 100%;
  border-collapse: collapse;
  background-color: transparent;
}

.research-table th {
  background-color: transparent !important;
  color: #6B7280;
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
  border-right: none;
  border-left: none;
  border-top: none;
}

.research-table td {
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
  border-right: none;
  border-left: none;
  color: #374151;
  background-color: transparent !important;
  vertical-align: middle;
}

.research-table tbody tr:hover td {
  background-color: #F9FAFB !important;
}

/* Buttons */
.refresh-btn {
  background-color: white;
  border: 1px solid #E5E7EB;
  color: #374151;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
}
.refresh-btn:hover {
  background-color: #F3F4F6;
}

.roi-badge {
  background-color: #ECFDF5;
  color: #059669;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}
```

- [ ] **Step 3: Commit Research View Updates**

```bash
cd frontend && git add src/views/Research* && git commit -m "style: Apply SaaS minimalist table styles to Research View"
```

### Task 5: Apply Table Aesthetic to Remaining Views

**Files:**
- Modify: `frontend/src/views/BiddingView.css`
- Modify: `frontend/src/views/WorkQueueView.css`
- Modify: `frontend/src/views/StoreView.css`
- Modify: `frontend/src/views/SettingsView.css`

- [ ] **Step 1: Clean up remaining CSS**

For `BiddingView.css`, `WorkQueueView.css`, `StoreView.css`, and `SettingsView.css`, apply the same pattern:
- Remove `.frosted-card` backgrounds.
- Remove vertical borders on `.bidding-table th, .bidding-table td` etc.
- Set horizontal borders to `1px solid #F3F4F6`.
- Change button backgrounds to the new Emerald or white/border button styles.
- Add `padding: 20px 24px;` to table cells.

*(Subagent Note: Ensure you review each CSS file and surgically replace the Frosted Alabaster borders/backgrounds with transparent backgrounds and #F3F4F6 horizontal lines, keeping the file structure intact).*

- [ ] **Step 2: Commit Remaining Views**

```bash
cd frontend && git add src/views/*.css && git commit -m "style: Apply SaaS table aesthetic across all views"
```
