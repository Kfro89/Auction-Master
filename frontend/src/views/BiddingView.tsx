import React, { useState, useEffect, useMemo } from 'react';
import './BiddingView.css';

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
      const data = await response.json();
      setItems(data.filter((item: Item) => item.is_user_bidding));
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
        <table className="dense-grid">
          <thead>
            <tr>
              <th>Img</th>
              <th>Title</th>
              <th>Lot</th>
              <th>Your Bid</th>
              <th>Max Bid</th>
              <th>ROI</th>
              <th>Ends</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="bidding-row">
                <td><img src={item.image_url || '/placeholder.png'} width="30" height="30" alt="" /></td>
                <td className="title-cell" title={item.title}>{item.title}</td>
                <td>{item.lot_number}</td>
                <td className="bid-cell">${item.current_bid}</td>
                <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                <td>{item.valuation ? `${Math.round(item.valuation.target_roi_pct * 100)}%` : '--'}</td>
                <td>{new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default BiddingView;
