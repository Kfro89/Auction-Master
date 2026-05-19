import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatMoney, formatPercent, computeProjectedProfit, computeRoi } from "@/lib/format"
import type { ResearchItem } from "@/lib/types"

export function ValuationPanel({ item }: { item: ResearchItem }) {
  const { valuation, valuation_detail, current_bid } = item

  if (!valuation) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No valuation data yet
      </div>
    )
  }

  const profit = computeProjectedProfit(valuation.est_market_value, current_bid)
  const roi = computeRoi(valuation.est_market_value, current_bid)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Est. Market Value</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <p className="text-lg font-semibold">{formatMoney(valuation.est_market_value)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Max Bid ({valuation.target_roi_pct}% ROI)</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <p className="text-lg font-semibold">{formatMoney(valuation.max_bid_for_target_roi)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Projected Profit</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <p className={`text-lg font-semibold ${profit != null && profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {formatMoney(profit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">ROI @ Current Bid</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <p className={`text-lg font-semibold ${roi != null && roi >= 0.2 ? "text-green-600 dark:text-green-400" : roi != null && roi >= 0 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
              {formatPercent(roi)}
            </p>
          </CardContent>
        </Card>
      </div>

      {valuation_detail && (
        <>
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg asking</span>
              <span>{formatMoney(valuation_detail.avg_asking_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Median asking</span>
              <span>{formatMoney(valuation_detail.median_asking_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price range</span>
              <span>{formatMoney(valuation_detail.price_range_low)} – {formatMoney(valuation_detail.price_range_high)}</span>
            </div>
          </div>
        </>
      )}

      {valuation.search_query && (
        <p className="text-xs text-muted-foreground">
          Based on {valuation.sample_size ?? "?"} eBay sold listings for "{valuation.search_query}"
        </p>
      )}
    </div>
  )
}
