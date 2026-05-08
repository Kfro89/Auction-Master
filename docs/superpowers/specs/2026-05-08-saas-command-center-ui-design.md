# Auction Master ERP: SaaS Command Center UI Design

## 1. Overview
The Auction Master ERP UI is transitioning from the "Frosted Alabaster" aesthetic to an "Ultra-Minimalist SaaS Command Center". The design focuses on extreme clarity, generous whitespace, and a professional balance. It relies heavily on a central Command Palette for navigation and actions, freeing up the screen edge-to-edge for pure data presentation.

## 2. Architecture & Layout
*   **App Shell Background:** Off-white (`#FAFAFA` or `#F8F9FA`) to provide a clean canvas. No heavy background wrappers or tactile noise.
*   **Navigation (The Floating Pill):**
    *   A floating, pill-shaped vertical sidebar anchored to the left-center of the screen.
    *   Contains only minimalist `lucide-react` icons (Research, Bidding, Queue, Store, Settings).
    *   No text labels.
    *   Active states are indicated by the primary accent color.
    *   Features a soft, large-radius drop shadow.
*   **Content Area:**
    *   Edge-to-edge data tables and grids.
    *   Maximizes available width and height.
    *   Uses extreme whitespace to let the data breathe.

## 3. The Command Palette (Cmd+K)
*   **Summoning:** Triggered globally via `Cmd+K`. Appears centered on the screen with a subtle backdrop blur over the main application.
*   **Functionality:**
    *   **Global Search:** Search for items by title or ID across all views.
    *   **Navigation:** Jump to different views (e.g., typing "Go to Bidding" or just "Bidding").
    *   **Quick Actions:** Execute context-aware actions like "Scan Barcode" or "Add Item".
*   **Design:** A massive, crisp input field with highly legible results below it.

## 4. Styling & Components (SaaS Minimalist)
*   **Typography:**
    *   `Inter` (Sans) is used globally for all text.
    *   High contrast hierarchy: Headings use dark slate (`#111827`), secondary/tertiary text uses soft grey (`#6B7280`).
*   **Colors:**
    *   Dominant palette: Whites and light greys.
    *   Primary Accent: Emerald/Teal (`#059669`). Used very sparingly for primary action buttons, active navigation states, and highlighting high-ROI items.
*   **Tables & Grids:**
    *   No vertical dividers.
    *   Ultra-thin (1px) horizontal dividers in very light grey (`#F3F4F6`).
    *   Extremely large padding between cells.
    *   Soft, subtle background shifts on row hover.
*   **Borders & Shadows:**
    *   Borders, where necessary, are 1px and ultra-light.
    *   Shadows are reserved for floating elements (the navigation pill, the Command Palette, modals) and use a soft, large radius (e.g., Tailwind's `shadow-xl`).

## 5. Scope and Constraints
*   This is a purely frontend UI/UX rework affecting React components and Tailwind configuration.
*   No backend API endpoints or database schemas will be altered.
*   Existing functionality (Valuation, Bidding, Work Queue, Store Sync) remains intact, only its presentation changes.