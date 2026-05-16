import React, { useState, useEffect } from 'react';
import './StoreView.css';
import { ViewContainer, ViewHeader } from '../components/layout/ViewLayout';
import { RefreshCw, LayoutPanelLeft, ListChecks, History, AlertCircle } from 'lucide-react';
import SellerDashboard from '../components/SellerDashboard';
import ReadyToListPane from '../components/ReadyToListPane';
import ActiveListingsPane from '../components/ActiveListingsPane';
import FulfillmentPane from '../components/FulfillmentPane';

type StoreTab = 'ready' | 'active' | 'sold' | 'returns';

const StoreView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StoreTab>('ready');
  const [stats, setStats] = useState({
    totalListed: 0,
    totalValue: 0,
    totalSoldQty: 0,
    totalSoldRev: 0,
    strPct: 0,
    avgDaysOnMarket: 0,
    unlistedInventoryValue: 0
  });
  const [readyItems, setReadyItems] = useState([]);
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const fetchData = async () => {
    try {
      const statsResp = await fetch('/api/ebay/dashboard-stats');
      if (statsResp.ok) {
        setStats(await statsResp.json());
      } else if (statsResp.status === 401) {
        setNeedsAuth(true);
      }

      // Fetch "Ready to List" items from Work Queue
      const readyResp = await fetch('/api/inventory/?status=READY_TO_LIST');
      if (readyResp.ok) {
        setReadyItems(await readyResp.json());
      }
      
      // Fetch Active Listings from eBay
      // This would normally be filtered/paginated
      const activeResp = await fetch('/api/ebay/sync/listings', { method: 'POST' });
      if (activeResp.ok) {
        const activeData = await activeResp.json();
        setActiveListings(activeData.listings || []);
      }
      // Note: In a real app, you wouldn't trigger sync on every view load, 
      // but for this prototype, we'll fetch our local synced copies.
    } catch (error) {
      console.error('Failed to fetch store data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/ebay/sync/listings', { method: 'POST' });
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectEbay = async () => {
    try {
      const response = await fetch('/api/ebay/auth-url');
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  const handleListToEbay = async (id: number, price: number) => {
    alert(`API Call: Listing Item ${id} for $${price}... (Stub for Phase 2 Implementation)`);
    // Implementation would move item from READY_TO_LIST -> listed
  };

  if (loading) return <div className="loading">Initializing store portal...</div>;

  return (
    <ViewContainer className="store-view">
      <ViewHeader 
        title="Selling Portal" 
        subtitle="Manage eBay inventory, pricing, and fulfillment."
        actions={
          <button 
            className={`action-btn outline ${syncing ? 'loading' : ''}`}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? <RefreshCw className="spinner" size={18}/> : <RefreshCw size={18} />} 
            Sync eBay Store
          </button>
        }
      />

      {needsAuth && (
        <div className="glass-panel p-8 bg-amber-500/10 border-amber-500/30 text-center mb-8">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">eBay Connection Required</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            To view active listings and store analytics, you must authorize this application with your eBay seller account.
          </p>
          <button className="action-btn primary mx-auto px-12" onClick={handleConnectEbay}>
            Connect eBay Account
          </button>
        </div>
      )}

      <SellerDashboard stats={stats} />

      <div className="flex gap-4 mb-6">
        <button 
          className={`tab-btn ${activeTab === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveTab('ready')}
        >
          <ListChecks size={18} /> Ready to List ({readyItems.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <LayoutPanelLeft size={18} /> Active Listings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sold' ? 'active' : ''}`}
          onClick={() => setActiveTab('sold')}
        >
          <History size={18} /> Fulfillment & History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'ready' && (
          <ReadyToListPane items={readyItems} onList={handleListToEbay} />
        )}
        {activeTab === 'active' && (
          <ActiveListingsPane listings={activeListings} onAction={() => {}} />
        )}
        {activeTab === 'sold' && (
          <FulfillmentPane 
            orders={activeListings.filter(l => l.status === 'sold') as any} 
            onShip={(id) => alert(`Ship Order ${id}`)} 
          />
        )}
      </div>
    </ViewContainer>
  );
};

export default StoreView;
