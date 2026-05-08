# Application Architecture & Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy, HTTPX.
- **Frontend:** React (Vite/TypeScript), Tailwind CSS.
- **Database:** PostgreSQL 16.
- **Async & Scheduling:** Use APScheduler for daily sweeps and standard `asyncio` for
  hot-polling.

# Documentation & Context Usage

- **Entry Point:** Always refer to **`docs/index.md`** for project goals, status, and manifests.
- **Efficiency:** Do NOT read documentation files in bulk. Use the index to target specific research or plans.
- **Status:** Consult `docs/progress_report.md` at the start of every session to align with the current implementation phase.
- **Status Updates:** Update `docs/progress_report.md` at the end of every session to document your changes and current status.

# Coding Rules & Constraints

- **Scraping Strategy:** Always fail closed on 429/403 errors (skip rather than retry
  hard). Do not use proxies. Only use Playwright if reverse-engineered HTTP requests
  explicitly fail.
- **eBay API Usage:** Aggressively cache eBay Browse API responses to preserve the 5,000
  calls/day quota.
- **Auth / Multi-tenancy:** Do NOT implement authentication, user login, or multi-tenancy.
  This is strictly a single-user local application.
- **Auto-bidding:** Do NOT implement sniper or auto-bidding functionality. The application
  must only surface opportunities for manual bidding.

# Testing & Validation

- Use VCR-style recorded fixtures for all external API tests to avoid burning live quota.
- Maintain a strict matching precision harness. Do not alter the matching pipeline
  (RapidFuzz/Condition mapping) without running the test suite against the labeled dataset.
