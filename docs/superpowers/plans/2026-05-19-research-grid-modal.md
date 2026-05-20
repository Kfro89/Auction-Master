# Research Page Grid View & Item Detail Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Research page to support an image-focused Grid view alongside the existing Table view, and replace the existing `ItemDetailSheet` with a new, comprehensive `ItemDetailModal` (dialog) that displays high-res images, detailed KPIs, a timer bar, and eBay comparables.

**Architecture:**
- **State Management:** URL-based view mode (`view=grid|table`) and selected item (`item=ID`).
- **Components:**
  - `ResearchView.tsx`: Orchestrator for Table vs Grid.
  - `ResearchGrid.tsx`: New grid layout component.
  - `ItemDetailModal.tsx`: New dialog component for item details.
  - `ResearchFilters.tsx`: Updated to include view toggle.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide Icons, Shadcn UI (Dialog, Progress, Card), TanStack Query.

---

### Task 1: Add View Toggle to Filters

**Files:**
- Modify: `frontend/src/components/research/ResearchFilters.tsx`

- [ ] **Step 1: Add view mode props and UI toggle**
Update `ResearchFiltersProps` and add the toggle buttons (using Shadcn `Tabs` or `Button` group) for switching between List and Grid.

```tsx
// frontend/src/components/research/ResearchFilters.tsx
export interface ResearchFiltersProps {
  // ... existing props
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

// Inside ResearchFilters component:
// Add icons: import { LayoutGrid, List } from "lucide-react"
// Add toggle UI in the right section of the filters
<div className="flex items-center gap-1 bg-muted p-1 rounded-md border">
  <Button
    variant={viewMode === "table" ? "secondary" : "ghost"}
    size="icon"
    className="h-7 w-7"
    onClick={() => onViewModeChange("table")}
  >
    <List className="h-4 w-4" />
  </Button>
  <Button
    variant={viewMode === "grid" ? "secondary" : "ghost"}
    size="icon"
    className="h-7 w-7"
    onClick={() => onViewModeChange("grid")}
  >
    <LayoutGrid className="h-4 w-4" />
  </Button>
</div>
```

- [ ] **Step 2: Verify Toggle Rendering**
Run `npm run lint` and check the UI in the browser to ensure the toggle appears and reacts to clicks.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/research/ResearchFilters.tsx
git commit -m "feat(research): add grid/table view toggle to filters"
```

---

### Task 2: Implement ResearchGrid Component

**Files:**
- Create: `frontend/src/components/research/ResearchGrid.tsx`

- [ ] **Step 1: Create the ResearchGrid component**
Implement a grid layout that renders `ResearchItem` as cards.

```tsx
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import { CountdownBadge } from "./CountdownBadge"
import { computeRoi, truncateTitle } from "@/lib/format"
import type { ResearchItem } from "@/lib/types"

