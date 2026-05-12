import React, { useState, useEffect } from 'react';
import './WatchListView.css';
import { X, ExternalLink, CalendarDays, TrendingUp, ArrowUpDown, Gavel, Loader2, LayoutGrid } from 'lucide-react';
import Modal from '../components/Modal';

interface WatchedItem {
  id: number;
  title: string;
  lot_number?: string;
  auction_house_key: string;
  current_bid: number;
  end_time: string | null;
  image_url: string;
  url: string;
  category?: string;
  tags?: any;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    search_query?: string;
    sample_size?: number;
  };
}

const normalizeTags = (tags: any): { key: string | null, value: string, fullTag: string }[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(t => typeof t === 'string').map(t => ({ key: null, value: t, fullTag: t }));
  if (typeof tags === 'object') {
    const result: { key: string, value: string, fullTag: string }[] = [];
    for (const [key, val] of Object.entries(tags)) {
      if (Array.isArray(val)) {
        val.forEach(v => result.push({ key, value: String(v), fullTag: `${key}: ${v}` }));
      } else if (val !== null && val !== undefined && String(val).trim() !== '') {
        result.push({ key, value: String(val), fullTag: `${key}: ${val}` });
      }
    }
    return result;
  }
  return [];
};

const CountdownTimer: React.FC<{ endTime: string | null }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else if (mins > 0) setTimeLeft(`${mins}m ${secs}s`);
      else setTimeLeft(`${secs}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return <span className={`watch-timer ${timeLeft === 'Ended' ? 'ended' : ''}`}>{timeLeft}</span>;
};

const WatchListView: React.FC = () => {
  const targetRoi = parseInt(localStorage.getItem('targetRoi') || '30', 10);
  
  const getRoiValue = (valuation: any, current_bid: number) => {
    if (!valuation) return null;
    if (current_bid > 0) return ((valuation.est_market_value - current_bid) / current_bid) * 100;
    return Infinity;
  };
  
  const getRoiClass = (roi: number | null) => {
    if (roi === null) return '';
    if (roi >= targetRoi) return 'roi-good';
    if (roi >= targetRoi - 10) return 'roi-warning';
    return 'roi-neutral';
  };
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WatchedItem | null>(null);

  const [valuatingItems, setValuatingItems] = useState<Set<number>>(new Set());
  const [valuationStatus, setValuationStatus] = useState<{ [itemId: number]: string }>({});
  const [valuationErrors, setValuationErrors] = useState<{ [itemId: number]: string }>({});

  const handleValuate = async (itemId: number) => {
    setValuatingItems(prev => new Set(prev).add(itemId));
    
    const statuses = ["Analyzing item...", "Using AI...", "Checking eBay...", "Calculating ROI..."];
    let statusIdx = 0;
    setValuationStatus(prev => ({ ...prev, [itemId]: statuses[statusIdx] }));
    
    const interval = setInterval(() => {
      statusIdx = (statusIdx + 1) % statuses.length;
      setValuationStatus(prev => ({ ...prev, [itemId]: statuses[statusIdx] }));
    }, 2000);

    try {
      const targetRoi = parseInt(localStorage.getItem('targetRoi') || '30', 10);
      const response = await fetch(`/api/admin/valuate/${itemId}?target_roi=${targetRoi / 100}`, { method: 'POST' });
      if (response.ok) {
        const newValuation = await response.json();
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, valuation: newValuation } : item
        ));
        setSelectedItem(prev => prev && prev.id === itemId ? { ...prev, valuation: newValuation } : prev);
        setValuationErrors(prev => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      } else {
        const errData = await response.json().catch(() => ({ detail: "Valuation failed" }));
        setValuationErrors(prev => ({ ...prev, [itemId]: errData.detail || "Valuation failed" }));
        console.error(`Failed to valuate item ${itemId}`);
      }
    } catch (error) {
      setValuationErrors(prev => ({ ...prev, [itemId]: "Network error" }));
      console.error(`Error valuating item ${itemId}:`, error);
    } finally {
      clearInterval(interval);
      setValuatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      setValuationStatus(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  };

  const getHighResImageUrl = (url: string) => {
    if (!url) return '';
    return url.replace(/\/(?:small|thumb)\//i, '/large/').replace(/[_-](?:small|thumb)(\.[a-zA-Z0-9]+)$/i, '_large$1');
  };

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/items/watchlist');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const removeFromWatchlist = async (itemId: number) => {
    try {
      const response = await fetch(`/api/items/${itemId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_watched: false })
      });
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (loading) return <div className="p-8">Loading Watch List...</div>;

  const totalItems = items.length;
  const totalBidValue = items.reduce((sum, item) => sum + (item.current_bid || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.valuation?.est_market_value || 0), 0);
  const aggregateRoi = totalBidValue > 0 ? ((totalValue - totalBidValue) / totalBidValue) * 100 : (totalValue > 0 ? Infinity : 0);

  return (
    <div className="watchlist-container">
      <h2 className="watchlist-header">Watch List</h2>

      <div className="watchlist-kpi-container">
        <div className="watchlist-kpi-card">
          <div className="watchlist-kpi-label">Items Watching</div>
          <div className="watchlist-kpi-value">{totalItems}</div>
        </div>
        <div className="watchlist-kpi-card bid">
          <div className="watchlist-kpi-label">Total Bid Value</div>
          <div className="watchlist-kpi-value">${totalBidValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div className="watchlist-kpi-card value">
          <div className="watchlist-kpi-label">Total Value</div>
          <div className="watchlist-kpi-value">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div className="watchlist-kpi-card roi">
          <div className="watchlist-kpi-label">Aggregate ROI</div>
          <div className="watchlist-kpi-value">
            {aggregateRoi === Infinity ? '∞%' : `${Math.round(aggregateRoi)}%`}
          </div>
        </div>
      </div>

      <div className="watchlist-grid">
        {items.length === 0 ? (
          <p className="empty-state">Your watch list is empty.</p>
        ) : (
          items.map(item => {
            const roi = getRoiValue(item.valuation, item.current_bid);
            return (
              <div key={item.id} className="watch-card" onClick={() => setSelectedItem(item)}>
                <button 
                  className="remove-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(item.id);
                  }}
                  title="Remove from Watch List"
                >
                  <X size={16} />
                </button>
                
                <div className="watch-card-image-container">
                   <div className="watch-card-title-overlay">
                      <h3 className="watch-title" title={item.title}>{item.title}</h3>
                   </div>
                   {item.image_url ? (
                      <img src={getHighResImageUrl(item.image_url)} alt={item.title} className="watch-card-image" />
                   ) : (
                      <div className="watch-card-no-image">No Image</div>
                   )}
                   <div className="watch-timer-overlay">
                      <CountdownTimer endTime={item.end_time} />
                   </div>
                </div>
                
                <div className="watch-card-content">
                  <div className="watch-details">
                    <div className="watch-metric">
                      <span className="metric-label">Bid</span>
                      <span className="metric-value font-semibold">${item.current_bid?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    {item.valuation && (
                      <>
                        <div className="watch-metric">
                          <span className="metric-label">Value</span>
                          <span className="metric-value text-emerald-600 font-bold">${item.valuation.est_market_value?.toFixed(2)}</span>
                        </div>
                        <div className="watch-metric">
                          <span className="metric-label">ROI</span>
                          <span className={`roi-badge ${getRoiClass(roi)}`} style={{ padding: '2px 4px', fontSize: '0.75rem' }}>
                            {roi === Infinity ? '∞%' : `${Math.round(roi!)}%`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="watch-actions">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="glass-blue-btn-small" onClick={e => e.stopPropagation()} style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
                      View Auction <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} size="xl">
        {selectedItem && (
          <div className="item-detail-layout modern">
            <div className="item-detail-image-panel-bg">
              {selectedItem.image_url ? (
                <img
                  src={getHighResImageUrl(selectedItem.image_url)}
                  alt={selectedItem.title}
                  className="item-detail-bg-image"
                />
              ) : (
                <div className="item-detail-no-image-bg">No Image Available</div>
              )}
            </div>

            <div className="item-detail-overlay-content">
              <div className="item-detail-content-columns">
                {/* Left Column: Metadata Pills, Research, Tags */}
                <div className="item-detail-col left">
                  <div className="item-detail-subtitle vertical">
                    <span className="item-pill vertical time-remaining">
                      <CalendarDays size={14}/> <CountdownTimer endTime={selectedItem.end_time} />
                    </span>
                    <span className="item-pill vertical lot-number">Lot #{selectedItem.lot_number || 'N/A'}</span>
                    {selectedItem.category && (
                      <span className="item-pill vertical category" title={selectedItem.category}>
                        <LayoutGrid size={14}/> <span className="truncate">{selectedItem.category}</span>
                      </span>
                    )}
                  </div>

                  {selectedItem.valuation && (
                    <div className="detail-section">
                      <h3>Research Info</h3>
                      <div className="detail-grid">
                        <div className="detail-item-custom">
                          <div className="research-query-header">Search Query</div>
                          <div className="research-query-term">{selectedItem.valuation.search_query}</div>
                        </div>
                        <div className="detail-item">
                          <span className="label">Sample Size</span>
                          <span className="value">{selectedItem.valuation.sample_size || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="item-detail-spacer"></div>

                  {selectedItem.tags && normalizeTags(selectedItem.tags).length > 0 && (
                    <div className="detail-section no-header">
                      <div className="tags-pill-container">
                        {normalizeTags(selectedItem.tags).map((tag, idx) => (
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
                    <h2>{selectedItem.title}</h2>
                  </div>
                  {selectedItem.image_url ? (
                    <img
                      src={getHighResImageUrl(selectedItem.image_url)}
                      alt={selectedItem.title}
                      className="item-detail-center-image"
                    />
                  ) : (
                    <div className="item-detail-no-image-bg">No Image Available</div>
                  )}
                </div>

                {/* Right Column: ROI, Stats, and Actions */}
                <div className="item-detail-col right">
                  <div className="item-detail-kpi-tile bid">
                    <div className="kpi-label">Current Bid</div>
                    <div className="kpi-value">${selectedItem.current_bid?.toFixed(2) || '0.00'}</div>
                  </div>

                  <div className="detail-section">
                    <h3>Bidding & Value</h3>
                    <div className="detail-grid">
                      {selectedItem.valuation && (
                        <>
                          <div className="detail-item">
                            <span className="label">Est. Value</span>
                            <span className="value text-emerald-500">${selectedItem.valuation.est_market_value?.toFixed(2)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Max Bid</span>
                            <span className="value text-blue-500">${selectedItem.valuation.max_bid_for_target_roi?.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="detail-section no-header">
                    <div className="action-column">
                      {valuatingItems.has(selectedItem.id) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>{valuationStatus[selectedItem.id] || "Loading..."}</span>
                        </div>
                      ) : (
                        <button 
                          className="glass-blue-btn-small"
                          style={{ marginBottom: '12px', width: '100%', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                          onClick={() => handleValuate(selectedItem.id)}
                        >
                          Re-Valuate
                        </button>
                      )}
                      
                      <div className="action-row">
                        <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="glass-blue-btn-small" style={{ width: '100%', justifyContent: 'center' }}>
                          View Full Auction <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {selectedItem.valuation && (
                    <div className="item-detail-kpi-tile roi">
                      <div className="kpi-label">ROI</div>
                      <div className={`kpi-value ${getRoiValue(selectedItem.valuation, selectedItem.current_bid) > 20 ? 'high' : ''}`}>
                        {getRoiValue(selectedItem.valuation, selectedItem.current_bid) === Infinity ? '∞%' : `${Math.round(getRoiValue(selectedItem.valuation, selectedItem.current_bid)!)}%`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WatchListView;