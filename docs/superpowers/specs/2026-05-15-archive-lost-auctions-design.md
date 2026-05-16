# Spec: Archiving Lost Auctions

## Overview
The goal is to allow users to archive lost auctions from the Bidding View dashboard to keep the interface clean. Archived items will be hidden by default but accessible through a toggle.

## Architecture
- **Backend:** FastAPI, SQLAlchemy, Alembic for migrations.
- **Frontend:** React (Vite/TypeScript) with Tailwind CSS.

## Data Model Changes
### `Item` (backend/app/models.py)
- Add `is_archived` column: `Boolean`, default `False`.

## API Endpoints
### `PATCH /api/items/{item_id}/archive`
- **Body:** `{ "is_archived": boolean }`
- **Response:** Updated item object.
- **Functionality:** Toggles the `is_archived` state for a specific item.

### `GET /api/items/`
- Update to accept an optional query parameter `show_archived` (boolean).
- If `show_archived` is false (default), exclude items where `is_archived` is true.

## UI Changes (BiddingView.tsx)
- **Archive Action:** Add an "Archive" button (icon-only, e.g., `Archive` or `X`) to each row in the bidding grid, but only show it if the item's status is "lost".
- **View Toggle:** Add a "View Archived" button/toggle in the ViewHeader or FilterBar.
- **State Management:**
    - New state `showArchived` (boolean) to track which items to display.
    - Update `fetchItems` to pass the `show_archived` parameter based on state.
    - Refresh list after archiving an item.

## Validation Plan
1. **Migration:** Verify `is_archived` column is added correctly via Alembic.
2. **Backend:** Unit test the archive endpoint and the filtering logic in `list_items`.
3. **Frontend:**
    - Verify "Archive" button only appears for "lost" auctions.
    - Verify clicking "Archive" hides the item from the default view.
    - Verify "View Archived" toggle correctly shows only archived items.
    - Verify "Unarchive" functionality (optional but recommended for UX).
