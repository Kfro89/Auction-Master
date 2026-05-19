import { motion } from "framer-motion"
import { useWatchlist, useUnwatch } from "@/hooks/useWatchlist"
import { EmptyState } from "@/components/common/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { CountdownBadge } from "@/components/research/CountdownBadge"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import { computeRoi, truncateTitle } from "@/lib/format"

export function WatchlistPage() {
  const { data, isLoading, isError } = useWatchlist()
  const unwatch = useUnwatch()

  if (isLoading) return (
    <div className="p-6 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  )
  if (isError) return (
    <div className="p-6">
      <EmptyState title="Failed to load watchlist" description="Check your connection and try again" />
    </div>
  )
  if (!data?.length) return (
    <div className="p-6">
      <EmptyState title="Nothing on your watchlist" description="Star items in Research to watch them" />
    </div>
  )

  return (
    <div className="p-6 space-y-2">
      {data.map((item, i) => {
        const roi = computeRoi(item.valuation?.est_market_value, item.current_bid)
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02, duration: 0.12 }}
            className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors"
          >
            {item.image_url
              ? <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0" />
              : <div className="h-10 w-10 rounded bg-muted flex-shrink-0" />
            }
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight line-clamp-1">
                {item.url
                  ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{truncateTitle(item.title)}</a>
                  : truncateTitle(item.title)
                }
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {item.auction_house_name && <Badge variant="secondary" className="text-xs px-1.5 py-0">{item.auction_house_name}</Badge>}
                <span className="text-xs text-muted-foreground"><Money value={item.current_bid} /></span>
                {item.valuation?.est_market_value && <span className="text-xs text-muted-foreground">EMV <Money value={item.valuation.est_market_value} /></span>}
                <Percent value={roi} colorCode className="text-xs" />
              </div>
            </div>
            <CountdownBadge endTime={item.end_time} />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => unwatch.mutate(item.id)}
            >
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}
