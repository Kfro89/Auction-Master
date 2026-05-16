import React, { useState, useEffect, useMemo } from 'react';
import './ResearchView.css';
import './WatchListView.css';
import { ViewContainer, ViewHeader, KpiBar, KpiCard, FilterBar } from '../components/layout/ViewLayout';
import { useSortableData } from '../hooks/useSortableData';
import ItemDetailModal from '../components/ItemDetailModal';
import Tooltip from '../components/Tooltip';
import { 
  Eye, 
  Gavel, 
  DollarSign, 
  TrendingUp, 
  LayoutGrid, 
  List, 
  Target, 
  ExternalLink, 
  ImageIcon, 
  ArrowUpDown, 
  Loader2, 
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save
  } from 'lucide-react';import { CountdownTimer } from '../components/CountdownTimer';
import { normalizeTags, getHighResImageUrl, formatAuctionDate } from '../utils/formatters';

interface Item {
  id: number;
  title: string;
  lot_number: string;
  current_bid: number;
  end_time: string | null;
  status: string;
  url: string;
  image_url: string;
  auction_house_key: string;
  category?: string;
  tags?: any;
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

export interface ColumnConfig {
  width: number;
  align: 'left' | 'center' | 'right';
}

const DEFAULT_COLUMNS: Record<string, ColumnConfig> = {
  image: { width: 50, align: 'center' },
  title: { width: 345, align: 'left' },
  lot: { width: 70, align: 'left' },
  source: { width: 100, align: 'center' },
  category: { width: 140, align: 'left' },
  tags: { width: 140, align: 'left' },
  bid: { width: 115, align: 'center' },
  estMarket: { width: 115, align: 'center' },
  maxBid: { width: 115, align: 'center' },
  roi: { width: 115, align: 'center' },
  time: { width: 140, align: 'center' },
  actions: { width: 110, align: 'center' }
};

const AUCTION_HOUSE_MAP: Record<string, { name: string, short: string, className: string }> = {
  'rol': { name: 'Roller', short: 'Roller', className: 'source-roller' },
  'rmeb': { name: 'Whitley', short: 'Whitley', className: 'source-whitley' },
  'public_surplus': { name: 'Public Surplus', short: 'PS', className: 'source-ps' },
  'dickensheet': { name: 'Dickensheet', short: 'Dickensheet', className: 'source-dickensheet' },
};

const WatchListView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [valuatingItems, setValuatingItems] = useState<Set<number>>(new Set());
  const [valuationStatus, setValuationStatus] = useState<{ [itemId: number]: string }>({});
  const [valuationErrors, setValuationErrors] = useState<{ [itemId: number]: string }>({});
  const [targetRoi, setTargetRoi] = useState<number>(() => parseInt(localStorage.getItem('targetRoi') || '30', 10));
  const [targetMargins, setTargetMargins] = useState<Record<number, string | number>>({});
  const [comparables, setComparables] = useState<Record<number, any>>({});
  const [loadingComparables, setLoadingComparables] = useState<Record<number, boolean>>({});
  const [timezone, setTimezone] = useState<string>(localStorage.getItem('user_timezone') || 'America/Denver');

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.user_timezone) {
          setTimezone(data.user_timezone);
          localStorage.setItem('user_timezone', data.user_timezone);
        }
      }
    } catch (e) {
      console.error('Failed to fetch settings for timezone:', e);
    }
  };

  useEffect(() => {
    localStorage.setItem('targetRoi', targetRoi.toString());
  }, [targetRoi]);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => 
    (localStorage.getItem('watchlist_view_mode') as 'table' | 'grid') || 'grid'
  );
  
  useEffect(() => {
    localStorage.setItem('watchlist_view_mode', viewMode);
  }, [viewMode]);

  // Column Configuration State
  const [columnConfig, setColumnConfig] = useState<Record<string, ColumnConfig>>(() => {
    const saved = localStorage.getItem('watchlistTableConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_COLUMNS, ...parsed };
      } catch (e) { }
    }
    return DEFAULT_COLUMNS;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizerRef = React.useRef<{ isResizing: boolean, colId: string | null, startX: number, startWidth: number }>({
    isResizing: false,
    colId: null,
    startX: 0,
    startWidth: 0
  });

  const handleHeaderMouseDown = () => {
    if (isEditMode) return;
    longPressTimer.current = setTimeout(() => {
      setIsEditMode(true);
    }, 600);
  };

  const handleHeaderMouseUpOrLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const saveColumnConfig = () => {
    localStorage.setItem('watchlistTableConfig', JSON.stringify(columnConfig));
    setIsEditMode(false);
  };

  const onResizeStart = (e: React.MouseEvent, colId: string) => {
    e.stopPropagation();
    resizerRef.current = {
      isResizing: true,
      colId,
      startX: e.clientX,
      startWidth: columnConfig[colId].width
    };
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
  };

  const onResizeMove = React.useCallback((e: MouseEvent) => {
    if (!resizerRef.current.isResizing || !resizerRef.current.colId) return;
    const diff = e.clientX - resizerRef.current.startX;
    const newWidth = Math.max(40, resizerRef.current.startWidth + diff);
    setColumnConfig(prev => ({
      ...prev,
      [resizerRef.current.colId!]: { ...prev[resizerRef.current.colId!], width: newWidth }
    }));
  }, []);

  const onResizeEnd = React.useCallback(() => {
    resizerRef.current.isResizing = false;
    resizerRef.current.colId = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
  }, [onResizeMove]);

  const updateAlign = (e: React.MouseEvent, colId: string, align: 'left' | 'center' | 'right') => {
    e.stopPropagation();
    setColumnConfig(prev => ({
      ...prev,
      [colId]: { ...prev[colId], align }
    }));
  };

  const getColStyle = (colId: string): React.CSSProperties => {
    const col = columnConfig[colId] || DEFAULT_COLUMNS[colId] || { width: 100, align: 'left' };
    return {
      width: `${col.width}px`,
      minWidth: `${col.width}px`,
      maxWidth: `${col.width}px`,
      textAlign: col.align
    };
  };

  const renderHeaderCell = (colId: string, content: React.ReactNode, sortKey?: string, className: string = '') => (
    <th 
      onClick={() => sortKey && !isEditMode ? requestSort(sortKey) : undefined}
      className={`${className} ${sortKey && !isEditMode ? 'sortable' : ''}`}
      style={{ ...getColStyle(colId) }}
    >
      <div className={`header-content ${(columnConfig[colId] || DEFAULT_COLUMNS[colId] || { align: 'left' }).align}`}>
        {content} {sortKey && renderSortIcon(sortKey)}
        
        {isEditMode && (
          <div className="edit-mode-controls">
             <div className="align-buttons" onClick={e => e.stopPropagation()}>
                <button onClick={(e) => updateAlign(e, colId, 'left')}><AlignLeft size={12}/></button>
                <button onClick={(e) => updateAlign(e, colId, 'center')}><AlignCenter size={12}/></button>
                <button onClick={(e) => updateAlign(e, colId, 'right')}><AlignRight size={12}/></button>
             </div>
             <div className="resizer-handle" onMouseDown={(e) => onResizeStart(e, colId)} />
          </div>
        )}
      </div>
    </th>
  );

  // Filter State
  const [parentCategoryFilter, setParentCategoryFilter] = useState<string>('');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('');
  const [auctionHouseFilter, setAuctionHouseFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
    fetchSettings();
  }, []);

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
        // Refresh comparables after valuation
        fetchComparables(itemId, true);
      } else {
        const errData = await response.json().catch(() => ({ detail: "Valuation failed" }));
        setValuationErrors(prev => ({ ...prev, [itemId]: errData.detail || "Valuation failed" }));
      }
    } catch (error) {
      setValuationErrors(prev => ({ ...prev, [itemId]: "Network error" }));
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

  const fetchComparables = async (id: number, force = false) => {
    if (!force && (comparables[id] || loadingComparables[id])) return;
    setLoadingComparables(prev => ({...prev, [id]: true}));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${id}/comparables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComparables(prev => ({...prev, [id]: data}));
      }
    } catch (e) {
      console.error('Failed to fetch comparables:', e);
    } finally {
      setLoadingComparables(prev => ({...prev, [id]: false}));
    }
  };

  const openItemDetail = (item: Item) => {
    setSelectedItem(item);
    fetchComparables(item.id);
  };

  const handleMarginChange = (id: number, val: string | number) => {
    setTargetMargins(prev => ({...prev, [id]: val}));
  };

  const persistMarginChange = async (id: number) => {
    const rawVal = targetMargins[id] ?? 20;
    const marginPct = (typeof rawVal === 'number' ? rawVal : parseFloat(rawVal as string)) / 100;
    if (isNaN(marginPct)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${id}/valuation/margin`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target_roi_pct: marginPct })
      });
      if (response.ok) {
        const updatedItem = await response.json();
        setItems(prev => prev.map(it => it.id === id ? { ...it, valuation: updatedItem.valuation } : it));
        if (selectedItem?.id === id) {
          setSelectedItem(prev => prev ? { ...prev, valuation: updatedItem.valuation } : null);
        }
      }
    } catch (e) {
      console.error('Failed to persist margin change:', e);
    }
  };

  const removeFromWatchlist = async (itemId: number) => {
    try {
      const response = await fetch(`/api/items/${itemId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_watched: false })
      });
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        if (selectedItem?.id === itemId) setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      let passesSearch = true;
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const ahName = AUCTION_HOUSE_MAP[item.auction_house_key]?.name.toLowerCase() || '';
        passesSearch = item.title.toLowerCase().includes(lowerQuery) || 
                       item.lot_number.toLowerCase().includes(lowerQuery) ||
                       ahName.includes(lowerQuery) ||
                       normalizeTags(item.tags).some(tag => 
                         tag.fullTag.toLowerCase().includes(lowerQuery) || 
                         tag.value.toLowerCase().includes(lowerQuery)
                       );
      }

      let passesCategory = true;
      if (parentCategoryFilter) {
        if (subCategoryFilter) {
          passesCategory = item.category === `${parentCategoryFilter} > ${subCategoryFilter}`;
        } else {
          passesCategory = item.category?.startsWith(parentCategoryFilter) || false;
        }
      }
      
      let passesAuctionHouse = true;
      if (auctionHouseFilter) {
        passesAuctionHouse = item.auction_house_key === auctionHouseFilter;
      }

      return passesSearch && passesCategory && passesAuctionHouse;
    });
  }, [items, searchQuery, parentCategoryFilter, subCategoryFilter, auctionHouseFilter]);

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

  const { items: sortedItems, requestSort, sortConfig } = useSortableData(itemsWithComputedRoi);

  const { parentCategories, subCategoriesMap } = useMemo(() => {
    const parents = new Set<string>();
    const subsMap = new Map<string, Set<string>>();

    items.forEach(item => {
      if (item.category) {
        const parts = item.category.split(' > ');
        const parent = parts[0];
        const sub = parts.length > 1 ? parts[1] : null;

        parents.add(parent);
        if (sub) {
          if (!subsMap.has(parent)) {
            subsMap.set(parent, new Set<string>());
          }
          subsMap.get(parent)!.add(sub);
        }
      }
    });

    const parentArray = Array.from(parents).sort();
    const subsObject: Record<string, string[]> = {};
    for (const [parent, subs] of subsMap.entries()) {
      subsObject[parent] = Array.from(subs).sort();
    }

    return { parentCategories: parentArray, subCategoriesMap: subsObject };
  }, [items]);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <span className="sort-icon asc">↑</span> : <span className="sort-icon desc">↓</span>;
    }
    return <ArrowUpDown size={14} className="sort-icon neutral" />;
  };

  // KPI Calculations
  const totalItemsCount = items.length;
  const totalBidValue = items.reduce((sum, item) => sum + (item.current_bid || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.valuation?.est_market_value || 0), 0);
  const aggregateRoi = totalBidValue > 0 ? ((totalValue - totalBidValue) / totalBidValue) * 100 : (totalValue > 0 ? Infinity : 0);

  if (loading) return <div className="loading">Loading items...</div>;

  return (
    <ViewContainer className="research-view">
      <ViewHeader 
        title="Watch List" 
        subtitle="Track items you are interested in or bidding on."
      />

      <KpiBar>
        <KpiCard 
          icon={<Eye size={24} />} 
          label="Items Watching" 
          value={totalItemsCount} 
          secondaryValue="Items"
        />
        <KpiCard 
          icon={<Gavel size={24} />} 
          label="Total Bid Value" 
          value={`$${totalBidValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
        />
        <KpiCard 
          icon={<DollarSign size={24} />} 
          label="Total Value" 
          value={`$${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
        />
        <KpiCard 
          icon={<TrendingUp size={24} />} 
          label="Aggregate ROI" 
          value={aggregateRoi === Infinity ? '∞%' : `${Math.round(aggregateRoi)}%`} 
        />
      </KpiBar>

      <section className="grid-section">
        <FilterBar title="Watched Items">
          <button 
            className="action-btn"
            onClick={() => setViewMode(prev => prev === 'table' ? 'grid' : 'table')}
            title="Change View"
            style={{ padding: '0.5rem 0.75rem' }}
          >
            {viewMode === 'table' ? <LayoutGrid size={16} /> : <List size={16} />}
            <span>Change View</span>
          </button>
          <div className="roi-setting">
            <Target size={16} />
            <label>Target ROI:</label>
            <input 
              type="number" 
              className="roi-input"
              value={targetRoi} 
              onChange={(e) => setTargetRoi(Number(e.target.value))}
              min="0"
              max="500"
            />
            <span className="roi-percent">%</span>
          </div>
          <select 
            className="saas-input"
            value={auctionHouseFilter}
            onChange={(e) => setAuctionHouseFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            {Object.entries(AUCTION_HOUSE_MAP).map(([id, ah]) => (
              <option key={id} value={id}>{ah.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            className="saas-input search-input"
            placeholder="Search title, lot, or tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="saas-input"
            value={parentCategoryFilter}
            onChange={(e) => {
              setParentCategoryFilter(e.target.value);
              setSubCategoryFilter('');
            }}
          >
            <option value="">All Categories</option>
            {parentCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="saas-input"
            value={subCategoryFilter}
            onChange={(e) => setSubCategoryFilter(e.target.value)}
            disabled={!parentCategoryFilter || !subCategoriesMap[parentCategoryFilter]}
          >
            <option value="">All Sub-Categories</option>
            {parentCategoryFilter && subCategoriesMap[parentCategoryFilter]?.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </FilterBar>

        {viewMode === 'table' ? (
          <table className="research-table">
            <thead 
              className={isEditMode ? 'edit-mode' : ''} 
              onMouseDown={handleHeaderMouseDown} 
              onMouseUp={handleHeaderMouseUpOrLeave} 
              onMouseLeave={handleHeaderMouseUpOrLeave}
            >
              <tr>
                {renderHeaderCell('image', <ImageIcon size={14} />)}
                {renderHeaderCell('title', 'Title', 'title')}
                {renderHeaderCell('lot', 'Lot', 'lot_number')}
                {renderHeaderCell('source', 'Source', 'auction_house_key')}
                {renderHeaderCell('category', 'Category')}
                {renderHeaderCell('tags', 'Tags')}
                {renderHeaderCell('bid', 'Bid', 'current_bid')}
                {renderHeaderCell('estMarket', 'Est. Market', 'valuation.est_market_value')}
                {renderHeaderCell('maxBid', 'Max Bid', 'valuation.max_bid_for_target_roi')}
                {renderHeaderCell('roi', 'ROI %', 'computedRoi')}
                {renderHeaderCell('time', 'Time Remaining', 'end_time')}
                {renderHeaderCell('actions', 'Actions')}
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => {
                const isValuating = valuatingItems.has(item.id);
                
                const getRoiClass = (roi: number | null) => {
                  if (roi === null) return '';
                  if (roi >= targetRoi) return 'roi-good';
                  if (roi >= targetRoi - 10) return 'roi-warning';
                  return 'roi-neutral';
                };

                return (
                  <tr key={item.id}>
                    <td style={{ ...getColStyle('image'), padding: '8px 12px' }}>
                      <div className="table-img-wrapper">
                        <img 
                          src={item.image_url || '/placeholder.png'} 
                          className="table-img clickable-img" 
                          alt="" 
                          onClick={() => openItemDetail(item)}
                        />
                      </div>
                    </td>
                    <td className="clickable-title" style={getColStyle('title')}>
                      <div className="title-content">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          {item.title} <ExternalLink size={12} className="inline-icon"/>
                        </a>
                      </div>
                    </td>
                    <td className="mono" style={getColStyle('lot')}>{item.lot_number}</td>
                    <td style={getColStyle('source')}>
                      <span className={`source-badge ${AUCTION_HOUSE_MAP[item.auction_house_key]?.className || 'source-default'}`}>
                        {AUCTION_HOUSE_MAP[item.auction_house_key]?.short || 'Unknown'}
                      </span>
                    </td>
                    <td style={getColStyle('category')}>
                      {item.category && <span className="category-badge">{item.category}</span>}
                    </td>
                    <td style={getColStyle('tags')}>
                      <div className="tags-container">
                        {normalizeTags(item.tags).slice(0, 3).map((tag, idx) => (
                          <span key={`${item.id}-tag-${idx}`} className={`tag-badge ${tag.key ? 'structured-tag' : ''}`}>
                            <span className="tag-value">{tag.value}</span>
                          </span>
                        ))}
                        {normalizeTags(item.tags).length > 3 && (
                          <span className="tag-badge" style={{ opacity: 0.6, cursor: 'default' }}>
                            +{normalizeTags(item.tags).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="bold" style={getColStyle('bid')}>${item.current_bid.toFixed(2)}</td>
                    <td style={getColStyle('estMarket')}>
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
                    <td style={getColStyle('maxBid')}>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                    <td style={getColStyle('roi')}>
                      {item.computedRoi !== null ? (
                        <span className={`roi-badge ${getRoiClass(item.computedRoi)}`}>
                          {item.computedRoi === Infinity ? '∞%' : `${Math.round(item.computedRoi)}%`}
                        </span>
                      ) : '--'}
                    </td>
                    <td style={getColStyle('time')}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <CountdownTimer endTime={item.end_time} className="timer-text" endedText="Ending Now" endedClassName="ending-now" />
                        <span style={{ fontSize: '10px', opacity: 0.6 }}>{formatAuctionDate(item.end_time, timezone)}</span>
                      </div>
                    </td>
                    <td style={getColStyle('actions')}>
                      <div className="action-buttons-cell">
                        <button 
                          onClick={() => removeFromWatchlist(item.id)}
                          className="glass-eye-btn small-action-icon watched"
                          title="Remove from Watch List"
                        >
                          <X size={16} className="text-emerald-500" />
                        </button>

                        {isValuating ? (
                          <div title={valuationStatus[item.id] || "Loading..."} className="small-action-icon-wrap" style={{ cursor: 'wait' }}>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-dim)' }} />
                          </div>
                        ) : valuationErrors[item.id] ? (
                          <button 
                            className="glass-eye-btn small-action-icon error-icon"
                            title={valuationErrors[item.id] || "Valuation Error. Click to Retry."}
                            onClick={() => handleValuate(item.id)}
                          >
                            <TrendingUp size={16} style={{ color: '#ef4444' }} />
                          </button>
                        ) : (
                          <Tooltip text="Valuate Item">
                            <button 
                              className="glass-eye-btn small-action-icon"
                              onClick={() => handleValuate(item.id)}
                              disabled={isValuating}
                            >
                              <TrendingUp size={16} />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="research-grid">
            {sortedItems.map(item => {
              const isValuating = valuatingItems.has(item.id);
              
              const getRoiClass = (roi: number | null) => {
                if (roi === null) return '';
                if (roi >= targetRoi) return 'roi-good';
                if (roi >= targetRoi - 10) return 'roi-warning';
                return 'roi-neutral';
              };

              return (
                <div key={item.id} className="research-card">
                  <div className="research-card-image-container">
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
                    <div className="research-card-title-overlay">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="research-card-title" title={item.title}>
                        {item.title}
                      </a>
                    </div>
                    <img 
                      src={item.image_url ? getHighResImageUrl(item.image_url) : '/placeholder.png'} 
                      className="research-card-image" 
                      alt={item.title} 
                      onClick={() => openItemDetail(item)}
                    />
                    <div className="watch-timer-overlay">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CountdownTimer endTime={item.end_time} className="timer-text" endedText="Ending Now" endedClassName="ending-now" />
                        <span style={{ fontSize: '9px', opacity: 0.8 }}>{formatAuctionDate(item.end_time, timezone)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="research-card-content">
                    <div className="research-card-stats">
                      <div className="research-card-stat">
                        <span className="stat-label">Bid</span>
                        <span className="stat-value font-bold">${item.current_bid.toFixed(2)}</span>
                      </div>
                      
                      {item.valuation && (
                        <>
                          <div className="research-card-stat">
                            <span className="stat-label">Est. Value</span>
                            <Tooltip text={
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', minWidth: '150px', padding: '4px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Query</div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'normal', lineHeight: 1.3 }}>"{item.valuation.search_query || 'Unknown'}"</div>
                                <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample Size</div>
                                <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item.valuation.sample_size || 0} comparable items</div>
                              </div>
                            }>
                              <span className="stat-value text-emerald-600 font-bold" style={{ cursor: 'help', borderBottom: '1px dashed rgba(16, 185, 129, 0.4)' }}>
                                ${item.valuation.est_market_value.toFixed(2)}
                              </span>
                            </Tooltip>
                          </div>
                          <div className="research-card-stat">
                            <span className="stat-label">ROI</span>
                            {item.computedRoi !== null ? (
                              <span className={`roi-badge ${getRoiClass(item.computedRoi)}`} style={{ padding: '2px 4px', fontSize: '0.75rem' }}>
                                {item.computedRoi === Infinity ? '∞%' : `${Math.round(item.computedRoi)}%`}
                              </span>
                            ) : '--'}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="research-card-actions">
                      <button 
                        onClick={() => removeFromWatchlist(item.id)}
                        className="glass-eye-btn watched"
                        title="Remove from Watch List"
                      >
                        <X size={16} className="text-emerald-500" />
                      </button>

                      {isValuating ? (
                        <Loader2 size={16} className="spinning" />
                      ) : valuationErrors[item.id] ? (
                         <button 
                          className="small-btn"
                          onClick={() => handleValuate(item.id)}
                        >
                          Retry
                        </button>
                      ) : (
                        <button 
                          className="small-btn"
                          onClick={() => handleValuate(item.id)}
                          disabled={isValuating}
                          style={{ flex: 1 }}
                        >
                          Valuate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isEditMode && (
        <button className="floating-save-btn" onClick={saveColumnConfig} title="Save Column Layout">
          <Save size={24} />
        </button>
      )}

      <ItemDetailModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)}
        viewContext="watchlist"
        onValuate={(id) => handleValuate(id)}
        isValuating={selectedItem ? valuatingItems.has(selectedItem.id) : false}
        valuationStatusText={selectedItem ? valuationStatus[selectedItem.id] : undefined}
        comparables={selectedItem ? comparables[selectedItem.id] : null}
        loadingComparables={selectedItem ? loadingComparables[selectedItem.id] : false}
        targetMargin={selectedItem ? targetMargins[selectedItem.id] : undefined}
        onMarginChange={(val) => selectedItem && handleMarginChange(selectedItem.id, val)}
        onPersistMargin={() => selectedItem && persistMarginChange(selectedItem.id)}
        userTimezone={timezone}
      />
    </ViewContainer>
  );
};

export default WatchListView;
