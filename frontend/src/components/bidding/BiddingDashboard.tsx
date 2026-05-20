import { useMemo } from "react"
import { Trophy, TrendingDown, Target, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import type { BidItem } from "@/lib/types"

interface DashboardMetrics {
  count: number
  relBidValue: number
  estValue: number
  estProfit: number
  roiSum: number
  roiCount: number
}

function calculateMetrics(items: BidItem[]): DashboardMetrics {
  let count = 0
  let relBidValue = 0
  let estValue = 0
  let estProfit = 0
  let roiSum = 0
  let roiCount = 0

  for (const item of items) {
    count++
    relBidValue += item.user_bid_amount || 0
    if (item.valuation?.est_market_value != null) {
      const val = item.valuation.est_market_value
      estValue += val
      estProfit += val - (item.current_bid_amount || 0)
      
      const denominator = item.current_bid_amount || 0
      if (denominator > 0) {
        roiSum += (val - denominator) / denominator
        roiCount++
      }
    }
  }

  return { count, relBidValue, estValue, estProfit, roiSum, roiCount }
}

export function BiddingDashboard({ items }: { items: BidItem[] }) {
  const { total, winning, outbid, won, lost, exposure } = useMemo(() => {
    const activeItems = items.filter((i) => !i.is_hidden_from_active)
    
    const total = calculateMetrics(activeItems)
    const winning = calculateMetrics(activeItems.filter((i) => i.user_bid_status === "winning"))
    const outbid = calculateMetrics(activeItems.filter((i) => i.user_bid_status === "outbid"))
    const won = calculateMetrics(activeItems.filter((i) => i.user_bid_status === "won"))
    const lost = calculateMetrics(activeItems.filter((i) => i.user_bid_status === "lost"))
    
    const exposure = activeItems
      .filter((i) => i.user_bid_status === "winning" || i.user_bid_status === "won")
      .reduce((sum, i) => sum + (i.user_proxy_bid ?? i.user_bid_amount ?? 0), 0)

    return { total, winning, outbid, won, lost, exposure }
  }, [items])

  const renderMetricTile = (
    title: string, 
    metrics: DashboardMetrics, 
    icon: React.ReactNode, 
    bgColor: string, 
    exposureAmount?: number
  ) => (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-muted/30">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
            {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        <div className="flex justify-between items-end">
          <div className="text-2xl font-bold">{metrics.count}</div>
          {exposureAmount !== undefined && (
            <div className="text-xs text-muted-foreground flex flex-col items-end">
              <span className="font-semibold text-primary"><Money value={exposureAmount} /></span>
              <span>Total Exposure</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Rel. Bid Value</span>
            <span className="font-medium"><Money value={metrics.relBidValue} /></span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Est. Value</span>
            <span className="font-medium"><Money value={metrics.estValue} /></span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Est. Profit</span>
            <span className="font-medium">
               <Money value={metrics.estProfit} className={metrics.estProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Est. ROI</span>
            <span className="font-medium">
               <Percent value={metrics.roiCount > 0 ? metrics.roiSum / metrics.roiCount : 0} colorCode />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {renderMetricTile("Total Items", total, <Target className="h-4 w-4 text-primary" />, "bg-primary/10", exposure)}
      {renderMetricTile("Winning", winning, <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />, "bg-green-500/10")}
      {renderMetricTile("Outbid", outbid, <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />, "bg-orange-500/10")}
      {renderMetricTile("Won", won, <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />, "bg-blue-500/10")}
      {renderMetricTile("Lost", lost, <XCircle className="h-4 w-4 text-muted-foreground" />, "bg-muted")}
    </div>
  )
}
