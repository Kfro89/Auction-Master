import React, { useState, useEffect, useMemo } from 'react';
import './BiddingView.css';
import { useSortableData } from '../hooks/useSortableData';
import { ArrowUpDown, RefreshCw } from 'lucide-react';

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
      
      const effectiveBid = item.user_bids?.user_proxy_bid || item.current_bid;
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
              {sortedItems.map(item => (
                <tr key={item.id} className={`bidding-row ${getRowClass(item.user_bids?.user_bid_status)}`}>
                  <td><img src={item.image_url || '/placeholder.png'} className="grid-thumb" alt="" /></td>
                  <td className="title-cell" title={item.title}>{item.title}</td>
                  <td className="mono">{item.lot_number}</td>
                  <td className="bid-cell">${item.user_bids?.user_bid_amount?.toFixed(2) || '--'}</td>
                  <td>${item.user_bids?.user_proxy_bid?.toFixed(2) || '--'}</td>
                  <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                  <td>${item.landedCost?.toFixed(2) || '--'}</td>
                  <td>{item.computedRoi !== null ? (item.computedRoi === Infinity ? '∞%' : `${Math.round(item.computedRoi)}%`) : '--'}</td>
                  <td className="timer-text">{new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BiddingView;