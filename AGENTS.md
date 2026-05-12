# Auction Master ERP: Project Overview & Guidelines

Auction Master is a comprehensive Auction Arbitrage ERP suite designed to automate the lifecycle of flipping items from local auctions to eBay. It handles discovery, valuation, bidding tracking, inventory staging (Work Queue), and store analytics.

## 🚀 Project Overview

- **Core Purpose:** Identify high-ROI opportunities at local auctions by cross-referencing auction lots with eBay market data.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy (PostgreSQL), Alembic, APScheduler.
- **Frontend:** React (Vite/TypeScript), Tailwind CSS with a "Glass Master" glassmorphism aesthetic.
- **Database:** PostgreSQL 16.
- **Key Features:**
  - **Ingestion Engine:** Scrapes Apollo/GraphQL-based auction sites (Whitley, Roller).
  - **Valuation Engine:** Uses eBay Browse API and LLM-based title cleaning to calculate ROI.
  - **Work Queue:** Staging area for inventory with barcode scanning and AI-generated eBay drafts.
  - **Store Analytics:** Real-time sync of eBay active listings and sales KPIs.

## 🛠 Building and Running

### Docker (Recommended)

The entire stack can be launched via Docker Compose:

```bash
# Start all services (DB on 5434, Backend on 8000, Frontend on 5174)
docker-compose up --build
```

### Manual Development Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## 📜 Development Conventions

### Documentation & Context

- **Primary Index:** Always refer to `docs/index.md` for the manifest of all research and design documents.
- **Session Start:** Read `docs/progress_report.md` to align with the current implementation phase.
- **Session End:** Update `docs/progress_report.md` with any major changes or completed tasks.

### Coding Rules

- **Scraping Strategy:** Fail closed on 429/403 errors. Avoid proxies. Aggressively cache eBay Browse API responses to preserve the 5,000 calls/day quota.
- **Auth & Scope:** Strictly a single-user local application. JWT-based auth is implemented for the backend, but multi-tenancy is out of scope.
- **Bidding:** No auto-bidding or sniping. The app surfaces opportunities for manual action.

### Testing & Validation

- **External APIs:** Use VCR-style recorded fixtures for tests involving external APIs (eBay, etc.) to save quota.
- **Matching Pipeline:** Do not alter the matching logic (RapidFuzz/Condition mapping) without validating against the existing labeled dataset.

## 📁 Key Directories

- `backend/app/routers/`: API endpoints (Admin, Items, Inventory).
- `backend/app/services/`: Core logic (Ingestion, Valuation, Drafting, eBay Sync).
- `frontend/src/views/`: Individual ERP tabs (Research, Bidding, Work Queue, Store, Settings).
- `docs/superpowers/`: Detailed specs and implementation plans for each project phase.

## Enviroment Considerations

This application and directory is on a remote machine, not local, so be careful about local only env variables and files. They should all be stored in the .env file and not committed to version control.

## Git

When committing changes, make sure to update the progress report.md file to reflect the current state of the project and any changes that have been made.
