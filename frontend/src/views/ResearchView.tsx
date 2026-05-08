import React, { useState, useEffect, useMemo } from 'react';
import './ResearchView.css';

interface Item {
  id: number;
  title: string;
  lot_number: string;
  current_bid: number;
  end_time: string;
  status: string;
  url: string;
  image_url: string;
  auction_house_id: number;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    computed_at: string;
  };
}

const ResearchView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items/');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  const highRoiItems = useMemo(() => {
    return items
      .filter(item => item.valuation && item.valuation.max_bid_for_target_roi > item.current_bid)
      .sort((a, b) => {
        const roiA = ((a.valuation?.max_bid_for_target_roi || 0) - a.current_bid) / a.current_bid;
        const roiB = ((b.valuation?.max_bid_for_target_roi || 0) - b.current_bid) / b.current_bid;
        return roiB - roiA;
      })
      .slice(0, 5);
  }, [items]);

  if (loading) return <div className="loading">Loading items...</div>;

  return (
    <div className="research-view">
      <section className="highlights-bar">
        {highRoiItems.map(item => (
          <div key={item.id} className="roi-card">
            <img src={item.image_url || '/placeholder.png'} alt="" className="roi-card-img" />
            <div className="roi-card-info">
              <span className="roi-badge">ROI: {Math.round(((item.valuation?.max_bid_for_target_roi || 0) - item.current_bid) / item.current_bid * 100)}%</span>
              <h3>{item.title}</h3>
              <p>Bid: ${item.current_bid} | Max: ${item.valuation?.max_bid_for_target_roi.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid-section">
        <table className="dense-grid">
          <thead>
            <tr>
              <th>Img</th>
              <th>Title</th>
              <th>Lot</th>
              <th>Bid</th>
              <th>Est. Market</th>
              <th>Max Bid</th>
              <th>ROI %</th>
              <th>Ending Soonest</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const roi = item.valuation ? ((item.valuation.max_bid_for_target_roi - item.current_bid) / item.current_bid * 100) : null;
              return (
                <tr key={item.id} className={roi && roi > 25 ? 'high-profit' : ''}>
                  <td><img src={item.image_url || '/placeholder.png'} width="30" height="30" alt="" /></td>
                  <td className="title-cell" title={item.title}>{item.title}</td>
                  <td>{item.lot_number}</td>
                  <td>${item.current_bid}</td>
                  <td>{item.valuation ? `$${item.valuation.est_market_value.toFixed(2)}` : '--'}</td>
                  <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                  <td>{roi !== null ? `${Math.round(roi)}%` : '--'}</td>
                  <td className="timer-cell">{new Date(item.end_time).toLocaleString()}</td>
                  <td>
                    <button className="small-btn">Valuate</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ResearchView;
