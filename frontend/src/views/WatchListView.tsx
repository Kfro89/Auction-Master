import { useState, useEffect, useMemo } from 'react';
import {
  Star, ExternalLink, Archive, Gavel, DollarSign, TrendingUp, Clock,
  Loader2, RefreshCcw,
} from 'lucide-react';
import {
  Button, KpiTile, DataTable, FilterBar, StatusBadge, ItemThumbnail, Money, Percent,
  SlideOver, GlassSurface, EmptyState, ChartThemeProvider,
} from '../components/ui';
import type { Column, Density, FilterChip } from '../components/ui';
import { CountdownTimer } from '../components/CountdownTimer';
import { useToast } from '../components/shell/ToastProvider';
import { getHighResImageUrl, formatItemName, normalizeTags } from '../utils/formatters';

interface ResearchItem {
  id: number;
  title: string;
  product_name?: string;
  brand?: string;
  condition?: string;
  lot_number: string;
  current_bid: number;
  end_time: string | null;
  url: string;
  image_url: string;
  auction_house_key: string;
  category?: string;
  tags?: any;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    computed_at?: string;
    sample_size?: number;
  };
  is_watched?: boolean;
}

const AUCTION_HOUSES: Record<string, string> = {
  rol: 'Roller',
  rmeb: 'Whitley',
  public_surplus: 'Public Surplus',
  govdeals: 'GovDeals',
  dickensheet: 'Dickensheet',
};

function endsWithin(item: ResearchItem, hours: number): boolean {
  if (!item.end_time) return false;
  const ms = new Date(item.end_time).getTime() - Date.now();
  return ms > 0 && ms < hours * 3600 * 1000;
}

function calcRoi(item: ResearchItem): number | null {
  if (!item.valuation?.est_market_value || !item.current_bid) return null;
  const ebayFees = item.valuation.est_market_value * 0.1325 + 0.4;
  const netRevenue = item.valuation.est_market_value - ebayFees;
  return ((netRevenue - item.current_bid) / item.current_bid) * 100;
}

