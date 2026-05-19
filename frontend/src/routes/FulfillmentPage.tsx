import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Package } from "lucide-react"

interface SoldQueueItem {
  id: number
  title: string
  status: string
  storage_location: string | null
  packaging_config: string | null
}

export function FulfillmentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sold-queue"],
    queryFn: () => apiFetch<SoldQueueItem[]>("/api/inventory/sold-queue"),
  })

  if (isLoading) return (
    <div className="p-6 space-y-2">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
    </div>
  )

  if (!data?.length) return (
    <div className="p-6 flex flex-col items-center justify-center py-20 text-center">
      <Package className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm font-medium">No items to fulfill</p>
      <p className="text-xs text-muted-foreground mt-1">Sold items pending shipment will appear here</p>
    </div>
  )

  return (
    <div className="p-6 space-y-2">
      {data.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-1">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.storage_location ? `📦 ${item.storage_location}` : "No location"}{item.packaging_config ? ` · ${item.packaging_config}` : ""}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">{item.status}</Badge>
        </div>
      ))}
    </div>
  )
}
