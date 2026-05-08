import React, { useState, useEffect, useMemo } from 'react';
import './BiddingView.css';
import { useSortableData } from '../hooks/useSortableData';
import { ArrowUpDown } from 'lucide-react';

interface Item {
  id: number;
  title: string;
  lot_number: string;
  current_bid: number;
  end_time: string;
  status: string;
  url: string;
  image_url: string;
  is_user_bidding: boolean;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
  };
}

const BiddingView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const endingToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return items.filter(item => {
      const endTime = new Date(item.end_time);
      return endTime >= today && endTime < tomorrow;
    });
  }, [items]);

  const itemsWithComputedRoi = useMemo(() => {
    return items.map(item => {
      let roi = null;
      if (item.valuation) {
        if (item.current_bid > 0) {
          roi = ((item.valuation.est_market_value - item.current_bid) / item.current_bid) * 100;
        } else {
          roi = Infinity;
        }
      }
      return { ...item, computedRoi: roi };
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
          <h2>Ending Today</h2>
          <div className="summary-stat">{endingToday.length} Items</div>
        </div>
        <div className="summary-card glass">
          <h2>Total Active Bids</h2>
          <div className="summary-stat">{items.length}</div>
        </div>
      </header>

      <section className="grid-section">
        <div className="glass-panel">
          <table className="dense-grid">
            <thead>
              <tr>
                <th>Img</th>
                <th onClick={() => requestSort('title')} className="sortable">Title {renderSortIcon('title')}</th>
                <th onClick={() => requestSort('lot_number')} className="sortable">Lot {renderSortIcon('lot_number')}</th>
                <th onClick={() => requestSort('current_bid')} className="sortable">Your Bid {renderSortIcon('current_bid')}</th>
                <th onClick={() => requestSort('valuation.max_bid_for_target_roi')} className="sortable">Max Bid {renderSortIcon('valuation.max_bid_for_target_roi')}</th>
                <th onClick={() => requestSort('computedRoi')} className="sortable">ROI {renderSortIcon('computedRoi')}</th>
                <th onClick={() => requestSort('end_time')} className="sortable">Ends {renderSortIcon('end_time')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => (
                <tr key={item.id} className="bidding-row">
                  <td><img src={item.image_url || '/placeholder.png'} className="grid-thumb" alt="" /></td>
                  <td className="title-cell" title={item.title}>{item.title}</td>
                  <td className="mono">{item.lot_number}</td>
                  <td className="bid-cell">${item.current_bid}</td>
                  <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
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