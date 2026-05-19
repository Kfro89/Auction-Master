import { useState, useEffect, useMemo, type ReactNode } from 'react';
import {
  Package, TrendingUp, Clock, AlertTriangle, MoreHorizontal,
  Check, ArrowRight, ArrowLeft, Wrench, Layout, Sparkles, Send,
  Truck, Save, Loader2, DollarSign, Boxes,
} from 'lucide-react';
import {
  Button, KpiTile, DataTable, FilterBar, StatusBadge, ItemThumbnail, Money,
  GlassSurface, GlassModal, EmptyState, StageStepper, INVENTORY_STAGES,
  nextStage, prevStage,
} from '../components/ui';
import type { Column, Density, StatusTone } from '../components/ui';
import type { InventoryStage } from '../components/ui';
import { useToast } from '../components/shell/ToastProvider';
import { formatItemName, getHighResImageUrl } from '../utils/formatters';

interface InventoryCostLineItem {
  id: number;
  label: string;
  amount: number;
  category: 'acquisition' | 'refurb' | 'packaging' | 'misc' | string;
  created_at: string;
}

interface InventoryParentLot {
  id: number;
  title: string;
  hammer_price: number;
  buyer_premium_pct: number;
  tax_rate: number;
  misc_fees: number;
}

interface InventoryItem {
  id: number;
  barcode?: string;
  title: string;
  product_name?: string;
  condition?: string;
  status: InventoryStage;
  buy_price?: number;
  estimated_price?: number;
  drafted_title?: string;
  drafted_description?: string;
  ebay_category_id?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_method?: 'vendor' | 'local';
  local_pickup_deadline?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  storage_location?: string;
  anti_tamper_tag?: string;
  qr_code_url?: string;
  image_url?: string;
  images?: string[];
  parent_lot_id?: number;
  parent_lot?: InventoryParentLot;
  cost_line_items?: InventoryCostLineItem[];
  packaging_config?: any;
  created_at: string;
  updated_at?: string;
}

const STAGE_TONE: Record<InventoryStage, StatusTone> = {
  WON: 'accent',
  PAID: 'profit',
  STAGING: 'pending',
  REFURBISH: 'pending',
  DRAFTING: 'insight',
  LISTED: 'insight',
  SOLD: 'profit',
};

const STAGE_LABEL: Record<InventoryStage, string> = {
  WON: 'Won',
  PAID: 'Paid',
  STAGING: 'Staging',
  REFURBISH: 'Refurb',
  DRAFTING: 'Drafting',
  LISTED: 'Listed',
  SOLD: 'Sold',
};

const CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL'];

const COST_CATEGORIES: { id: string; label: string }[] = [
  { id: 'acquisition', label: 'Acquisition' },
  { id: 'refurb', label: 'Refurb' },
  { id: 'packaging', label: 'Packaging' },
  { id: 'misc', label: 'Misc' },
];

function daysSince(iso?: string): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function ctaForStage(stage: InventoryStage): { label: string; icon: ReactNode } | null {
  switch (stage) {
    case 'WON': return { label: 'Mark Paid', icon: <Check size={13} /> };
    case 'PAID': return { label: 'Move to Staging', icon: <Layout size={13} /> };
    case 'STAGING': return { label: 'Send to Refurb', icon: <Wrench size={13} /> };
    case 'REFURBISH': return { label: 'Generate Draft', icon: <Sparkles size={13} /> };
    case 'DRAFTING': return { label: 'List Now', icon: <Send size={13} /> };
    case 'LISTED': return { label: 'Mark Sold', icon: <Check size={13} /> };
    case 'SOLD': return null;
  }
}