export default function WatchListView() {
  const { success, error: toastError, info } = useToast();
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState<string>('');
  const [endingSoonOnly, setEndingSoonOnly] = useState(false);
  const [density, setDensity] = useState<Density>('cozy');
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/research/watchlist');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: ResearchItem[] = Array.isArray(data) ? data : data.items ?? [];
      // Force is_watched=true since this endpoint returns only watched items
      setItems(list.map((i) => ({ ...i, is_watched: true })));
    } catch (e) {
      console.error(e);
      toastError('Failed to load watchlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleUnwatch = async (item: ResearchItem) => {
    // Optimistically remove from this view (since it shows only watched)
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/research/${item.id}/watch`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      success('Removed from watchlist');
    } catch {
      loadItems();
      toastError('Could not update watch status');
    }
  };

  const handleArchive = async (item: ResearchItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/research/${item.id}/archive`, { method: 'PATCH' });
      if (!res.ok) throw new Error('failed');
      info('Archived');
    } catch {
      loadItems();
      toastError('Archive failed');
    }
  };

  // ─── Filtering & search
  const filtered = useMemo(() => {
    let result = items;
    if (houseFilter) result = result.filter((i) => i.auction_house_key === houseFilter);
    if (endingSoonOnly) result = result.filter((i) => endsWithin(i, 24));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          (i.title?.toLowerCase().includes(q)) ||
          (i.product_name?.toLowerCase().includes(q)) ||
          (i.lot_number?.toLowerCase().includes(q)) ||
          (i.brand?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [items, search, houseFilter, endingSoonOnly]);

  // ─── KPIs
  const kpis = useMemo(() => {
    const count = items.length;
    const totalEstValue = items.reduce(
      (acc, i) => acc + (i.valuation?.est_market_value ?? 0),
      0
    );
    const withRoi = items.map(calcRoi).filter((r): r is number => r !== null);
    const avgRoi = withRoi.length ? withRoi.reduce((a, b) => a + b, 0) / withRoi.length : null;
    const endingSoon = items.filter((i) => endsWithin(i, 24)).length;
    return { count, totalEstValue, avgRoi, endingSoon };
  }, [items]);

  const filterChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = [];
    if (houseFilter) {
      chips.push({
        id: 'house',
        label: 'Auction',
        value: AUCTION_HOUSES[houseFilter] ?? houseFilter,
        onClear: () => setHouseFilter(''),
      });
    }
    if (endingSoonOnly) {
      chips.push({ id: 'ending', label: 'Ending', value: '< 24h', onClear: () => setEndingSoonOnly(false) });
    }
    return chips;
  }, [houseFilter, endingSoonOnly]);

  // ─── Table columns
  const columns: Column<ResearchItem>[] = [
    {
      id: 'thumb',
      header: '',
      width: 48,
      cell: (item) => (
        <ItemThumbnail src={getHighResImageUrl(item.image_url)} alt={formatItemName(item)} size={36} />
      ),
    },
    {
      id: 'item',
      header: 'Item',
      sortable: true,
      sortAccessor: (i) => i.title ?? '',
      cell: (item) => (
        <div className="min-w-0 max-w-[420px]">
          <div
            className="text-sm font-medium truncate"
            style={{ color: 'var(--color-fg)' }}
            title={formatItemName(item)}
          >
            {formatItemName(item)}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {item.brand && (
              <span className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>
                {item.brand}
              </span>
            )}
            <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-fg-subtle)' }}>
              #{item.lot_number}
            </span>
            {item.condition && (
              <StatusBadge tone="subtle" size="xs">
                {item.condition}
              </StatusBadge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'house',
      header: 'Auction',
      width: 110,
      cell: (item) => (
        <StatusBadge tone="neutral" size="xs">
          {AUCTION_HOUSES[item.auction_house_key] ?? item.auction_house_key}
        </StatusBadge>
      ),
    },
    {
      id: 'bid',
      header: 'Current Bid',
      align: 'right',
      width: 110,
      sortable: true,
      sortAccessor: (i) => i.current_bid,
      cell: (item) => <Money value={item.current_bid} size="sm" tone="neutral" />,
    },
    {
      id: 'value',
      header: 'Est. Value',
      align: 'right',
      width: 110,
      sortable: true,
      sortAccessor: (i) => i.valuation?.est_market_value ?? 0,
      cell: (item) =>
        item.valuation?.est_market_value ? (
          <div className="flex flex-col items-end gap-0.5">
            <Money value={item.valuation.est_market_value} size="sm" tone="neutral" />
            {item.valuation.sample_size !== undefined && (
              <span className="text-[10px]" style={{ color: 'var(--color-fg-subtle)' }}>
                n={item.valuation.sample_size}
              </span>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
        ),
    },
    {
      id: 'maxbid',
      header: 'Max Bid',
      align: 'right',
      width: 110,
      sortable: true,
      sortAccessor: (i) => i.valuation?.max_bid_for_target_roi ?? 0,
      cell: (item) =>
        item.valuation?.max_bid_for_target_roi ? (
          <Money value={item.valuation.max_bid_for_target_roi} size="sm" tone="accent" />
        ) : (
          <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
        ),
    },
    {
      id: 'roi',
      header: 'ROI',
      align: 'right',
      width: 90,
      sortable: true,
      sortAccessor: (i) => calcRoi(i) ?? -9999,
      cell: (item) => <Percent value={calcRoi(item)} />,
    },
    {
      id: 'ends',
      header: 'Ends',
      align: 'right',
      width: 110,
      sortable: true,
      sortAccessor: (i) => (i.end_time ? new Date(i.end_time).getTime() : Infinity),
      cell: (item) => <CountdownTimer endTime={item.end_time} pill />,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: 130,
      cell: (item) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleUnwatch(item)}
            className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
            title="Remove from watchlist"
            style={{ color: 'var(--color-pending)' }}
          >
            <Star size={14} fill="currentColor" strokeWidth={1.75} />
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
            title="Open auction page"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            <ExternalLink size={14} strokeWidth={1.75} />
          </a>
          <button
            onClick={() => handleArchive(item)}
            className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
            title="Archive"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            <Archive size={14} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ChartThemeProvider>
      <div className="flex flex-col gap-5">
        {/* KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiTile
            label="Watched Items"
            value={kpis.count.toLocaleString()}
            icon={<Star size={14} />}
            tone="accent"
            index={0}
          />
          <KpiTile
            label="Total Est. Value"
            value={<Money value={kpis.totalEstValue} size="xl" compact tone="profit" />}
            icon={<DollarSign size={14} />}
            tone="profit"
            index={1}
          />
          <KpiTile
            label="Avg ROI"
            value={kpis.avgRoi !== null ? `${kpis.avgRoi.toFixed(1)}%` : '—'}
            icon={<TrendingUp size={14} />}
            tone={(kpis.avgRoi ?? 0) >= 0 ? 'profit' : 'loss'}
            index={2}
          />
          <KpiTile
            label="Ending in < 24h"
            value={kpis.endingSoon}
            icon={<Clock size={14} />}
            tone="pending"
            index={3}
          />
        </div>

        {/* Filter bar */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search title, brand, or lot #…"
          chips={filterChips}
          onClearAll={() => {
            setHouseFilter('');
            setEndingSoonOnly(false);
          }}
          density={density}
          onDensityChange={setDensity}
          resultCount={filtered.length}
          totalCount={items.length}
          rightSlot={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </Button>
          }
          filtersSlot={
            <>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps">Auction</span>
                <select
                  value={houseFilter}
                  onChange={(e) => setHouseFilter(e.target.value)}
                  className="min-w-[160px]"
                >
                  <option value="">All</option>
                  {Object.entries(AUCTION_HOUSES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps">Ending</span>
                <label
                  className="flex items-center gap-2 px-3 h-9 rounded-md cursor-pointer"
                  style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-hairline)' }}
                >
                  <input
                    type="checkbox"
                    checked={endingSoonOnly}
                    onChange={(e) => setEndingSoonOnly(e.target.checked)}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-fg)' }}>
                    Within 24h
                  </span>
                </label>
              </div>
            </>
          }
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          keyField={(i) => i.id}
          loading={loading}
          density={density}
          onRowClick={(item) => setSelectedItem(item)}
          defaultSort={{ columnId: 'ends', direction: 'asc' }}
          emptyState={
            <EmptyState
              icon={<Star size={20} />}
              title={search || filterChips.length ? 'No matches' : 'No watched items'}
              description={
                search || filterChips.length
                  ? `Try adjusting your filters.`
                  : 'Star items from Research to track them here.'
              }
            />
          }
        />

        {/* Detail slide-over */}
        <SlideOver
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem ? formatItemName(selectedItem) : ''}
          description={selectedItem?.lot_number ? `Lot #${selectedItem.lot_number}` : undefined}
          width="520px"
          footer={
            selectedItem && (
              <>
                <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<ExternalLink size={13} />}
                  onClick={() => window.open(selectedItem.url, '_blank')}
                >
                  Open auction
                </Button>
                <Button variant="primary" leftIcon={<Gavel size={13} />}>
                  Place bid
                </Button>
              </>
            )
          }
        >
          {selectedItem && <WatchListDetail item={selectedItem} />}
        </SlideOver>
      </div>
    </ChartThemeProvider>
  );
}

function WatchListDetail({ item }: { item: ResearchItem }) {
  const tags = normalizeTags(item.tags);
  const roi = calcRoi(item);

  return (
    <div className="flex flex-col gap-5">
      {/* Image */}
      <div
        className="aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden"
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border-hairline)',
        }}
      >
        {item.image_url ? (
          <img
            src={getHighResImageUrl(item.image_url)}
            alt={formatItemName(item)}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-fg-subtle)' }}>
            No image available
          </div>
        )}
      </div>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="accent" size="sm">
          {AUCTION_HOUSES[item.auction_house_key] ?? item.auction_house_key}
        </StatusBadge>
        {item.condition && <StatusBadge tone="neutral" size="sm">{item.condition}</StatusBadge>}
        {item.brand && <StatusBadge tone="subtle" size="sm">{item.brand}</StatusBadge>}
        <StatusBadge tone="pending" size="sm" dot>
          Watched
        </StatusBadge>
      </div>

      {/* Valuation card */}
      <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-label-caps">Valuation</span>
          {item.valuation?.sample_size && (
            <span className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>
              Based on {item.valuation.sample_size} comps
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <DetailStat
            label="Current Bid"
            value={<Money value={item.current_bid} size="lg" />}
          />
          <DetailStat
            label="Est. Market"
            value={
              item.valuation?.est_market_value ? (
                <Money value={item.valuation.est_market_value} size="lg" />
              ) : (
                <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
              )
            }
          />
          <DetailStat
            label="Max Bid"
            value={
              item.valuation?.max_bid_for_target_roi ? (
                <Money value={item.valuation.max_bid_for_target_roi} size="lg" tone="accent" />
              ) : (
                <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
              )
            }
          />
        </div>
        {roi !== null && (
          <div className="flex items-center justify-between pt-3 hairline-t">
            <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              Projected ROI at current bid
            </span>
            <Percent value={roi} />
          </div>
        )}
      </GlassSurface>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-label-caps">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md"
                style={{
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-fg-muted)',
                }}
                title={t.fullTag}
              >
                {t.key ? <span className="opacity-60">{t.key}:</span> : null} {t.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Time remaining */}
      <GlassSurface tier={2} radius="md" padded="sm" className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
          Time remaining
        </span>
        <CountdownTimer endTime={item.end_time} pill />
      </GlassSurface>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-caps">{label}</span>
      <div>{value}</div>
    </div>
  );
}
