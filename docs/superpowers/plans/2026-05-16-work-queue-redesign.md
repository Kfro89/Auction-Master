# Work Queue UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Work Queue to match the "Glass Master" SaaS Minimalist aesthetic, improving layout, spacing, and UX for all workflow stages.

**Architecture:** We will completely overhaul `WorkQueueView.css` to introduce clean, whitespace-heavy SaaS styling (soft shadows, thin borders). We will then refactor `WorkQueueView.tsx` to apply modern input structures, logical groupings, and better empty/read-only states that map perfectly to the documented workflow stages.

**Tech Stack:** React 19, TypeScript, plain CSS, lucide-react.

---

### Task 1: Overhaul WorkQueueView.css for SaaS Minimalist Aesthetic

**Files:**
- Modify: `frontend/src/views/WorkQueueView.css`

- [ ] **Step 1: Replace CSS content with SaaS Minimalist styles**

We need ultra-thin borders, soft shadows, rounded corners (8px/12px), and generous padding.

```css
/* We will rewrite the entire file to provide a clean, modern aesthetic */
.work-queue-view {
  display: flex;
  background-color: #FAFAFA;
  color: #111827;
  flex-direction: column;
  height: calc(100vh - 4rem);
  padding: 2.5rem;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.stage-navigator {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  overflow-x: auto;
  margin-bottom: 2rem;
}

.stage-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  color: #6B7280;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;
  background: transparent;
  border: none;
  cursor: pointer;
}

.stage-btn:hover {
  background: rgba(243, 244, 246, 0.8);
  color: #374151;
}

.stage-btn.active {
  background: #EEF2FF;
  color: #2563EB;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.stage-count {
  background: #F3F4F6;
  color: #4B5563;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stage-btn.active .stage-count {
  background: #DBEAFE;
  color: #1D4ED8;
}

.work-container {
  display: flex;
  gap: 2rem;
  flex: 1;
  overflow: hidden;
}

.item-list {
  width: 400px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02);
}

.list-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
  font-weight: 600;
  color: #111827;
  font-size: 1.05rem;
}

.count-badge {
  background: #F9FAFB;
  color: #6B7280;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #E5E7EB;
}

.items-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.queue-item {
  padding: 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #F3F4F6;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);
}

.queue-item:hover {
  border-color: #D1D5DB;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}

.queue-item.selected {
  background: #F8FAFC;
  border-color: #93C5FD;
  box-shadow: 0 0 0 1px #93C5FD;
}

.item-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin-bottom: 6px;
}

.item-meta {
  font-size: 0.8rem;
  color: #6B7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.staging-panel {
  flex: 1;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.02), 0 10px 10px -5px rgba(0, 0, 0, 0.01);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.staging-content {
  padding: 3rem;
  height: 100%;
  overflow-y: auto;
}

.staging-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #F3F4F6;
}

.staging-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
}

.status-badge {
  background: #F3F4F6;
  color: #4B5563;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid #E5E7EB;
}

.staging-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 3rem;
}

.staging-grid.single-column {
  grid-template-columns: minmax(auto, 650px);
  justify-content: center;
}

.photo-zone {
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #F9FAFB;
  border: 2px dashed #D1D5DB;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #9CA3AF;
  margin-bottom: 1.5rem;
}

.photo-zone:hover {
  border-color: #9CA3AF;
  background: #F3F4F6;
  color: #6B7280;
}

.photo-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.field-group {
  margin-bottom: 1.25rem;
}

.field-group label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  display: block;
}

.frosted-input,
.frosted-input-large {
  background: #ffffff;
  border: 1px solid #D1D5DB;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #111827;
  font-size: 0.95rem;
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
}

.frosted-input:focus,
.frosted-input-large:focus {
  outline: none;
  border-color: #60A5FA;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.frosted-input:disabled {
  background: #F9FAFB;
  color: #9CA3AF;
  cursor: not-allowed;
}

textarea.frosted-input-large {
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  min-height: 200px;
}

.action-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
}

.action-btn.primary {
  background: #111827;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn.primary:hover {
  background: #374151;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.action-btn.outline {
  background: #ffffff;
  border-color: #D1D5DB;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.action-btn.outline:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.action-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.action-btn.square {
  aspect-ratio: 1;
  padding: 0.75rem;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6B7280;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #D1D5DB;
}

.empty-state h3 {
  color: #111827;
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.95rem;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Card overrides for sections inside staging */
.staging-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  margin-bottom: 1.5rem;
}

.staging-card h3 {
  color: #111827;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 0.75rem;
}

/* Specific styling for the read-only Paid tag */
.paid-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
```

### Task 2: Refactor WorkQueueView.tsx - "Won" & "Paid" Stages

**Files:**
- Modify: `frontend/src/views/WorkQueueView.tsx`

- [ ] **Step 1: Replace `.bg-white.border...` with `.staging-card`**
Replace all instances of `className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm"` with `className="staging-card"`.

- [ ] **Step 2: Clean up the "Won" Stage layout**
Ensure fields are well-spaced. Improve the Lot Splitting section.

- [ ] **Step 3: Enhance the "Paid" Stage**
Use the `.paid-tag` class from the new CSS for the PAID notification. The Paid stage should show acquisition costs (read-only) and logistics input.

### Task 3: Refactor "In Transit", "Received", "Refurbish"

- [ ] **Step 1: In Transit and Logistics**
Ensure tracking inputs look modern. Add an ETA display or placeholder if data isn't natively available yet, to match workflow doc.

- [ ] **Step 2: Received Stage**
Ensure the "Print Thermal Label", "Generate ID", and "Storage Location" inputs are beautifully laid out. Provide clear buttons for "Needs Repair" (Refurbish) and "Ready for Staging".

- [ ] **Step 3: Refurbish Stage**
The workflow doc states we should have "Add Refurbishment Cost" and a button to move to Staging. We will add a staging card for Refurbishment with the CostLineItemLedger explicitly labeled.

### Task 4: Refactor "Staging" Stage

- [ ] **Step 1: Anti-Tamper & Dims**
Group Anti-Tamper barcode, Weight, Dimensions into a cohesive grid. Add the Auto-Select Packaging button neatly below.

- [ ] **Step 2: AI Listing Generator & Media**
Ensure the Photo Upload zone has great UX text ("Drag & drop product photos"). Align the Drafting title input, generate button, and description textarea perfectly.

---
End of Plan.
