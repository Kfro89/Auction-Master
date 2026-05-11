# Auction Arbitrage Project: Progress Report & Handoff

This document summarizes the current state of the Auction Arbitrage project, capturing the architectural decisions, codebase structure, and technical context to facilitate a smooth transition to a new development environment.

## Current State

We have successfully completed **Phase 0 (Research)**, **Phase 1 (Scaffolding)**, and the core implementation for **Phase 2 (Data Ingestion)**. The project is currently blocked from end-to-end testing only by the lack of a running Docker daemon on the current host machine.

### 1. Architecture & Environment Scaffold
- **Infrastructure:** Configured a local environment via `docker-compose.yml` comprising:
  - `db`: PostgreSQL 16
  - `backend`: Python 3.11 with FastAPI and Uvicorn
  - `frontend`: Node.js 20 with React, Vite, and Tailwind CSS
- **Database Schema:** Designed a unified SQLAlchemy model (`backend/app/models.py`) capable of normalizing disparate data from multiple auction platforms into standardized `AuctionHouse`, `Auction`, and `Item` entities.
- **Migrations:** Configured Alembic (`backend/alembic/env.py`) to automatically detect model changes.

### 2. Scraping Engine (Phase 2)
Based on Phase 0 research, we pivoted Phase 2 to pilot **Whitley Auction** and **Roller Auction** simultaneously, as both utilize the identical SaaS platform ("Auctioneer Software").

- **Base Interface (`backend/app/scrapers/base.py`)**: Abstract base class enforcing discovery and extraction contracts.
- **Implementation (`backend/app/scrapers/auctioneer_software.py`)**: 
  - Utilizes `httpx.AsyncClient` for robust HTTP requests.
  - Instead of brittle DOM parsing, it employs a highly efficient Regex strategy to extract the `window.__APOLLO_STATE__` JSON object injected into the page HTML by the server. 
  - Directly maps the internal Apollo GraphQL `Auction` and `AuctionLot` entities to bypass API protections and pagination complexities.
- **Ingestion Orchestration (`backend/app/services/ingestion.py`)**: Handles the normalization of Apollo state JSON, timestamp conversion, and bulk `upsert` logic into the PostgreSQL database.

### 3. API Endpoints
- `POST /api/admin/scrape/whitley`: Triggers ingestion for Whitley Auction (applies an 18.5% buyer's premium).
- `POST /api/admin/scrape/roller`: Triggers ingestion for Roller Auction (applies a 13.0% buyer's premium).

---

## Next Steps: Environment Initialization (Target Machine)

When you resume development on the new machine with Docker installed, follow these steps to initialize the environment and verify the ingestion pipeline:

### Step 1: Start the Docker Stack
From the root directory containing `docker-compose.yml`:
```bash
docker compose up --build -d
```
Verify that `db`, `backend`, and `frontend` containers are running and healthy.

### Step 2: Initialize the Database Schema
Execute the following commands to generate and apply the initial Alembic migration based on the unified schema:
```bash
docker compose exec backend alembic revision --autogenerate -m "Initial schema"
docker compose exec backend alembic upgrade head
```

### Step 3: Run the Ingestion Pilot
With the backend running (default port 8000), trigger the manual scraping endpoints to populate the database:
```bash
curl -X POST http://localhost:8000/api/admin/scrape/whitley
curl -X POST http://localhost:8000/api/admin/scrape/roller
```
*Note: Monitor the backend container logs (`docker compose logs -f backend`) to observe the discovery and extraction process.*

### Step 4: Proceed to Phase 3 (Valuation)
Once ingestion is verified, the next major milestone is **Phase 3: Valuation & Market Analysis**. This will involve integrating the eBay Browse API to evaluate the ingested `Items` and assigning profitability scores.