export default function WorkQueueView() {
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<InventoryStage | 'ALL'>('ALL');
  const [density, setDensity] = useState<Density>('cozy');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  const loadItems = async () => {
    try {
      const res = await fetch('/api/inventory/');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items ?? []);
    } catch (e) {
      console.error(e);
      toastError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setBusy = (id: number, busy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const applyOptimisticUpdate = (id: number, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setSelectedItem((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  };

  const replaceItem = (item: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    setSelectedItem((prev) => (prev?.id === item.id ? item : prev));
  };

  const handlePatch = async (id: number, patch: Partial<InventoryItem>, toastLabel?: string) => {
    const prevItem = items.find((i) => i.id === id);
    if (!prevItem) return;
    setBusy(id, true);
    applyOptimisticUpdate(id, patch);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      if (updated && typeof updated === 'object' && 'id' in updated) replaceItem(updated as InventoryItem);
      if (toastLabel) success(toastLabel);
    } catch (e) {
      console.error(e);
      // revert
      setItems((prev) => prev.map((i) => (i.id === id ? prevItem : i)));
      setSelectedItem((prev) => (prev?.id === id ? prevItem : prev));
      toastError('Update failed');
    } finally {
      setBusy(id, false);
    }
  };

  const handleAdvance = async (item: InventoryItem) => {
    const next = nextStage(item.status);
    if (!next) return;
    await handlePatch(item.id, { status: next }, `Advanced to ${STAGE_LABEL[next]}`);
  };

  const handleRegress = async (item: InventoryItem) => {
    const prev = prevStage(item.status);
    if (!prev) return;
    await handlePatch(item.id, { status: prev }, `Reverted to ${STAGE_LABEL[prev]}`);
  };

  const handleGenerateDraft = async (item: InventoryItem) => {
    setBusy(item.id, true);
    try {
      const res = await fetch(`/api/inventory/${item.id}/draft`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      if (updated && typeof updated === 'object' && 'id' in updated) {
        replaceItem(updated as InventoryItem);
      }
      // Advance to DRAFTING if not already.
      const after = (updated && 'status' in updated ? (updated as InventoryItem).status : item.status);
      if (after !== 'DRAFTING') {
        await handlePatch(item.id, { status: 'DRAFTING' });
      }
      success('Draft generated');
    } catch (e) {
      console.error(e);
      toastError('Draft generation failed');
    } finally {
      setBusy(item.id, false);
    }
  };

  const handleAutoPackage = async (item: InventoryItem) => {
    setBusy(item.id, true);
    try {
      const res = await fetch(`/api/inventory/${item.id}/auto-package`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && typeof data === 'object' && 'id' in data) {
        replaceItem(data as InventoryItem);
      } else {
        await loadItems();
      }
      success('Packaging suggested');
    } catch (e) {
      console.error(e);
      toastError('Auto-package failed');
    } finally {
      setBusy(item.id, false);
    }
  };

  const handleCtaClick = async (item: InventoryItem) => {
    if (item.status === 'REFURBISH') {
      await handleGenerateDraft(item);
      return;
    }
    await handleAdvance(item);
  };

  const handleAddCost = async (itemId: number, label: string, amount: number, category: string) => {
    try {
      const res = await fetch(`/api/inventory/${itemId}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, amount, category }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      // Response may be the cost array or updated item.
      if (Array.isArray(data)) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, cost_line_items: data } : i)));
        setSelectedItem((prev) => (prev?.id === itemId ? { ...prev, cost_line_items: data } : prev));
      } else if (data && typeof data === 'object' && 'id' in data && 'amount' in data) {
        // Single cost line item appended.
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? { ...i, cost_line_items: [...(i.cost_line_items ?? []), data as InventoryCostLineItem] }
              : i
          )
        );
        setSelectedItem((prev) =>
          prev?.id === itemId
            ? { ...prev, cost_line_items: [...(prev.cost_line_items ?? []), data as InventoryCostLineItem] }
            : prev
        );
      } else if (data && typeof data === 'object' && 'cost_line_items' in data) {
        replaceItem(data as InventoryItem);
      }
      success('Cost added');
    } catch (e) {
      console.error(e);
      toastError('Could not add cost');
    }
  };

  const handleDeleteCost = async (itemId: number, costId: number) => {
    const prevItem = items.find((i) => i.id === itemId);
    if (!prevItem) return;
    const optimistic = (prevItem.cost_line_items ?? []).filter((c) => c.id !== costId);
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, cost_line_items: optimistic } : i))
    );
    setSelectedItem((prev) =>
      prev?.id === itemId ? { ...prev, cost_line_items: optimistic } : prev
    );
    try {
      const res = await fetch(`/api/inventory/${itemId}/costs/${costId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('failed');
      success('Cost removed');
    } catch (e) {
      console.error(e);
      setItems((prev) => prev.map((i) => (i.id === itemId ? prevItem : i)));
      setSelectedItem((prev) => (prev?.id === itemId ? prevItem : prev));
      toastError('Could not remove cost');
    }
  };

  // ─── KPIs
  const kpis = useMemo(() => {
    const inQueue = items.filter((i) => i.status !== 'SOLD');
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const advancedThisWeek = items.filter((i) => {
      if (i.status === 'WON') return false;
      const ts = i.updated_at ? new Date(i.updated_at).getTime() : 0;
      return ts >= weekAgo;
    }).length;
    const ages = inQueue.map((i) => daysSince(i.updated_at ?? i.created_at));
    const avgDays = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    const oldest = ages.length ? Math.max(...ages) : 0;
    return {
      inQueue: inQueue.length,
      advancedThisWeek,
      avgDays,
      oldest,
    };
  }, [items]);

  // ─── Filtering
  const filtered = useMemo(() => {
    let result = items;
    if (stageFilter !== 'ALL') {
      result = result.filter((i) => i.status === stageFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.product_name?.toLowerCase().includes(q) ||
          i.barcode?.toLowerCase().includes(q) ||
          i.storage_location?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, search, stageFilter]);

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = { ALL: items.length };
    for (const s of INVENTORY_STAGES) map[s] = 0;
    for (const i of items) {
      if (map[i.status] !== undefined) map[i.status]++;
    }
    return map;
  }, [items]);

  // ─── Columns
  const columns: Column<InventoryItem>[] = [
    {
      id: 'thumb',
      header: '',
      width: 56,
      cell: (item) => (
        <ItemThumbnail
          src={item.image_url ? getHighResImageUrl(item.image_url) : item.images?.[0]}
          alt={formatItemName(item)}
          size={40}
        />
      ),
    },
    {
      id: 'item',
      header: 'Item',
      sortable: true,
      sortAccessor: (i) => i.title ?? '',
      cell: (item) => (
        <div className="min-w-0 max-w-[400px]">
          <div
            className="text-sm font-medium truncate"
            style={{ color: 'var(--color-fg)' }}
            title={formatItemName(item)}
          >
            {formatItemName(item)}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {item.product_name && item.product_name !== item.title && (
              <span
                className="text-[11px] truncate max-w-[200px]"
                style={{ color: 'var(--color-fg-muted)' }}
              >
                {item.product_name}
              </span>
            )}
            {item.barcode && (
              <span
                className="text-[11px] font-mono tabular-nums"
                style={{ color: 'var(--color-fg-subtle)' }}
              >
                {item.barcode}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 100,
      cell: (item) => (
        <StatusBadge tone={STAGE_TONE[item.status]} size="xs" dot>
          {STAGE_LABEL[item.status]}
        </StatusBadge>
      ),
    },
    {
      id: 'storage',
      header: 'Storage',
      width: 120,
      cell: (item) =>
        item.storage_location ? (
          <span className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>
            {item.storage_location}
          </span>
        ) : (
          <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
        ),
    },
    {
      id: 'days_in_stage',
      header: 'Age',
      width: 70,
      align: 'right',
      sortable: true,
      sortAccessor: (i) => daysSince(i.updated_at ?? i.created_at),
      cell: (item) => (
        <span
          className="text-xs tabular-nums"
          style={{ color: 'var(--color-fg-muted)' }}
        >
          {daysSince(item.updated_at ?? item.created_at)}d
        </span>
      ),
    },
    {
      id: 'progress',
      header: 'Progress',
      width: 150,
      cell: (item) => <StageStepper current={item.status} compact />,
    },
    {
      id: 'cta',
      header: '',
      width: 170,
      align: 'right',
      cell: (item) => {
        if (item.status === 'SOLD') {
          return (
            <StatusBadge tone="subtle" size="xs">
              Done
            </StatusBadge>
          );
        }
        const cta = ctaForStage(item.status);
        if (!cta) return null;
        const isBusy = busyIds.has(item.id);
        return (
          <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              leftIcon={isBusy ? <Loader2 size={13} className="animate-spin" /> : cta.icon}
              onClick={() => handleCtaClick(item)}
              disabled={isBusy}
            >
              {cta.label}
            </Button>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      width: 44,
      align: 'right',
      cell: (item) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <button
            onClick={() => setSelectedItem(item)}
            className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
            title="Details"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="In Queue"
          value={kpis.inQueue.toLocaleString()}
          icon={<Package size={14} />}
          tone="accent"
          index={0}
        />
        <KpiTile
          label="Advanced This Week"
          value={kpis.advancedThisWeek.toLocaleString()}
          icon={<TrendingUp size={14} />}
          tone="profit"
          index={1}
        />
        <KpiTile
          label="Avg Days in Stage"
          value={`${kpis.avgDays.toFixed(1)} d`}
          icon={<Clock size={14} />}
          tone="neutral"
          index={2}
        />
        <KpiTile
          label="Oldest Item Age"
          value={`${kpis.oldest} d`}
          icon={<AlertTriangle size={14} />}
          tone="pending"
          index={3}
        />
      </div>

      {/* Stage filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <StageChip
          label="All"
          count={stageCounts.ALL ?? 0}
          active={stageFilter === 'ALL'}
          onClick={() => setStageFilter('ALL')}
        />
        {INVENTORY_STAGES.map((s) => (
          <StageChip
            key={s}
            label={STAGE_LABEL[s]}
            count={stageCounts[s] ?? 0}
            active={stageFilter === s}
            onClick={() => setStageFilter(s)}
          />
        ))}
      </div>

      {/* Filter bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search title, barcode, storage…"
        density={density}
        onDensityChange={setDensity}
        resultCount={filtered.length}
        totalCount={items.length}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyField={(i) => i.id}
        loading={loading}
        density={density}
        onRowClick={(item) => setSelectedItem(item)}
        defaultSort={{ columnId: 'days_in_stage', direction: 'desc' }}
        emptyState={
          <EmptyState
            icon={<Package size={20} />}
            title={search || stageFilter !== 'ALL' ? 'No matches' : 'Work queue is empty'}
            description={
              search || stageFilter !== 'ALL'
                ? 'Try adjusting your filters.'
                : 'Items won at auction will appear here as they move through the pipeline.'
            }
          />
        }
      />

      {/* Detail modal */}
      <GlassModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        size="2xl"
        title={selectedItem ? formatItemName(selectedItem) : undefined}
        description={selectedItem?.barcode ?? undefined}
        footer={
          selectedItem && (
            <>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft size={13} />}
                onClick={() => handleRegress(selectedItem)}
                disabled={!prevStage(selectedItem.status) || busyIds.has(selectedItem.id)}
              >
                Regress to {prevStage(selectedItem.status) ? STAGE_LABEL[prevStage(selectedItem.status)!] : '—'}
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight size={13} />}
                onClick={() => handleAdvance(selectedItem)}
                disabled={!nextStage(selectedItem.status) || busyIds.has(selectedItem.id)}
              >
                Advance to {nextStage(selectedItem.status) ? STAGE_LABEL[nextStage(selectedItem.status)!] : 'Done'}
              </Button>
            </>
          )
        }
      >
        {selectedItem && (
          <WorkQueueDetail
            item={selectedItem}
            busy={busyIds.has(selectedItem.id)}
            onPatch={(patch, toastLabel) => handlePatch(selectedItem.id, patch, toastLabel)}
            onAutoPackage={() => handleAutoPackage(selectedItem)}
            onAddCost={(label, amount, category) =>
              handleAddCost(selectedItem.id, label, amount, category)
            }
            onDeleteCost={(costId) => handleDeleteCost(selectedItem.id, costId)}
          />
        )}
      </GlassModal>
    </div>
  );
}

function StageChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-medium transition-colors focus-ring"
      style={{
        background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-1)',
        color: active ? 'var(--color-accent)' : 'var(--color-fg-muted)',
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border-hairline)'}`,
      }}
    >
      <span>{label}</span>
      <span
        className="px-1.5 rounded-full text-[10px] font-bold tabular-nums"
        style={{
          background: active ? 'var(--color-accent)' : 'var(--color-surface-2)',
          color: active ? 'var(--color-fg-onaccent)' : 'var(--color-fg-muted)',
        }}
      >
        {count}
      </span>
    </button>
  );
}

interface WorkQueueDetailProps {
  item: InventoryItem;
  busy: boolean;
  onPatch: (patch: Partial<InventoryItem>, toastLabel?: string) => Promise<void>;
  onAutoPackage: () => Promise<void>;
  onAddCost: (label: string, amount: number, category: string) => Promise<void>;
  onDeleteCost: (costId: number) => Promise<void>;
}

function WorkQueueDetail({
  item,
  busy,
  onPatch,
  onAutoPackage,
  onAddCost,
  onDeleteCost,
}: WorkQueueDetailProps) {
  const [weight, setWeight] = useState<string>(item.weight?.toString() ?? '');
  const [length, setLength] = useState<string>(item.length?.toString() ?? '');
  const [width, setWidth] = useState<string>(item.width?.toString() ?? '');
  const [height, setHeight] = useState<string>(item.height?.toString() ?? '');
  const [storage, setStorage] = useState<string>(item.storage_location ?? '');
  const [carrier, setCarrier] = useState<string>(item.shipping_carrier ?? '');
  const [trackingNumber, setTrackingNumber] = useState<string>(item.tracking_number ?? '');
  const [costLabel, setCostLabel] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [costCategory, setCostCategory] = useState('misc');

  useEffect(() => {
    setWeight(item.weight?.toString() ?? '');
    setLength(item.length?.toString() ?? '');
    setWidth(item.width?.toString() ?? '');
    setHeight(item.height?.toString() ?? '');
    setStorage(item.storage_location ?? '');
    setCarrier(item.shipping_carrier ?? '');
    setTrackingNumber(item.tracking_number ?? '');
  }, [item.id, item.weight, item.length, item.width, item.height, item.storage_location, item.shipping_carrier, item.tracking_number]);

  const imageSrc =
    item.images?.[0] ?? (item.image_url ? getHighResImageUrl(item.image_url) : undefined);

  const costs = item.cost_line_items ?? [];
  const totalCost = costs.reduce((s, c) => s + c.amount, 0);

  const saveDimensions = () => {
    onPatch(
      {
        weight: weight === '' ? undefined : parseFloat(weight) || 0,
        length: length === '' ? undefined : parseFloat(length) || 0,
        width: width === '' ? undefined : parseFloat(width) || 0,
        height: height === '' ? undefined : parseFloat(height) || 0,
        storage_location: storage || undefined,
      },
      'Saved'
    );
  };

  const saveTracking = () => {
    onPatch(
      {
        shipping_carrier: carrier || undefined,
        tracking_number: trackingNumber || undefined,
      },
      'Tracking saved'
    );
  };

  const submitCost = () => {
    const amount = parseFloat(costAmount);
    if (!costLabel || isNaN(amount)) return;
    onAddCost(costLabel, amount, costCategory);
    setCostLabel('');
    setCostAmount('');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Status + stepper strip */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={STAGE_TONE[item.status]} size="sm" dot>
            {STAGE_LABEL[item.status]}
          </StatusBadge>
          {item.condition && (
            <StatusBadge tone="subtle" size="sm">
              {item.condition}
            </StatusBadge>
          )}
          {item.storage_location && (
            <StatusBadge tone="neutral" size="sm">
              {item.storage_location}
            </StatusBadge>
          )}
        </div>
        <GlassSurface tier={2} radius="md" padded="md">
          <StageStepper current={item.status} />
        </GlassSurface>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LEFT column */}
        <div className="flex flex-col gap-5">
          {/* Image */}
          <div
            className="aspect-square rounded-[var(--radius-md)] overflow-hidden"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-hairline)',
            }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={formatItemName(item)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ color: 'var(--color-fg-subtle)' }}
              >
                No image
              </div>
            )}
          </div>

          {/* Dimensions */}
          <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-caps">Dimensions & Storage</span>
              <Button variant="ghost" size="sm" onClick={saveDimensions} disabled={busy}>
                <Save size={12} className="mr-1" /> Save
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DetailInput
                label="Weight (oz)"
                value={weight}
                onChange={setWeight}
                type="number"
                placeholder="0.0"
              />
              <DetailInput
                label="Length (in)"
                value={length}
                onChange={setLength}
                type="number"
                placeholder="0.0"
              />
              <DetailInput
                label="Width (in)"
                value={width}
                onChange={setWidth}
                type="number"
                placeholder="0.0"
              />
              <DetailInput
                label="Height (in)"
                value={height}
                onChange={setHeight}
                type="number"
                placeholder="0.0"
              />
            </div>
            <DetailInput
              label="Storage Location"
              value={storage}
              onChange={setStorage}
              placeholder="e.g. Bin 12A"
            />
            <Button
              variant="secondary"
              size="sm"
              leftIcon={busy ? <Loader2 size={13} className="animate-spin" /> : <Boxes size={13} />}
              onClick={onAutoPackage}
              disabled={busy}
            >
              Auto-Package
            </Button>
            {item.packaging_config && (
              <div
                className="rounded-md px-3 py-2 text-xs"
                style={{
                  background: 'var(--color-accent-soft)',
                  color: 'var(--color-accent)',
                }}
              >
                <span className="font-semibold">
                  {(item.packaging_config?.name as string) ?? 'Packaging selected'}
                </span>
                {item.packaging_config?.dimensions && (
                  <span className="ml-2" style={{ color: 'var(--color-fg-muted)' }}>
                    {String(item.packaging_config.dimensions)}
                  </span>
                )}
              </div>
            )}
          </GlassSurface>
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-5">
          {/* Cost ledger */}
          <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-caps flex items-center gap-1.5">
                <DollarSign size={11} /> Cost Ledger
              </span>
              <Money value={totalCost} size="sm" tone="accent" />
            </div>
            {costs.length === 0 ? (
              <div
                className="text-xs py-3 text-center rounded-md"
                style={{
                  color: 'var(--color-fg-subtle)',
                  background: 'var(--color-surface-1)',
                  border: '1px dashed var(--color-border-hairline)',
                }}
              >
                No costs recorded yet
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {costs.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md"
                    style={{
                      background: 'var(--color-surface-1)',
                      border: '1px solid var(--color-border-hairline)',
                    }}
                  >
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: 'var(--color-fg)' }}
                      >
                        {c.label}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-wide"
                        style={{ color: 'var(--color-fg-subtle)' }}
                      >
                        {c.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Money value={c.amount} size="sm" tone="neutral" />
                      <button
                        onClick={() => onDeleteCost(c.id)}
                        className="text-[11px] underline-offset-2 hover:underline"
                        style={{ color: 'var(--color-fg-subtle)' }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Add cost form */}
            <div className="grid grid-cols-[1fr_100px_120px_auto] gap-2 pt-2 hairline-t">
              <input
                type="text"
                value={costLabel}
                onChange={(e) => setCostLabel(e.target.value)}
                placeholder="Description"
                className="px-2 h-8 rounded-md text-xs"
                style={{
                  background: 'var(--color-surface-1)',
                  color: 'var(--color-fg)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              />
              <input
                type="number"
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                placeholder="0.00"
                className="px-2 h-8 rounded-md text-xs tabular-nums"
                style={{
                  background: 'var(--color-surface-1)',
                  color: 'var(--color-fg)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              />
              <select
                value={costCategory}
                onChange={(e) => setCostCategory(e.target.value)}
                className="px-2 h-8 rounded-md text-xs"
                style={{
                  background: 'var(--color-surface-1)',
                  color: 'var(--color-fg)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              >
                {COST_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                size="sm"
                onClick={submitCost}
                disabled={!costLabel || !costAmount}
              >
                Add
              </Button>
            </div>
          </GlassSurface>

          {/* Tracking */}
          <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label-caps flex items-center gap-1.5">
                <Truck size={11} /> Shipping & Tracking
              </span>
              <Button variant="ghost" size="sm" onClick={saveTracking} disabled={busy}>
                <Save size={12} className="mr-1" /> Save
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-label-caps">Carrier</span>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="px-2 h-9 rounded-md text-xs"
                  style={{
                    background: 'var(--color-surface-1)',
                    color: 'var(--color-fg)',
                    border: '1px solid var(--color-border-hairline)',
                  }}
                >
                  <option value="">—</option>
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <DetailInput
                label="Tracking #"
                value={trackingNumber}
                onChange={setTrackingNumber}
                placeholder="1Z…"
              />
            </div>
          </GlassSurface>

          {/* Drafted listing preview */}
          {item.drafted_title && (
            <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-2">
              <span className="text-label-caps flex items-center gap-1.5">
                <Sparkles size={11} /> Drafted Listing
              </span>
              <div className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
                {item.drafted_title}
              </div>
              {item.drafted_description && (
                <p
                  className="text-xs leading-relaxed line-clamp-4"
                  style={{ color: 'var(--color-fg-muted)' }}
                >
                  {item.drafted_description}
                </p>
              )}
            </GlassSurface>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-caps">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-2 h-9 rounded-md text-xs tabular-nums"
        style={{
          background: 'var(--color-surface-1)',
          color: 'var(--color-fg)',
          border: '1px solid var(--color-border-hairline)',
        }}
      />
    </div>
  );
}
