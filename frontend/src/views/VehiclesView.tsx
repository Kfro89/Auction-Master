import React, { useState, useEffect, useMemo } from 'react';
import './ResearchView.css';
import { useSortableData } from '../hooks/useSortableData';
import Modal from '../components/Modal';
import Tooltip from '../components/Tooltip';
import { CalendarDays, Clock, TrendingUp, ArrowUpDown, ExternalLink, ImageIcon, Eye, EyeOff, Loader2, AlignLeft, AlignCenter, AlignRight, Save, LayoutGrid, List, Target } from 'lucide-react';
import { useCommandContext } from '../contexts/CommandContext';
import type { Command } from '../contexts/CommandContext';

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
  tags?: any; // Can be string[] or Record<string, string | string[]>
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    computed_at: string;
    search_query?: string;
    sample_size?: number;
  };
  is_watched?: boolean;
  is_user_bidding?: boolean;
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

const normalizeTags = (tags: any): { key: string | null, value: string, fullTag: string }[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(t => typeof t === 'string').map(t => ({ key: null, value: t, fullTag: t }));
  if (typeof tags === 'object') {
    const result: { key: string, value: string, fullTag: string }[] = [];
    for (const [key, val] of Object.entries(tags)) {
      if (Array.isArray(val)) {
        val.forEach(v => result.push({ key, value: String(v), fullTag: `${key}: ${v}` }));
      } else if (val !== null && val !== undefined && String(val).trim() !== '') {
        result.push({ key, value: String(val), fullTag: `${key}: ${val}` });
      }
    }
    return result;
  }
  return [];
};

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

