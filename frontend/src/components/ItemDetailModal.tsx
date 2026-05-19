import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { 
  ExternalLink, 
  Loader2, 
  Package, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  Timer,
  Activity,
  CheckCircle2,
  Gauge,
  Wrench,
  Gavel,
  DollarSign,
  Target
} from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { normalizeTags, getHighResImageUrl, formatAuctionDate, formatItemName } from '../utils/formatters';

export interface ModalItem {
  id: number;
  title: string;
  lot_number?: string;
  current_bid?: number;
  end_time?: string | null;
  url?: string;
  image_url?: string;
  images?: string[];
  category?: string;
  tags?: unknown;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    search_query?: string;
    sample_size?: number;
  };
  is_watched?: boolean;
  is_archived?: boolean;
  user_bids?: {
    current_bid_amount?: number;
    user_bid_amount?: number;
    user_proxy_bid?: number;
    user_bid_status?: string;
  };
  landedCost?: number;
  computedRoi?: number | null;
  vin?: string;
  vehicle_year?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_trim?: string;
  auction_house_key?: string;
  product_name?: string;
  brand?: string;
  condition?: string;
}

const AUCTION_HOUSE_MAP: Record<string, { name: string, short: string, className: string }> = {
  'rol': { name: 'Roller', short: 'Roller', className: 'source-roller' },
  'rmeb': { name: 'Whitley', short: 'Whitley', className: 'source-whitley' },
  'public_surplus': { name: 'Public Surplus', short: 'PS', className: 'source-ps' },
  'govdeals': { name: 'GovDeals', short: 'GD', className: 'source-gd' },
  'dickensheet': { name: 'Dickensheet', short: 'Dickensheet', className: 'source-dickensheet' },
};

interface ItemDetailModalProps {
  item: ModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  viewContext?: 'research' | 'watchlist' | 'bidding' | 'vehicles';
  onValuate?: (itemId: number) => void;
  isValuating?: boolean;
  valuationStatusText?: string;
  onPlaceBid?: (itemId: number, amount: string) => void;
  onMarkWon?: (itemId: number) => void;
  onArchive?: (itemId: number, isArchived: boolean) => void;
  isBidding?: boolean;
  bidError?: string | null;
  bidSuccess?: string | null;
  comparables?: any;
  loadingComparables?: boolean;
  targetMargin?: string | number;
  onMarginChange?: (val: any) => void;
  onPersistMargin?: () => void;
  userTimezone?: string;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ 
  item, 
  isOpen, 
  onClose,
  viewContext = 'research',
  onValuate,
  isValuating,
  valuationStatusText,
  onPlaceBid,
  onMarkWon,
  onArchive,
  isBidding,
  bidError,
  bidSuccess,
  comparables,
  loadingComparables,
  targetMargin,
  onMarginChange,
  onPersistMargin,
  userTimezone
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<string>('');

  useEffect(() => {
    setTimeout(() => {
      setImageIndex(0);
      setBidAmount('');
    }, 0);
  }, [item?.id]);

  if (!item) return null;

  const images = item.images && item.images.length > 0 ? item.images : (item.image_url ? [item.image_url] : []);
  const currentImage = images.length > 0 ? getHighResImageUrl(images[imageIndex]) : '';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const roi = item.computedRoi !== null && item.computedRoi !== undefined 
    ? item.computedRoi 
    : (item.valuation?.target_roi_pct ? item.valuation.target_roi_pct * 100 : null);

  const auctionHouse = item.auction_house_key ? AUCTION_HOUSE_MAP[item.auction_house_key] : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-background text-body-md antialiased overflow-y-auto max-h-[90vh] rounded-xl">
        <main className="p-6 space-y-6">
          {/* Summary Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest rounded-xl flex items-center gap-4 p-4 shadow-soft border border-outline-variant/30">
              <div className="w-10 h-10 bg-secondary-container/10 rounded-full flex items-center justify-center">
                <DollarSign size={20} className="text-secondary opacity-70" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Est. Value</p>
                <p className="text-xl text-on-surface">${item.valuation?.est_market_value?.toFixed(0) || '---'}</p>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest rounded-xl flex items-center gap-4 p-4 shadow-soft border border-outline-variant/30">
              <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center">
                <Target size={20} className="text-outline opacity-70" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Max Bid</p>
                <p className="text-xl text-on-surface">${item.valuation?.max_bid_for_target_roi?.toFixed(0) || '---'}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl flex items-center gap-4 p-4 shadow-soft border border-outline-variant/30">
              <div className="w-10 h-10 bg-secondary-container/10 rounded-full flex items-center justify-center">
                <Gavel size={20} className="text-secondary" />
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-widest">Current Bid</p>
                <p className="text-xl text-secondary">${item.current_bid?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl flex items-center gap-4 p-4 shadow-soft border border-outline-variant/30">
              <div className="w-10 h-10 bg-status-winning/10 rounded-full flex items-center justify-center">
                <TrendingUp size={20} className="text-status-profit opacity-70" />
              </div>
              <div>
                <p className="text-[10px] text-status-profit uppercase tracking-widest">Projected ROI</p>
                <p className="text-xl text-status-profit">
                  {roi === Infinity ? '∞%' : (roi !== null ? `${Math.round(roi)}%` : '---')}
                </p>
              </div>
            </div>
          </section>

          {/* Urgent Header Bar */}
          <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-error" />
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Time Remaining</span>
              </div>
              <div className="flex-1 h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                <div className="h-full bg-error w-3/4 rounded-full"></div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-headline-md text-error font-bold whitespace-nowrap">
                  <CountdownTimer endTime={item.end_time || null} />
                </div>
                <span className="text-[9px] opacity-60 font-medium">{formatAuctionDate(item.end_time, userTimezone)}</span>
              </div>
            </div>
          </section>