export function ResearchGrid({ 
  items, 
  onOpenItem,
  onWatch,
  onArchive
}: { 
  items: ResearchItem[]
  onOpenItem: (item: ResearchItem) => void
  onWatch: (item: ResearchItem) => void
  onArchive: (item: ResearchItem) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.01 }}
        >
          <Card 
            className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            onClick={() => onOpenItem(item)}
          >
            <div className="relative aspect-square bg-muted">
              {item.image_url ? (
                <img src={item.image_url} alt="" className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground italic">No Image</div>
              )}
              <div className="absolute top-2 right-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  onClick={(e) => { e.stopPropagation(); onWatch(item); }}
                >
                  <Star className={`h-4 w-4 ${item.is_watched ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <CountdownBadge endTime={item.end_time} />
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="text-muted-foreground uppercase text-[10px] font-bold">Current Bid</div>
                  <Money value={item.current_bid} />
                </div>
                <div className="space-y-0.5 text-right">
                  <div className="text-muted-foreground uppercase text-[10px] font-bold">Est. Market</div>
                  <Money value={item.valuation?.est_market_value} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t">
                <Percent value={computeRoi(item.valuation?.est_market_value, item.current_bid)} colorCode className="font-bold" />
                <Badge variant="outline" className="text-[10px]">{item.auction_house_name}</Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/components/research/ResearchGrid.tsx
git commit -m "feat(research): implement image-focused grid component"
```

---

### Task 3: Refactor ResearchPage and View Mode State

**Files:**
- Modify: `frontend/src/routes/ResearchPage.tsx`
- Modify: `frontend/src/components/research/ResearchTable.tsx` (or Rename to `ResearchView.tsx`)

- [ ] **Step 1: Handle view mode state in ResearchPage or ResearchTable**
Update `ResearchTable.tsx` to handle the view toggle and switch between `Table` and `ResearchGrid`. Sync state with URL.

```tsx
// frontend/src/components/research/ResearchTable.tsx (or ResearchView.tsx)
// Inside the component:
const [params, setParams] = useSearchParams()
const viewMode = (params.get("view") as 'table' | 'grid') || 'table'

const setViewMode = (mode: 'table' | 'grid') => {
  const next = new URLSearchParams(params)
  next.set("view", mode)
  setParams(next)
}

// In the return block:
<ResearchFilters 
  // ... 
  viewMode={viewMode}
  onViewModeChange={setViewMode}
/>

{viewMode === "table" ? (
  <div className="rounded-md border overflow-hidden">
     <Table>...</Table>
  </div>
) : (
  <ResearchGrid 
    items={filtered} 
    onOpenItem={(i) => openItem(i)}
    onWatch={(i) => toggleWatch.mutate(i.id)}
    onArchive={(i) => toggleArchive.mutate(i.id)}
  />
)}
```

- [ ] **Step 2: Update Table Item Click**
Ensure the table row click triggers `openItem` correctly (excluding title link).

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/research/ResearchTable.tsx
git commit -m "feat(research): support toggling between table and grid views"
```

---

### Task 4: Implement ItemDetailModal (Dialog)

**Files:**
- Create: `frontend/src/components/research/ItemDetailModal.tsx`
- Modify: `frontend/src/components/research/ResearchTable.tsx` (Replace `ItemDetailSheet` with `ItemDetailModal`)

- [ ] **Step 1: Create ItemDetailModal component**
Implement the structure using `Dialog`.

```tsx
import { useSearchParams } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import { useCountdown } from "@/hooks/useCountdown" // Assume/Verify existence
import type { ResearchItem } from "@/lib/types"

export function ItemDetailModal({ items }: { items: ResearchItem[] }) {
  const [params, setParams] = useSearchParams()
  const itemId = params.get("item") ? Number(params.get("item")) : null
  const item = items.find((i) => i.id === itemId) ?? null

  const close = () => {
    const next = new URLSearchParams(params)
    next.delete("item")
    setParams(next)
  }

  // Timer calculation
  const { days, hours, minutes, seconds, progress } = useCountdown(item?.end_time)

  if (!item) return null

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col h-[90vh]">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* KPI Tiles */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "eBay Comps", value: item.valuation?.sample_size ?? 0, type: "number" },
                { label: "Est. Value", value: item.valuation?.est_market_value, type: "money" },
                { label: "Current Bid", value: item.current_bid, type: "money" },
                { label: "Max Suggested", value: item.valuation?.max_bid_for_target_roi, type: "money" },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-muted/30 p-4 rounded-xl border flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</span>
                  <span className="text-xl font-bold font-mono">
                    {kpi.type === "money" ? <Money value={kpi.value as number} /> : kpi.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Timer Bar */}
            <div className="relative h-10 bg-muted rounded-full overflow-hidden border">
              <div 
                className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-1000" 
                style={{ width: `${progress}%` }} 
              />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm">
                {days}d {hours}h {minutes}m {seconds}s remaining
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Left Column: Image & Titles */}
              <div className="md:col-span-2 space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden border bg-muted">
                  <img src={item.image_url ?? ""} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{item.product_name || "Unknown Product"}</h2>
                  {item.title !== item.product_name && (
                    <p className="text-muted-foreground text-sm mt-1">{item.title}</p>
                  )}
                </div>
              </div>

              {/* Right Column: Insights & Benchmarks */}
              <div className="md:col-span-3 space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Research Insights</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/20 p-4 rounded-xl border">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Velocity</div>
                      <div className="text-lg font-bold">14.2 days</div>
                      <div className="text-[10px] text-muted-foreground mt-1">Avg current listing duration</div>
                    </div>
                    {/* 3 Placeholders */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-muted/10 p-4 rounded-xl border border-dashed flex items-center justify-center text-muted-foreground/30 italic text-xs">
                        Metric Placeholder
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Marketplace Benchmarks</h3>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Item</th>
                          <th className="px-3 py-2 text-right font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {item.valuation_detail?.sample_listings?.slice(0, 10).map((comp: any, i: number) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="px-3 py-2 flex items-center gap-2">
                              <img src={comp.thumbnail} className="h-6 w-6 rounded-sm object-cover" />
                              <span className="truncate max-w-[180px]">{comp.title}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-medium">
                              <Money value={comp.price} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Calculate Velocity**
Update the Velocity tile to calculate the average duration if `valuation_detail.sample_listings` have `start_time` or `sold_at` (or similar duration fields). If not available, use a realistic calculated mock for now based on the requested logic.

- [ ] **Step 3: Swap Sheet for Modal in ResearchTable.tsx**
Replace `<ItemDetailSheet items={filtered} />` with `<ItemDetailModal items={filtered} />`.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/components/research/ItemDetailModal.tsx frontend/src/components/research/ResearchTable.tsx
git commit -m "feat(research): replace item sheet with high-res detailed modal"
```

---

### Task 5: Final Verification & Cleanup

**Files:**
- Delete: `frontend/src/components/research/ItemDetailSheet.tsx`

- [ ] **Step 1: Delete old component**
```bash
rm frontend/src/components/research/ItemDetailSheet.tsx
```

- [ ] **Step 2: Run final build & lint check**
Run: `cd frontend && npm run build && npm run lint`
Expected: SUCCESS

- [ ] **Step 3: Final Commit**
```bash
git add .
git commit -m "cleanup: remove retired ItemDetailSheet"
```
