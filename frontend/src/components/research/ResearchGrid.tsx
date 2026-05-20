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
  onWatch
}: { 
  items: ResearchItem[]
  onOpenItem: (item: ResearchItem) => void
  onWatch: (item: ResearchItem) => void
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
            className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all bg-card"
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
                {truncateTitle(item.title)}
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
