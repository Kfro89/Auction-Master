import { useSearchParams } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import { useCountdown } from "@/hooks/useCountdown"
import type { ResearchItem, Comparable } from "@/lib/types"

export function ItemDetailModal({ items }: { items: ResearchItem[] }) {
  const [params, setParams] = useSearchParams()
  const itemId = params.get("item") ? Number(params.get("item")) : null
  const item = items.find((i) => i.id === itemId) ?? null

  const close = () => {
    const next = new URLSearchParams(params)
    next.delete("item")
    setParams(next)
  }

  const secondsLeft = useCountdown(item?.end_time)

  if (!item) return null

  const totalSeconds = 7 * 24 * 3600
  const progress = secondsLeft != null ? Math.min(100, (secondsLeft / totalSeconds) * 100) : 0

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && close()}>
      {/* 
        Note: We are passing a custom class to DialogContent that overrides default shadcn 
        light/dark background colors to achieve the Glass 2.0 look.
      */}
      <DialogContent 
        className="max-w-7xl p-0 border-white/10 bg-slate-950/40 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] text-white [&>button>svg]:text-white [&>button]:hover:bg-white/20"
      >
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-3xl font-bold font-sans tracking-tight">Item Detail</DialogTitle>
          <DialogDescription className="text-slate-400">Detailed research insights and market benchmarks</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-8 space-y-8">
            
            {/* Summary Metrics Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-xl flex items-center gap-4 p-6 shadow-sm border border-white/10">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Est. Value</p>
                  <p className="text-2xl font-semibold"><Money value={item.valuation?.est_market_value ?? 0} /></p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl flex items-center gap-4 p-6 shadow-sm border border-white/10">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Max Bid</p>
                  <p className="text-2xl font-semibold"><Money value={item.valuation?.max_bid_for_target_roi ?? 0} /></p>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl flex items-center gap-4 p-6 shadow-sm border border-white/10">
                <div>
                  <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Current Bid</p>
                  <p className="text-2xl font-semibold text-primary"><Money value={item.current_bid} /></p>
                </div>
              </div>
              <div className="bg-green-500/10 backdrop-blur-md rounded-xl flex items-center gap-4 p-6 shadow-sm border border-green-500/30">
                <div>
                  <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest">Proj. ROI</p>
                  <p className="text-2xl font-semibold text-green-400">
                    <Percent value={item.valuation?.target_roi_pct ?? 0} />
                  </p>
                </div>
              </div>
            </section>

            {/* Urgent Status Bar */}
            <section className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Time Remaining</span>
                </div>
                <div className="flex-1 h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-lg font-bold text-red-500 tabular-nums">
                  {secondsLeft !== null ? `${Math.floor(secondsLeft / 3600)}h ${Math.floor((secondsLeft % 3600) / 60)}m ${secondsLeft % 60}s` : "Ended"}
                </span>
              </div>
            </section>

            {/* Detail Content Layout */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-black/40 relative">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 italic">No Image</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{item.product_name || item.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      {item.title !== item.product_name ? item.title : ""}
                    </p>
                    <div className="space-y-4">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Metadata Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {item.auction_house_name && (
                          <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs border border-white/10 text-slate-300">
                            {item.auction_house_name}
                          </span>
                        )}
                        {item.condition && (
                          <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs border border-white/10 text-slate-300">
                            Condition: {item.condition}
                          </span>
                        )}
                        {item.lot_number && (
                          <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs border border-white/10 text-slate-300">
                            Lot #{item.lot_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-12 lg:col-span-7 space-y-6">
                
                {/* Insights Grid (Static/Mocked for Glass 2.0 presentation) */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-bold mb-6">Research Insights</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volatility</span>
                      </div>
                      <p className="font-semibold text-sm mb-1">Stable Secondary Floor</p>
                      <p className="text-slate-400 text-xs leading-snug">Maintains ~85% MSRP value.</p>
                    </div>
                    <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification</span>
                      </div>
                      <p className="font-semibold text-sm mb-1">Serial Check Passed</p>
                      <p className="text-slate-400 text-xs leading-snug">DB confirms original channel.</p>
                    </div>
                    <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Velocity</span>
                      </div>
                      <p className="font-semibold text-sm mb-1">Avg 48h Turnaround</p>
                      <p className="text-slate-400 text-xs leading-snug">Quick resale potential.</p>
                    </div>
                    <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repair</span>
                      </div>
                      <p className="font-semibold text-sm mb-1">Score: 4/10 (Modular)</p>
                      <p className="text-slate-400 text-xs leading-snug">Standard components.</p>
                    </div>
                  </div>
                </div>

                {/* Benchmarks Table */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-white/10">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Marketplace Benchmarks</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Avg Sale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {item.valuation_detail?.sample_listings && item.valuation_detail.sample_listings.length > 0 ? (
                          (item.valuation_detail.sample_listings as Comparable[]).slice(0, 10).map((comp, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 text-sm flex items-center gap-3">
                                {comp.thumbnail && <img src={comp.thumbnail} className="h-8 w-8 rounded-md object-cover border border-white/10" alt="" />}
                                <span className="truncate max-w-[200px]">{comp.title}</span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-semibold font-mono">
                                <Money value={comp.price} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="px-6 py-8 text-center text-slate-500 italic text-sm">No sample listings available</td>
                          </tr>
                        )}
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
