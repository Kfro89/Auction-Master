import React, { useState, useEffect, useMemo } from 'react';
import './BiddingView.css';
import { ViewContainer, ViewHeader, KpiBar, KpiCard, FilterBar } from '../components/layout/ViewLayout';
import { useSortableData } from '../hooks/useSortableData';
import { ArrowUpDown, RefreshCw, ChevronRight, Wallet, Gavel, Target, Archive, RotateCcw, AlignLeft, AlignCenter, AlignRight, Save, EyeOff } from 'lucide-react';
import ItemDetailModal from '../components/ItemDetailModal';
import LotSplitModal from '../components/LotSplitModal';
import Tooltip from '../components/Tooltip';
import { CountdownTimer } from '../components/CountdownTimer';
import type { LotSplitData } from '../components/LotSplitModal';
import { formatAuctionDate, formatItemName } from '../utils/formatters';

interface SampleListing {
  url: string;
  title: string;
  price: number | string;
  condition: string;
}

interface BidItem {
  id: number;
  title: string;
  lot_number: string;
  current_bid_amount: number;
  user_bid_amount: number;
  user_proxy_bid: number;
  user_bid_status: string;
  end_time: string;
  url: string;
  image_url: string;
  auction_house_key?: string;
  category?: string;
  images?: string[];
  is_hidden_from_active: boolean;
  shipping_cost_est?: number;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    search_query?: string;
    sample_size?: number;
  };
  valuation_detail?: {
    avg_asking_price: number;
    median_asking_price: number;
    price_range_low: number;
    price_range_high: number;
    sample_listings: SampleListing[];
  };
  user_bids?: {
    current_bid_amount: number;
    user_bid_amount: number;
    user_proxy_bid: number;
    user_bid_status: string;
  };
  computedRoi?: number | null;
  landedCost?: number;
  is_archived?: boolean;
  product_name?: string;
  brand?: string;
  condition?: string;
}

export interface ColumnConfig {
  width: number;
  align: 'left' | 'center' | 'right';
}

const DEFAULT_COLUMNS: Record<string, ColumnConfig> = {
  image: { width: 60, align: 'center' },
  title: { width: 300, align: 'left' },
  lot: { width: 100, align: 'left' },
  house: { width: 100, align: 'center' },
  category: { width: 150, align: 'left' },
  status: { width: 120, align: 'center' },
  yourBid: { width: 110, align: 'center' },
  proxyBid: { width: 130, align: 'center' },
  estValue: { width: 110, align: 'center' },
  maxBid: { width: 110, align: 'center' },
  landedCost: { width: 110, align: 'center' },
  roi: { width: 80, align: 'center' },
  ends: { width: 150, align: 'center' },
  actions: { width: 100, align: 'center' }
};

const getRowClass = (status?: string) => {
  switch(status) {
    case 'won': return 'bg-green-600/20';
    case 'winning': return 'bg-green-500/10';
    case 'lost': return 'bg-red-600/20';
    case 'outbid': return 'bg-red-500/10';
    case 'reserve_not_met': return 'bg-yellow-500/10';
    case 'outbid_near': return 'bg-orange-500/10';
    default: return '';
  }
};

const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return null;
  const config: any = {
    winning: { label: 'Winning', class: 'winning', icon: '✓' },
    outbid: { label: 'Outbid', class: 'outbid', icon: '✕' },
    reserve_not_met: { label: 'Reserve Not Met', class: 'reserve_not_met', icon: '!' },
    outbid_near: { label: 'Outbid (Near)', class: 'outbid_near', icon: '⚠' },
    won: { label: 'Won', class: 'won', icon: '🏆' },
    loss: { label: 'Loss', class: 'loss', icon: '✕' },
    lost: { label: 'Lost', class: 'lost', icon: '✕' }
  };
  const s = config[status] || { label: status, class: 'default', icon: '' };
  return (
    <div className={`status-pill ${s.class}`}>
      <span className="status-icon">{s.icon}</span> {s.label}
    </div>
  );
};

const AUCTION_HOUSE_MAP: Record<string, { name: string, short: string, className: string }> = {
  'rol': { name: 'Roller', short: 'Roller', className: 'source-roller' },
  'rmeb': { name: 'Whitley', short: 'Whitley', className: 'source-whitley' },
  'public_surplus': { name: 'Public Surplus', short: 'PS', className: 'source-ps' },
  'govdeals': { name: 'GovDeals', short: 'GD', className: 'source-gd' },
  'dickensheet': { name: 'Dickensheet', short: 'Dickensheet', className: 'source-dickensheet' },
};

