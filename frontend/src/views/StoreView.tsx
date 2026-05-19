import { useState, useEffect } from 'react';
import { RefreshCw, LayoutPanelLeft, ListChecks, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button, GlassSurface, KpiTile, EmptyState, StatusBadge, Money } from '../components/ui';
import SellerDashboard from '../components/SellerDashboard';
import ActiveListingsPane from '../components/ActiveListingsPane';
import { useToast } from '../components/shell/ToastProvider';

type StoreTab = 'ready' | 'active';

export default function StoreView() {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<StoreTab>('active');
  const [stats, setStats] = useState({
    totalListed: 0,
    totalValue: 0,
    totalSoldQty: 0,
    totalSoldRev: 0,
    strPct: 0,
    avgDaysOnMarket: 0,
    unlistedInventoryValue: 0,
  });
  const [readyItems, setReadyItems] = useState<any[]>([]);
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
      const readyResp = await fetch('/api/inventory/?status=READY_TO_LIST');
      if (readyResp.ok) {
        const d = await readyResp.json();
        setReadyItems(Array.isArray(d) ? d : d.items ?? []);
      }
      const activeResp = await fetch('/api/ebay/sync/listings', { method: 'POST' });
      if (activeResp.ok) {
        const d = await activeResp.json();
        setActiveListings(d.listings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/ebay/sync/listings', { method: 'POST' });
      if (res.ok) {
        success('eBay listings synced');
        await fetchData();
      } else {
        toastError('Sync failed');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectEbay = async () => {
    try {
      const res = await fetch('/api/ebay/auth-url');
      if (res.ok) {
        const { url } = await res.json();
        window.open(url, '_blank');
      }
    } catch {
      toastError('Could not start eBay OAuth');
    }
  };

  if (needsAuth) {
    return (
      <EmptyState
        icon={<AlertCircle size={20} />}
        title="Connect eBay"
        description="Sign in to your eBay seller account to view store performance and sync active listings."
        action={
          <Button variant="primary" leftIcon={<ExternalLink size={14} />} onClick={handleConnectEbay}>
            Connect eBay
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile
          label="Listed"
          value={stats.totalListed}
          tone="accent"
          icon={<ListChecks size={14} />}
          index={0}
        />
        <KpiTile
          label="Listed Value"
          value={<Money value={stats.totalValue} size="xl" compact />}
          tone="neutral"
          index={1}
        />
        <KpiTile
          label="Sold (qty)"
          value={stats.totalSoldQty}
          tone="profit"
          index={2}
        />
        <KpiTile
          label="Sold Revenue"
          value={<Money value={stats.totalSoldRev} size="xl" compact />}
          tone="profit"
          index={3}
        />
      </div>

      {/* Tabs + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="inline-flex items-center gap-0.5 p-0.5 rounded-md"
          style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-border-hairline)',
          }}
        >
          {(['active', 'ready'] as StoreTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-all focus-ring"
              style={{
                background: activeTab === t ? 'var(--color-surface-2)' : 'transparent',
                color: activeTab === t ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                boxShadow: activeTab === t ? 'var(--shadow-glass-sm)' : 'none',
              }}
            >
              {t === 'active' ? 'Active Listings' : 'Ready to List'}
              <span
                className="ml-2 text-[10px] tabular-nums px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'var(--color-surface-3)',
                  color: 'var(--color-fg-muted)',
                }}
              >
                {t === 'active' ? activeListings.length : readyItems.length}
              </span>
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          leftIcon={syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          onClick={handleSync}
          disabled={syncing}
        >
          Sync eBay
        </Button>
      </div>

      {/* Seller dashboard summary */}
      <GlassSurface tier={2} radius="md" padded="md">
        <SellerDashboard stats={stats} />
      </GlassSurface>

      {/* Content */}
      <GlassSurface tier={2} radius="md" padded="md">
        {activeTab === 'active' ? (
          activeListings.length === 0 ? (
            <EmptyState
              icon={<LayoutPanelLeft size={20} />}
              title="No active listings"
              description={loading ? 'Loading…' : 'Sync your eBay account to see active listings.'}
            />
          ) : (
            <ActiveListingsPane listings={activeListings} />
          )
        ) : readyItems.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={20} />}
            title="No items ready to list"
            description="Move items through the Work Queue to the LISTED stage to populate this view."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {readyItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-md"
                style={{
                  background: 'var(--color-surface-1)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              >
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--color-fg)' }}>
                  {item.title || `Item #${item.id}`}
                </span>
                <StatusBadge tone="insight">{item.status}</StatusBadge>
                <Money value={item.estimated_price} size="sm" />
              </div>
            ))}
          </div>
        )}
      </GlassSurface>
    </div>
  );
}