const VehiclesView: React.FC = () => {
  const { setContextCommands } = useCommandContext();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [valuatingItems, setValuatingItems] = useState<Set<number>>(new Set());
  const [valuationStatus, setValuationStatus] = useState<{ [itemId: number]: string }>({});
  const [valuationErrors, setValuationErrors] = useState<{ [itemId: number]: string }>({});
  const [targetRoi, setTargetRoi] = useState<number>(() => parseInt(localStorage.getItem('targetRoi') || '30', 10));
  React.useEffect(() => { localStorage.setItem('targetRoi', targetRoi.toString()); }, [targetRoi]);

  const [newItemIds, setNewItemIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('am_new_items');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  React.useEffect(() => {
    localStorage.setItem('am_new_items', JSON.stringify(Array.from(newItemIds)));
  }, [newItemIds]);

  const clearNewStatus = (itemId: number) => {
    setNewItemIds(prev => {
      if (!prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  React.useEffect(() => {
    setNewItemIds(prev => {
      let changed = false;
      const next = new Set(prev);
      items.forEach(item => {
        if (item.is_user_bidding && next.has(item.id)) {
          next.delete(item.id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [items]);

  // Column Configuration State
  const [columnConfig, setColumnConfig] = useState<Record<string, ColumnConfig>>(() => {
    const saved = localStorage.getItem('researchTableConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_COLUMNS, ...parsed };
      } catch (e) { }
    }
    return DEFAULT_COLUMNS;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isBulkValuateModalOpen, setIsBulkValuateModalOpen] = useState(false);
  const [bulkValuateProgress, setBulkValuateProgress] = useState<{ total: number, current: number, active: boolean }>({ total: 0, current: 0, active: false });
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
    localStorage.setItem('researchTableConfig', JSON.stringify(columnConfig));
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
      <div style={{ 
        display: 'flex', 
        justifyContent: (columnConfig[colId] || DEFAULT_COLUMNS[colId] || { align: 'left' }).align === 'right' ? 'flex-end' : (columnConfig[colId] || DEFAULT_COLUMNS[colId] || { align: 'left' }).align === 'center' ? 'center' : 'flex-start', 
        alignItems: 'center', 
        width: '100%', 
        position: 'relative' 
      }}>
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

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Filter State
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [parentCategoryFilter, setParentCategoryFilter] = useState<string>('');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('');
  const [auctionHouseFilter, setAuctionHouseFilter] = useState<string>('');
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

  const isScrapingRef = React.useRef(false);
  const isValuatingRef = React.useRef(false);

  useEffect(() => {
    fetchItems();
    
    const fetchJobStatus = async () => {
      try {
        const response = await fetch('/api/admin/jobs/status');
        if (response.ok) {
          const data = await response.json();
          
          const currentlyScraping = data.scrape?.status === 'active';
          if (!currentlyScraping && isScrapingRef.current) {
            // Scrape just finished, let's fetch items and find new ones
            try {
               const res = await fetch('/api/items/');
               if (res.ok) {
                 const newData = await res.json();
                 setItems(prevItems => {
                   const existingIds = new Set(prevItems.map(i => i.id));
                   const newIds = newData.map((i: any) => i.id).filter((id: number) => !existingIds.has(id));
                   if (newIds.length > 0) {
                     setNewItemIds(new Set(newIds));
                   }
                   return newData;
                 });
               }
            } catch (e) {
               console.error("Error fetching after scrape", e);
            }
          }
          isScrapingRef.current = currentlyScraping;
          setIsScraping(currentlyScraping);
          
          const currentlyValuating = data.valuate?.status === 'active';
          if (!currentlyValuating && isValuatingRef.current) {
            // Valuation bulk job just finished, refresh items so they appear
            fetchItems();
          }
          isValuatingRef.current = currentlyValuating;
          
          if (currentlyValuating) {
            setBulkValuateProgress({
              active: true,
              current: data.valuate.current,
              total: data.valuate.total
            });
          } else {
            setBulkValuateProgress(prev => ({ ...prev, active: false }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch job status", err);
      }
    };

    fetchJobStatus();
    const jobInterval = setInterval(fetchJobStatus, 3000);
    const itemInterval = setInterval(fetchItems, 60000); // Poll every 60s
    return () => {
      clearInterval(jobInterval);
      clearInterval(itemInterval);
    };
  }, []);

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const response = await fetch(`/api/admin/scrape/all`, { method: 'POST' });
      if (!response.ok) {
        console.error(`Failed to trigger scrape job`);
        setIsScraping(false);
      }
    } catch (error) {
      console.error(`Error triggering scrape job:`, error);
      setIsScraping(false);
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

  const handleBulkValuate = async (onlyMissing: boolean) => {
    setIsBulkValuateModalOpen(false);
    
    // We update UI locally first to seem responsive, actual state will follow from polling
    setBulkValuateProgress({ total: 1, current: 0, active: true }); 
    
    try {
      const response = await fetch(`/api/admin/valuate-bulk`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: onlyMissing ? 'missing' : 'all', target_roi: targetRoi / 100 })
      });
      if (!response.ok) {
        console.error(`Failed to trigger bulk valuation job`);
        setBulkValuateProgress(prev => ({ ...prev, active: false }));
      }
    } catch (error) {
      console.error(`Error triggering bulk valuation:`, error);
      setBulkValuateProgress(prev => ({ ...prev, active: false }));
    }
  };

  const getHighResImageUrl = (url: string) => {
    if (!url) return '';
    // Replace typical patterns from scraping for high-res images
    return url.replace(/\/(?:small|thumb)\//i, '/large/').replace(/[_-](?:small|thumb)(\.[a-zA-Z0-9]+)$/i, '_large$1');
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
        clearNewStatus(itemId);
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
      
      // INCLUDE ONLY Motor Pool vehicles
      let passesMotorPoolCheck = false;
      if (item.category && item.category.startsWith('Motor Pool') && !item.category.startsWith('Motor Pool Parts')) {
        passesMotorPoolCheck = true;
      }
      
      let passesAuctionHouse = true;
      if (auctionHouseFilter) {
        passesAuctionHouse = item.auction_house_key === auctionHouseFilter;
      }

      return passesDateFilter && passesSearch && passesCategory && passesMotorPoolCheck && passesAuctionHouse;
    });
  }, [items, filter, searchQuery, parentCategoryFilter, subCategoryFilter, auctionHouseFilter]);

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

  useEffect(() => {
    const commands: Command[] = [];

    parentCategories.forEach(parent => {
      commands.push({
        id: `cat-parent-${parent}`,
        label: `Category: ${parent}`,
        action: () => {
          setParentCategoryFilter(parent);
          setSubCategoryFilter('');
        },
        group: 'Categories'
      });

      if (subCategoriesMap[parent]) {
        subCategoriesMap[parent].forEach(sub => {
          commands.push({
            id: `cat-sub-${parent}-${sub}`,
            label: `Category: ${parent} > ${sub}`,
            action: () => {
              setParentCategoryFilter(parent);
              setSubCategoryFilter(sub);
            },
            group: 'Categories'
          });
        });
      }
    });

    Object.values(AUCTION_HOUSE_MAP).forEach(ah => {
      commands.push({
        id: `ah-${ah.name}`,
        label: `Auction House: ${ah.name}`,
        action: () => {
          setSearchQuery(ah.name);
          setParentCategoryFilter('');
          setSubCategoryFilter('');
        },
        group: 'Auction Houses'
      });
    });

    setContextCommands(commands);
    return () => setContextCommands([]);
  }, [parentCategories, subCategoriesMap, setContextCommands]);



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
          <Tooltip text="Refresh data from all auction houses">
            <button 
              className={`action-btn scrape-btn ${isScraping ? 'scraping' : ''}`}
              onClick={handleScrape}
              disabled={isScraping}
            >
              {isScraping ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={16}/>}
              {isScraping ? 'Scanning...' : 'Check for New Items'}
            </button>
          </Tooltip>
          <Tooltip text="Update valuations for all items">
            <button 
              className="action-btn"
              onClick={() => setIsBulkValuateModalOpen(true)}
              disabled={bulkValuateProgress.active}
            >
              {bulkValuateProgress.active ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={16}/>}
              {bulkValuateProgress.active ? `Updating (${bulkValuateProgress.current}/${bulkValuateProgress.total})` : 'Update Valuations'}
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
          <h1 className="saas-title">Available Items</h1>
          <div className="saas-filters">
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
          </div>
        </div>
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
                {renderHeaderCell('vin', 'VIN', 'vin')}
                {renderHeaderCell('vehicle_year', 'Year', 'vehicle_year')}
                {renderHeaderCell('vehicle_make', 'Make', 'vehicle_make')}
                {renderHeaderCell('vehicle_model', 'Model', 'vehicle_model')}
                {renderHeaderCell('vehicle_trim', 'Trim', 'vehicle_trim')}
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
                          onClick={() => {
                            setSelectedItem(item);
                            clearNewStatus(item.id);
                          }}
                        />
                        {newItemIds.has(item.id) && (
                          <div className="new-badge-overlay">
                            NEW
                          </div>
                        )}
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
                    <td style={getColStyle('vin')} className="mono text-xs">{item.vin || '--'}</td>
                    <td style={getColStyle('vehicle_year')}>{item.vehicle_year || '--'}</td>
                    <td style={getColStyle('vehicle_make')}>{item.vehicle_make || '--'}</td>
                    <td style={getColStyle('vehicle_model')}>{item.vehicle_model || '--'}</td>
                    <td style={getColStyle('vehicle_trim')}>{item.vehicle_trim || '--'}</td>
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
                            <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mean Price</div>
                            <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>${item.valuation.mean?.toFixed(2) || '--'}</div>
                            <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trimmed Median</div>
                            <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>${item.valuation.trimmed_median?.toFixed(2) || '--'}</div>
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
                      <CountdownTimer endTime={item.end_time} />
                    </td>
                    <td style={getColStyle('actions')}>
                      <div className="action-buttons-cell">
                        <button 
                          onClick={() => toggleWatchStatus(item.id, !!item.is_watched)}
                          className={`glass-eye-btn small-action-icon ${item.is_watched ? 'watched' : ''}`}
                          title={item.is_watched ? "Remove from Watch List" : "Add to Watch List"}
                        >
                          {item.is_watched ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-slate-400" />}
                        </button>

                        {isValuating ? (
                          <div title={valuationStatus[item.id] || "Loading..."} className="small-action-icon-wrap" style={{ cursor: 'wait' }}>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-dim)' }} />
                          </div>
                        ) : valuationErrors[item.id] ? (
                          <button 
                            className="glass-eye-btn small-action-icon error-icon"
                            title={valuationErrors[item.id] || "Valuation Error. Click to Retry."}
                            onClick={() => {
                              setValuationErrors(prev => {
                                const next = { ...prev };
                                delete next[item.id];
                                return next;
                              });
                              handleValuate(item.id);
                            }}
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
                    <div className="research-card-title-overlay">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="research-card-title" title={item.title}>
                        {item.title}
                      </a>
                    </div>
                    <img 
                      src={item.image_url ? getHighResImageUrl(item.image_url) : '/placeholder.png'} 
                      className="research-card-image" 
                      alt={item.title} 
                      onClick={() => {
                        setSelectedItem(item);
                        clearNewStatus(item.id);
                      }}
                    />
                    {newItemIds.has(item.id) && (
                      <div className="new-badge-overlay grid-overlay">
                        NEW
                      </div>
                    )}
                  </div>
                  <div className="research-card-content">
                    
                    <div className="research-card-stats">
                      <div className="research-card-stat">
                        <span className="stat-label">Time Left</span>
                        <span className="stat-value"><CountdownTimer endTime={item.end_time} /></span>
                      </div>
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
                                <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mean Price</div>
                                <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>${item.valuation.mean?.toFixed(2) || '--'}</div>
                                <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '4px 0' }} />
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trimmed Median</div>
                                <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>${item.valuation.trimmed_median?.toFixed(2) || '--'}</div>
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
                        onClick={() => toggleWatchStatus(item.id, !!item.is_watched)}
                        className={`glass-eye-btn ${item.is_watched ? 'watched' : ''}`}
                        title={item.is_watched ? "Remove from Watch List" : "Add to Watch List"}
                      >
                        {item.is_watched ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-slate-400" />}
                      </button>

                      {isValuating ? (
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : valuationErrors[item.id] ? (
                         <button 
                          className="small-btn"
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

      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} size="lg">
        {selectedItem && (
          <div className="item-detail-layout">
            <div className="item-detail-image-panel">
              {selectedItem.image_url ? (
                <img
                  src={getHighResImageUrl(selectedItem.image_url)}
                  alt={selectedItem.title}
                  className="item-detail-image lightbox-img"
                />
              ) : (
                <div className="item-detail-no-image">No Image Available</div>
              )}
            </div>
            <div className="item-detail-info-panel">
              <div className="item-detail-header">
                <h2>{selectedItem.title}</h2>
                <div className="item-detail-badges">
                  <span className="item-detail-timer"><CalendarDays size={14}/> <CountdownTimer endTime={selectedItem.end_time} /></span>
                </div>
              </div>

              <div className="item-detail-stats glass-panel">
                <div className="item-detail-stat">
                  <span className="stat-label">Current Bid</span>
                  <span className="stat-value font-bold">${selectedItem.current_bid?.toFixed(2) || '0.00'}</span>
                </div>
                {selectedItem.valuation ? (
                  <>
                    <div className="item-detail-stat">
                      <span className="stat-label">Est. Value</span>
                      <span className="stat-value text-emerald-600 font-bold">${selectedItem.valuation.est_market_value?.toFixed(2)}</span>
                    </div>
                    <div className="item-detail-stat">
                      <span className="stat-label">Max Bid</span>
                      <span className="stat-value text-blue-600 font-bold">${selectedItem.valuation.max_bid_for_target_roi?.toFixed(2)}</span>
                    </div>
                    <div className="item-detail-stat">
                      <span className="stat-label">ROI %</span>
                      <span className={`roi-badge`}>
                        {selectedItem.valuation.target_roi_pct ? `${Math.round(selectedItem.valuation.target_roi_pct)}%` : '--'}
                      </span>
                    </div>
                    <div className="item-detail-divider" />
                    <div className="item-detail-stat">
                      <span className="stat-label">eBay Search Query</span>
                      <span className="stat-value">{selectedItem.valuation.search_query || 'Unknown'}</span>
                    </div>
                    <div className="item-detail-stat">
                      <span className="stat-label">Sample Size</span>
                      <span className="stat-value">{selectedItem.valuation.sample_size || 0}</span>
                    </div>
                  </>
                ) : (
                  <div className="item-detail-stat">
                    <span className="stat-label">Valuation</span>
                    <span className="stat-value">Not Valuated</span>
                  </div>
                )}
              </div>

              <div className="item-detail-extra">
                <div className="item-detail-stat">
                  <span className="stat-label">Lot Number</span>
                  <span className="stat-value mono">{selectedItem.lot_number}</span>
                </div>
                {selectedItem.category && (
                  <div className="item-detail-stat">
                    <span className="stat-label">Category</span>
                    <span className="stat-value">{selectedItem.category}</span>
                  </div>
                )}
                {selectedItem.vin && (
                  <div className="item-detail-stat">
                    <span className="stat-label">VIN</span>
                    <span className="stat-value mono">{selectedItem.vin}</span>
                  </div>
                )}
                {selectedItem.vehicle_year && (
                  <div className="item-detail-stat">
                    <span className="stat-label">Year</span>
                    <span className="stat-value">{selectedItem.vehicle_year}</span>
                  </div>
                )}
                {selectedItem.vehicle_make && (
                  <div className="item-detail-stat">
                    <span className="stat-label">Make</span>
                    <span className="stat-value">{selectedItem.vehicle_make}</span>
                  </div>
                )}
                {selectedItem.vehicle_model && (
                  <div className="item-detail-stat">
                    <span className="stat-label">Model</span>
                    <span className="stat-value">{selectedItem.vehicle_model}</span>
                  </div>
                )}
                {selectedItem.vehicle_trim && (
                  <div className="item-detail-stat">
                    <span className="stat-label">Trim</span>
                    <span className="stat-value">{selectedItem.vehicle_trim}</span>
                  </div>
                )}
                {selectedItem.tags && normalizeTags(selectedItem.tags).length > 0 && (
                  <div className="item-detail-stat">
                    <span className="stat-label">Tags</span>
                    <span className="stat-value">
                      <div className="tags-container" style={{ justifyContent: 'flex-end' }}>
                        {normalizeTags(selectedItem.tags).map((tag, idx) => (
                          <span key={`modal-tag-${idx}`} className={`tag-badge ${tag.key ? 'structured-tag' : ''}`}>
                            <span className="tag-value">{tag.value}</span>
                          </span>
                        ))}
                      </div>
                    </span>
                  </div>
                )}
              </div>

              <div className="item-detail-actions" style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="action-btn" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>
                  View Full Auction <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isBulkValuateModalOpen} onClose={() => setIsBulkValuateModalOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>How would you like to update the AI valuations for your inventory?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="action-btn" 
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => handleBulkValuate(true)}
            >
              Missing Only
            </button>
            <button 
              className="action-btn" 
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => handleBulkValuate(false)}
            >
              Update All
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VehiclesView;
