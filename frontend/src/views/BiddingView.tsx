import { useState, useEffect, useMemo } from 'react';
import {
  Gavel, DollarSign, Trophy, TrendingUp, Target, Clock, ExternalLink,
  ChevronUp, EyeOff, Loader2, RefreshCcw, Search,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell,
} from 'recharts';
import {
  Button, KpiTile, DataTable, FilterBar, StatusBadge, ItemThumbnail, Money, Percent,
  GlassModal, GlassSurface, EmptyState, ChartThemeProvider, useChartTheme, ChartTooltip,
} from '../components/ui';
import type { Column, Density, FilterChip, StatusTone } from '../components/ui';
import { CountdownTimer } from '../components/CountdownTimer';
import { useToast } from '../components/shell/ToastProvider';
import { getHighResImageUrl, formatItemName, normalizeTags } from '../utils/formatters';

interface SampleListing {
  url?: string;
  title?: string;
  price?: number | string;
  condition?: string;
}

interface BidItem {
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
  images?: string[];
  auction_house_key: string;
  category?: string;
  tags?: any;
  current_bid_amount: number;
  user_bid_amount: number;
  user_proxy_bid?: number;
  user_bid_status: string;
  is_hidden_from_active?: boolean;
  shipping_cost_est?: number;
  valuation?: {
    est_market_value: number;
    max_bid_for_target_roi: number;
    target_roi_pct: number;
    sample_size?: number;
  };
  valuation_detail?: {
    avg_asking_price?: number;
    median_asking_price?: number;
    price_range_low?: number;
    price_range_high?: number;
    sample_listings?: SampleListing[];
  };
}

const AUCTION_HOUSES: Record<string, string> = {
  rol: 'Roller',
  rmeb: 'Whitley',
  public_surplus: 'Public Surplus',
  govdeals: 'GovDeals',
  dickensheet: 'Dickensheet',
};

// eBay net-of-fees factor (1 - 13.25% fee) and fixed $0.40 listing fee
const EBAY_NET_FACTOR = 1 - 0.1325; // 0.8675
const EBAY_FIXED_FEE = 0.4;

function isActive(item: BidItem): boolean {
  return !['won', 'lost'].includes(item.user_bid_status?.toLowerCase());
}

function computeProjectedProfit(item: BidItem): number | null {
  const ev = item.valuation?.est_market_value;
  if (!ev || ev <= 0) return null;
  const bid = item.user_bid_amount || 0;
  return ev * EBAY_NET_FACTOR - EBAY_FIXED_FEE - bid;
}

function computeRoi(item: BidItem): number | null {
  const profit = computeProjectedProfit(item);
  const bid = item.user_bid_amount;
  if (profit === null || !bid || bid <= 0) return null;
  return (profit / bid) * 100;
}

function statusTone(status: string): StatusTone {
  const s = (status ?? '').toLowerCase();
  if (s === 'winning') return 'profit';
  if (s === 'won') return 'accent';
  if (s === 'outbid' || s === 'outbid_near') return 'loss';
  if (s === 'lost') return 'subtle';
  return 'neutral';
}

