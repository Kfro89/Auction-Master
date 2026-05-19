import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { FileEdit, Package, ExternalLink } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { formatMoney, truncateTitle } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

interface CostLineItem { id: number; label: string; amount: number; category: string | null }

interface InventoryItem {
  id: number
  title: string
  sku: string | null
  status: string
  storage_location: string | null
  condition: string | null
  product_name: string | null
  image_url: string | null
  hammer_price: number | null
  buyer_premium_pct: number | null
  tax_rate: number | null
  cost_line_items: CostLineItem[]
  ebay_listing_url: string | null
}

export function WorkQueuePage() {
  const [filter, setFilter] = useState("staged")
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => apiFetch<InventoryItem[]>("/api/inventory/"),
  })

  const draftMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/inventory/${id}/draft`, { method: "POST" }),
    onSuccess: () => { toast.success("Draft listing created"); qc.invalidateQueries({ queryKey: ["inventory"] }) },
    onError: () => toast.error("Failed to create draft"),
  })

  const packageMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/inventory/${id}/auto-package`, { method: "POST" }),
    onSuccess: () => { toast.success("Packaging assigned"); qc.invalidateQueries({ queryKey: ["inventory"] }) },
    onError: () => toast.error("Failed to assign packaging"),
  })

  const filtered = data?.filter((i) => filter === "all" ? true : i.status === filter) ?? []

  const counts = {
    staged: data?.filter(i => i.status === "staged").length ?? 0,
    listed: data?.filter(i => i.status === "listed").length ?? 0,
    sold: data?.filter(i => i.status === "sold").length ?? 0,
  }

  return (
    <div className="p-6 space-y-4">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="staged">Staged <Badge variant="secondary" className="ml-1.5 text-xs">{counts.staged}</Badge></TabsTrigger>
          <TabsTrigger value="listed">Listed <Badge variant="secondary" className="ml-1.5 text-xs">{counts.listed}</Badge></TabsTrigger>
          <TabsTrigger value="sold">Sold <Badge variant="secondary" className="ml-1.5 text-xs">{counts.sold}</Badge></TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !filtered.length ? (
        <p className="text-sm text-muted-foreground py-10 text-center">No items in this stage</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>COGS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, i) => {
                const cogs = item.cost_line_items.reduce((s, c) => s + c.amount, 0)
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.12 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      {item.image_url
                        ? <img src={item.image_url} alt="" className="h-9 w-9 rounded object-cover" />
                        : <div className="h-9 w-9 rounded bg-muted" />
                      }
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{truncateTitle(item.title)}</p>
                      <p className="text-xs text-muted-foreground">{item.sku ?? "—"}{item.condition ? ` · ${item.condition}` : ""}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.storage_location ?? "—"}</TableCell>
                    <TableCell className="tabular-nums text-sm">{formatMoney(cogs)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "listed" ? "default" : item.status === "sold" ? "outline" : "secondary"}
                        className="capitalize"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {item.status === "staged" && (
                          <>
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
                              onClick={() => packageMutation.mutate(item.id)}
                              disabled={packageMutation.isPending}>
                              <Package className="h-3 w-3" />Package
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
                              onClick={() => draftMutation.mutate(item.id)}
                              disabled={draftMutation.isPending}>
                              <FileEdit className="h-3 w-3" />Draft
                            </Button>
                          </>
                        )}
                        {item.ebay_listing_url && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <a href={item.ebay_listing_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
