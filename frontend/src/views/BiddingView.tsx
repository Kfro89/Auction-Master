import React, { useState, useEffect, useMemo } from 'react';
import './BiddingView.css';
import { useSortableData } from '../hooks/useSortableData';
import { ArrowUpDown, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';

interface Item {
  id: number;
  title: string;
  lot_number: string;
  current_bid: number;
  end_time: string;
  status: string;
  url: string;
  image_url: string;
  images?: string[];
  is_user_bidding: boolean;
  shipping_cost_est?: number;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
  };
  valuation_detail?: {
    avg_asking_price: number;
    median_asking_price: number;
    price_range_low: number;
    price_range_high: number;
    sample_listings: any[];
  };
  user_bids?: {
    current_bid_amount: number;
    user_bid_amount: number;
    user_proxy_bid: number;
    user_bid_status: string;
  };
}

const getRowClass = (status?: string) => {
  switch(status) {
    case 'winning': return 'bg-green-900/20 border-l-4 border-green-500';
    case 'outbid': return 'bg-red-900/20 border-l-4 border-red-500';
    case 'reserve_not_met': return 'bg-yellow-900/20 border-l-4 border-yellow-500';
    case 'outbid_near': return 'bg-orange-900/20 border-l-4 border-orange-500';
    default: return '';
  }
};

