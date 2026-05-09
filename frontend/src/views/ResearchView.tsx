import React, { useState, useEffect, useMemo } from 'react';
import './ResearchView.css';
import { useSortableData } from '../hooks/useSortableData';
import Modal from '../components/Modal';
import Tooltip from '../components/Tooltip';
import { CalendarDays, Clock, TrendingUp, ArrowUpDown, ExternalLink, ImageIcon, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Item {
  id: number;
  title: string;
  lot_number: string;
  current_bid: number;
  end_time: string | null;
  status: string;
  url: string;
  image_url: string;
  auction_house_id: number;
  category?: string;
  tags?: string[];
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    computed_at: string;
    search_query?: string;
    sample_size?: number;
  };
  is_watched?: boolean;
}

const CountdownTimer: React.FC<{ endTime: string | null }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('Unknown');
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      
      if (isNaN(end)) {
        setTimeLeft('Unknown');
        return;
      }

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

  return <span className={`timer-text ${timeLeft === 'Ending Now' ? 'ending-now' : ''}`}>{timeLeft}</span>;
};

const ResearchView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<{ [key: string]: boolean }>({ whitley: false, roller: false });
  const [valuatingItems, setValuatingItems] = useState<Set<number>>(new Set());
  const [valuationStatus, setValuationStatus] = useState<{ [itemId: number]: string }>({});
  const [valuationErrors, setValuationErrors] = useState<{ [itemId: number]: string }>({});
  const [targetRoi, setTargetRoi] = useState<number>(30);

  // Modal State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter State
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items/');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
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
    
    const statuses = ["Analyzing item...", "Using AI...", "Checking eBay...", "Calculating ROI..."];
    let statusIdx = 0;
    setValuationStatus(prev => ({ ...prev, [itemId]: statuses[statusIdx] }));
    
    const interval = setInterval(() => {
      statusIdx = (statusIdx + 1) % statuses.length;
      setValuationStatus(prev => ({ ...prev, [itemId]: statuses[statusIdx] }));
    }, 2000);

    try {
      const response = await fetch(`/api/admin/valuate/${itemId}?target_roi=${targetRoi / 100}`, { method: 'POST' });
      if (response.ok) {
        const newValuation = await response.json();
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, valuation: newValuation } : item
        ));
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

  const toggleWatchStatus = async (itemId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/items/${itemId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_watched: !currentStatus })
      });
      
      if (response.ok) {
        // Optimistically update the UI
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, is_watched: !currentStatus } : item
        ));
      }
    } catch (error) {
      console.error('Failed to toggle watch status:', error);
    }
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(now).setHours(23, 59, 59, 999);
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    const result = {
      today: 0,
      tomorrow: 0,
      week: 0
    };

    items.forEach(item => {
      const end = new Date(item.end_time || '').getTime();
      if (end <= todayEnd) result.today++;
      if (end > todayEnd && end <= tomorrowEnd.getTime()) result.tomorrow++;
      if (end <= weekEnd.getTime()) result.week++;
    });

    return result;
  }, [items]);

  const filteredItems = useMemo(() => {
    const now = new Date();
    const todayEnd = new Date(now).setHours(23, 59, 59, 999);
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    return items.filter(item => {
      const end = new Date(item.end_time || '').getTime();
      
      let passesDateFilter = true;
      if (filter === 'today') passesDateFilter = end <= todayEnd;
      else if (filter === 'tomorrow') passesDateFilter = end > todayEnd && end <= tomorrowEnd.getTime();
      else if (filter === 'week') passesDateFilter = end <= weekEnd.getTime();

      let passesSearch = true;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        passesSearch = item.title.toLowerCase().includes(lowerQuery) || 
                       item.lot_number.toLowerCase().includes(lowerQuery);
      }

      let passesTag = true;
      if (tagFilter) {
        const lowerTagFilter = tagFilter.toLowerCase();
        passesTag = item.tags?.some(tag => tag.toLowerCase() === lowerTagFilter) ?? false;
      }

      let passesCategory = true;
      if (categoryFilter) {
        passesCategory = item.category === categoryFilter;
      }

      return passesDateFilter && passesSearch && passesTag && passesCategory;
    });
  }, [items, filter, searchQuery, tagFilter, categoryFilter]);

  // Map items to include a flat ROI percentage for easier sorting
  const itemsWithComputedRoi = useMemo(() => {
    return filteredItems.map(item => {
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
  }, [filteredItems]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [items]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    items.forEach(item => {
      if (item.category) categories.add(item.category);
    });
    return Array.from(categories).sort();
  }, [items]);



  const { items: sortedItems, requestSort, sortConfig } = useSortableData(itemsWithComputedRoi);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="sort-icon asc">↑</span> : <span className="sort-icon desc">↓</span>;
    }
    return <ArrowUpDown size={14} className="sort-icon neutral" />;
  };

  if (loading) return <div className="loading">Loading items...</div>;

  return (
    <div className="research-view">
      <header className="view-header">
        <div className="header-title">
          <h1>Auction Research</h1>
          <p>Real-time arbitrage opportunities from top auction houses.</p>
        </div>
        <div className="header-actions">
          <div className="roi-setting">
            <label>Target ROI: </label>
            <input 
              type="number" 
              className="saas-input"
              value={targetRoi} 
              onChange={(e) => setTargetRoi(Number(e.target.value))}
              min="0"
              max="500"
            />
            %
          </div>
          <Tooltip text="Refresh data from Whitley">
            <button 
              className={`action-btn ${scraping.whitley ? 'loading' : ''}`}
              onClick={() => handleScrape('whitley')}
              disabled={scraping.whitley}
            >
              {scraping.whitley ? <span className="spinner"></span> : <TrendingUp size={16}/>}
              Scrape Whitley
            </button>
          </Tooltip>
          <Tooltip text="Refresh data from Roller">
            <button 
              className={`action-btn ${scraping.roller ? 'loading' : ''}`}
              onClick={() => handleScrape('roller')}
              disabled={scraping.roller}
            >
              {scraping.roller ? <span className="spinner"></span> : <TrendingUp size={16}/>}
              Scrape Roller
            </button>
          </Tooltip>
        </div>
      </header>

      <section className="kpi-bar">
        <div className={`kpi-card ${filter === 'today' ? 'active-filter' : ''}`} onClick={() => setFilter(filter === 'today' ? 'all' : 'today')}>
          <div className="kpi-icon-wrap"><Clock size={24} className="kpi-icon"/></div>
          <div className="kpi-info">
            <span className="kpi-label">Ending Today</span>
            <span className="kpi-value">{kpis.today} <small>Items</small></span>
          </div>
        </div>
        <div className={`kpi-card ${filter === 'tomorrow' ? 'active-filter' : ''}`} onClick={() => setFilter(filter === 'tomorrow' ? 'all' : 'tomorrow')}>
          <div className="kpi-icon-wrap"><CalendarDays size={24} className="kpi-icon"/></div>
          <div className="kpi-info">
            <span className="kpi-label">Ending Tomorrow</span>
            <span className="kpi-value">{kpis.tomorrow} <small>Items</small></span>
          </div>
        </div>
        <div className={`kpi-card ${filter === 'week' ? 'active-filter' : ''}`} onClick={() => setFilter(filter === 'week' ? 'all' : 'week')}>
          <div className="kpi-icon-wrap"><CalendarDays size={24} className="kpi-icon"/></div>
          <div className="kpi-info">
            <span className="kpi-label">Ending This Week</span>
            <span className="kpi-value">{kpis.week} <small>Items</small></span>
          </div>
        </div>
      </section>

      <section className="grid-section">
        <div className="saas-view-header">
          <h1 className="saas-title">Research</h1>
          <div className="saas-filters">
            <input 
              type="text" 
              className="saas-input"
              placeholder="Search title or lot..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="saas-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select 
              className="saas-input"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="">All Tags</option>
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="research-table">
            <thead>
              <tr>
                <th><ImageIcon size={14} /></th>
                <th onClick={() => requestSort('title')} className="sortable">Title {renderSortIcon('title')}</th>
                <th onClick={() => requestSort('lot_number')} className="sortable">Lot {renderSortIcon('lot_number')}</th>
                <th>Category</th>
                <th>Tags</th>
                <th onClick={() => requestSort('current_bid')} className="sortable">Bid {renderSortIcon('current_bid')}</th>
                <th onClick={() => requestSort('valuation.est_market_value')} className="sortable">Est. Market {renderSortIcon('valuation.est_market_value')}</th>
                <th onClick={() => requestSort('valuation.max_bid_for_target_roi')} className="sortable">Max Bid {renderSortIcon('valuation.max_bid_for_target_roi')}</th>
                <th onClick={() => requestSort('computedRoi')} className="sortable">ROI % {renderSortIcon('computedRoi')}</th>
                <th onClick={() => requestSort('end_time')} className="sortable">Time Remaining {renderSortIcon('end_time')}</th>
                <th>Watch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => {
                const isValuating = valuatingItems.has(item.id);
                const isHighRoi = item.computedRoi !== null && item.computedRoi > 25;
                
                return (
                  <tr key={item.id} className={isHighRoi ? 'high-profit' : ''}>
                    <td>
                      <img 
                        src={item.image_url || '/placeholder.png'} 
                        className="grid-thumb clickable-img" 
                        alt="" 
                        onClick={() => setSelectedImage(item.image_url)}
                      />
                    </td>
                    <td className="title-cell clickable-title">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title} <ExternalLink size={12} className="inline-icon"/>
                      </a>
                    </td>
                    <td className="mono">{item.lot_number}</td>
                    <td>
                      {item.category && <span className="category-badge">{item.category}</span>}
                    </td>
                    <td>
                      <div className="tags-container">
                        {item.tags?.map((tag: string) => (
                          <span key={tag} className="tag-badge" onClick={() => setTagFilter(tag)}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="bold">${item.current_bid}</td>
                    <td>
                      {item.valuation ? (
                        <Tooltip text={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', minWidth: '150px', padding: '4px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Query</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'normal', lineHeight: 1.3 }}>"{item.valuation.search_query || 'Unknown'}"</div>
                            <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample Size</div>
                            <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item.valuation.sample_size || 0} comparable items</div>
                          </div>
                        }>
                          <span style={{ cursor: 'help', borderBottom: '1px dashed rgba(0,0,0,0.3)' }}>${item.valuation.est_market_value.toFixed(2)}</span>
                        </Tooltip>
                      ) : '--'}
                    </td>
                    <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                    <td>
                      {item.computedRoi !== null ? (
                        <span className="roi-badge">
                          {item.computedRoi === Infinity ? '∞%' : `${Math.round(item.computedRoi)}%`}
                        </span>
                      ) : '--'}
                    </td>
                    <td className="timer-cell">
                      <CountdownTimer endTime={item.end_time} />
                    </td>
                    <td>
<<<<<<< Updated upstream
                      <button 
                        onClick={() => toggleWatchStatus(item.id, !!item.is_watched)}
                        className="icon-button"
                        title={item.is_watched ? "Remove from Watch List" : "Add to Watch List"}
                      >
                        {item.is_watched ? <Eye size={18} className="text-emerald-500" /> : <EyeOff size={18} className="text-slate-400" />}
                      </button>
                    </td>
                    <td>
                      <Tooltip text="Request LLM valuation">
                        <button 
                          className={`small-btn ${isValuating ? 'loading' : ''}`}
                          onClick={() => handleValuate(item.id)}
                          disabled={isValuating}
                        >
                          {isValuating ? '...' : 'Valuate'}
                        </button>
                      </Tooltip>
=======
                      {isValuating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                          <span style={{ display: 'inline-block', width: '115px' }}>{valuationStatus[item.id] || "Loading..."}</span>
                        </div>
                      ) : valuationErrors[item.id] ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500, maxWidth: '150px', whiteSpace: 'normal', lineHeight: 1.2 }}>
                            {valuationErrors[item.id]}
                          </span>
                          <button 
                            className="small-btn"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', width: 'fit-content' }}
                            onClick={() => {
                              setValuationErrors(prev => {
                                const next = { ...prev };
                                delete next[item.id];
                                return next;
                              });
                              handleValuate(item.id);
                            }}
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <Tooltip text="Request LLM valuation">
                          <button 
                            className="small-btn"
                            onClick={() => handleValuate(item.id)}
                            disabled={isValuating}
                          >
                            Valuate
                          </button>
                        </Tooltip>
                      )}
>>>>>>> Stashed changes
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </section>

      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} size="lg">
        {selectedImage && <img src={selectedImage} alt="Enlarged view" className="lightbox-img" />}
      </Modal>
    </div>
  );
};

export default ResearchView;
