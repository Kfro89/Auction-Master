# Frontend State — shadcn/ui Rebuild (2026-05-19)

This document captures the **current state** of the Auction Master React frontend after the May 2026 rebuild that replaced the hand-rolled "frosted-alabaster glass" design system with shadcn/ui on Tailwind v4. It supersedes the descriptions in older specs under `docs/superpowers/specs/2026-05-08-*-design.md`, which describe the prior glass aesthetic.

For design tokens, dependencies, and contribution rules, see [`/DESIGN.md`](../DESIGN.md) at the repo root.

---

## What changed

| Aspect | Before | After |
|---|---|---|
| Design system | 23 hand-rolled "Glass Master" primitives + 570-line `@theme` block | shadcn/ui (Nova preset) primitives in `src/components/ui/` |
| Navigation | Tabbed shell, local component state | React Router v7 with URL-driven routes |
| Data fetching | Scattered `fetch()` calls, contexts | TanStack Query v5 with typed `apiFetch` wrapper |
| Tables | Bespoke `<table>` markup per view | TanStack Table v8 against shadcn `<Table>` primitives |
| Forms | Hand-wired controlled inputs | `react-hook-form` + `zod` + shadcn `Form` components |
| Theming | Inline glass-blur tiers, single light theme | CSS-variable tokens, light + dark via `next-themes` |
| Motion | None | Framer Motion route fade, row stagger, critical-countdown pulse |
| Command palette | `CommandContext` provider with separate registry | shadcn `Command` inside `CommandDialog`, module-level registry |
| Auth | `window.location.reload()` on 401 | Router-aware `signalUnauthorized` event bus |

---

## Routes (P0 = built, P1 = built unless noted)

| Path | Status | Backend dependency |
|---|---|---|
| `/login` | P0 | `POST /api/auth/login` (OAuth2 password form) |
| `/research` | P0 | `GET /api/research/?show_archived=` |
| `/bidding` | P0 | `GET /api/bidding/` (30s refetch) |
| `/watchlist` | P0 | `GET /api/research/watchlist` |
| `/workqueue` | P1 | `GET /api/inventory/` |
| `/fulfillment` | P1 | `GET /api/inventory/sold-queue` |
| `/ledger` | P1 | `GET /api/analytics/pnl`, `/api/expenses/` |
| `/settings` | P1 | `POST /api/credentials/` |
| `/store` | placeholder | not yet implemented backend-side |
| `/vehicles` | placeholder | not yet implemented backend-side |
| `/rma` | placeholder | not yet implemented backend-side |

---

## Source layout

```
frontend/src/
  main.tsx
  App.tsx                 # provider stack (QueryClient, ThemeProvider, RouterProvider, Toaster)
  router.tsx              # createBrowserRouter, all routes lazy
  index.css               # Tailwind v4 @theme inline, light + dark CSS vars
  lib/
    api.ts                # apiFetch + ApiError; injects token, signals 401
    auth.ts               # getToken/setToken/clearToken + onUnauthorized event bus
    queryClient.ts        # staleTime 30s, retry 1
    format.ts             # money/percent, truncateTitle, computeProjectedProfit/Roi
    types.ts              # ResearchItem, BidItem, Valuation, Comparable
    utils.ts              # shadcn cn()
  hooks/
    useResearchItems.ts   # useResearchItems, useToggleWatch, useToggleArchive
    useBids.ts            # useBids (30s refetch), useHideBid, useClaimBid, useComparables
    useWatchlist.ts       # useWatchlist, useUnwatch
    useCountdown.ts       # 1s tick, seconds remaining
    useCommandRegistry.ts # module-level singleton; pages register page-scoped commands
  components/
    ui/                   # shadcn primitives (26 files)
    shell/                # AppLayout, AppSidebar, TopBar, ProtectedRoute, ThemeToggle
    command/              # CommandPalette (Cmd+K)
    common/               # Money, Percent, EmptyState
    research/             # ResearchTable, ResearchFilters, ResearchRowActions,
                          # ItemDetailSheet, ValuationPanel, BidForm, CountdownBadge
    bidding/              # BidsTable, BidStatusBadge, ComparablesDrawer
  routes/                 # one file per route
```

---

## Cross-cutting features

- **Theme** — `next-themes` with `attribute="class"`, `storageKey="am_theme"`. `index.html` reads the same key pre-mount to avoid FOUC. Toggle in TopBar.
- **Command palette** — `⌘K` / `Ctrl+K` opens `CommandDialog`. Two groups: page-scoped actions (registered via `useCommandRegistry`) + global navigation. Pages register on mount, unregister on unmount.
- **Optimistic mutations** — watch, archive, hide, unwatch all use the `cancelQueries` → `setQueriesData` → rollback-on-error pattern.
- **Title truncation** — `truncateTitle(title, max=65)` is applied uniformly across Research, Bidding, WorkQueue, and Watchlist row titles.
- **Profit math** — `computeProjectedProfit` and `computeRoi` in `lib/format.ts` use the verbatim eBay constants `EBAY_NET_FACTOR = 0.8675` and `EBAY_FIXED_FEE = 0.4`. Do not paraphrase.
- **Motion**:
  - Route transitions: `AnimatePresence mode="wait"`, 120 ms fade with `y: 4 → 0`.
  - Row mount: 20 ms stagger, `opacity 0→1` + `y: 4→0`, applied in Research, Bidding, WorkQueue, Watchlist.
  - Countdown pulse: scale `1 → 1.08 → 1` looping at 0.8 s when remaining < 10 s.

---

## Deployment notes

- The frontend container at `192.168.0.16:~/Docker/AuctionMaster/frontend/` uses an anonymous Docker volume at `/app/node_modules`. **Host `npm install` does not affect the running container** — install inside the container: `docker exec auctionmaster-frontend-1 npm install` then `docker compose restart frontend`.
- Vite 8 and shadcn CLI 4.7 require Node ≥ 20. The host Mac (Node 18) cannot run these locally; use the container.
- TypeScript check (`npx tsc -b --noEmit`) over the NAS-mounted source takes 5–8 minutes due to filesystem latency. An empty (0-byte) output file means success.
- All paths in `feat/frontend-shadcn-rebuild` branch are committed; the previous glass-design frontend is recoverable from `main` history.

---

## Verification status

Each box reflects the current production state of the deployed frontend:

- [x] `npm run dev` boots cleanly in Docker
- [x] Login round-trip works against `/api/auth/login`
- [x] Theme toggle persists across reload with no FOUC
- [x] Sidebar collapses; active route highlighted
- [x] Research list loads; search + ending-soon + show-archived filters work
- [x] Watch / archive toggles are optimistic
- [x] `/research?item=:id` deep-link opens detail sheet
- [x] Bid form POSTs to `/api/research/{id}/bid`
- [x] Bidding table renders status badges + computed projected profit
- [x] Claim-to-inventory works
- [x] Watchlist unwatch reflects on Research immediately
- [x] ⌘K opens with nav + context page actions; ESC closes
- [x] Forced 401 navigates to `/login` via Router (no full reload)
- [ ] `npm run build` / `npm run lint` not yet wired into CI for this branch
