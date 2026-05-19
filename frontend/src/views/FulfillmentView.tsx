import { useState, useEffect, useMemo } from 'react';
import {
  Package, Truck, CheckCircle2, Undo2, MapPin, PackageCheck, Loader2,
} from 'lucide-react';
import {
  Button, KpiTile, StatusBadge, ItemThumbnail, GlassSurface, EmptyState,
  TrackingTimeline,
} from '../components/ui';
import type { TrackingStage } from '../components/ui/TrackingTimeline';
import { useToast } from '../components/shell/ToastProvider';
import { formatItemName } from '../utils/formatters';

interface SoldOrder {
  id: number;
  ebay_order_id: string;
  title: string;
  buyer: string;
  storage_location?: string;
  packaging_config?: any;
  status: 'paid' | 'shipped' | 'returned';
  images?: string[];
  tracking_number?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  expected_delivery?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

function dimensionsLine(o: SoldOrder): string | null {
  const parts: string[] = [];
  if (o.length && o.width && o.height) {
    parts.push(`${o.length}" × ${o.width}" × ${o.height}"`);
  }
  if (o.weight) {
    parts.push(`${o.weight} oz`);
  }
  return parts.length ? parts.join(' · ') : null;
}

function deriveTrackingStage(o: SoldOrder): TrackingStage {
  if (!o.tracking_number) return 'label';
  if (o.expected_delivery) {
    const ms = new Date(o.expected_delivery).getTime() - Date.now();
    if (!isNaN(ms) && ms > 0 && ms <= 24 * 3600 * 1000) return 'out_for_delivery';
    if (!isNaN(ms) && ms <= 0) return 'delivered';
  }
  return 'transit';
}

export function FulfillmentView() {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<SoldOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/inventory/sold-queue');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.items ?? []);
    } catch (e) {
      console.error(e);
      toastError('Failed to load sold queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
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

  const handleMarkPacked = async (order: SoldOrder) => {
    const prevOrder = order;
    setBusy(order.id, true);
    // Optimistic update: flip status to 'shipped'.
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: 'shipped' as const } : o))
    );
    try {
      const res = await fetch(`/api/inventory/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      success('Marked packed');
    } catch (e) {
      console.error(e);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? prevOrder : o)));
      toastError('Could not update order');
    } finally {
      setBusy(order.id, false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const toShip = orders.filter((o) => o.status === 'paid').length;
    const inTransit = orders.filter((o) => {
      if (o.status !== 'shipped') return false;
      if (!o.expected_delivery) return true;
      const ms = new Date(o.expected_delivery).getTime() - Date.now();
      return isNaN(ms) || ms > 0;
    }).length;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const deliveredThisWeek = orders.filter((o) => {
      if (o.status !== 'shipped') return false;
      const shipped = o.shipped_at ? new Date(o.shipped_at).getTime() : 0;
      const expected = o.expected_delivery ? new Date(o.expected_delivery).getTime() : 0;
      return shipped >= weekAgo && expected > 0 && expected <= Date.now();
    }).length;
    const returns = orders.filter((o) => o.status === 'returned').length;
    return { toShip, inTransit, deliveredThisWeek, returns };
  }, [orders]);

  const paidOrders = useMemo(() => orders.filter((o) => o.status === 'paid'), [orders]);
  const shippedOrders = useMemo(() => orders.filter((o) => o.status === 'shipped'), [orders]);

  // Group paid orders by storage location
  const pickGroups = useMemo(() => {
    const map = new Map<string, SoldOrder[]>();
    for (const o of paidOrders) {
      const key = o.storage_location ?? 'Unassigned';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [paidOrders]);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="To Ship Today"
          value={kpis.toShip.toLocaleString()}
          icon={<Package size={14} />}
          tone="pending"
          index={0}
        />
        <KpiTile
          label="In Transit"
          value={kpis.inTransit.toLocaleString()}
          icon={<Truck size={14} />}
          tone="accent"
          index={1}
        />
        <KpiTile
          label="Delivered This Week"
          value={kpis.deliveredThisWeek.toLocaleString()}
          icon={<CheckCircle2 size={14} />}
          tone="profit"
          index={2}
        />
        <KpiTile
          label="Returns Pending"
          value={kpis.returns.toLocaleString()}
          icon={<Undo2 size={14} />}
          tone="loss"
          index={3}
        />
      </div>

      {/* Pick List */}
      <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck size={14} style={{ color: 'var(--color-pending)' }} />
            <span className="text-headline-sm" style={{ color: 'var(--color-fg)' }}>
              Pick List
            </span>
          </div>
          <StatusBadge tone="pending" size="xs">
            {paidOrders.length}
          </StatusBadge>
        </div>

        {loading ? (
          <SectionLoader />
        ) : paidOrders.length === 0 ? (
          <EmptyState
            icon={<Package size={20} />}
            title="No orders to pack"
            description="Paid orders awaiting fulfillment will appear here."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {pickGroups.map(([location, group]) => (
              <div key={location} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={11} style={{ color: 'var(--color-fg-muted)' }} />
                  <span className="text-label-caps">{location}</span>
                  <span
                    className="text-[11px] tabular-nums"
                    style={{ color: 'var(--color-fg-subtle)' }}
                  >
                    · {group.length}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {group.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-md"
                      style={{
                        background: 'var(--color-surface-1)',
                        border: '1px solid var(--color-border-hairline)',
                      }}
                    >
                      <ItemThumbnail src={order.images?.[0]} alt={order.title} size={40} />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-fg)' }}
                          title={formatItemName(order)}
                        >
                          {formatItemName(order)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[11px]"
                            style={{ color: 'var(--color-fg-muted)' }}
                          >
                            {order.buyer}
                          </span>
                          {dimensionsLine(order) && (
                            <span
                              className="text-[11px] tabular-nums"
                              style={{ color: 'var(--color-fg-subtle)' }}
                            >
                              · {dimensionsLine(order)}
                            </span>
                          )}
                          <span
                            className="text-[11px] font-mono"
                            style={{ color: 'var(--color-fg-subtle)' }}
                          >
                            · #{order.ebay_order_id}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={
                          busyIds.has(order.id) ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <PackageCheck size={13} />
                          )
                        }
                        onClick={() => handleMarkPacked(order)}
                        disabled={busyIds.has(order.id)}
                      >
                        Mark Packed
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </GlassSurface>

      {/* In Transit */}
      <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={14} style={{ color: 'var(--color-accent)' }} />
            <span className="text-headline-sm" style={{ color: 'var(--color-fg)' }}>
              In Transit
            </span>
          </div>
          <StatusBadge tone="accent" size="xs">
            {shippedOrders.length}
          </StatusBadge>
        </div>

        {loading ? (
          <SectionLoader />
        ) : shippedOrders.length === 0 ? (
          <EmptyState
            icon={<Truck size={20} />}
            title="No shipments in transit"
            description="Packages on the way will appear here with live tracking."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {shippedOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-3 px-4 py-3 rounded-md"
                style={{
                  background: 'var(--color-surface-1)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              >
                <div className="flex items-center gap-3">
                  <ItemThumbnail src={order.images?.[0]} alt={order.title} size={40} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--color-fg)' }}
                      title={formatItemName(order)}
                    >
                      {formatItemName(order)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[11px]"
                        style={{ color: 'var(--color-fg-muted)' }}
                      >
                        {order.buyer}
                      </span>
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: 'var(--color-fg-subtle)' }}
                      >
                        · #{order.ebay_order_id}
                      </span>
                    </div>
                  </div>
                </div>
                <TrackingTimeline
                  stage={deriveTrackingStage(order)}
                  carrier={order.shipping_carrier}
                  trackingNumber={order.tracking_number}
                  eta={order.expected_delivery}
                />
              </li>
            ))}
          </ul>
        )}
      </GlassSurface>
    </div>
  );
}

function SectionLoader() {
  return (
    <div
      className="flex items-center justify-center py-6 text-xs"
      style={{ color: 'var(--color-fg-subtle)' }}
    >
      <Loader2 size={14} className="animate-spin mr-2" />
      Loading…
    </div>
  );
}
