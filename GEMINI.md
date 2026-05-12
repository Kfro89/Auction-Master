# Auction Arbitrage & Profit Analysis Application

## Project Overview

This is a single-user application designed to identify profitable arbitrage opportunities on niche auction websites (such as Public Surplus). The application crawls target auction platforms, extracts active listing data, cross-references these items with eBay's marketplace to estimate market value, and calculates estimated net profits based on simulated bid amounts and specific auction house buyer's fees.

### Architecture & Technologies

The project is structured as a monorepo with the following main components:

-   **Backend (`/backend`):** A RESTful API built with **Python** and **FastAPI**. It uses **SQLAlchemy** for database interactions, **Alembic** for schema migrations, and tools like **BeautifulSoup4** and **httpx** for data scraping and target site ingestion.
-   **Frontend (`/frontend`):** A modern Single Page Application (SPA) built with **React**, **TypeScript**, and **Vite**. UI components and styling are managed using **Tailwind CSS**.
-   **Database:** **PostgreSQL** 16 is used as the primary relational database.
-   **Browser Extension (`/extension`):** A custom extension to assist in browser-based interactions or scraping tasks.

## Building and Running

The project relies on Docker Compose for easy orchestration of the full stack.

### Quick Start (Docker Compose)

1.  Copy the environment template: `cp .env.template .env` and adjust the variables if necessary.
2.  Start the entire stack:
    ```bash
    docker-compose up --build
    ```

**Service Endpoints:**
-   **Frontend:** `http://localhost:5174` (Note: internal Vite port 5173 is mapped to 5174).
-   **Backend API:** `http://localhost:8000` (API documentation available at `/docs`).
-   **PostgreSQL:** `localhost:5434`.

### Local Development (Standalone)

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
npm run dev
```

## Development Conventions

-   **Valuation Methodology:** The application relies primarily on eBay active listings (Browse API) because sold-listing data is currently unavailable. Valuations are calculated using trimmed medians, outlier removal, and a specific "market adjustment factor" to compensate for active listing price inflation.
-   **Data Ingestion:** While the pilot (Public Surplus) has an API, other target sites require reverse engineering browser network requests to extract listing details efficiently without relying on brittle HTML scraping.
-   **Code Quality:** The frontend is configured with strict TypeScript settings and ESLint.
-   **AI Integration:** The workspace integrates the `Gemini-Kit` extension, suggesting an AI-assisted workflow with specific agents (Planner, Coder, Reviewer) and compound learning patterns. Use the defined planning phases and ensure thorough testing of the valuation logic.