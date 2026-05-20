# Service Relationship & SRP Matrix

As part of the transition to a Single Responsibility Principle (SRP) architecture, all data-touching components in the Auction Master backend have been decomposed into small, manageable processes. This document outlines the boundaries, inputs, outputs, and relationships across Services, Scrapers, Routers, and Core components.

## Relationship Matrix

| Component Type | Module | Receives Data From (Dependencies) | Provides Data To (Consumers) |
| :--- | :--- | :--- | :--- |
| **Scraper** | `whitley_auction.py` | Auction Site (GraphQL) | `discovery.py`, `bid_sync.py` |
| **Scraper** | `roller_auction.py` | Auction Site (GraphQL) | `discovery.py`, `bid_sync.py` |
| **Scraper** | `auctioneer_software.py` | N/A (Shared Logic) | `whitley_auction.py`, `roller_auction.py` |
| **Scraper** | `public_surplus.py` | Auction Site (HTML/JSON) | `discovery.py`, `bid_sync.py` |
| **Scraper** | `bid_wrangler.py` | Auction Site (API) | `discovery.py`, `bid_sync.py` |
| **Scraper** | `govdeals.py` | Auction Site (HTML) | `discovery.py`, `bid_sync.py` |
| **Service** | `discovery.py` | `scrapers.*` | `pipeline.py`, `routers.admin` |
| **Service** | `bid_sync.py` | `scrapers.*`, `security.py`, `valuation_worker.py` | `pipeline.py`, `routers.admin` |
| **Service** | `enrichment.py` | `llm.py` | `pipeline.py` |
| **Service** | `ebay_valuation.py` | `ebay_auth.py`, `ebay_browse.py`, `valuation.py` | `pipeline.py`, `valuation_worker.py` |
| **Service** | `pipeline.py` | `discovery.py`, `bid_sync.py`, `enrichment.py`, `ebay_valuation.py` | `main.py`, `routers.admin` |
| **Service** | `llm.py` | External Local LLM | `enrichment.py`, `valuation.py`, `ai_staging.py` |
| **Service** | `ebay_auth.py` | eBay OAuth Service | `ebay_browse.py`, `ebay_store.py`, `ebay_valuation.py`, `routers.*` |
| **Service** | `ebay_browse.py` | `ebay_auth.py`, eBay API | `ebay_valuation.py`, `valuation_worker.py`, `routers.inventory` |
| **Service** | `security.py` | `crypto.py`, `database.py` | All services/routers needing credentials |
| **Router** | `admin.py` | `pipeline.py`, `discovery.py`, `bid_sync.py` | Frontend Admin View |
| **Router** | `items.py` | `scrapers.*`, `ebay_browse.py`, `security.py` | Frontend Research/Watchlist View |
| **Router** | `inventory.py` | `ai_staging.py`, `labels.py`, `drafting.py` | Frontend Work Queue View |
| **Router** | `ebay.py` | `ebay_store.py`, `ebay_auth.py` | Frontend Store View |
| **Core** | `models.py` | SQLAlchemy Base | All data-touching modules |
| **Core** | `schemas.py` | Pydantic Base | All API & internal data contracts |
| **Core** | `auth.py` | `security.py`, `database.py` | All secured API endpoints |

---

## 🕷 Scrapers (`backend/app/scrapers/`)
Scrapers are responsible for raw data extraction from external auction platforms. They MUST return standardized Pydantic models defined in `app.schemas.scraping`.

- **`whitley_auction.py`**: Specialized scraper for Whitley Auction; handles bid tracking via `/account/watchlist` and Redux auth state.
- **`roller_auction.py`**: Specialized scraper for Roller Auction; utilizes standard `/account/bids` for bid tracking.
- **`auctioneer_software.py`**: Abstract base class (`AuctioneerSoftwareBaseScraper`) containing shared Apollo GraphQL state extraction and lot discovery logic.
- **`public_surplus.py`**: Scrapes the Public Surplus site, handling session management and location-based filtering.
- **`bid_wrangler.py`**: Interacts with the BidWrangler API for platforms using that engine.
- **`govdeals.py`**: Scrapes GovDeals search results and lot details.
- **`base.py`**: The abstract base class (`BaseScraper`) ensuring all scrapers implement discovery, lot fetching, and health checks.

## ⚙️ Services (`backend/app/services/`)
Services contain the core business logic and orchestration.

- **`discovery.py`**: Executes Phase 1 ingestion; iterates through scrapers to populate the `items` table.
- **`bid_sync.py`**: Synchronizes current user bids to prevent auto-pruning of active items.
- **`enrichment.py`**: Uses `llm.py` to categorize and tag items discovered during ingestion.
- **`ebay_valuation.py` / `valuation.py`**: Computes market value and ROI based on eBay active listings.
- **`valuation_worker.py`**: Orchestrates background/parallel processing for batch valuations.
- **`pipeline.py`**: High-level orchestrator that runs the entire ingestion sequence (Discovery -> Sync -> Enrichment -> Valuation).
- **`ebay_auth.py`**: Handles OAuth2 token lifecycle for all eBay API interactions.
- **`ebay_browse.py`**: Fetches competitor listing data from the eBay Browse API.
- **`ebay_store.py`**: Manages the user's active eBay inventory, orders, and performance stats.
- **`ai_staging.py`**: Generates AI listing content and packaging recommendations for won items.
- **`drafting.py`**: Creates human-readable eBay titles and HTML descriptions.
- **`labels.py`**: Generates thermal label PDFs for inventory tracking.
- **`llm.py`**: Interfaces with the local Gemma model for NLP tasks.
- **`security.py` / `crypto.py`**: Manage application-level secrets and low-level encryption.

## 🛣 Routers (`backend/app/routers/`)
Routers define the HTTP interface and map incoming requests to service calls.

- **`admin.py`**: Handles system configuration, ingestion triggers, and auction house management.
- **`items.py`**: Provides endpoints for the Research and Watchlist views (browsing, filtering, manual valuation).
- **`inventory.py`**: Manages the Work Queue, staging items, and AI drafting for eBay.
- **`ebay.py`**: Interfaces with store synchronization and performance analytics.
- **`analytics.py`**: Computes financial KPIs and historical performance metrics.
- **`credentials.py`**: Securely manages third-party API keys and auction logins.
- **`packaging.py`**: CRUD for standardized shipping materials and configurations.
- **`expenses.py`**: Tracks overhead and item-specific costs for net profit analysis.

## 🏛 Core Components (`backend/app/`)
The foundation of the data architecture.

- **`models.py`**: The definitive SQLAlchemy source of truth for the database schema.
- **`schemas.py`**: Defines the data transfer objects (DTOs) for all API requests and responses.
- **`database.py`**: Manages connection pooling, engine configuration, and session lifecycle.
- **`auth.py`**: Implements JWT authentication, password hashing, and role-based access.
- **`main.py`**: Bootstraps the FastAPI application and schedules background maintenance jobs (pruning, pipeline sweeps).
