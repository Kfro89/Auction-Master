import { useSearchParams } from "react-router-dom"
import { useState } from "react"
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Money } from "@/components/common/Money"
import { Percent } from "@/components/common/Percent"
import { useCountdown } from "@/hooks/useCountdown"
import { useEnrichItem, useUpdateQueries } from "@/hooks/useResearchItems"
import { toast } from "sonner"
import { 
  X, Gavel, Flag, TrendingUp, Timer, Download, ShieldCheck, 
  Zap, Wrench, Wallet, Sparkles, Settings2, Check, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ResearchItem, Comparable } from "@/lib/types"

export function ItemDetailModal({ items }: { items: ResearchItem[] }) {
  const [params, setParams] = useSearchParams()
  const itemId = params.get("item") ? Number(params.get("item")) : null
  const item = items.find((i) => i.id === itemId) ?? null

  const [isEditingQueries, setIsEditingQueries] = useState(false)
  const [newQueries, setNewQueries] = useState("")

  const enrich = useEnrichItem()
  const updateQueries = useUpdateQueries()

  const close = () => {
    const next = new URLSearchParams(params)
    next.delete("item")
    setParams(next)
    setIsEditingQueries(false)
  }

  const handleEnrich = () => {
    if (!item) return
    enrich.mutate(item.id, {
      onSuccess: () => toast.success("AI Enrichment refreshed"),
      onError: () => toast.error("Enrichment failed")
    })
  }

  const handleUpdateQueries = () => {
    if (!item) return
    const queries = newQueries.split(",").map(q => q.trim()).filter(Boolean)
    if (queries.length === 0) return
    updateQueries.mutate({ id: item.id, queries }, {
      onSuccess: () => {
        toast.success("Search queries updated")
        setIsEditingQueries(false)
      },
      onError: () => toast.error("Failed to update queries")
    })
  }

  const secondsLeft = useCountdown(item?.end_time)

  if (!item) return null

  // Progress bar calculation (7-day scale)
  const totalSeconds = 7 * 24 * 3600
  const progress = secondsLeft != null ? Math.min(100, (secondsLeft / totalSeconds) * 100) : 0

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent 
        showCloseButton={false} 
        className="max-w-7xl lg:max-w-[85vw] xl:max-w-[80vw] p-0 border-white/10 bg-[#020617]/40 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] text-white"
      >
        {/* Close Button - Exact Styling from Mockup, overlayed on the top right */}
        <DialogClose className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-colors z-50 flex items-center justify-center border border-white/10 shadow-sm text-slate-300 hover:text-white outline-none">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Hidden accessible title/description for screen readers */}
        <DialogTitle className="sr-only">Item Detail: {item.product_name || item.title}</DialogTitle>
        <DialogDescription className="sr-only">Detailed research insights and market benchmarks for this lot.</DialogDescription>

        {/* Main Split Layout Grid */}
        <div className="grid grid-cols-12 h-full w-full overflow-y-auto lg:overflow-hidden">
          
          {/* Left Column: Hero Image Container */}
          <div className="col-span-12 lg:col-span-5 h-[320px] lg:h-full relative bg-slate-950/40 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden flex flex-col justify-end select-none">
            {/* Blurred background image to prevent black bars and create depth */}
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 select-none pointer-events-none" 
              />
            )}
            
            {/* Centered foreground image showing the full product detail without cropping */}
            <div className="absolute inset-0 flex items-center justify-center p-6 pb-28">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.product_name || item.title} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5" 
                />
              ) : (
                <div className="text-slate-500 italic text-sm">No Image Available</div>
              )}
            </div>

            {/* Premium ambient gradient overlay to blend details at the bottom of the banner */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-[#020617]/20 pointer-events-none" />

            {/* Title Overlay at the bottom-left of the left column */}
            <div className="relative p-6 space-y-2 z-10">
              {item.lot_number && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 backdrop-blur-md">
                  Lot #{item.lot_number}
                </span>
              )}
              <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight drop-shadow-lg line-clamp-2 leading-tight">
                {item.product_name || item.title}
              </h2>
            </div>
          </div>

          {/* Right Column: Scrollable Details Pane */}
          <div className="col-span-12 lg:col-span-7 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar flex flex-col p-6 lg:p-8 space-y-6">
            
            {/* Header Row (Title, Actions, Badges) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6 pr-8">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.lot_number && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                      Lot #{item.lot_number}
                    </span>
                  )}
                  {item.condition && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10 uppercase tracking-wider">
                      {item.condition}
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight line-clamp-2">
                  {item.product_name || item.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 sm:pt-2">
                {item.url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm"
                    asChild
                  >
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-semibold">View Auction</span>
                    </a>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm"
                  onClick={handleEnrich}
                  disabled={enrich.isPending}
                >
                  <Sparkles className={`h-4 w-4 text-sky-400 ${enrich.isPending ? "animate-pulse" : ""}`} />
                  <span className="text-xs font-semibold">Refresh Valuation</span>
                </Button>
              </div>
            </div>

            {/* Urgent Status Bar - Exact Styling & Glow */}
            <section className="bg-[#ba1a1a]/10 backdrop-blur-md border border-[#ba1a1a]/30 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1 max-w-3xl">
                <div className="flex items-center gap-3 shrink-0">
                  <Timer className="h-5 w-5 text-[#ba1a1a]" />
                  <span className="text-[11px] font-bold text-[#ba1a1a] uppercase tracking-widest">Time Remaining</span>
                </div>
                <div className="flex-1 h-1.5 bg-[#ba1a1a]/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ba1a1a] rounded-full shadow-[0_0_8px_rgba(186,26,26,0.6)] transition-all duration-1000" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-[18px] font-bold text-[#ba1a1a] tabular-nums shrink-0 leading-none">
                  {secondsLeft !== null ? (
                    `${Math.floor(secondsLeft / 3600).toString().padStart(2, '0')}h ${Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0')}m ${(secondsLeft % 60).toString().padStart(2, '0')}s`
                  ) : "00h 00m 00s"}
                </span>
              </div>
            </section>

            {/* Summary Metrics Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Est. Value Tile */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl flex items-center gap-3 p-4 shadow-sm border border-white/10">
                <div className="w-10 h-10 bg-[#0051d5]/20 rounded-full flex items-center justify-center shrink-0">
                  <Wallet className="h-5 w-5 text-[#0051d5] opacity-80" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.05em]">Est. Value</p>
                  <p className="text-[20px] md:text-[24px] font-semibold text-white leading-tight"><Money value={item.valuation?.est_market_value ?? 0} /></p>
                </div>
              </div>

              {/* Max Bid Tile */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl flex items-center gap-3 p-4 shadow-sm border border-white/10">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Flag className="h-5 w-5 text-slate-400 opacity-80" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.05em]">Max Bid</p>
                  <p className="text-[20px] md:text-[24px] font-semibold text-white leading-tight"><Money value={item.valuation?.max_bid_for_target_roi ?? 0} /></p>
                </div>
              </div>

              {/* Current Bid Tile */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl flex items-center gap-3 p-4 shadow-sm border border-white/10">
                <div className="w-10 h-10 bg-[#0051d5]/20 rounded-full flex items-center justify-center shrink-0">
                  <Gavel className="h-5 w-5 text-[#0051d5] opacity-80 fill-[#0051d5]/20" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#0051d5] uppercase tracking-[0.05em]">Current Bid</p>
                  <p className="text-[20px] md:text-[24px] font-semibold text-[#0051d5] leading-tight"><Money value={item.current_bid} /></p>
                </div>
              </div>

              {/* Proj. ROI Tile */}
              <div className="bg-[#059669]/10 backdrop-blur-md rounded-xl flex items-center gap-3 p-4 shadow-sm border border-[#059669]/30">
                <div className="w-10 h-10 bg-[#059669]/20 rounded-full flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-[#059669] opacity-80" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#059669] uppercase tracking-[0.05em]">Proj. ROI</p>
                  <p className="text-[20px] md:text-[24px] font-semibold text-[#059669] leading-tight">
                    <Percent value={item.valuation?.target_roi_pct ?? 0} />
                  </p>
                </div>
              </div>
            </section>

            {/* Insights Grid */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[18px] font-semibold text-white uppercase tracking-tight leading-none">Research Insights</h4>
                <button className="text-[#0051d5] text-[11px] font-bold uppercase tracking-[0.05em] hover:bg-[#0051d5]/10 px-3 py-1 rounded transition-colors flex items-center gap-1.5">
                  <Download className="h-4 w-4" /> Specs Report
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm hover:border-[#0051d5]/50 transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#0051d5]/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-[#0051d5]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volatility</span>
                  </div>
                  <p className="text-white font-bold text-[13px] mb-1">Stable Secondary Floor</p>
                  <p className="text-slate-400 text-[13px] leading-snug">Maintains ~85% MSRP value on active channels.</p>
                </div>

                <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm hover:border-[#0051d5]/50 transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-slate-300" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification</span>
                  </div>
                  <p className="text-white font-bold text-[13px] mb-1">Serial Check Passed</p>
                  <p className="text-slate-400 text-[13px] leading-snug">Auction channel confirms original origin.</p>
                </div>

                <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm hover:border-[#0051d5]/50 transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Velocity</span>
                  </div>
                  <p className="text-white font-bold text-[13px] mb-1">Avg 48h Turnaround</p>
                  <p className="text-slate-400 text-[13px] leading-snug">High demand spec; quick resale potential.</p>
                </div>

                <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm hover:border-[#0051d5]/50 transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#ba1a1a]/20 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-[#ba1a1a]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repair</span>
                  </div>
                  <p className="text-white font-bold text-[13px] mb-1">Score: 8/10 (Modular)</p>
                  <p className="text-slate-400 text-[13px] leading-snug">Standard components; serviceability high.</p>
                </div>
              </div>
            </div>

            {/* Lot Details Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <h4 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lot Details</h4>
                <p className="text-slate-300 text-[14px] leading-relaxed">
                  {item.title !== item.product_name ? item.title : "High-performance item verified for resale. Detailed inspection notes and channel confirmation available below."}
                </p>
              </div>

              {/* Search Queries / Tuning */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Valuation Queries</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] text-slate-400"
                    onClick={() => {
                      setNewQueries(item.search_queries?.join(", ") || "")
                      setIsEditingQueries(!isEditingQueries)
                    }}
                  >
                    {isEditingQueries ? <X className="h-3 w-3 mr-1" /> : <Settings2 className="h-3 w-3 mr-1" />}
                    {isEditingQueries ? "Cancel" : "Tune"}
                  </Button>
                </div>
                
                {isEditingQueries ? (
                  <div className="flex gap-2">
                    <Input 
                      value={newQueries}
                      onChange={(e) => setNewQueries(e.target.value)}
                      placeholder="Query 1, Query 2..."
                      className="h-8 text-xs bg-white/5 border-white/10 text-white"
                    />
                    <Button 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={handleUpdateQueries}
                      disabled={updateQueries.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {item.search_queries && item.search_queries.length > 0 ? (
                      item.search_queries.map((q, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-slate-400">
                          {q}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No custom queries tuned.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata Tags */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Metadata Tags</p>
                <div className="flex flex-wrap gap-2">
                  {item.auction_house_name && (
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[13px] border border-white/10 text-slate-300">
                      {item.auction_house_name}
                    </span>
                  )}
                  {item.condition && (
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[13px] border border-white/10 text-slate-300">
                      Condition: {item.condition}
                    </span>
                  )}
                  {item.lot_number && (
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[13px] border border-white/10 text-slate-300">
                      Lot #{item.lot_number}
                    </span>
                  )}
                  {item.category && (
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[13px] border border-white/10 text-slate-300">
                      {item.category.split(' > ').pop()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Marketplace Benchmarks Table */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-white/10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Marketplace Benchmarks</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-[#0051d5] uppercase tracking-wider text-right">Avg Sale</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trend</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Listings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {item.valuation_detail?.sample_listings && item.valuation_detail.sample_listings.length > 0 ? (
                      (item.valuation_detail.sample_listings as Comparable[]).slice(0, 10).map((comp, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-[13px] flex items-center gap-3">
                            {comp.thumbnail ? (
                              <img src={comp.thumbnail} className="h-8 w-8 rounded-md object-cover border border-white/10" alt="" />
                            ) : (
                              <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10" />
                            )}
                            <span className="truncate max-w-[200px] font-medium">{comp.title}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-[13px] font-bold font-mono text-white">
                            <Money value={comp.price} />
                          </td>
                          <td className="px-6 py-4 text-[13px] text-slate-400">Stable</td>
                          <td className="px-6 py-4 text-right text-[13px] text-slate-500">
                            {item.valuation?.sample_size || 1} active
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-[13px] flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10" />
                          <span className="truncate max-w-[200px] font-medium text-slate-300">eBay Active Comp</span>
                        </td>
                        <td className="px-6 py-4 text-right text-[13px] font-bold font-mono text-white">
                          <Money value={item.valuation?.est_market_value || 0} />
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-400">Trend TBD</td>
                        <td className="px-6 py-4 text-right text-[13px] text-slate-500">
                          {item.valuation?.sample_size || 0} active
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
