# Mobile App Full Feature Parity

## Goal
Transform the scaffolded Flutter mobile application into a full-featured frontend that has parity with the React web application, connecting it to the existing FastAPI backend. The UI must feature an Apple-inspired "liquid glass" aesthetic with a custom glass pebble indicator for active navigation.

## Tasks

- [ ] Task 1: **Networking & Auth Foundation**
      Configure Riverpod + Dio for API requests to the local backend (`http://localhost:8000`). Implement secure token storage and the `LoginScreen`.
      → *Verify: User can log in with credentials and a JWT is stored locally.*

- [ ] Task 2: **Liquid Glass Navigation Shell**
      Implement `GoRouter` with a custom horizontal Bottom Navigation Bar. The bar must mimic an "Apple liquid glass" aesthetic. The currently active tab must be highlighted with a "glass pebble" overlay effect. 
      **Required Tabs:** Research, Cars/Automotive, Watchlist, Active Bids, Work Queue, Store Dashboard.
      → *Verify: Tapping tabs smoothly transitions between placeholder screens, and the glass pebble indicator slides to the active tab.*

- [ ] Task 3: **Connect Research & Auto Tabs to Live API**
      Replace `mockItemsProvider` with Riverpod FutureProviders that fetch active general items and automotive items from the backend API.
      → *Verify: Research and Cars tabs load real auction data from the database.*

- [ ] Task 4: **Implement Watchlist & Active Bids Tabs**
      Build the UI and state management for the Watchlist and Bidding views, adhering to the liquid glass aesthetic.
      → *Verify: Items can be saved to the watchlist and viewed; active bids are displayed.*

- [ ] Task 5: **Implement Work Queue & Store Dashboard**
      Build the Store (eBay integration/inventory) and Work Queue (tasks needing attention) views.
      → *Verify: User can view inventory metrics and manage pending queue items.*

## Done When
- [ ] Mobile app authenticates against the live FastAPI backend.
- [ ] Custom liquid glass bottom navigation bar is fully functional with the pebble indicator.
- [ ] All required tabs (Research, Auto, Watchlist, Bids, Work Queue, Store) are navigable.
- [ ] Real data flows into the primary views.
