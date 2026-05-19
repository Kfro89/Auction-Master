# Auction Master — Design System

This document defines the **design system requirements, primitives, and dependencies** for the Auction Master frontend. Any change to colors, typography, spacing, motion, or core primitives should be made against this document. The previous "frosted-alabaster glass" design system was retired in the May 2026 rebuild; do not re-introduce its tokens.

For a snapshot of the resulting UI and route status, see [`docs/2026-05-19-frontend-shadcn-rebuild.md`](docs/2026-05-19-frontend-shadcn-rebuild.md).

---

## Principles

1. **Sober and neutral by default, accent sparingly.** The interface is a working tool, not a brochure. Color carries meaning (status, profit/loss, countdown urgency). Decorative color is forbidden.
2. **Own the primitives.** shadcn/ui components are copied into `src/components/ui/` and edited freely — they are *our* components, not a library. No `npm install shadcn-ui`.
3. **Tokens, not literals.** Every color, radius, and font is a CSS variable defined in `frontend/src/index.css`. Components reference tokens; they never hard-code an `oklch(...)` or a hex.
4. **Motion is a hint, not a show.** Transitions are ≤ 200 ms unless they communicate urgency. The user should feel the app respond, not wait for it.
5. **Dark mode is a peer, not an afterthought.** Every change ships in both themes simultaneously.

---

## Foundation

| Concern | Decision |
|---|---|
| Library | **shadcn/ui** (Nova preset), components copied into `src/components/ui/` |
| Styling | **Tailwind CSS v4**, `@theme inline` token mapping |
| Animation | **Framer Motion 12** — and only Framer Motion |
| Icons | **lucide-react** — and only lucide-react |
| Forms | **react-hook-form** + **zod** + shadcn `Form` |
| Routing | **React Router v7** (`createBrowserRouter`) |
| Data | **TanStack Query v5** through a typed `apiFetch` wrapper |
| Tables | **TanStack Table v8** rendered into shadcn `<Table>` primitives |
| Charts | **recharts** |
| Toasts | **sonner** |
| Theming | **next-themes**, `attribute="class"`, `storageKey="am_theme"` |
| Font | **Inter Variable** via `@fontsource-variable/inter` |

The frontend `package.json` is the source of truth for exact versions. See [`frontend/package.json`](frontend/package.json).

---

## Color tokens

All colors live in `frontend/src/index.css` as CSS variables on `:root` (light) and `.dark` (dark). Tailwind reads them via `@theme inline` so they're available as `bg-background`, `text-primary`, etc.

