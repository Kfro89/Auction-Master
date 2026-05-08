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

const CountdownTimer: React.FC<{ endTime: string }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ending Now');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${secs}s`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return <span className="timer-text">{timeLeft}</span>;
};

const ResearchView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<{ [key: string]: boolean }>({ whitley: false, roller: false });
  const [valuatingItems, setValuatingItems] = useState<Set<number>>(new Set());

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

  const handleScrape = async (house: 'whitley' | 'roller') => {
    setScraping(prev => ({ ...prev, [house]: true }));
    try {
      const response = await fetch(`/api/admin/scrape/${house}`, { method: 'POST' });
      if (response.ok) {
        await fetchItems();
      } else {
        console.error(`Failed to scrape ${house}`);
      }
    } catch (error) {
      console.error(`Error scraping ${house}:`, error);
    } finally {
      setScraping(prev => ({ ...prev, [house]: false }));
    }
  };

  const handleValuate = async (itemId: number) => {
    setValuatingItems(prev => new Set(prev).add(itemId));
    try {
      const response = await fetch(`/api/admin/valuate/${itemId}`, { method: 'POST' });
      if (response.ok) {
        const newValuation = await response.json();
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, valuation: newValuation } : item
        ));
      } else {
        console.error(`Failed to valuate item ${itemId}`);
      }
    } catch (error) {
      console.error(`Error valuating item ${itemId}:`, error);
    } finally {
      setValuatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

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
      <header className="view-header">
        <div className="header-title">
          <h1>Auction Research</h1>
          <p>Real-time arbitrage opportunities from top auction houses.</p>
        </div>
        <div className="header-actions">
          <button 
            className={`action-btn glass ${scraping.whitley ? 'loading' : ''}`}
            onClick={() => handleScrape('whitley')}
            disabled={scraping.whitley}
          >
            {scraping.whitley ? <span className="spinner"></span> : null}
            Scrape Whitley
          </button>
          <button 
            className={`action-btn glass ${scraping.roller ? 'loading' : ''}`}
            onClick={() => handleScrape('roller')}
            disabled={scraping.roller}
          >
            {scraping.roller ? <span className="spinner"></span> : null}
            Scrape Roller
          </button>
        </div>
      </header>

      <section className="highlights-bar">
        {highRoiItems.map(item => (
          <div key={item.id} className="roi-card glass-card">
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
        <div className="glass-panel">
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
                <th>Time Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const roi = item.valuation ? ((item.valuation.max_bid_for_target_roi - item.current_bid) / item.current_bid * 100) : null;
                const isValuating = valuatingItems.has(item.id);
                const isHighRoi = roi !== null && roi > 25;
                
                return (
                  <tr key={item.id} className={isHighRoi ? 'high-profit' : ''}>
                    <td><img src={item.image_url || '/placeholder.png'} className="grid-thumb" alt="" /></td>
                    <td className="title-cell" title={item.title}>{item.title}</td>
                    <td className="mono">{item.lot_number}</td>
                    <td className="bold">${item.current_bid}</td>
                    <td>{item.valuation ? `$${item.valuation.est_market_value.toFixed(2)}` : '--'}</td>
                    <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                    <td className={isHighRoi ? 'roi-text-high' : ''}>
                      {roi !== null ? `${Math.round(roi)}%` : '--'}
                    </td>
                    <td className="timer-cell">
                      <CountdownTimer endTime={item.end_time} />
                    </td>
                    <td>
                      <button 
                        className={`small-btn ${isValuating ? 'loading' : ''}`}
                        onClick={() => handleValuate(item.id)}
                        disabled={isValuating}
                      >
                        {isValuating ? '...' : 'Valuate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ResearchView;
