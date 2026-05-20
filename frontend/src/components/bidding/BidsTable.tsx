import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontal, EyeOff, Package, BarChart2, X } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { BidStatusBadge } from "./BidStatusBadge"
import { ComparablesDrawer } from "./ComparablesDrawer"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import { EmptyState } from "@/components/common/EmptyState"
import { CountdownBadge } from "@/components/research/CountdownBadge"
import { useHideBid, useClaimBid, useBulkHideBids } from "@/hooks/useBids"
import { computeProjectedProfit, computeRoi, truncateTitle } from "@/lib/format"
import type { BidItem } from "@/lib/types"

export function BidsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  )
}

export function BidsTable({ items }: { items: BidItem[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [comparableItem, setComparableItem] = useState<BidItem | null>(null)

  const hideBid = useHideBid()
  const claimBid = useClaimBid()
  const bulkHide = useBulkHideBids()

  const handleBulkHide = () => {
    const ids = table.getSelectedRowModel().rows.map(r => r.original.id)
    if (ids.length === 0) return
    bulkHide.mutate({ ids, is_hidden: true }, {
      onSuccess: () => {
        toast.success(`Hidden ${ids.length} items`)
        setRowSelection({})
      },
      onError: () => toast.error("Bulk hide failed")
    })
  }

  const columns = useMemo<ColumnDef<BidItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "image",
        header: "",
        size: 48,
        cell: ({ row }) =>
          row.original.image_url ? (
            <img src={row.original.image_url} alt="" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-muted" />
          ),
      },
      {
        accessorKey: "title",
        header: "Item",
        cell: ({ row }) => {
          const i = row.original
          const displayName = i.product_name || i.title
          return (
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight line-clamp-2">
                {i.url ? (
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {truncateTitle(displayName)}
                  </a>
                ) : truncateTitle(displayName)}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {i.auction_house_name && <Badge variant="secondary" className="text-xs px-1.5 py-0">{i.auction_house_name}</Badge>}
                {i.condition && <span className="text-xs text-muted-foreground">{i.condition}</span>}
              </div>
            </div>
          )
        },
      },
      {
        id: "current_bid",
        header: "Current",
        accessorKey: "current_bid_amount",
        cell: ({ row }) => <Money value={row.original.current_bid_amount} />,
      },
      {
        id: "my_bid",
        header: "My Bid",
        accessorKey: "user_bid_amount",
        cell: ({ row }) => <Money value={row.original.user_bid_amount} />,
      },
      {
        id: "proxy",
        header: "Proxy",
        cell: ({ row }) => <Money value={row.original.user_proxy_bid} />,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <BidStatusBadge status={row.original.user_bid_status} />,
      },
      {
        id: "ends",
        header: "Ends",
        cell: ({ row }) => <CountdownBadge endTime={row.original.end_time} />,
      },
      {
        id: "est_value",
        header: "Est. Value",
        accessorFn: (row) => row.valuation?.est_market_value,
        cell: ({ row }) => <Money value={row.original.valuation?.est_market_value} />,
      },
      {
        id: "profit",
        header: "Est. Profit",
        accessorFn: (row) => computeProjectedProfit(row.valuation?.est_market_value, row.current_bid_amount),
        cell: ({ row }) => {
          const profit = computeProjectedProfit(row.original.valuation?.est_market_value, row.original.current_bid_amount)
          const color = profit == null ? "" : profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          return <Money value={profit} className={color} />
        },
      },
      {
        id: "roi",
        header: "Est. ROI",
        accessorFn: (row) => computeRoi(row.valuation?.est_market_value, row.current_bid_amount),
        cell: ({ row }) => (
          <Percent
            value={computeRoi(row.original.valuation?.est_market_value, row.original.current_bid_amount)}
            colorCode
          />
        ),
      },
      {
        id: "actions",
        header: "",
        size: 40,
        cell: ({ row }) => {
          const item = row.original
          const canClaim = item.user_bid_status === "won"
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setComparableItem(item)}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Comparables
                </DropdownMenuItem>
                {canClaim && (
                  <DropdownMenuItem
                    onClick={() => {
                      claimBid.mutate(item.id, {
                        onSuccess: () => toast.success("Claimed to inventory"),
                        onError: () => toast.error("Claim failed"),
                      })
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Claim to inventory
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => hideBid.mutate(item.id)}
                  className="text-muted-foreground"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [hideBid, claimBid]
  )

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="space-y-4 relative">
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.12 }}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyState title="No active bids" description="Bids you place will appear here" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-white/10"
          >
            <span className="text-sm font-medium border-r border-white/20 pr-6">
              {selectedCount} selected
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-white hover:bg-white/10"
                onClick={handleBulkHide}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Hide
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-white hover:bg-white/10"
                onClick={() => setRowSelection({})}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ComparablesDrawer
        item={comparableItem}
        onClose={() => setComparableItem(null)}
      />
    </div>
  )
}