const BiddingView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [targetMargins, setTargetMargins] = useState<Record<number, number>>({});

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };
  
  const handleMarginChange = (id: number, val: number) => {
    setTargetMargins(prev => ({...prev, [id]: val}));
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items/');
      if (response.ok) {
        const data = await response.json();
        setItems(data.filter((item: Item) => item.is_user_bidding));
      }
    } catch (error) {
      console.error('Failed to fetch bidding items:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshActiveBids = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/refresh-active-bids', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        await fetchItems();
      }
    } catch (error) {
      console.error('Failed to refresh active bids:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const { totalCurrentBids, totalUserBids, totalMaxExposure } = useMemo(() => {
    let tCurrent = 0;
    let tUser = 0;
    let tExposure = 0;

    items.forEach(item => {
      if (item.user_bids) {
        tCurrent += item.user_bids.current_bid_amount || 0;
        tUser += item.user_bids.user_bid_amount || 0;
        tExposure += item.user_bids.user_proxy_bid || 0;
      }
    });

    return {
      totalCurrentBids: tCurrent,
      totalUserBids: tUser,
      totalMaxExposure: tExposure
    };
  }, [items]);

  const itemsWithComputedRoi = useMemo(() => {
    return items.map(item => {
      let roi = null;
      let landedCost = 0;
      
      const effectiveBid = item.user_bids?.user_proxy_bid ?? item.current_bid;
      const shippingCost = item.shipping_cost_est || 0;
      const buyerPremium = effectiveBid * 0.15;
      landedCost = effectiveBid + shippingCost + buyerPremium;

      if (item.valuation) {
        if (landedCost > 0) {
          roi = ((item.valuation.est_market_value - landedCost) / landedCost) * 100;
        } else {
          roi = Infinity;
        }
      }
      return { ...item, computedRoi: roi, landedCost };
    });
  }, [items]);

  const { items: sortedItems, requestSort, sortConfig } = useSortableData(itemsWithComputedRoi);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="sort-icon asc">↑</span> : <span className="sort-icon desc">↓</span>;
    }
    return <ArrowUpDown size={14} className="sort-icon neutral" />;
  };

  if (loading) return <div className="loading">Loading active bids...</div>;

  return (
    <div className="bidding-view">
      <header className="summary-section">
        <div className="summary-card glass">
          <h2>Max Exposure</h2>
          <div className="summary-stat">${totalMaxExposure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="summary-card glass">
          <h2>Total Current Bids</h2>
          <div className="summary-stat">${totalCurrentBids.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="summary-card glass">
          <h2>Your Active Bids</h2>
          <div className="summary-stat">${totalUserBids.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <button
          className="refresh-bids-btn"
          onClick={refreshActiveBids}
          disabled={refreshing}
          title="Refresh active bids from all logged-in accounts"
        >
          <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Updating...' : 'Update Bids'}
        </button>
      </header>

      <section className="grid-section">
        <div className="glass-panel">
          <table className="dense-grid">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Img</th>
                <th onClick={() => requestSort('title')} className="sortable">Title {renderSortIcon('title')}</th>
                <th onClick={() => requestSort('lot_number')} className="sortable">Lot {renderSortIcon('lot_number')}</th>
                <th onClick={() => requestSort('user_bids.user_bid_amount')} className="sortable">Your Bid {renderSortIcon('user_bids.user_bid_amount')}</th>
                <th onClick={() => requestSort('user_bids.user_proxy_bid')} className="sortable">Top Proxy {renderSortIcon('user_bids.user_proxy_bid')}</th>
                <th onClick={() => requestSort('valuation.max_bid_for_target_roi')} className="sortable">Max Bid {renderSortIcon('valuation.max_bid_for_target_roi')}</th>
                <th onClick={() => requestSort('landedCost')} className="sortable">Landed Cost {renderSortIcon('landedCost')}</th>
                <th onClick={() => requestSort('computedRoi')} className="sortable">ROI {renderSortIcon('computedRoi')}</th>
                <th onClick={() => requestSort('end_time')} className="sortable">Ends {renderSortIcon('end_time')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => {
                const isExpanded = expandedRows.has(item.id);
                return (
                  <React.Fragment key={item.id}>
                    <tr className={`bidding-row ${getRowClass(item.user_bids?.user_bid_status)}`}>
                      <td onClick={() => toggleRow(item.id)} className="cursor-pointer text-center" style={{ width: '40px' }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td><img src={item.image_url || '/placeholder.png'} className="grid-thumb" alt="" /></td>
                      <td className="title-cell" title={item.title}>{item.title}</td>
                      <td className="mono">{item.lot_number}</td>
                      <td className="bid-cell">{item.user_bids?.user_bid_amount !== undefined ? `$${item.user_bids.user_bid_amount.toFixed(2)}` : '--'}</td>
                      <td>{item.user_bids?.user_proxy_bid !== undefined ? `$${item.user_bids.user_proxy_bid.toFixed(2)}` : '--'}</td>
                      <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                      <td>{item.landedCost !== undefined ? `$${item.landedCost.toFixed(2)}` : '--'}</td>
                      <td>{item.computedRoi !== null ? (item.computedRoi === Infinity ? '∞%' : `${Math.round(item.computedRoi)}%`) : '--'}</td>
                      <td className="timer-text">{new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="expanded-row-container bg-black/40">
                        <td colSpan={10} className="p-4">
                          <div className="flex gap-6">
                            {item.valuation_detail && (
                              <div className="margin-calculator bg-white/5 p-4 rounded-lg border border-white/10 w-64 flex-shrink-0">
                                <h3 className="font-bold mb-3 text-white">Margin Calculator</h3>
                                <div className="flex items-center justify-between mb-3">
                                  <label className="text-sm text-gray-300">Target Margin (%):</label>
                                  <input 
                                    type="number" 
                                    value={targetMargins[item.id] ?? 20}
                                    onChange={(e) => handleMarginChange(item.id, parseFloat(e.target.value) || 0)}
                                    className="bg-black/50 border border-white/20 rounded px-2 py-1 w-20 text-right text-white"
                                  />
                                </div>
                                {(() => {
                                  const margin = (targetMargins[item.id] ?? 20) / 100;
                                  const avgPrice = item.valuation_detail?.avg_asking_price || 0;
                                  const shipping = item.shipping_cost_est || 0;
                                  const maxBid = (avgPrice * (1 - 0.15) * (1 - margin)) - shipping;
                                  
                                  const listingsCount = item.valuation_detail?.sample_listings?.length || 0;
                                  let saturationText = 'Moderate Volume';
                                  let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/50';
                                  if (listingsCount > 15) {
                                    saturationText = 'High Volume / Saturated';
                                    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/50';
                                  } else if (listingsCount < 5) {
                                    saturationText = 'Scarce / Low Volume';
                                    badgeColor = 'bg-green-500/20 text-green-300 border-green-500/50';
                                  }

                                  return (
                                    <>
                                      <div className="mb-3 pt-3 border-t border-white/10">
                                        <div className="text-sm text-gray-300 mb-1">Max Recommended Bid</div>
                                        <div className="text-xl text-green-400 font-mono">${Math.max(0, maxBid).toFixed(2)}</div>
                                      </div>
                                      <div className={`inline-block px-2 py-1 text-xs rounded border ${badgeColor}`}>
                                        {saturationText} ({listingsCount})
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}

                            <div className="valuation-table flex-1">
                              <h3 className="font-bold mb-3 text-white">Sample Listings (Valuation)</h3>
                              {item.valuation_detail?.sample_listings && item.valuation_detail.sample_listings.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto rounded border border-white/10">
                                  <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-white/10 sticky top-0">
                                      <tr>
                                        <th className="p-2 border-b border-white/10">Title</th>
                                        <th className="p-2 border-b border-white/10">Price</th>
                                        <th className="p-2 border-b border-white/10">Condition</th>
                                        <th className="p-2 border-b border-white/10 text-center">Link</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.valuation_detail.sample_listings.map((listing: any, i: number) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                          <td className="p-2 truncate max-w-[300px]" title={listing.title}>{listing.title}</td>
                                          <td className="p-2 font-mono text-green-300">${listing.price}</td>
                                          <td className="p-2 text-gray-300">{listing.condition}</td>
                                          <td className="p-2 text-center">
                                            <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                                              View
                                            </a>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-gray-400 italic p-4 bg-white/5 rounded border border-white/10">
                                  No sample listings available.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BiddingView;