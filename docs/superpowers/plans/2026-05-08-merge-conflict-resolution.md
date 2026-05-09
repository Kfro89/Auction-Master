# Merge Conflict Resolution Plan

> **For agentic workers:** Execute this plan to resolve the divergence between `fix/research-pane-issues` and `main`. 

**Goal:** Resolve complex merge conflicts (both `content` and `add/add`) caused by parallel development of backend features and the massive frontend SaaS UI Rework.

**Architecture:** 
- `main` has advanced with parallel backend/frontend changes.
- `fix/research-pane-issues` contains the completed "SaaS Command Center" UI rework and some "Frosted Alabaster" precursors, as well as potential backend tweaks for the research pane.
- Strategy: **Favor the SaaS UI** on the frontend, but carefully combine backend schema/router additions to ensure no features are lost.

---

### Task 1: Re-initiate the Merge
- [ ] **Step 1: Run the merge command to recreate conflicts**
```bash
git merge main
```
*(This will output the list of conflicts and leave the workspace in a conflicting state).*

### Task 2: Resolve Backend Conflicts
**Files to check:**
- `backend/app/models.py` (content)
- `backend/app/routers/items.py` (add/add)
- `backend/app/services/ingestion.py` (content)

- [ ] **Step 1: Read conflict markers in `models.py` and `ingestion.py`**
Combine the database models and ingestion logic. Ensure all new columns/classes from both branches exist.
- [ ] **Step 2: Read conflict markers in `items.py`**
Since this is an `add/add` conflict, both branches created this router. Unify the endpoints so all routes (e.g., `GET /items`, `POST /items/scan`, etc.) are preserved.

### Task 3: Resolve Frontend Conflicts
**Files to check:**
- `frontend/src/App.tsx`, `frontend/src/App.css`, `frontend/src/index.css` (content)
- `frontend/src/components/Navigation.tsx`, `Navigation.css` (add/add)
- `frontend/src/views/*.tsx` and `*.css` (add/add)

- [ ] **Step 1: Resolve Global/Shell Conflicts (`App.tsx`, `index.css`)**
Favor the `fix/research-pane-issues` branch for the UI layout (e.g., Command Palette, edge-to-edge layout, Inter font). Ensure any new context providers or routing logic added in `main` are kept.
- [ ] **Step 2: Resolve Component/View Conflicts**
For `add/add` UI conflicts, the `fix/research-pane-issues` branch has the desired "SaaS Command Center" aesthetic (e.g., `lucide-react` icons, transparent tables, borderless layout). Choose the HEAD (our branch) for styling, but inject any new state/props/API bindings that `main` introduced.

### Task 4: Resolve Documentation Conflicts
- [ ] **Step 1: Unify `docs/progress_report.md`**
Combine the progress lists. Ensure "8. Frosted Alabaster UI Rework" and the new SaaS rework notes are kept alongside whatever `main` added.
- [ ] **Step 2: Unify Specs and Plans**
For `docs/superpowers/specs/...` and `docs/superpowers/plans/...` `add/add` conflicts, simply keep both sets of text (or keep HEAD if they are meant to replace older docs).

### Task 5: Verify and Commit
- [ ] **Step 1: Test Backend**
```bash
cd backend
# Run any relevant pytest or uvicorn check
```
- [ ] **Step 2: Test Frontend**
```bash
cd frontend
npm run build
```
- [ ] **Step 3: Finalize Merge**
```bash
git add .
git commit -m "Merge main into fix/research-pane-issues and resolve UI/Backend conflicts"
```