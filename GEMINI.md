# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Auction Master is a single-user Auction Arbitrage ERP that flips items from local government/online auctions to eBay. It scrapes auction houses, cross-references lots against eBay market data for ROI, stages won inventory through a Work Queue, generates AI eBay drafts, and tracks the resulting store sales.

**Stack at a glance:**

- **Backend** (`backend/`): Python 3.12, FastAPI, SQLAlchemy (PostgreSQL 16), Alembic, APScheduler. BeautifulSoup4 + httpx for scraping.
- **Frontend** (`frontend/`): React 19 + Vite + TypeScript (strict). Tailwind CSS v4 + **shadcn/ui (Nova preset)** with a sober neutral + violet accent palette and dark mode (rebuilt May 2026 — the prior "Glass Master" aesthetic is retired). React Router v7 + TanStack Query v5 + TanStack Table v8 + react-hook-form/zod + Framer Motion. `recharts` for analytics, `lucide-react` for icons. See [DESIGN.md](DESIGN.md) for the design system contract and [docs/2026-05-19-frontend-shadcn-rebuild.md](docs/2026-05-19-frontend-shadcn-rebuild.md) for the current UI state.
- **Mobile** (`lib/` + `ios/` + `android/`, also surfaced under `.worktrees/mobile`): Flutter (Dart), matches the React feature set.
- **Database**: PostgreSQL 16.
- **Live URL**: `https://auction.autom8tr.com` — use this for OAuth callbacks and any test of the deployed app from external devices.

## Distributed Execution Model (Important)

The agent runs on a **local Mac laptop**, but the application stack (FastAPI backend + React frontend + PostgreSQL) runs on a **remote machine at `192.168.0.16`** and is exposed publicly at `https://auction.autom8tr.com`.

- Backend/frontend code edits made locally must be synced to the remote host before they take effect. Use [backend/deploy_rsync.exp](backend/deploy_rsync.exp) to rsync the working tree to `kevin@192.168.0.16:~/Docker/AuctionMaster/`, then [backend/deploy.exp](backend/deploy.exp) to rebuild containers there.
- Do **not** run `docker-compose up` locally expecting it to be the live system — local Docker is only useful for offline testing. The truth is the remote stack.
- The Flutter mobile app (`lib/`, `ios/`, `android/`, etc.) is the exception: it builds and runs locally via Xcode/simulator and is then committed back.
- Secrets live in `.env` (gitignored); `.env.template` lists the required keys.
- The `.exp` files in `backend/` are Expect scripts that automate password-based SSH against the remote (the password is hardcoded as literal `password` in those scripts for this private LAN setup).

## Common Commands

### Backend (Python 3.12 / FastAPI / SQLAlchemy)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt

alembic upgrade head                       # apply migrations
alembic revision --autogenerate -m "msg"   # author new migration
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pytest                                     # run all tests
pytest tests/test_valuation.py             # single file
pytest tests/test_valuation.py::test_name  # single test
```

The repo currently has **multiple alembic heads** (see recent `chore: merge alembic heads` commit). When adding migrations, check `alembic heads` first and merge if needed before generating new revisions.

### Frontend (React 19 + Vite + TypeScript, strict mode)

```bash
cd frontend
npm install
npm run dev -- --host    # dev server on :5173 (mapped to :5174 via Docker)
npm run build            # tsc -b && vite build
npm run lint             # eslint
```

### Full stack (local, via Docker)

```bash
docker-compose up --build
# frontend → http://localhost:5174
# backend  → http://localhost:8000  (docs at /docs)
# postgres → localhost:5434
```

### Deploy to remote (the live system)

```bash
./backend/deploy_rsync.exp    # rsync tree to 192.168.0.16
./backend/deploy.exp          # docker compose up --build -d on the remote
```

### Mobile (Flutter)

`pubspec.yaml` lives at the repo root; the Flutter project shares this directory with the web stack. Run from the repo root: `flutter pub get`, `flutter run -d <device>`. See [docs/mobile_app_testing_guide.md](docs/mobile_app_testing_guide.md) for iOS connectivity gotchas (the simulator must reach the remote `auction.autom8tr.com`, not localhost).

## Architecture

### Backend layering

```
backend/app/
├── main.py              # FastAPI app + APScheduler bootstrap (orchestrates background pipeline)
├── models.py            # SQLAlchemy models — single file, shared across domains
├── schemas.py           # Pydantic request/response schemas
├── auth.py              # JWT auth (single-user)
├── routers/             # Thin HTTP layer; one router per ERP domain
│   ├── admin items inventory credentials packaging ebay expenses analytics
├── services/            # All business logic lives here (Decoupled Architecture)
│   ├── discovery.py         # Pure scraping & raw Item creation (Phase 1)
│   ├── bid_sync.py          # Definitive source of truth for user active bids (Phase 2)
│   ├── enrichment.py        # Local Gemma LLM categorization & tagging (Phase 3)
│   ├── ebay_valuation.py    # eBay Browse API math & ROI (Phase 4)
│   ├── ingestion.py         # Legacy wrappers (being deprecated/refactored)
│   ├── ebay_auth.py         # eBay OAuth token mgmt
│   ├── ebay_store.py        # Trading/Inventory APIs for store sync
│   ├── drafting.py          # LLM-generated eBay titles/descriptions
│   ├── ai_staging.py        # Work Queue AI assistance
│   ├── llm.py               # Local Gemma client wrapper
│   ├── labels.py            # item hierarchy classification
│   └── crypto.py / security.py  # encrypted credential storage
└── scrapers/            # Per-source scrapers, all subclass base.BaseScraper
    ├── auctioneer_software.py   # Whitley, Roller, Dickensheet (Apollo/GraphQL)
    ├── public_surplus.py
    ├── bid_wrangler.py
    └── govdeals.py
