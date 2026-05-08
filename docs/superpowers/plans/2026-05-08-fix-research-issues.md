# Plan: Fix Research Pane Issues

## Issue 1: URL Linking
**Investigation & Findings:**
The Title column in the `ResearchView.tsx` component is configured with an `onClick` event that calls `setSelectedUrl(item.url)`. However, `selectedUrl` state is not utilized anywhere within the component to open a modal or window.
**Solution:**
Update the `onClick` handler in the Title cell to use `window.open(item.url, '_blank', 'noopener,noreferrer')` or replace the text with an explicit `<a>` anchor tag to natively handle opening the URL in a new tab.

## Issue 2: eBay Market Data auto-provided for first 14 results
**Investigation & Findings:**
The backend `process_pending_valuations` worker inside `backend/app/services/valuation_worker.py` only queries for and processes a `.limit(5)` items per run. There is also a `.limit(100)` parameter in `backend/app/routers/items.py` that truncates the returned payload for the frontend. The `14` items observed by the user are an artifact of the background cron job only occasionally firing and pulling a limited set before halting.
**Solution:**
1. In `backend/app/routers/items.py`, remove `.limit(100)` or significantly increase it so all items are fetched for the frontend.
2. In `backend/app/services/valuation_worker.py`, increase the worker batch `.limit(5)` to a much higher value (e.g. `.limit(100)`) so that it iteratively valuates all unvaluated items in bulk instead of stopping after 5.

## Issue 3: Filter Pane Structure (Categories and Items Dropdowns)
**Investigation & Findings:**
The `ResearchView.tsx` component uses `setSidebarContent` to render the navigation pane's filter options. Currently, it renders a "Filter by Tag" section using a list of buttons (tag cloud).
**Solution:**
Update the sidebar content to use standard `<select>` HTML elements. I will introduce two dropdowns:
- Category Dropdown (based on unique categories found in `items`)
- Tag Dropdown (based on unique tags found in `items`)
State hooks will be added for `categoryFilter` in addition to `tagFilter` to ensure the list appropriately filters based on the selected dropdowns.

## Issue 4: Time Remaining States "Ending Now"
**Investigation & Findings:**
In `frontend/src/views/ResearchView.tsx`, the `CountdownTimer` component accepts `endTime`. If `endTime` is `null` (because the scraper failed to parse the auction date), `new Date(null).getTime()` evaluates to epoch (Jan 1, 1970). This causes `end - now` to be a negative number, thus falling into the `if (diff <= 0)` logic and rendering "Ending Now". Additionally, if the `end_time` is valid, the Python backend returns it as an ISO 8601 string without a `Z` suffix because it's a naive DateTime in the PostgreSQL database, leading the JS frontend to parse it in the user's local timezone instead of UTC.
**Solution:**
1. In `frontend/src/views/ResearchView.tsx`, update `CountdownTimer` to handle `null` or missing `endTime` strings properly, setting the display to "Unknown" instead of "Ending Now".
2. In `backend/app/routers/items.py`, ensure the serialized `end_time` appends the `"Z"` suffix so the JS `Date` parser accurately calculates time based on UTC.
