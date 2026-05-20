# Project Tracking: Gemini AI Integration

This document tracks the phased implementation of the Gemini AI integration for Auction Master.

## Implementation Status Overview

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Foundation & SRP-Based Routing | ✅ Completed |
| **Phase 2** | Multimodal & Structured Output | ✅ Completed |
| **Phase 3** | Hybrid AI Engine (Enrichment vs Valuation) | 🔄 In Progress |

---

## Phase 1: Foundation & SRP-Based Routing
**Goal:** Implement the infrastructure to support multiple AI providers and provide a UI toggle for the user.

- [x] **Task 1.1: Frontend Settings UI**
  - [x] Add "AI Enrichment" section to `SettingsView.tsx`.
  - [x] Implement `ai_provider` (Local vs Gemini) toggle.
  - [x] Add `gemini_api_key` input (password type).
  - [x] Add `ai_concurrency_limit` slider/input (range 1-100).
- [x] **Task 1.2: Backend Provider Abstraction**
  - [x] Create `backend/app/services/ai_providers/` directory.
  - [x] Define `AIProvider` base interface/protocol.
  - [x] Implement `LocalProvider` (migrating logic from `llm.py`).
  - [x] Implement `GeminiProvider` (initial HTTPx implementation).
- [x] **Task 1.3: Dynamic Pipeline Routing**
  - [x] Update `enrichment.py` to instantiate provider based on settings.
  - [x] Refactor `enrich_pending_items` to use dynamic concurrency limit.
- [x] **Task 1.4: Verification**
  - [x] Test local provider still works with limit 6.
  - [x] Test Gemini provider works with API key and high concurrency.

---

## Phase 2: Multimodal & Structured Output
**Goal:** Enhance accuracy by using Gemini's advanced features.

- [x] **Task 2.1: Native JSON Schema Enforcement**
  - [x] Update `GeminiProvider` to use `response_mime_type="application/json"` and provide a strict schema.
  - [x] Remove manual JSON cleaning/regex logic for Gemini responses.
- [x] **Task 2.2: Multi-Image Analysis**
  - [x] Modify `enrich_single_item` to pass the full `images` array to the provider.
  - [x] Update prompt to instruct Gemini to look for labels/damage across all photos.
- [x] **Task 2.3: Condition Scoring Update**
  - [x] Refine condition grading logic based on visual evidence from multiple images.

---

## Phase 3: Hybrid AI Engine (Cost-Optimized vs reasoning)
**Goal:** Implement the SRP-based split between text-only enrichment and multimodal valuation.

- [ ] **Task 3.1: Cost-Optimized Enrichment Engine**
  - [ ] Implement `GeminiProvider.enrich_text_only()` using `gemini-1.5-flash-8b`.
  - [ ] Specialized system prompt for high-speed categorization and tagging without images.
- [ ] **Task 3.2: Multimodal Valuation reasoning Engine**
  - [ ] Implement `GeminiProvider.valuate_multimodal()` using `gemini-1.5-flash`.
  - [ ] reasoning prompt: Analyzes 5+ images + eBay search results to determine Market Adjustment Factor.
- [ ] **Task 3.3: Decoupled enrichment service**
  - [ ] Refactor `enrichment.py` to only call the Text-Only engine.
  - [ ] Move image-based reasoning into the `valuation_worker.py` flow.
- [ ] **Task 3.4: Verification**
  - [ ] Verify classification costs are reduced (check token usage in logs).
  - [ ] Verify valuation accuracy is increased by leveraging vision-reasoning.

---

## Phase 4: Work Queue AI Drafting (Post-Integration)
**Goal:** Streamline the "Win to List" flow with automated drafting.

- [ ] **Task 4.1: Drafting Service**
  - [ ] Create `backend/app/services/drafting_agent.py`.
- [ ] **Task 4.2: Work Queue Integration**
  - [ ] Add an "AI Draft" button to the Work Queue UI.

---

## Maintenance Notes
- **Update Rule:** This document must be updated at the end of every session where progress is made.
- **Provider Rule:** New AI models (e.g., Claude, OpenAI) should be added as new providers in `backend/app/services/ai_providers/` without breaking existing ones.