const BiddingView: React.FC = () => {
  const [items, setItems] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [auctionHouseFilter, setAuctionHouseFilter] = useState("");
  const [parentCategoryFilter, setParentCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [targetMargins, setTargetMargins] = useState<Record<number, string | number>>({});
  const [selectedItem, setSelectedItem] = useState<BidItem | null>(null);
  const [comparables, setComparables] = useState<Record<number, any>>({});
  const [loadingComparables, setLoadingComparables] = useState<Record<number, boolean>>({});
  const [isValuating, setIsValuating] = useState(false);
  const [valuationStatus, setValuationStatus] = useState("");
  const [timezone, setTimezone] = useState<string>(localStorage.getItem('user_timezone') || 'America/Denver');
  const [isLotSplitOpen, setIsLotSplitOpen] = useState(false);
  const [itemToWin, setItemToWin] = useState<BidItem | null>(null);

  // Column Configuration State
  const [columnConfig, setColumnConfig] = useState<Record<string, ColumnConfig>>(() => {
    const saved = localStorage.getItem('biddingTableConfig');
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
    localStorage.setItem('biddingTableConfig', JSON.stringify(columnConfig));
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
      onMouseDown={handleHeaderMouseDown}
      onMouseUp={handleHeaderMouseUpOrLeave}
      onMouseLeave={handleHeaderMouseUpOrLeave}
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

  const handleHide = async (id: number, isHidden: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bidding/${id}/hide`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_hidden: isHidden })
      });
      if (response.ok) {
        await fetchItems();
      }
    } catch (e) {
      console.error('Failed to hide item:', e);
    }
  };

  const handleMarkWon = (item: BidItem) => {
    setItemToWin(item);
    setIsLotSplitOpen(true);
  };

  const confirmMarkWon = async (data: LotSplitData) => {
    if (!itemToWin) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bidding/${itemToWin.id}/claim`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setIsLotSplitOpen(false);
        setSelectedItem(null);
        setItemToWin(null);
        await fetchItems();
      } else {
        alert('Failed to move item to Work Queue');
      }
    } catch (error) {
      console.error('Error claiming won bid:', error);
      alert('Error claiming won bid');
    }
  };

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

  const handleValuate = async (id: number) => {
    setIsValuating(true);
    setValuationStatus("Initializing AI analysis...");
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/valuate/${id}?type=bid`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const newValuation = await response.json();
        setItems(prev => prev.map(it => it.id === id ? { ...it, valuation: newValuation } : it));
        if (selectedItem?.id === id) {
          setSelectedItem(prev => prev ? { ...prev, valuation: newValuation } : null);
        }
        fetchComparables(id, true);
      }
    } catch (e) {
      console.error('Failed to valuate item:', e);
    } finally {
      setIsValuating(false);
      setValuationStatus("");
    }
  };

  const persistMarginChange = async (id: number) => {
    const rawVal = targetMargins[id] ?? 20;
    const marginPct = (typeof rawVal === 'number' ? rawVal : parseFloat(rawVal as string)) / 100;
    if (isNaN(marginPct)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bidding/${id}/valuation/margin`, {
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

  const fetchComparables = async (id: number, force = false) => {
    if (!force && (comparables[id] || loadingComparables[id])) return;
    setLoadingComparables(prev => ({...prev, [id]: true}));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bidding/${id}/comparables`, {
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

  const openItemDetail = (item: BidItem) => {
    setSelectedItem(item);
    fetchComparables(item.id);
  };
  
  const handleMarginChange = (id: number, val: string | number) => {
    setTargetMargins(prev => ({...prev, [id]: val}));
  };

  const fetchItems = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/bidding/?show_hidden=${showHidden}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch bidding items:', error);
    } finally {
      setLoading(false);
    }
  }, [showHidden]);

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
    fetchSettings();
    const interval = setInterval(fetchItems, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [showHidden, fetchItems]);

  const { totalCurrentBids, totalUserBids, totalMaxExposure } = useMemo(() => {
    let tCurrent = 0;
    let tUser = 0;
    let tExposure = 0;
    items.forEach(item => {
      if (item.is_hidden_from_active) return; 
      tCurrent += item.current_bid_amount || 0;
      tUser += item.user_bid_amount || 0; 
      tExposure += item.user_proxy_bid || 0;
    });
    return { totalCurrentBids: tCurrent, totalUserBids: tUser, totalMaxExposure: tExposure };
  }, [items]);

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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search Query
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch = formatItemName(item).toLowerCase().includes(lowerQuery) || 
                             item.lot_number.toLowerCase().includes(lowerQuery);
        if (!matchesSearch) return false;
      }

      // Auction House Filter
      if (auctionHouseFilter && item.auction_house_key !== auctionHouseFilter) return false;

      // Category Filters
      if (item.category) {
        const [parent, sub] = item.category.split(' > ');
        if (parentCategoryFilter && parent !== parentCategoryFilter) return false;
        if (subCategoryFilter && sub !== subCategoryFilter) return false;
      } else if (parentCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, auctionHouseFilter, parentCategoryFilter, subCategoryFilter]);

  const itemsWithComputedRoi = useMemo(() => {
    return filteredItems.map(item => {
      let roi = null;
      const effectiveBid = item.user_proxy_bid ?? item.current_bid_amount;
      const shippingCost = item.shipping_cost_est || 0;
      const buyerPremium = effectiveBid * 0.15;
      const landedCost = effectiveBid + shippingCost + buyerPremium;
      if (item.valuation) {
        if (landedCost > 0) {
          roi = ((item.valuation.est_market_value - landedCost) / landedCost) * 100;
        }
      }
      return { ...item, computedRoi: roi, landedCost };
    });
  }, [filteredItems]);

  const { items: sortedItems, requestSort, sortConfig } = useSortableData(itemsWithComputedRoi);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return (
        <span className={`sort-icon active ${sortConfig.direction}`}>
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return <ArrowUpDown size={12} className="sort-icon neutral" />;
  };

  if (loading) return <div className="loading">Loading active bids...</div>;

  return (
    <ViewContainer className="bidding-view">
      <ViewHeader 
        title="Active Auctions" 
        subtitle="Track and manage your live bids across all auction houses."
        actions={
          <button className="action-btn" onClick={refreshActiveBids} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Updating...' : 'Update Bids'}
          </button>
        }
      />

      <KpiBar>
        <KpiCard 
          icon={<Wallet size={24} />} 
          label="Max Exposure" 
          value={`$${totalMaxExposure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
        />
        <KpiCard 
          icon={<Gavel size={24} />} 
          label="Total Current Bids" 
          value={`$${totalCurrentBids.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
        />
        <KpiCard 
          icon={<Target size={24} />} 
          label="Your Active Bids" 
          value={`$${totalUserBids.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
        />
      </KpiBar>

      <section className="grid-section">
        <FilterBar title="My Bids">
          <button 
            className={`saas-input whitespace-nowrap px-4 transition-colors ${showHidden ? 'bg-indigo-600/40 border-indigo-500/50 text-white' : 'hover:bg-white/5'}`}
            onClick={() => setShowHidden(!showHidden)}
          >
            {showHidden ? 'Hide Hidden' : 'Show Hidden'}
          </button>
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
            placeholder="Search title or lot..." 
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
        <div className="glass-panel" style={{ position: 'relative' }}>
          <table className="dense-grid">
            <thead className={isEditMode ? 'edit-mode' : ''}>
              <tr>
                {renderHeaderCell('image', 'Img')}
                {renderHeaderCell('title', 'Title', 'title')}
                {renderHeaderCell('lot', 'Lot', 'lot_number')}
                {renderHeaderCell('house', 'House', 'auction_house_key')}
                {renderHeaderCell('category', 'Category', 'category')}
                {renderHeaderCell('status', 'Status', undefined, 'text-center')}
                {renderHeaderCell('yourBid', 'Your Bid', 'user_bid_amount')}
                {renderHeaderCell('proxyBid', 'Proxy Bid Value', 'user_proxy_bid')}
                {renderHeaderCell('estValue', 'Est. Value', 'valuation.est_market_value')}
                {renderHeaderCell('maxBid', 'Max Bid', 'valuation.max_bid_for_target_roi')}
                {renderHeaderCell('landedCost', 'Landed Cost', 'landedCost')}
                {renderHeaderCell('roi', 'ROI', 'computedRoi')}
                {renderHeaderCell('ends', 'Ends', 'end_time')}
                {renderHeaderCell('actions', 'Actions', undefined, 'w-16 text-center')}
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => {
                return (
                  <tr 
                    key={item.id} 
                    className={`bidding-row transition-colors cursor-pointer hover:bg-white/5 ${getRowClass(item.user_bid_status)} ${item.is_archived ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    onClick={() => openItemDetail(item)}
                  >
                    <td style={getColStyle('image')}>
                      <img 
                        src={item.image_url || '/placeholder.png'} 
                        className="grid-thumb rounded border border-white/10" 
                        alt={formatItemName(item)} 
                      />
                    </td>
                    <td className="title-cell" style={getColStyle('title')}>
                      <span className="whitespace-normal break-words" title={formatItemName(item)}>{formatItemName(item)}</span>
                    </td>
                    <td className="mono" style={getColStyle('lot')}>{item.lot_number}</td>
                    <td className="text-center" style={getColStyle('house')}>
                      <span className={`source-badge ${AUCTION_HOUSE_MAP[item.auction_house_key || '']?.className || 'source-default'}`}>
                        {AUCTION_HOUSE_MAP[item.auction_house_key || '']?.short || '???'}
                      </span>
                    </td>
                    <td style={getColStyle('category')}>
                      {item.category && <span className="category-badge">{item.category}</span>}
                    </td>
                    <td className="text-center" style={getColStyle('status')}>
                      <StatusPill status={item.user_bid_status} />
                    </td>
                    <td className="bid-cell" style={getColStyle('yourBid')}>{item.user_bid_amount !== undefined ? `$${item.user_bid_amount.toFixed(2)}` : '--'}</td>
                    <td style={getColStyle('proxyBid')}>{item.user_proxy_bid !== undefined ? `$${item.user_proxy_bid.toFixed(2)}` : '--'}</td>
                    <td className="text-center" style={getColStyle('estValue')}>
                      {item.valuation ? (
                        <Tooltip text={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', minWidth: '150px', padding: '4px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Query</div>
                            <div style={{ fontWeight: 600, color: 'white', whiteSpace: 'normal', lineHeight: 1.3 }}>"{item.valuation.search_query || 'Unknown'}"</div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample Size</div>
                            <div style={{ fontWeight: 500, color: 'white' }}>{item.valuation.sample_size || 0} comparable items</div>
                          </div>
                        }>
                          <span className="text-emerald-600 font-semibold cursor-help border-b border-dashed border-emerald-600/30">
                            ${item.valuation.est_market_value.toFixed(2)}
                          </span>
                        </Tooltip>
                      ) : '--'}
                    </td>
                    <td style={getColStyle('maxBid')}>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                    <td style={getColStyle('landedCost')}>{item.landedCost !== undefined ? `$${item.landedCost.toFixed(2)}` : '--'}</td>
                    <td style={getColStyle('roi')}>{item.computedRoi !== null ? `${Math.round(item.computedRoi)}%` : '--'}</td>
                    <td className="timer-text" style={getColStyle('ends')}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CountdownTimer endTime={item.end_time} className="countdown-main" endedText="Ending Now" endedClassName="ending-now" />
                        <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 400 }}>
                          {formatAuctionDate(item.end_time, timezone)}
                        </span>
                      </div>
                    </td>
                    <td className="text-center" style={getColStyle('actions')}>
                      <div className="flex items-center justify-center gap-2">
                        {item.user_bid_status === 'won' && (
                          <button 
                            className="p-1 hover:bg-green-500/20 rounded transition-colors text-green-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkWon(item);
                            }}
                            title="Move to Work Queue"
                          >
                            <ChevronRight size={20} />
                          </button>
                        )}
                        {(['lost', 'loss', 'outbid', 'outbid_near', 'reserve_not_met'].includes(item.user_bid_status || '')) && (
                          <button 
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHide(item.id, true);
                            }}
                            title="Hide from active"
                          >
                            <EyeOff size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isEditMode && (
            <button className="floating-save-btn" onClick={saveColumnConfig} title="Save Column Layout">
              <Save size={24} />
            </button>
          )}
        </div>
      </section>

      <ItemDetailModal 
        item={selectedItem as any} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        viewContext="bidding" 
        onValuate={handleValuate}
        isValuating={isValuating}
        valuationStatusText={valuationStatus}
        comparables={selectedItem ? comparables[selectedItem.id] : null}
        loadingComparables={selectedItem ? loadingComparables[selectedItem.id] : false}
        targetMargin={selectedItem ? targetMargins[selectedItem.id] : undefined}
        onMarginChange={(val) => selectedItem && handleMarginChange(selectedItem.id, val)}
        onPersistMargin={() => selectedItem && persistMarginChange(selectedItem.id)}
        userTimezone={timezone}
        onMarkWon={() => selectedItem && handleMarkWon(selectedItem)}
        onArchive={(id, isArchived) => handleHide(id, isArchived)}
      />

      {itemToWin && (
        <LotSplitModal 
          isOpen={isLotSplitOpen}
          onClose={() => setIsLotSplitOpen(false)}
          onConfirm={confirmMarkWon}
          itemTitle={formatItemName(itemToWin)}
          estimatedValue={itemToWin.valuation?.est_market_value}
        />
      )}
    </ViewContainer>
  );
};

export default BiddingView;
