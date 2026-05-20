import { useState, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CountdownBadge } from "./CountdownBadge"
import { ResearchRowActions } from "./ResearchRowActions"
import { ResearchFilters } from "./ResearchFilters"
import { ResearchGrid } from "./ResearchGrid"
import { ItemDetailModal } from "./ItemDetailModal"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import { EmptyState } from "@/components/common/EmptyState"
import { useToggleWatch, useToggleArchive, useScanItems, useReevaluateItems } from "@/hooks/useResearchItems"
import { computeRoi, truncateTitle } from "@/lib/format"
import type { ResearchItem } from "@/lib/types"

export function ResearchTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  )
}

export function ResearchTable({ items }: { items: ResearchItem[] }) {
  const [params, setParams] = useSearchParams()
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [endingSoon, setEndingSoon] = useState(false)
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState("all")
  const [selectedSubCategory, setSelectedSubCategory] = useState("all")
  const [selectedTag, setSelectedTag] = useState("all")

  const viewMode = (params.get("view") as 'table' | 'grid') || 'table'
  const setViewMode = (mode: 'table' | 'grid') => {
    setParams((p) => {
      const next = new URLSearchParams(p)
      next.set("view", mode)
      return next
    })
  }

  const toggleWatch = useToggleWatch()
  const toggleArchive = useToggleArchive()
  const scanItems = useScanItems()
  const reevaluateItems = useReevaluateItems()

  const primaryCategories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach(i => {
      if (i.category && typeof i.category === 'string') {
        const primary = i.category.split(" > ")[0]?.trim()
        if (primary) cats.add(primary)
      }
    })
    return Array.from(cats).sort()
  }, [items])

  const subCategories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach(i => {
      if (i.category && typeof i.category === 'string') {
        const parts = i.category.split(" > ")
        if (parts.length > 1) {
          const primary = parts[0]?.trim()
          const sub = parts[1]?.trim()
          if (sub && (selectedPrimaryCategory === "all" || primary === selectedPrimaryCategory)) {
            cats.add(sub)
          }
        }
      }
    })
    return Array.from(cats).sort()
  }, [items, selectedPrimaryCategory])

  const tags = useMemo(() => {
    const allTags = new Set<string>()
    items.forEach(i => {
      if (Array.isArray(i.tags)) {
        i.tags.forEach(t => {
          if (typeof t === 'string') {
            const trimmed = t.trim()
            if (trimmed) allTags.add(trimmed)
          }
        })
      }
    })
    return Array.from(allTags).sort()
  }, [items])

  const filtered = useMemo(() => {
    let data = items
    if (!showArchived) data = data.filter((i) => !i.is_archived)
    if (endingSoon) {
      const cutoff = Date.now() + 24 * 3600 * 1000
      data = data.filter((i) => i.end_time && new Date(i.end_time).getTime() < cutoff)
    }
    if (selectedPrimaryCategory !== "all") {
      data = data.filter((i) => i.category?.split(" > ")[0] === selectedPrimaryCategory)
    }
    if (selectedSubCategory !== "all") {
      data = data.filter((i) => i.category?.split(" > ")[1] === selectedSubCategory)
    }
    if (selectedTag !== "all") {
      data = data.filter((i) => Array.isArray(i.tags) && i.tags.includes(selectedTag))
    }
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.auction_house_name?.toLowerCase().includes(q) ||
          i.product_name?.toLowerCase().includes(q) ||
          i.lot_number?.toLowerCase().includes(q)
      )
    }
    return data
  }, [items, showArchived, endingSoon, search, selectedPrimaryCategory, selectedSubCategory, selectedTag])

  const handleScan = () => {
    scanItems.mutate(undefined, {
      onSuccess: () => toast.success("Scan started", { description: "Background scraping is now running." }),
      onError: (err) => toast.error("Failed to start scan", { description: err.message })
    })
  }

  const handleReevaluate = () => {
    reevaluateItems.mutate(undefined, {
      onSuccess: () => toast.success("Reevaluation started", { description: "Bulk valuation process has been queued." }),
      onError: (err) => toast.error("Failed to reevaluate", { description: err.message })
    })
  }

  const openItem = useCallback((item: ResearchItem, tab?: string) => {
    setParams((p) => {
      const next = new URLSearchParams(p)
      next.set("item", String(item.id))
      if (tab) next.set("tab", tab)
      else next.delete("tab")
      return next
    })
  }, [setParams])

  const columns = useMemo<ColumnDef<ResearchItem>[]>(
    () => [
      {
        id: "image",
        header: "",
        size: 48,
        cell: ({ row }) =>
          row.original.image_url ? (
            <img
              src={row.original.image_url}
              alt=""
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded bg-muted" />
          ),
      },
      {
        accessorKey: "title",
        header: "Item",
        cell: ({ row }) => {
          const i = row.original
          return (
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight line-clamp-2 cursor-pointer hover:text-primary" onClick={() => openItem(i)}>
                {truncateTitle(i.title)}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {i.auction_house_name && <Badge variant="secondary" className="text-xs px-1.5 py-0">{i.auction_house_name}</Badge>}
                {i.condition && <span className="text-xs text-muted-foreground">{i.condition}</span>}
                {i.is_archived && <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground">Archived</Badge>}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "current_bid",
        header: "Bid",
        cell: ({ row }) => <Money value={row.original.current_bid} />,
      },
      {
        accessorKey: "end_time",
        header: "Ends",
        cell: ({ row }) => <CountdownBadge endTime={row.original.end_time} />,
      },
      {
        id: "emv",
        header: "EMV",
        accessorFn: (row) => row.valuation?.est_market_value ?? null,
        cell: ({ row }) => <Money value={row.original.valuation?.est_market_value} />,
      },
      {
        id: "roi",
        header: "ROI",
        accessorFn: (row) => computeRoi(row.valuation?.est_market_value, row.current_bid),
        cell: ({ row }) => (
          <Percent
            value={computeRoi(row.original.valuation?.est_market_value, row.original.current_bid)}
            colorCode
          />
        ),
      },
      {
        id: "watch",
        header: "",
        size: 40,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => toggleWatch.mutate(row.original.id)}
          >
            <Star
              className={`h-4 w-4 ${row.original.is_watched ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
            />
          </Button>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 40,
        cell: ({ row }) => (
          <ResearchRowActions
            item={row.original}
            onWatch={(i) => toggleWatch.mutate(i.id)}
            onArchive={(i) => toggleArchive.mutate(i.id)}
            onBid={(i) => openItem(i, "bid")}
          />
        ),
      },
    ],
    [toggleWatch, toggleArchive, openItem]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <>
      <ResearchFilters
        search={search}
        onSearchChange={setSearch}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
        endingSoon={endingSoon}
        onEndingSoonChange={setEndingSoon}
        primaryCategories={primaryCategories}
        subCategories={subCategories}
        tags={tags}
        selectedPrimaryCategory={selectedPrimaryCategory}
        onPrimaryCategoryChange={(v) => {
          setSelectedPrimaryCategory(v)
          setSelectedSubCategory("all")
        }}
        selectedSubCategory={selectedSubCategory}
        onSubCategoryChange={setSelectedSubCategory}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        onScan={handleScan}
        onReevaluate={handleReevaluate}
        isScanning={scanItems.isPending}
        isReevaluating={reevaluateItems.isPending}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'table' ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.12 }}
                    className="border-b transition-colors hover:bg-muted/50 cursor-default"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <EmptyState title="No items" description="Try adjusting your filters" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ResearchGrid
          items={filtered}
          onOpenItem={(i) => openItem(i)}
          onWatch={(i) => toggleWatch.mutate(i.id)}
        />      )}

      <ItemDetailModal items={filtered} />
    </>
  )
}