export default function BiddingView() {
  const { success, error: toastError, info } = useToast();
  const [items, setItems] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [houseFilter, setHouseFilter] = useState<string>('');
  const [showHidden, setShowHidden] = useState(false);
  const [density, setDensity] = useState<Density>('cozy');
  const [selectedItem, setSelectedItem] = useState<BidItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const loadItems = async () => {
    try {
      const res = await fetch(`/api/bidding/?show_hidden=${showHidden}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items ?? []);
    } catch (e) {
      console.error(e);
      toastError('Failed to load bids');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHidden]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleHide = async (item: BidItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/bidding/${item.id}/hide`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      info('Hidden from active');
    } catch {
      loadItems();
      toastError('Could not hide item');
    }
  };

  const handleClaim = async (item: BidItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/bidding/${item.id}/claim`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      success('Item claimed → check Work Queue');
    } catch {
      loadItems();
      toastError('Claim failed');
    }
  };

  // ─── Filtering & search
  const filtered = useMemo(() => {
    let result = items;
    if (statusFilter) result = result.filter((i) => (i.user_bid_status ?? '').toLowerCase() === statusFilter);
    if (houseFilter) result = result.filter((i) => i.auction_house_key === houseFilter);
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
  }, [items, search, statusFilter, houseFilter]);

  // ─── KPIs
  const kpis = useMemo(() => {
    const active = items.filter(isActive);
    const winning = items.filter((i) => (i.user_bid_status ?? '').toLowerCase() === 'winning');

    const activeBids = active.length;
    const totalExposure = active.reduce((acc, i) => acc + (i.user_bid_amount || 0), 0);
    const currentlyWinning = winning.reduce((acc, i) => acc + (i.user_bid_amount || 0), 0);
    const projectedProfit = winning.reduce((acc, i) => acc + (computeProjectedProfit(i) ?? 0), 0);
    const weightedRoi = currentlyWinning > 0 ? (projectedProfit / currentlyWinning) * 100 : null;

    let nextEndIso: string | null = null;
    let nextEndMs = Infinity;
    for (const i of active) {
      if (!i.end_time) continue;
      const ms = new Date(i.end_time).getTime();
      if (!isNaN(ms) && ms > Date.now() && ms < nextEndMs) {
        nextEndMs = ms;
        nextEndIso = i.end_time;
      }
    }

    return { activeBids, totalExposure, currentlyWinning, projectedProfit, weightedRoi, nextEndIso };
  }, [items]);

  // ─── ROI histogram data (active items)
  const roiHistogram = useMemo(() => {
    const active = items.filter(isActive);
    const rois = active.map((i) => computeRoi(i)).filter((r): r is number => r !== null);
    if (rois.length === 0) return [];

    const min = Math.min(...rois);
    const max = Math.max(...rois);
    if (min === max) {
      return [{ label: `${min.toFixed(0)}%`, count: rois.length, midpoint: min }];
    }

    const buckets = 8;
    const step = (max - min) / buckets;
    const out: { label: string; count: number; midpoint: number }[] = [];
    for (let b = 0; b < buckets; b++) {
      const lo = min + step * b;
      const hi = b === buckets - 1 ? max + 1e-6 : min + step * (b + 1);
      const count = rois.filter((r) => r >= lo && r < hi).length;
      out.push({
        label: `${lo.toFixed(0)}%`,
        count,
        midpoint: (lo + hi) / 2,
      });
    }
    return out;
  }, [items]);

  // ─── Ending soonest (top 3 active)
  const endingSoonest = useMemo(() => {
    return items
      .filter(isActive)
      .filter((i) => !!i.end_time)
      .sort((a, b) => new Date(a.end_time!).getTime() - new Date(b.end_time!).getTime())
      .slice(0, 3);
  }, [items]);

  const filterChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = [];
    if (statusFilter) {
      chips.push({
        id: 'status',
        label: 'Status',
        value: statusFilter,
        onClear: () => setStatusFilter(''),
      });
    }
    if (houseFilter) {
      chips.push({
        id: 'house',
        label: 'Auction',
        value: AUCTION_HOUSES[houseFilter] ?? houseFilter,
        onClear: () => setHouseFilter(''),
      });
    }
    if (showHidden) {
      chips.push({ id: 'hidden', label: 'Show hidden', value: 'on', onClear: () => setShowHidden(false) });
    }
    return chips;
  }, [statusFilter, houseFilter, showHidden]);

  // ─── Table columns
  const columns: Column<BidItem>[] = [
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
        <div className="min-w-0 max-w-[360px]">
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
          </div>
        </div>
      ),
    },
    {
      id: 'auction',
      header: 'Auction',
      width: 110,
      cell: (item) => (
        <StatusBadge tone="neutral" size="xs">
          {AUCTION_HOUSES[item.auction_house_key] ?? item.auction_house_key}
        </StatusBadge>
      ),
    },
    {
      id: 'my_bid',
      header: 'My Bid',
      align: 'right',
      width: 100,
      sortable: true,
      sortAccessor: (i) => i.user_bid_amount ?? 0,
      cell: (item) => <Money value={item.user_bid_amount} size="sm" tone="neutral" />,
    },
    {
      id: 'current_bid',
      header: 'Current',
      align: 'right',
      width: 100,
      sortable: true,
      sortAccessor: (i) => i.current_bid_amount ?? 0,
      cell: (item) => {
        const isOutbid = (item.user_bid_status ?? '').toLowerCase() === 'outbid';
        return (
          <span
            className="tabular-nums text-[13px] whitespace-nowrap"
            style={{ color: isOutbid ? 'var(--color-fg-subtle)' : 'var(--color-fg)' }}
          >
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(item.current_bid_amount ?? 0)}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      width: 110,
      sortable: true,
      sortAccessor: (i) => i.user_bid_status ?? '',
      cell: (item) => {
        const s = (item.user_bid_status ?? '').toLowerCase();
        const tone = statusTone(s);
        const isWinning = s === 'winning';
        return (
          <StatusBadge tone={tone} size="xs" dot={isWinning} pulse={isWinning}>
            {s || 'unknown'}
          </StatusBadge>
        );
      },
    },
    {
      id: 'est_value',
      header: 'Est. Value',
      align: 'right',
      width: 100,
      sortable: true,
      sortAccessor: (i) => i.valuation?.est_market_value ?? 0,
      cell: (item) =>
        item.valuation?.est_market_value ? (
          <Money value={item.valuation.est_market_value} size="sm" tone="neutral" />
        ) : (
          <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
        ),
    },
    {
      id: 'projected_profit',
      header: 'Proj. Profit',
      align: 'right',
      width: 110,
      sortable: true,
      sortAccessor: (i) => computeProjectedProfit(i) ?? -1e9,
      cell: (item) => {
        const p = computeProjectedProfit(item);
        if (p === null) return <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>;
        return <Money value={p} size="sm" tone="auto" showSign />;
      },
    },
    {
      id: 'roi',
      header: 'ROI',
      align: 'right',
      width: 80,
      sortable: true,
      sortAccessor: (i) => computeRoi(i) ?? -1e9,
      cell: (item) => <Percent value={computeRoi(item)} />,
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
      width: 140,
      cell: (item) => {
        const s = (item.user_bid_status ?? '').toLowerCase();
        return (
          <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
            {s === 'won' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleClaim(item)}
              >
                Claim →
              </Button>
            ) : (
              <>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
                  title="Raise bid"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <ChevronUp size={14} strokeWidth={1.75} />
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
                  onClick={() => handleHide(item)}
                  className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
                  title="Hide from active"
                  style={{ color: 'var(--color-fg-muted)' }}
                >
                  <EyeOff size={14} strokeWidth={1.75} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ChartThemeProvider>
      <div className="flex flex-col gap-5">
        {/* KPI strip — 6 tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiTile
            label="Active Bids"
            value={kpis.activeBids.toLocaleString()}
            icon={<Gavel size={14} />}
            tone="accent"
            index={0}
          />
          <KpiTile
            label="Total Exposure"
            value={<Money value={kpis.totalExposure} size="lg" compact tone="neutral" />}
            icon={<DollarSign size={14} />}
            tone="neutral"
            index={1}
          />
          <KpiTile
            label="Currently Winning"
            value={<Money value={kpis.currentlyWinning} size="lg" compact tone="profit" />}
            icon={<Trophy size={14} />}
            tone="profit"
            index={2}
          />
          <KpiTile
            label="Projected Profit"
            value={
              <Money
                value={kpis.projectedProfit}
                size="lg"
                compact
                tone={kpis.projectedProfit >= 0 ? 'profit' : 'loss'}
                showSign
              />
            }
            icon={<TrendingUp size={14} />}
            tone={kpis.projectedProfit >= 0 ? 'profit' : 'loss'}
            index={3}
          />
          <KpiTile
            label="Weighted ROI"
            value={
              kpis.weightedRoi !== null ? (
                <Percent value={kpis.weightedRoi} />
              ) : (
                <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
              )
            }
            icon={<Target size={14} />}
            tone={kpis.weightedRoi !== null && kpis.weightedRoi >= 0 ? 'profit' : 'loss'}
            index={4}
          />
          <KpiTile
            label="Next Ends In"
            value={
              kpis.nextEndIso ? (
                <CountdownTimer endTime={kpis.nextEndIso} pill />
              ) : (
                <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
              )
            }
            icon={<Clock size={14} />}
            tone="pending"
            index={5}
          />
        </div>

        {/* Mid section — two columns on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-caps">Projected ROI Distribution</span>
              <span className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>
                Active bids
              </span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              {roiHistogram.length === 0 ? (
                <div
                  className="flex items-center justify-center h-full text-sm"
                  style={{ color: 'var(--color-fg-subtle)' }}
                >
                  Not enough data
                </div>
              ) : (
                <RoiHistogramChart data={roiHistogram} />
              )}
            </div>
          </GlassSurface>

          <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-caps">Ending Soonest</span>
              <span className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>
                Top 3 active
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {endingSoonest.length === 0 ? (
                <div className="text-sm py-4 text-center" style={{ color: 'var(--color-fg-subtle)' }}>
                  No active bids with end times
                </div>
              ) : (
                endingSoonest.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-[var(--color-surface-2)] focus-ring text-left"
                    style={{ border: '1px solid var(--color-border-hairline)' }}
                  >
                    <ItemThumbnail
                      src={getHighResImageUrl(item.image_url)}
                      alt={formatItemName(item)}
                      size={40}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--color-fg)' }}
                        title={formatItemName(item)}
                      >
                        {formatItemName(item)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Money value={item.current_bid_amount} size="xs" tone="neutral" />
                        <span style={{ color: 'var(--color-fg-subtle)' }}>·</span>
                        <CountdownTimer endTime={item.end_time} pill />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassSurface>
        </div>

        {/* Filter bar */}
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search title, brand, or lot #…"
          chips={filterChips}
          onClearAll={() => {
            setStatusFilter('');
            setHouseFilter('');
            setShowHidden(false);
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
                <span className="text-label-caps">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-w-[140px]"
                >
                  <option value="">All</option>
                  <option value="winning">Winning</option>
                  <option value="outbid">Outbid</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
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
                <span className="text-label-caps">Hidden</span>
                <label
                  className="flex items-center gap-2 px-3 h-9 rounded-md cursor-pointer"
                  style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border-hairline)' }}
                >
                  <input
                    type="checkbox"
                    checked={showHidden}
                    onChange={(e) => setShowHidden(e.target.checked)}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-fg)' }}>
                    Show hidden
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
          onRowClick={(item) => {
            setActiveImageIndex(0);
            setSelectedItem(item);
          }}
          defaultSort={{ columnId: 'ends', direction: 'asc' }}
          emptyState={
            <EmptyState
              icon={<Search size={20} />}
              title={search || filterChips.length ? 'No matches' : 'No active bids'}
              description={
                search || filterChips.length
                  ? `Try adjusting your filters.`
                  : 'Place a bid from Research or Watchlist to track exposure here.'
              }
            />
          }
        />

        {/* Detail modal */}
        <GlassModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          size="xl"
          title={selectedItem ? formatItemName(selectedItem) : ''}
          description={selectedItem?.lot_number ? `Lot #${selectedItem.lot_number}` : undefined}
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
                  Raise bid
                </Button>
              </>
            )
          }
        >
          {selectedItem && (
            <BidDetail
              item={selectedItem}
              activeImageIndex={activeImageIndex}
              onSelectImage={setActiveImageIndex}
            />
          )}
        </GlassModal>
      </div>
    </ChartThemeProvider>
  );
}

