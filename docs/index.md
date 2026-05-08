# Documentation Index — Auction Arbitrage Application

This directory contains the core documentation for the Auction Arbitrage project. To optimize token and context usage, **AI agents should read this index first** and only retrieve full documents when specific details are required for the current task.

---

## 🚀 Goals & Strategy
- **[Auction Arbitrage App Goals.md](./Auction%20Arbitrage%20App%20Goals.md)**: Executive summary, project scope (v1), and core business logic.
- **[superpowers/plans/Initial Starting Plan.md](./superpowers/plans/Initial%20Starting%20Plan.md)**: The original high-level roadmap covering all phases from scaffolding to deployment.

## 📊 Status & Progress
- **[progress_report.md](./progress_report.md)**: Current development status, completed milestones, and immediate handoff context.

## 🛠 Technical Manifests
- **[api_manifest.md](./api_manifest.md)**: **CRITICAL.** Consolidated research on eBay Browse API, Public Surplus API, and reverse-engineered GraphQL/Apollo structures for Whitley and Roller Auction. Includes fee structures and condition mapping enums.

## 🏠 Auction House Research
Raw data, capture notes, and schema structures for individual sources:
- **[Public Surplus.md](./Public%20Surplus.md)**
- **[Whitley Auction.md](./Whitley%20Auction.md)**
- **[Roller Auction.md](./Roller%20Auction.md)**

## 💎 Phase 3: Valuation Engine (Active Implementation)
Current focus area for automated market analysis and ROI calculation:
- **[superpowers/specs/2026-05-08-valuation-engine-design.md](./superpowers/specs/2026-05-08-valuation-engine-design.md)**: Design specification for the automated valuation workflow.
- **[superpowers/plans/2026-05-08-ebay-valuation-engine.md](./superpowers/plans/2026-05-08-ebay-valuation-engine.md)**: Implementation plan for Task 1-5 (Models, OAuth, Search, Math).
- **[superpowers/plans/2026-05-08-valuation-engine.md](./superpowers/plans/2026-05-08-valuation-engine.md)**: Plan for Task 6+ (LLM Keyword Extraction, Background Worker, Frontend).

---

### AI Usage Guidelines
1. **Consult this Index** to find the narrowest document relevant to your directive.
2. **Do not read raw research files** (`Public Surplus.md`, etc.) unless implementing a specific scraper for that site.
3. **Always check `progress_report.md`** before starting a new session to understand where the last agent left off.