```

**Scheduler:** `main.py` registers APScheduler jobs at startup for ingestion sweeps, valuation worker runs, watchlist pruning (14d after end), and closed-auction pruning (24h after end, only when user did not bid). Modifying these jobs requires understanding their interaction — pruning races with ingestion if intervals overlap.

**Bid tracking:** during ingestion, the scrapers cross-reference the Bidder ID stored under Credentials against the Apollo state of each lot to set `Item.is_user_bidding` — this flag protects the item from auto-prune.

### Frontend layering

```
frontend/src/
├── App.tsx              # provider stack: QueryClient + ThemeProvider + RouterProvider + Toaster
├── router.tsx           # createBrowserRouter, all routes lazy
├── routes/              # one .tsx per route (LoginPage, ResearchPage, BiddingPage,
│                        # WatchlistPage, WorkQueuePage, FulfillmentPage, LedgerPage,
│                        # SettingsPage, PlaceholderPage for store/vehicles/rma)
├── components/
│   ├── ui/              # shadcn primitives (owned in-tree, do not npm-install)
│   ├── shell/           # AppLayout, AppSidebar, TopBar, ProtectedRoute, ThemeToggle
│   ├── command/         # Cmd+K palette
│   ├── common/          # Money, Percent, EmptyState
│   ├── research/        # ResearchTable, ItemDetailSheet, BidForm, ValuationPanel, …
│   └── bidding/         # BidsTable, ComparablesDrawer, BidStatusBadge
├── hooks/               # useResearchItems, useBids, useWatchlist, useCountdown,
│                        # useCommandRegistry (no React Context for state)
└── lib/                 # api.ts (token-aware fetch), auth.ts, queryClient.ts,
                         # format.ts (profit math + truncateTitle), types.ts
```

State management is TanStack Query (server state) + local component state (UI state); no Redux/Zustand. Auth state is a small event-bus module in `lib/auth.ts`. For UI primitives, design tokens, and motion rules, see [DESIGN.md](DESIGN.md).

### Data flow (the canonical lifecycle)

1. **Ingest** → APScheduler triggers a scraper → rows written to `items` with raw lot data.
2. **Valuate** → `valuation_worker` picks up pending items → calls `ebay_browse` → writes computed ROI back to the same row.
3. **Surface** → ResearchView ranks by ROI; user manually bids on the source site (no auto-bidding ever).
4. **Win → Stage** → user moves won items into the Work Queue (`InventoryItem`) → barcode/UPC scan or AI populates draft.
5. **List** → AI-generated eBay draft pushed via Trading API.
6. **Sell** → StoreView syncs back live listings, watchers, and sales.

### Hard rules (encoded as code expectations)

- **Valuation method** is fixed: trimmed median of eBay **active** listings with outlier removal + a "market adjustment factor" haircut. Do not switch to sold-comps or change the formula without updating the labeled-dataset validation in `tests/test_valuation.py`.
- **Scraping**: fail closed on HTTP 429/403; do not add proxies. eBay Browse API responses must be cached aggressively (5,000 calls/day hard quota).
- **No auto-bidding.** The app surfaces; the human bids.
- **Single-user** auth model. Do not generalize to multi-tenant.
- **External-API tests** use VCR-style recorded fixtures. Adding network calls to tests is a regression.
- **Scraper Data Contract**: All scrapers MUST adhere to the [docs/scraper_data_contract.md](docs/scraper_data_contract.md). Scrapers are responsible for returning standardized Pydantic models; downstream services must never handle platform-specific raw data.

## Documentation Conventions

- [docs/index.md](docs/index.md) is the manifest — consult it first, then load only the narrowest doc relevant to your task.
- [docs/srp.md](docs/srp.md) details the Single Responsibility Principle (SRP) boundaries of all backend services and their relationship matrix.
- [docs/progress_report.md](docs/progress_report.md) tracks current phase; **update it when committing meaningful changes** so the next session has the handoff context.
- [docs/api_manifest.md](docs/api_manifest.md) is the consolidated reference for eBay Browse, Public Surplus, and the reverse-engineered Apollo/GraphQL shapes for Whitley/Roller — read before touching scrapers or valuation.
- [docs/superpowers/specs/](docs/superpowers/) holds phase specs and implementation plans; new plans go into `docs/superpowers/plans/` dated `YYYY-MM-DD-name.md`.

## Repo Hygiene Notes

The working tree currently carries many ad-hoc `test_*.py`, `fix*.py`, `*.html` artifacts at the backend root and a few at the repo root (e.g. `check_db.py`, `replace_modal.py`, `old_file_tmp.tsx`). These are experiment scratch files, not the test suite — the real tests live in `backend/tests/`. Don't import from the scratch files and avoid sweeping deletions without confirming with the user.

`.env` is gitignored and holds all secrets (DB creds, eBay OAuth keys, Resend API key, alert email addresses) — see `.env.template` for the required keys.
