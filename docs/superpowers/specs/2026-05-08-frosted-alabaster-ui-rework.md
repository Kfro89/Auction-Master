# Design Spec: Frosted Alabaster UI Rework

## 1. Vision & Aesthetic

Transition the Auction Master ERP from a dark-themed, textured "Glass Master" aesthetic to a clean, light-mode "Frosted Alabaster" look. The design emphasizes professionalism, clarity, and "liquid glass" elements.

### 1.1 Color Palette (Light Mode)

- **Background:** Primary background `#FAFAFA` (Off-white). A subtle radial gradient `radial-gradient(circle at top, #FFFFFF 0%, #F3F4F6 100%)`.
- **Surface (Glass):** `rgba(255, 255, 255, 0.65)` with `backdrop-filter: blur(20px)`.
- **Borders:** Thin, semi-transparent borders `1px solid rgba(0, 0, 0, 0.05)` or `rgba(255, 255, 255, 0.4)` for depth.
- **Primary Accents:** Deep Blue (`#2563EB`) and Slate (`#0F172A`).
- **Feedback Colors:** Emerald (`#10B981`) for success/high-ROI, Amber (`#F59E0B`) for warnings/ending-soon.

### 1.2 Iconography & Typography

- **Icon Library:** `lucide-react` for all icons. **ABSOLUTELY NO EMOJIS.**
- **Navigation Icons:**
  - Research: `Search`
  - Bidding: `Gavel`
  - Work Queue: `Package`
  - Store: `BarChart3`
  - Settings: `Settings`
- **Typography:** Inter (Sans-serif) for general UI; JetBrains Mono for IDs, Lot Numbers, and Prices.

## 2. Research View Enhancements

### 2.1 Time-Based KPIs

The high-ROI highlight bar will be replaced by three distinct KPI cards, when clicking on each card, it will filter the `dense-grid` to show only items that match the card's criteria:

1.  **Ending Today:** Count of items where `end_time` falls within the current calendar day.
2.  **Ending Tomorrow:** Count of items where `end_time` falls within the next calendar day.
3.  **Ending This Week:** Count of items where `end_time` is within the next 7 days.

### 2.2 Table Interactivity

- **Sortable Columns:** Every column header in the `dense-grid` will be clickable to toggle `ASC` or `DESC` sorting.
- **Quick-Look Images:** Clicking a thumbnail will open a centered modal with an enlarged view of the item image.
- **Iframe Title Modal:** Clicking the title of an item will open a large (90% width/height) glass-frosted modal containing an `<iframe>` to the item's original source URL.

## 3. UI/UX Refinements

### 3.1 Button & Input Standards

- **Uniform Inputs:** Input fields will share a consistent frosted style (`bg-white/50`, `border-slate-200`) and a slight shadow on focus.
- **Feedback:**
  - **Hover:** Tooltips (Slate background, white text) appear after 300ms.
  - **Click:** Subtle `scale(0.98)` and `box-shadow: inset 0 2px 4px rgba(0,0,0,0.05)`. No layout shifting.
- **Glass Tiles:** Maintain the "frosted" panel look for all containers, ensuring readability over the lighter background.

## 4. Technical Components

- **`LucideIcon` Integration:** Standardizing icon usage across the app.
- **`SortableTable` Hook:** A custom hook to manage table state (data, sort key, sort direction).
- **`Modal` & `Lightbox`:** New reusable components for displaying the enlarged images and iframes.
- **`Tooltip`:** A wrapper component for standardizing button labels.
