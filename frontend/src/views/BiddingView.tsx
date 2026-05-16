import React, { useState, useEffect, useMemo } from 'react';
import './BiddingView.css';
import { ViewContainer, ViewHeader, KpiBar, KpiCard, FilterBar } from '../components/layout/ViewLayout';
import { useSortableData } from '../hooks/useSortableData';
import { ArrowUpDown, RefreshCw, ChevronRight, Wallet, Gavel, Target, Archive, RotateCcw } from 'lucide-react';
import ItemDetailModal from '../components/ItemDetailModal';
import LotSplitModal from '../components/LotSplitModal';
import type { LotSplitData } from '../components/LotSplitModal';
import { formatAuctionDate } from '../utils/formatters';

interface SampleListing {
  url: string;
  title: string;
  price: number | string;
  condition: string;
}

interface Item {
  id: number;
  title: string;
  lot_number: string;
  current_bid: number;
  end_time: string;
  status: string;
  url: string;
  image_url: string;
  auction_house_key?: string;
  category?: string;
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
}

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
  'dickensheet': { name: 'Dickensheet', short: 'Dickensheet', className: 'source-dickensheet' },
};

const BiddingView: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [auctionHouseFilter, setAuctionHouseFilter] = useState("");
  const [parentCategoryFilter, setParentCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [targetMargins, setTargetMargins] = useState<Record<number, string | number>>({});
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [comparables, setComparables] = useState<Record<number, any>>({});
  const [loadingComparables, setLoadingComparables] = useState<Record<number, boolean>>({});
  const [isValuating, setIsValuating] = useState(false);
  const [valuationStatus, setValuationStatus] = useState("");
  const [timezone, setTimezone] = useState<string>(localStorage.getItem('user_timezone') || 'America/Denver');
  const [isLotSplitOpen, setIsLotSplitOpen] = useState(false);
  const [itemToWin, setItemToWin] = useState<Item | null>(null);

  const handleArchive = async (id: number, isArchived: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${id}/archive`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_archived: isArchived })
      });
      if (response.ok) {
        await fetchItems();
      }
    } catch (e) {
      console.error('Failed to archive item:', e);
    }
  };

  const handleMarkWon = (item: Item) => {
    setItemToWin(item);
    setIsLotSplitOpen(true);
  };

  const confirmMarkWon = async (data: LotSplitData) => {
    if (!itemToWin) return;
    
    try {
      const response = await fetch(`/api/inventory/items/${itemToWin.id}/won`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setIsLotSplitOpen(false);
        setSelectedItem(null);
        setItemToWin(null);
        await fetchItems();
      } else {
        alert('Failed to mark item as won');
      }
    } catch (error) {
      console.error('Error marking item as won:', error);
      alert('Error marking item as won');
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
      const response = await fetch(`/api/admin/valuate/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const newValuation = await response.json();
        setItems(prev => prev.map(it => it.id === id ? { ...it, valuation: newValuation } : it));
        if (selectedItem?.id === id) {
          setSelectedItem(prev => prev ? { ...prev, valuation: newValuation } : null);
        }
        // Refresh comparables after valuation
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

  const fetchItems = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/items/?show_archived=${showArchived}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.filter((item: Item) => item.is_user_bidding));
      }
    } catch (error) {
      console.error('Failed to fetch bidding items:', error);
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

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
  }, [showArchived, fetchItems]);

  const { totalCurrentBids, totalUserBids, totalMaxExposure } = useMemo(() => {
    let tCurrent = 0;
    let tUser = 0;
    let tExposure = 0;
    items.forEach(item => {
      if (item.is_archived) return; // Skip archived items
      if (item.user_bids) {
        tCurrent += item.user_bids.current_bid_amount || 0;
        tUser += item.user_bids.user_bid_amount || 0; 
        tExposure += item.user_bids.user_proxy_bid || 0;
      }
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
        const matchesSearch = item.title.toLowerCase().includes(lowerQuery) || 
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
      const effectiveBid = item.user_bids?.user_proxy_bid ?? item.current_bid;
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
            className={`saas-input whitespace-nowrap px-4 transition-colors ${showArchived ? 'bg-indigo-600/40 border-indigo-500/50 text-white' : 'hover:bg-white/5'}`}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Hide Archived' : 'Show Archived'}
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
            <thead>
              <tr>
                <th>Img</th>
                <th onClick={() => requestSort('title')} className="sortable">
                  <div className="header-content left">Title {renderSortIcon('title')}</div>
                </th>
                <th onClick={() => requestSort('lot_number')} className="sortable">
                  <div className="header-content left">Lot {renderSortIcon('lot_number')}</div>
                </th>
                <th onClick={() => requestSort('auction_house_key')} className="sortable">
                  <div className="header-content center">House {renderSortIcon('auction_house_key')}</div>
                </th>
                <th onClick={() => requestSort('category')} className="sortable">
                  <div className="header-content left">Category {renderSortIcon('category')}</div>
                </th>
                <th className="text-center">Status</th>
                <th onClick={() => requestSort('user_bids.user_bid_amount')} className="sortable">
                  <div className="header-content center">Your Bid {renderSortIcon('user_bids.user_bid_amount')}</div>
                </th>
                <th onClick={() => requestSort('user_bids.user_proxy_bid')} className="sortable">
                  <div className="header-content center">Proxy Bid Value {renderSortIcon('user_bids.user_proxy_bid')}</div>
                </th>
                <th onClick={() => requestSort('valuation.max_bid_for_target_roi')} className="sortable">
                  <div className="header-content center">Max Bid {renderSortIcon('valuation.max_bid_for_target_roi')}</div>
                </th>
                <th onClick={() => requestSort('landedCost')} className="sortable">
                  <div className="header-content center">Landed Cost {renderSortIcon('landedCost')}</div>
                </th>
                <th onClick={() => requestSort('computedRoi')} className="sortable">
                  <div className="header-content center">ROI {renderSortIcon('computedRoi')}</div>
                </th>
                <th onClick={() => requestSort('end_time')} className="sortable">
                  <div className="header-content center">Ends {renderSortIcon('end_time')}</div>
                </th>
                <th className="w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map(item => {
                return (
                  <tr 
                    key={item.id} 
                    className={`bidding-row transition-colors cursor-pointer hover:bg-white/5 ${getRowClass(item.user_bids?.user_bid_status)} ${item.is_archived ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    onClick={() => openItemDetail(item)}
                  >
                    <td>
                      <img 
                        src={item.image_url || '/placeholder.png'} 
                        className="grid-thumb rounded border border-white/10" 
                        alt="" 
                      />
                    </td>
                    <td className="title-cell">
                      <span className="whitespace-normal break-words" title={item.title}>{item.title}</span>
                    </td>
                    <td className="mono">{item.lot_number}</td>
                    <td className="text-center">
                      <span className={`source-badge ${AUCTION_HOUSE_MAP[item.auction_house_key || '']?.className || 'source-default'}`}>
                        {AUCTION_HOUSE_MAP[item.auction_house_key || '']?.short || '???'}
                      </span>
                    </td>
                    <td>
                      {item.category && <span className="category-badge">{item.category}</span>}
                    </td>
                    <td className="text-center">
                      <StatusPill status={item.user_bids?.user_bid_status} />
                    </td>
                    <td className="bid-cell">{item.user_bids?.user_bid_amount !== undefined ? `$${item.user_bids.user_bid_amount.toFixed(2)}` : '--'}</td>
                    <td>{item.user_bids?.user_proxy_bid !== undefined ? `$${item.user_bids.user_proxy_bid.toFixed(2)}` : '--'}</td>
                    <td>{item.valuation ? `$${item.valuation.max_bid_for_target_roi.toFixed(2)}` : '--'}</td>
                    <td>{item.landedCost !== undefined ? `$${item.landedCost.toFixed(2)}` : '--'}</td>
                    <td>{item.computedRoi !== null ? `${Math.round(item.computedRoi)}%` : '--'}</td>
                    <td className="timer-text">{formatAuctionDate(item.end_time, timezone)}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {(['lost', 'loss', 'outbid', 'outbid_near', 'reserve_not_met'].includes(item.user_bids?.user_bid_status || '') || item.is_archived) && (
                          <button 
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(item.id, !item.is_archived);
                            }}
                            title={item.is_archived ? "Unarchive" : "Archive"}
                          >
                            {item.is_archived ? <RotateCcw size={16} /> : <Archive size={16} />}
                          </button>
                        )}
                        <ChevronRight size={16} className="opacity-50" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <ItemDetailModal 
        item={selectedItem} 
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
      />

      {itemToWin && (
        <LotSplitModal 
          isOpen={isLotSplitOpen}
          onClose={() => setIsLotSplitOpen(false)}
          onConfirm={confirmMarkWon}
          itemTitle={itemToWin.title}
        />
      )}
    </ViewContainer>
  );
};

export default BiddingView;