          {/* Main Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Product Info & Gallery */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-soft">
                <div className="aspect-video bg-surface-container-low relative group">
                  {currentImage ? (
                    <img className="w-full h-full object-cover" src={currentImage} alt={formatItemName(item)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">No Image Available</div>
                  )}
                  
                  {images.length > 1 && (
                    <>
                      <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === imageIndex ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg text-primary leading-tight">{formatItemName(item)}</h3>
                    {auctionHouse && (
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${auctionHouse.className}`}>
                        {auctionHouse.short}
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm mb-4 leading-relaxed line-clamp-2">
                    {item.category || 'Uncategorized Auction Item'} • Lot #{item.lot_number || 'N/A'}
                  </p>
                  
                  <div>
                    <p className="text-[10px] text-outline uppercase tracking-widest mb-2">Technical Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {normalizeTags(item.tags).map((tag, idx) => (
                        <span key={idx} className="bg-surface-container-low px-2 py-1 rounded text-[11px] text-on-surface-variant border border-outline-variant/20 whitespace-nowrap">
                          {tag.value}
                        </span>
                      ))}
                      {item.vin && <span className="bg-primary/5 px-2 py-1 rounded text-[11px] font-mono border border-primary/10">VIN: {item.vin}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Insights */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base text-primary">Research Insights</h4>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-secondary uppercase text-[10px] hover:underline flex items-center gap-1">
                    <ExternalLink size={12} /> Full Auction
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-outline-variant/30 rounded-lg p-3 bg-surface-bright">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-secondary-container/10 flex items-center justify-center">
                        <Activity size={14} className="text-secondary" />
                      </div>
                      <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">Scarcity</span>
                    </div>
                    <p className="text-primary font-bold text-xs mb-0.5">
                      {item.valuation?.sample_size ? (item.valuation.sample_size > 20 ? 'High Liquidity' : 'Low Volume') : 'N/A'}
                    </p>
                    <p className="text-on-surface-variant text-[10px] leading-tight">Based on {item.valuation?.sample_size || 0} active comps.</p>
                  </div>
                  
                  <div className="border border-outline-variant/30 rounded-lg p-3 bg-surface-bright">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-tertiary-fixed/30 flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-tertiary" />
                      </div>
                      <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">Analysis</span>
                    </div>
                    <p className="text-primary font-bold text-xs mb-0.5">AI Enriched</p>
                    <p className="text-on-surface-variant text-[10px] leading-tight">Gemma 2B categorization confirmed.</p>
                  </div>

                  <div className="border border-outline-variant/30 rounded-lg p-3 bg-surface-bright">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center">
                        <Gauge size={14} className="text-primary" />
                      </div>
                      <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">Query</span>
                    </div>
                    <p className="text-primary font-bold text-xs mb-0.5 truncate" title={item.valuation?.search_query}>
                      {item.valuation?.search_query || 'N/A'}
                    </p>
                    <p className="text-on-surface-variant text-[10px] leading-tight">Search terms used for valuation.</p>
                  </div>

                  <div className="border border-outline-variant/30 rounded-lg p-3 bg-surface-bright">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-error-container/50 flex items-center justify-center">
                        <Wrench size={14} className="text-error" />
                      </div>
                      <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">Status</span>
                    </div>
                    <p className="text-primary font-bold text-xs mb-0.5">
                      {item.is_archived ? 'Archived' : (item.is_watched ? 'Watching' : 'Active')}
                    </p>
                    <p className="text-on-surface-variant text-[10px] leading-tight">Currently in your {item.is_archived ? 'history' : 'pipeline'}.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Market Data & Expenses */}
            <div className="lg:col-span-7 space-y-6">
              {/* Market Comparison Table */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-soft">
                <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Market Comparison (Active Comps)</p>
                  {loadingComparables ? (
                    <Loader2 size={12} className="animate-spin text-secondary" />
                  ) : (
                    <span className="text-[10px] text-outline">Trimmed Median Analysis</span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/30 border-b border-outline-variant/30">
                        <th className="px-5 py-3 text-[9px] text-outline uppercase tracking-wider">Competitor Listing</th>
                        <th className="px-5 py-3 text-[9px] text-secondary uppercase tracking-wider text-right">Price</th>
                        <th className="px-5 py-3 text-[9px] text-outline uppercase tracking-wider">Cond.</th>
                        <th className="px-5 py-3 text-[9px] text-outline uppercase tracking-wider text-right">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {comparables?.sample_listings?.slice(0, 4).map((listing: any, i: number) => (
                        <tr key={i} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-5 py-3 text-xs text-primary truncate max-w-[200px]">{listing.title}</td>
                          <td className="px-5 py-3 text-xs text-primary text-right font-bold">${listing.price}</td>
                          <td className="px-5 py-3 text-[10px] text-on-surface-variant uppercase">{listing.condition || 'N/A'}</td>
                          <td className="px-5 py-3 text-right">
                            <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:opacity-70">
                              <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      ))}
                      {(!comparables?.sample_listings || comparables.sample_listings.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-xs text-outline italic">
                            {loadingComparables ? 'Syncing market data...' : 'No direct comparables found in recent scrape.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base text-primary">Expense Estimation</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Marketplace Fees (13.5%)</span>
                    <span className="font-bold text-primary">${((item.valuation?.est_market_value || 0) * 0.135).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Shipping & Fulfillment</span>
                    <span className="font-bold text-primary">$45.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Processing Buffer</span>
                    <span className="font-bold text-primary">$15.00</span>
                  </div>
                  <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Est. Operating Cost</span>
                    <span className="text-lg text-error">
                      ${(((item.valuation?.est_market_value || 0) * 0.135) + 60).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Margin Calculator (Visible in specific contexts) */}
              {(viewContext === 'bidding' || viewContext === 'watchlist') && onMarginChange && (
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-soft">
                  <h4 className="text-base text-primary mb-4">Margin Calculator</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-[9px] text-outline uppercase block mb-1">Target Margin (%)</label>
                      <input 
                        type="number" 
                        value={targetMargin ?? (item.valuation?.target_roi_pct ? item.valuation.target_roi_pct * 100 : 20)}
                        onChange={(e) => onMarginChange(e.target.value)}
                        onBlur={() => onPersistMargin && onPersistMargin()}
                        onKeyDown={(e) => e.key === 'Enter' && onPersistMargin && onPersistMargin()}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-secondary outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] text-outline uppercase block mb-1">Max Recommended Bid</label>
                      <p className="text-lg font-bold text-emerald-600">${item.valuation?.max_bid_for_target_roi?.toFixed(2) || '---'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Local Actions (Re-valuate, Archive, Mark Won) */}
              <div className="flex flex-wrap gap-3">
                {viewContext === 'research' && (
                   <button 
                    onClick={() => onValuate && onValuate(item.id)}
                    className="flex-1 py-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50"
                    disabled={isValuating}
                  >
                    {isValuating ? <Loader2 size={14} className="animate-spin inline mr-2" /> : <TrendingUp size={14} className="inline mr-2" />}
                    {isValuating ? (valuationStatusText || 'Valuating...') : 'Re-Valuate AI'}
                  </button>
                )}
                
                {viewContext === 'bidding' && (
                  <button
                    className="flex-1 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all"
                    onClick={() => onMarkWon && onMarkWon(item.id)}
                  >
                    Mark as Won
                  </button>
                )}

                {onArchive && (
                  <button 
                    onClick={() => onArchive(item.id, !item.is_archived)}
                    className="px-6 py-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-outline-variant/30 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all"
                    title={item.is_archived ? 'Unarchive' : 'Archive'}
                  >
                    {item.is_archived ? <RotateCcw size={14} /> : <Package size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Persistent Footer Action Bar */}
        <footer className="sticky bottom-0 bg-surface-container/80  border-t border-outline-variant/30 p-5 flex flex-col md:flex-row items-center justify-between gap-4 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="space-y-1">
              <span className="text-[9px] text-outline uppercase tracking-widest">Your Next Bid</span>
              <div className="flex items-center gap-2">
                <span className="text-outline font-bold">$</span>
                <input 
                  type="number"
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-1.5 w-32 text-lg text-primary focus:ring-2 focus:ring-secondary outline-none transition-all"
                  value={bidAmount}
                  placeholder={((item.current_bid || 0) + 1).toString()}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={isBidding}
                />
              </div>
            </div>
            <div className="hidden md:block h-10 w-px bg-outline-variant/30"></div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-outline uppercase tracking-widest">Potential Profit</span>
              <p className="text-lg text-secondary">
                {item.valuation && bidAmount ? `$${(item.valuation.est_market_value - Number(bidAmount)).toFixed(2)}` : '---'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 w-full md:w-auto">
            <button 
              className="w-full md:w-auto px-12 py-3 bg-primary text-on-primary rounded-lg text-[11px] uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              onClick={() => onPlaceBid && onPlaceBid(item.id, bidAmount)}
              disabled={isBidding || !bidAmount}
            >
              {isBidding ? <Loader2 size={16} className="animate-spin" /> : 'Place Quick Bid'}
            </button>
            {bidError && <span className="text-[10px] text-error font-medium">{bidError}</span>}
            {bidSuccess && <span className="text-[10px] text-status-profit font-medium">{bidSuccess}</span>}
          </div>
        </footer>
      </div>
    </Modal>
  );
};

export default ItemDetailModal;
