import React, { useState, useEffect } from 'react';
import './WatchListView.css';
import { X, ExternalLink } from 'lucide-react';

interface WatchedItem {
  id: number;
  title: string;
  auction_house_id: number;
  current_bid: number;
  end_time: string | null;
  image_url: string;
  url: string;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
  };
}

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
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="watchlist-container">
      <h2 className="watchlist-header">Watch List</h2>
      <div className="watchlist-grid">
        {items.length === 0 ? (
          <p className="empty-state">Your watch list is empty.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="watch-card">
              <button 
                className="remove-btn" 
                onClick={() => removeFromWatchlist(item.id)}
                title="Remove from Watch List"
              >
                <X size={16} />
              </button>
              
              <div className="watch-card-image-container">
                 {item.image_url ? (
                    <img src={item.image_url.replace('/small/', '/large/').replace('/thumb/', '/large/')} alt={item.title} className="watch-card-image" />
                 ) : (
                    <div className="watch-card-no-image">No Image</div>
                 )}
                 <div className="watch-timer-overlay">
                    <CountdownTimer endTime={item.end_time} />
                 </div>
              </div>
              
              <div className="watch-card-content">
                <h3 className="watch-title" title={item.title}>{item.title}</h3>
                
                <div className="watch-details">
                  <div className="watch-metric">
                    <span className="metric-label">Current Bid</span>
                    <span className="metric-value font-semibold">${item.current_bid?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  {item.valuation && (
                    <>
                      <div className="watch-metric">
                        <span className="metric-label">Est. Value</span>
                        <span className="metric-value text-emerald-600">${item.valuation.est_market_value?.toFixed(2)}</span>
                      </div>
                      <div className="watch-metric">
                        <span className="metric-label">Max Bid</span>
                        <span className="metric-value text-blue-600">${item.valuation.max_bid_for_target_roi?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="watch-actions">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="external-link">
                    View Auction <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WatchListView;