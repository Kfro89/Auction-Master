import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { MoreHorizontal, EyeOff, Package, BarChart2 } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useHideBid, useClaimBid } from "@/hooks/useBids"
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
  const [comparableItem, setComparableItem] = useState<BidItem | null>(null)

  const hideBid = useHideBid()
  const claimBid = useClaimBid()

  const columns = useMemo<ColumnDef<BidItem>[]>(
    () => [
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
          return (
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight line-clamp-2">
                {i.url ? (
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {truncateTitle(i.title)}
                  </a>
                ) : truncateTitle(i.title)}
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
        id: "profit",
        header: "Profit",
        accessorFn: (row) => computeProjectedProfit(row.valuation?.est_market_value, row.current_bid_amount),
        cell: ({ row }) => {
          const profit = computeProjectedProfit(row.original.valuation?.est_market_value, row.original.current_bid_amount)
          const color = profit == null ? "" : profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          return <Money value={profit} className={color} />
        },
      },
      {
        id: "roi",
        header: "ROI",
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState title="No active bids" description="Bids you place will appear here" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ComparablesDrawer item={comparableItem} onClose={() => setComparableItem(null)} />
    </>
  )
}