function RoiHistogramChart({
  data,
}: {
  data: { label: string; count: number; midpoint: number }[];
}) {
  const tokens = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={tokens.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          stroke={tokens.axis}
          tick={{ fill: tokens.axisLabel, fontSize: 11, fontFamily: tokens.font }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={tokens.axis}
          tick={{ fill: tokens.axisLabel, fontSize: 11, fontFamily: tokens.font }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <RechartsTooltip cursor={{ fill: tokens.grid }} content={<ChartTooltip />} />
        <Bar dataKey="count" name="Items" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.midpoint >= 0 ? tokens.profit : tokens.loss}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function BidDetail({
  item,
  activeImageIndex,
  onSelectImage,
}: {
  item: BidItem;
  activeImageIndex: number;
  onSelectImage: (i: number) => void;
}) {
  const tags = normalizeTags(item.tags);
  const profit = computeProjectedProfit(item);
  const roi = computeRoi(item);
  const status = (item.user_bid_status ?? '').toLowerCase();

  const images = (item.images && item.images.length > 0 ? item.images : [item.image_url]).filter(Boolean);
  const mainImage = images[activeImageIndex] ?? images[0];

  const samples = item.valuation_detail?.sample_listings ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Image gallery */}
      <div className="flex flex-col gap-2">
        <div
          className="aspect-[4/3] rounded-[var(--radius-md)] overflow-hidden"
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border-hairline)',
          }}
        >
          {mainImage ? (
            <img
              src={getHighResImageUrl(mainImage)}
              alt={formatItemName(item)}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--color-fg-subtle)' }}>
              No image available
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => onSelectImage(i)}
                className="shrink-0 rounded-[var(--radius-sm)] overflow-hidden focus-ring transition-all"
                style={{
                  width: 56,
                  height: 56,
                  border:
                    i === activeImageIndex
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-border-hairline)',
                  opacity: i === activeImageIndex ? 1 : 0.7,
                }}
                title={`Image ${i + 1}`}
              >
                <img src={getHighResImageUrl(src)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="accent" size="sm">
          {AUCTION_HOUSES[item.auction_house_key] ?? item.auction_house_key}
        </StatusBadge>
        {status && (
          <StatusBadge
            tone={statusTone(status)}
            size="sm"
            dot={status === 'winning'}
            pulse={status === 'winning'}
          >
            {status}
          </StatusBadge>
        )}
        {item.condition && <StatusBadge tone="neutral" size="sm">{item.condition}</StatusBadge>}
        {item.brand && <StatusBadge tone="subtle" size="sm">{item.brand}</StatusBadge>}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: valuation + bid history */}
        <div className="flex flex-col gap-4">
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
              <DetailStat label="My Bid" value={<Money value={item.user_bid_amount} size="lg" />} />
              <DetailStat label="Current" value={<Money value={item.current_bid_amount} size="lg" />} />
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
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 hairline-t">
              <DetailStat
                label="Projected Profit"
                value={
                  profit !== null ? (
                    <Money value={profit} size="lg" tone="auto" showSign />
                  ) : (
                    <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
                  )
                }
              />
              <DetailStat label="Projected ROI" value={<Percent value={roi} />} />
            </div>
            {item.user_proxy_bid !== undefined && item.user_proxy_bid > 0 && (
              <div className="flex items-center justify-between pt-3 hairline-t">
                <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                  Max proxy
                </span>
                <Money value={item.user_proxy_bid} size="sm" tone="accent" />
              </div>
            )}
          </GlassSurface>

          <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-2">
            <span className="text-label-caps">Bid History</span>
            <div className="text-sm py-4 text-center" style={{ color: 'var(--color-fg-subtle)' }}>
              Bid history coming soon
            </div>
          </GlassSurface>

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
        </div>

        {/* RIGHT: comparable listings */}
        <div className="flex flex-col gap-3">
          <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-caps">Comparable Listings</span>
              {samples.length > 0 && (
                <span className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>
                  Top {Math.min(5, samples.length)}
                </span>
              )}
            </div>
            {samples.length === 0 ? (
              <div className="text-sm py-4 text-center" style={{ color: 'var(--color-fg-subtle)' }}>
                No comparable listings available
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {samples.slice(0, 5).map((s, i) => {
                  const price = typeof s.price === 'string' ? parseFloat(s.price) : s.price ?? 0;
                  return (
                    <a
                      key={i}
                      href={s.url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
                      style={{ border: '1px solid var(--color-border-hairline)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-fg)' }}
                          title={s.title ?? ''}
                        >
                          {s.title ?? 'Untitled'}
                        </div>
                        {s.condition && (
                          <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>
                            {s.condition}
                          </div>
                        )}
                      </div>
                      <Money value={Number.isFinite(price) ? price : null} size="sm" tone="neutral" />
                    </a>
                  );
                })}
              </div>
            )}
            {item.valuation_detail && (samples.length > 0 || item.valuation_detail.avg_asking_price) && (
              <div className="grid grid-cols-2 gap-3 pt-3 hairline-t">
                <DetailStat
                  label="Avg Asking"
                  value={
                    item.valuation_detail.avg_asking_price ? (
                      <Money value={item.valuation_detail.avg_asking_price} size="md" />
                    ) : (
                      <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
                    )
                  }
                />
                <DetailStat
                  label="Median"
                  value={
                    item.valuation_detail.median_asking_price ? (
                      <Money value={item.valuation_detail.median_asking_price} size="md" />
                    ) : (
                      <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
                    )
                  }
                />
              </div>
            )}
          </GlassSurface>

          <GlassSurface tier={2} radius="md" padded="sm" className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              Time remaining
            </span>
            <CountdownTimer endTime={item.end_time} pill />
          </GlassSurface>
        </div>
      </div>
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
