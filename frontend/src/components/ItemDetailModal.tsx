import React, { useState, useEffect } from 'react';
import './ItemDetailModal.css';
import Modal from './Modal';
import { CalendarDays, LayoutGrid, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { normalizeTags, getHighResImageUrl, formatAuctionDate } from '../utils/formatters';

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
  tags?: any;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    search_query?: string;
    sample_size?: number;
  };
  is_watched?: boolean;
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
}

const AUCTION_HOUSE_MAP: Record<string, { name: string, short: string, className: string }> = {
  'rol': { name: 'Roller', short: 'Roller', className: 'source-roller' },
  'rmeb': { name: 'Whitley', short: 'Whitley', className: 'source-whitley' },
  'public_surplus': { name: 'Public Surplus', short: 'PS', className: 'source-ps' },
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
  isBidding?: boolean;
  bidError?: string | null;
  bidSuccess?: string | null;
  // New props for market data
  comparables?: any;
  targetMargin?: string | number;
  onMarginChange?: (val: string | number) => void;
  onPersistMargin?: () => void;
  loadingComparables?: boolean;
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
  targetMargin,
  onMarginChange,
  onPersistMargin,
  loadingComparables,
  userTimezone
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<string>('');

  useEffect(() => {
    setImageIndex(0);
    setBidAmount('');
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="item-detail-layout modern">
        <div className="item-detail-image-panel-bg">
          {currentImage ? (
            <img
              src={currentImage}
              alt={item.title}
              className="item-detail-bg-image"
            />
          ) : (
            <div className="item-detail-no-image-bg">No Image Available</div>
          )}
        </div>

        <div className="item-detail-overlay-content">
          <div className="item-detail-content-columns">
            {/* Left Column: Metadata & Research */}
            <div className="item-detail-col left">
              <div className="item-detail-subtitle vertical">
                <span className="item-pill vertical time-remaining" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarDays size={14}/> <CountdownTimer endTime={item.end_time || null} />
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.8, marginLeft: '20px' }}>
                    {formatAuctionDate(item.end_time, userTimezone)}
                  </div>
                </span>
                <span className="item-pill vertical lot-number">Lot #{item.lot_number || 'N/A'}</span>
                {item.auction_house_key && (
                  <span className={`source-badge ${AUCTION_HOUSE_MAP[item.auction_house_key]?.className || 'source-default'}`} style={{ borderRadius: '12px', padding: '10px 14px', fontSize: '0.85rem', width: '100%', textAlign: 'center' }}>
                    {AUCTION_HOUSE_MAP[item.auction_house_key]?.name || 'Unknown House'}
                  </span>
                )}
                {item.vin && (
                  <span className="item-pill vertical vin mono">
                    {item.vin}
                  </span>
                )}
                {item.category && (
                  <span className="item-pill vertical category" title={item.category}>
                    <LayoutGrid size={14}/> <span className="truncate">{item.category}</span>
                  </span>
                )}
              </div>

              {/* Margin Calculator Panel - Moved to Section 1 */}
              {(viewContext === 'bidding' || viewContext === 'watchlist') && (
                <div className="detail-section">
                  <h3>Margin Calculator</h3>
                  <div className="market-panel calculator sidebar">
                    <div className="calc-row">
                      <label>Target Margin (%)</label>
                      <input 
                        type="number" 
                        value={targetMargin ?? (item.valuation?.target_roi_pct ? item.valuation.target_roi_pct * 100 : 20)}
                        onChange={(e) => onMarginChange?.(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={() => onPersistMargin?.()}
                        onKeyDown={(e) => e.key === 'Enter' && onPersistMargin?.()}
                        className="calc-input"
                      />
                    </div>
                    <div className="calc-result">
                      <span className="result-label">Max Recommended Bid</span>
                      <span className="result-value small">${item.valuation?.max_bid_for_target_roi.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {viewContext === 'vehicles' && (
                <div className="detail-section">
                  <h3>Vehicle Specs</h3>
                  <div className="detail-grid">
                    {item.vehicle_year && (
                      <div className="detail-item">
                        <span className="label">Year</span>
                        <span className="value">{item.vehicle_year}</span>
                      </div>
                    )}
                    {item.vehicle_make && (
                      <div className="detail-item">
                        <span className="label">Make</span>
                        <span className="value">{item.vehicle_make}</span>
                      </div>
                    )}
                    {item.vehicle_model && (
                      <div className="detail-item">
                        <span className="label">Model</span>
                        <span className="value">{item.vehicle_model}</span>
                      </div>
                    )}
                    {item.vehicle_trim && (
                      <div className="detail-item">
                        <span className="label">Trim</span>
                        <span className="value">{item.vehicle_trim}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {item.valuation && (
                <div className="detail-section">
                  <h3>Research Info</h3>
                  <div className="detail-grid">
                    <div className="detail-item-custom">
                      <div className="research-query-header">Search Query</div>
                      <div className="research-query-term">{item.valuation.search_query}</div>
                    </div>
                    <div className="detail-item">
                      <span className="label">Sample Size</span>
                      <span className="value">{item.valuation.sample_size || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="item-detail-spacer"></div>

              {item.tags && normalizeTags(item.tags).length > 0 && (
                <div className="detail-section no-header">
                  <div className="tags-pill-container">
                    {normalizeTags(item.tags).map((tag, idx) => (
                      <span key={`modal-tag-${idx}`} className={`modern-tag ${tag.key ? 'structured' : ''}`}>
                        {tag.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center Column: High-Res Image & Title Overlay */}
            <div className="item-detail-col center">
              <div className="item-detail-title-card">
                <h2>{item.title}</h2>
              </div>
              <div className="gallery-container">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={item.title}
                    className="item-detail-center-image"
                  />
                ) : (
                  <div className="item-detail-no-image-bg">No Image Available</div>
                )}
                {images.length > 1 && (
                  <>
                    <button className="gallery-nav-btn left" onClick={handlePrev}><ChevronLeft size={24} /></button>
                    <button className="gallery-nav-btn right" onClick={handleNext}><ChevronRight size={24} /></button>
                    <div className="gallery-indicators">
                      {images.map((_, idx) => (
                        <span key={idx} className={`gallery-dot ${idx === imageIndex ? 'active' : ''}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Contextual Content */}
            <div className="item-detail-col right">
              {/* Current Bid Tile */}
              <div className="item-detail-kpi-tile bid">
                <div className="kpi-label">Current Bid</div>
                <div className="kpi-value">${item.current_bid?.toFixed(2) || '0.00'}</div>
              </div>

              {/* Bidding & Value Grid */}
              <div className="detail-section">
                <h3>Bidding & Value</h3>
                <div className="detail-grid">
                  {viewContext === 'bidding' && item.user_bids && (
                    <>
                      <div className="detail-item">
                        <span className="label">Your Bid</span>
                        <span className="value font-semibold">${item.user_bids.user_bid_amount?.toFixed(2)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Proxy Bid Value</span>
                        <span className="value font-semibold">${item.user_bids.user_proxy_bid?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {item.valuation && (
                    <>
                      <div className="detail-item">
                        <span className="label">Est. Value</span>
                        <span className="value text-emerald-500">${item.valuation.est_market_value?.toFixed(2)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Max Bid</span>
                        <span className="value text-blue-500">${item.valuation.max_bid_for_target_roi?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {viewContext === 'bidding' && item.landedCost !== undefined && (
                    <div className="detail-item">
                      <span className="label">Landed Cost</span>
                      <span className="value text-gray-300">${item.landedCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div className="detail-section no-header">
                {viewContext === 'research' && (
                  <div className="item-detail-bid-section-modern">
                    <div className="bid-input-group">
                      <span className="currency-symbol">$</span>
                      <input 
                        type="number" 
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="modern-bid-input"
                        placeholder={`Min: $${((item.current_bid || 0) + 1).toFixed(0)}`}
                        disabled={isBidding}
                      />
                      <button 
                        className="modern-bid-btn" 
                        onClick={() => onPlaceBid && onPlaceBid(item.id, bidAmount)} 
                        disabled={isBidding || !bidAmount}
                      >
                        {isBidding ? <Loader2 size={16} className="spinning" /> : 'Bid'}
                      </button>
                    </div>
                    {bidError && <div className="bid-msg error">{bidError}</div>}
                    {bidSuccess && <div className="bid-msg success">{bidSuccess}</div>}
                  </div>
                )}

                {(viewContext === 'watchlist' || viewContext === 'vehicles' || viewContext === 'bidding') && (
                  <div className="action-column">
                    {viewContext === 'bidding' && item.user_bids?.user_bid_status === 'won' && (
                      <div className="bg-green-500/20 text-green-400 p-2 rounded text-center text-sm font-medium mb-3 border border-green-500/30">
                        🏆 Lot Won
                      </div>
                    )}
                    {viewContext === 'bidding' && item.user_bids?.user_bid_status !== 'won' && (
                      <>
                        <button
                          className="glass-blue-btn-small"
                          style={{ marginBottom: '12px', width: '100%', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                          onClick={() => onMarkWon && onMarkWon(item.id)}
                        >
                          Mark as Won
                        </button>
                        {(['lost', 'loss', 'outbid', 'outbid_near', 'reserve_not_met'].includes(item.user_bids?.user_bid_status || '') || item.is_archived) && (
                          <button
                            className="glass-blue-btn-small"
                            style={{ marginBottom: '12px', width: '100%', justifyContent: 'center', background: item.is_archived ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: item.is_archived ? '#10b981' : '#ef4444', borderColor: item.is_archived ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}
                            onClick={() => onArchive && onArchive(item.id, !item.is_archived)}
                          >
                            {item.is_archived ? <RotateCcw size={16} className="mr-2" /> : <Archive size={16} className="mr-2" />}
                            {item.is_archived ? 'Unarchive' : 'Archive'}
                          </button>
                        )}
                      </>
                    )}                    {isValuating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>{valuationStatusText || "Loading..."}</span>
                      </div>
                    ) : (
                      <button 
                        className="glass-blue-btn-small"
                        style={{ marginBottom: '12px', width: '100%', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                        onClick={() => onValuate && onValuate(item.id)}
                      >
                        Re-Valuate
                      </button>
                    )}
                  </div>
                )}

                <div className="action-row" style={{ marginTop: '12px' }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="glass-blue-btn-small" style={{ width: '100%', justifyContent: 'center' }}>
                    View Full Auction <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* ROI Tile */}
              {item.valuation && (
                <div className="item-detail-kpi-tile roi">
                  <div className="kpi-label">ROI</div>
                  <div className={`kpi-value ${viewContext === 'bidding' && item.computedRoi && item.computedRoi > 20 ? 'high' : ''}`}>
                    {viewContext === 'bidding' && item.computedRoi !== undefined && item.computedRoi !== null
                      ? (item.computedRoi === Infinity ? '∞%' : `${Math.round(item.computedRoi)}%`)
                      : (item.valuation.target_roi_pct ? `${Math.round(item.valuation.target_roi_pct)}%` : '--')
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* New Market Analysis Section */}
          {(viewContext === 'bidding' || viewContext === 'watchlist') && (
            <div className="item-detail-market-section full-width">
              {loadingComparables ? (
                <div className="market-loading">
                  <Loader2 size={24} className="spinning" />
                  <span>Analyzing market listings...</span>
                </div>
              ) : (
                <div className="market-panel listings full-width">
                  <div className="listings-header">
                    <h3>Active Market Listings</h3>
                    {comparables && (
                      <div className="market-stats">
                        <span>AVG: <strong>${comparables.avg_asking_price?.toFixed(2)}</strong></span>
                        <span className="divider">|</span>
                        <span>RANGE: <strong>${comparables.price_range_low?.toFixed(2)} - ${comparables.price_range_high?.toFixed(2)}</strong></span>
                      </div>
                    )}
                  </div>
                  
                  <div className="listings-table-container">
                    <table className="market-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Price</th>
                          <th>Condition</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparables?.sample_listings?.map((listing: any, i: number) => (
                          <tr key={i} onClick={() => window.open(listing.url, '_blank')} className="clickable-row">
                            <td className="listing-title" title={listing.title}>{listing.title}</td>
                            <td className="listing-price font-mono">${listing.price}</td>
                            <td className="listing-condition">{listing.condition}</td>
                            <td className="listing-action">
                              <ExternalLink size={14} className="text-blue-500" />
                            </td>
                          </tr>
                        ))}
                        {(!comparables?.sample_listings || comparables.sample_listings.length === 0) && (
                          <tr>
                            <td colSpan={4} className="no-data">No comparable listings found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ItemDetailModal;
Modal>
  );
};

export default ItemDetailModal;