### Semantic palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | App canvas |
| `foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card surfaces |
| `popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Popover / dropdown surfaces |
| `primary` | `oklch(0.606 0.25 292.717)` | `oklch(0.7 0.22 292.717)` | **Violet accent** — buttons, links, focus ring |
| `secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Neutral secondary surfaces |
| `muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | De-emphasized backgrounds (skeletons, placeholders) |
| `muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary text |
| `accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover states |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Errors, deletes, "ended" |
| `border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Default border |
| `ring` | matches `primary` | matches `primary` | Focus outline |

A separate sidebar palette (`sidebar`, `sidebar-foreground`, …) and a 5-step chart palette (`chart-1`…`chart-5`) follow the same pattern.

### Color rules

- The accent is **violet** (`oklch(0.606 0.25 292.717)` light, `oklch(0.7 0.22 292.717)` dark). It signals "tool / marketplace" and is the only chromatic color in the chrome.
- **Profit / ROI** uses Tailwind `text-green-600 dark:text-green-400` and `text-red-600 dark:text-red-400` with the `Percent` and `Money` components when `colorCode` is set. Do not invent new green/red tokens.
- **Countdown urgency** uses three states: default (`secondary`), warning (custom orange utility `border-orange-400 text-orange-600 dark:text-orange-400` on a shadcn `outline` badge), and critical (`destructive` + Framer Motion pulse < 10 s).
- Never use raw hex. Never inline `oklch()` outside `index.css`.

---

## Typography

| Token | Value |
|---|---|
| `--font-sans` | `'Inter Variable', sans-serif` |
| `--font-heading` | inherits from `--font-sans` |

Type scale uses Tailwind defaults — `text-xs` through `text-3xl` — with body copy at `text-sm` and table cells at `text-sm` with `tabular-nums` for currency columns.

---

## Spacing and radius

| Token | Value |
|---|---|
| `--radius` | `0.625rem` (10 px) |
| `--radius-sm` | `calc(var(--radius) * 0.6)` |
| `--radius-md` | `calc(var(--radius) * 0.8)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` → `4xl` | scaled multiples |

Spacing follows Tailwind defaults (`p-2`, `gap-3`, etc.). Common patterns:
- Page container: `p-6 space-y-4`
- Card content: `p-4` / `p-6`
- Table cell vertical padding: `py-2`
- Avatar / thumbnail: `h-10 w-10 rounded` in lists, `h-9 w-9` in dense tables

---

## Motion

| Surface | Animation | Duration |
|---|---|---|
| Route transition | `AnimatePresence mode="wait"`; opacity `0→1`, y `4→0` | 120 ms |
| Table / list row mount | per-row stagger; opacity `0→1`, y `4→0` | 120 ms each, 20 ms stagger |
| Countdown < 10 s | scale loop `1 → 1.08 → 1` | 800 ms repeat, ease-in-out |
| Dialog / Sheet open | shadcn defaults via `tw-animate-css` | 150–200 ms |
| Skeletons | shadcn default `animate-pulse` | n/a |

Motion rules:
- **Use Framer Motion for choreographed transitions** (route, list mount, urgency pulse).
- **Use `tw-animate-css` / Tailwind for built-in primitive states** (dialog open, dropdown menus, skeletons).
- Do not introduce a third animation library.
- Animations longer than 200 ms must carry meaning (critical countdown pulse is the only current example).

---

## Iconography

- **lucide-react** is the only icon set. Default size `h-4 w-4`. Dense buttons use `h-3.5 w-3.5`.
- Icons inside buttons pair with `gap-2` (regular) or `gap-1` (`size="sm"`).
- Status icons should never be the only signal — pair with text or a badge.

---

## Component primitives

All primitives live in `frontend/src/components/ui/`. They are copies of shadcn components edited in-tree. Currently included:

`alert · avatar · badge · button · checkbox · dialog · dropdown-menu · form · input · input-group · label · popover · scroll-area · select · separator · sheet · sidebar · skeleton · sonner · switch · table · tabs · textarea · tooltip`

To add a new primitive: run `npx shadcn@latest add <name>` inside a working Node ≥ 20 environment (the Docker container), copy the file into `src/components/ui/`, then sweep imports for `verbatimModuleSyntax` (`import { type X }` rather than `import { X }` for type-only imports).

---

## Composition patterns (require approval to deviate)

- **List/table rows** — image thumbnail (`h-9-10 w-9-10 rounded object-cover`) on the left, title with optional badge cluster underneath, status / countdown / actions on the right. Truncate titles with `truncateTitle(title, 65)` from `lib/format.ts`.
- **Detail surfaces** — right-side `Sheet` for context (item detail, comparables); `Dialog` only for confirmations and destructive actions.
- **Filters** — single horizontal toolbar at the top of a list view, `Input` + 1–3 `Switch`es. Avoid filter sidebars.
- **Forms** — `react-hook-form` with `zod` schemas, surfaced via shadcn `Form` / `FormField` / `FormMessage`.

---

## Dependencies (load-bearing)

These are required by the design system; do not remove or replace without updating this document:

```
shadcn (^4.7), radix-ui (^1.4), tailwindcss (^4.3), tw-animate-css (^1.4),
framer-motion (^12.39), lucide-react (^1.16),
@tanstack/react-query (^5.80), @tanstack/react-table (^8.21),
react-hook-form (^7.57), zod (^3.25), @hookform/resolvers (^3.10),
react-router-dom (^7.6), next-themes (^0.4),
sonner (^1.7), recharts (^3.8), cmdk (^1.1),
class-variance-authority (^0.7), clsx (^2.1), tailwind-merge (^3.6),
@fontsource-variable/inter (^5.2)
```

Exact versions live in [`frontend/package.json`](frontend/package.json).

---

## Anti-patterns (do not do)

- ❌ Re-introduce glass blur (`backdrop-blur`, `bg-white/40`, glass tier tokens).
- ❌ Hard-code `oklch(...)`, `#hex`, or `rgb(...)` outside `index.css`.
- ❌ Add a CSS-in-JS library (styled-components, emotion).
- ❌ Add an icon set other than lucide-react.
- ❌ Build custom primitives parallel to shadcn (`<MyButton>` next to `<Button>`).
- ❌ Mount filters in sidebars or modals.
- ❌ Animate something that doesn't communicate a state change.
- ❌ Ship a change in light mode only.

---

## Changing the design system

1. Open a PR that updates **this document** plus the corresponding code (`index.css`, primitives, etc.).
2. Verify both themes — toggle once, reload, toggle again. Confirm there is no FOUC.
3. Note the change in [`docs/2026-05-19-frontend-shadcn-rebuild.md`](docs/2026-05-19-frontend-shadcn-rebuild.md) if it touches behavior visible to users.
