# Auction Master ERP: Project Overview & Guidelines

Auction Master is a comprehensive Auction Arbitrage ERP suite designed to automate the lifecycle of flipping items from local auctions to eBay. It handles discovery, valuation, bidding tracking, inventory staging (Work Queue), and store analytics.

## 🚀 Project Overview

- **Core Purpose:** Identify high-ROI opportunities at local auctions by cross-referencing auction lots with eBay market data, estimating net profits based on bid amounts and buyer's fees.
- **Backend (`/backend`):** Python 3.12, FastAPI, SQLAlchemy (PostgreSQL), Alembic, APScheduler. Uses BeautifulSoup4 and httpx for data scraping and target site ingestion.
- **Frontend (`/frontend`):** React (Vite/TypeScript), Tailwind CSS with a "Glass Master" glassmorphism aesthetic.
- **Mobile App (`/mobile` or `.worktrees/mobile`):** Flutter (Dart) cross-platform application matching the React frontend.
- **Database:** PostgreSQL 16.
- **Key Features:**
  - **Ingestion Engine:** Scrapes Apollo/GraphQL-based auction sites (Whitley, Roller, Public Surplus, Dickensheet).
  - **Valuation Engine:** Uses eBay Browse API and LLM-based title cleaning to calculate ROI.
  - **Work Queue:** Staging area for inventory with barcode scanning and AI-generated eBay drafts.
  - **Store Analytics:** Real-time sync of eBay active listings and sales KPIs.

## 🌍 Distributed Development Environment

This project utilizes a distributed development architecture across a local laptop and a remote machine:
- **Execution Context:** The AI agent (Gemini CLI) and mobile application testing (Xcode/iOS Simulator) are executed on the **local laptop**.
- **Remote Application Hosting:** The core application stack (FastAPI backend, React frontend web app, and PostgreSQL database) runs on a **remote machine at `192.168.0.16`** and is exposed to the public internet via a reverse proxy at `https://auction.autom8tr.com`.
- **Environment Considerations:** Be careful about local-only env variables and files. They should all be stored in the `.env` file and not committed to version control.
- **Code Modification Rules:**
    - Changes to the core application (Backend/Frontend Web) must be executed on the remote machine (e.g., via SSH or Docker exec commands).
    - Changes to the Flutter Mobile App code are made on the local laptop and will be pushed/synced to the remote machine's repository.

## 🛠 Building and Running

### Docker (Recommended for Full Stack)

The entire web/backend stack can be launched via Docker Compose:
```bash
# Copy env template if needed: cp .env.template .env
docker-compose up --build
```
**Service Endpoints:**
- **Frontend:** `http://localhost:5174` (mapped to 5173 internally).
- **Backend API:** `http://localhost:8000` (API docs at `/docs`).
- **PostgreSQL:** `localhost:5434`.

### Manual Development Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev -- --host
```

## 📜 Development Conventions

### Documentation & Context

- **Primary Index:** **Always refer to `docs/index.md`** for the manifest of all research and design documents.
- **Session Start:** Read `docs/progress_report.md` to align with the current implementation phase.
- **Session End & Git:** When committing changes, update `docs/progress_report.md` to reflect the current state of the project and any changes that have been made.

### Coding Rules

- **Valuation Methodology:** Relies primarily on eBay active listings (Browse API). Valuations are calculated using trimmed medians, outlier removal, and a specific "market adjustment factor".
- **Scraping Strategy:** Fail closed on 429/403 errors. Avoid proxies. Aggressively cache eBay Browse API responses to preserve the 5,000 calls/day quota.
- **Auth & Scope:** Strictly a single-user application. JWT-based auth is implemented for the backend.
- **Bidding:** No auto-bidding or sniping. The app surfaces opportunities for manual action.
- **Testing:** Use VCR-style recorded fixtures for tests involving external APIs. Do not alter matching logic without validating against the labeled dataset.
- **Code Quality:** The frontend is configured with strict TypeScript settings and ESLint.

## 📁 Key Directories & Resources

- `backend/app/routers/`: API endpoints (Admin, Items, Inventory, Credentials).
- `backend/app/services/`: Core logic (Ingestion, Valuation, Drafting, Crypto, eBay Sync).
- `frontend/src/views/`: Individual ERP tabs (Research, Vehicles, Bidding, Work Queue, Store, Settings).
- `docs/index.md`: **CORE DIRECTORY INDEX.** Go here first to find specs, plans, and technical manifests.
- `docs/mobile_app_testing_guide.md`: MUST-READ for mobile app architecture, iOS constraints, testing rules, and backend connectivity gotchas.
- `docs/superpowers/`: Detailed specs and implementation plans for each project phase.

---
**AI Integration:** The workspace integrates the `Gemini-Kit` extension, suggesting an AI-assisted workflow with specific agents (Planner, Coder, Reviewer). Use the defined planning phases and ensure thorough testing of logic.
