/**
 * Manual visual verification harness for the new design system.
 * Hidden route — not wired into AppShell navigation by default.
 * Open via the browser URL after wiring temporarily, or import for tests.
 * Safe to delete once Phase 6 cleanup completes.
 */
import { useState } from 'react';
import {
  Sparkles, Clock, TrendingUp, DollarSign, Package,
  Plus, Star, ExternalLink,
} from 'lucide-react';
import {
  Button, GlassSurface, KpiTile, DataTable, FilterBar, StatusBadge,
  GlassModal, SlideOver, Money, Percent, ItemThumbnail, Skeleton, EmptyState,
  ChartThemeProvider, Sparkline, Sparkbar, GaugeRing, StageStepper, TrackingTimeline,
} from '../components/ui';
import { CountdownTimer } from '../components/CountdownTimer';
import type { Column } from '../components/ui';

const SPARK_DATA = [12, 19, 14, 22, 28, 24, 31, 29, 36, 33, 41, 38, 45];

export default function _DesignDemoView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [slideOpen, setSlideOpen] = useState(false);

  const sampleRows = [
    { id: 1, name: 'Vintage Rolex Submariner', price: 8400, roi: 42.5, status: 'winning' as const },
    { id: 2, name: 'MacBook Pro 16" M3 Max', price: 2890, roi: 28.4, status: 'outbid' as const },
    { id: 3, name: 'Hermès Birkin 30 Togo', price: 12500, roi: 55.1, status: 'won' as const },
    { id: 4, name: 'Sony A7 IV Body', price: 1820, roi: -3.2, status: 'lost' as const },
  ];
  const cols: Column<(typeof sampleRows)[number]>[] = [
    { id: 'name', header: 'Item', cell: (r) => <span className="text-sm font-medium">{r.name}</span> },
    { id: 'price', header: 'Price', align: 'right', sortable: true, sortAccessor: (r) => r.price, cell: (r) => <Money value={r.price} size="sm" /> },
    { id: 'roi', header: 'ROI', align: 'right', sortable: true, sortAccessor: (r) => r.roi, cell: (r) => <Percent value={r.roi} /> },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} dot pulse={r.status === 'winning'} /> },
  ];

  return (
    <ChartThemeProvider>
      <div className="flex flex-col gap-8 pb-12">
        <Section title="KPI Tiles">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiTile label="Tracked Items" value="248" delta={12.4} sparkData={SPARK_DATA} icon={<Sparkles size={14} />} tone="accent" index={0} />
            <KpiTile label="Total Exposure" value={<Money value={48230} size="xl" compact />} delta={-3.2} icon={<DollarSign size={14} />} tone="profit" index={1} />
            <KpiTile label="Avg ROI" value="34.2%" delta={5.7} icon={<TrendingUp size={14} />} tone="profit" index={2} />
            <KpiTile label="Ending < 24h" value="17" icon={<Clock size={14} />} tone="pending" index={3} />
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" leftIcon={<Plus size={13} />}>With Icon</Button>
            <Button variant="secondary" isLoading>Loading</Button>
          </div>
        </Section>

        <Section title="Status Badges">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="profit" dot>Winning</StatusBadge>
            <StatusBadge tone="profit" dot pulse>Live · Winning</StatusBadge>
            <StatusBadge tone="loss" dot>Outbid</StatusBadge>
            <StatusBadge tone="accent" dot>Won</StatusBadge>
            <StatusBadge tone="pending">Pending</StatusBadge>
            <StatusBadge tone="insight">AI Pick</StatusBadge>
            <StatusBadge tone="neutral">Neutral</StatusBadge>
            <StatusBadge tone="subtle">Subtle</StatusBadge>
          </div>
        </Section>

        <Section title="Money & Percent">
          <div className="flex flex-wrap items-end gap-4">
            <Money value={1234.56} size="xl" />
            <Money value={-892.10} size="lg" tone="auto" />
            <Money value={5_420_390} size="md" compact />
            <Money value={null} size="md" />
            <Percent value={42.5} />
            <Percent value={-3.2} />
            <Percent value={0} />
          </div>
        </Section>

        <Section title="Sparklines & Gauges">
          <div className="flex flex-wrap items-center gap-6">
            <Sparkline data={SPARK_DATA} width={120} height={40} />
            <Sparkbar data={SPARK_DATA} width={120} height={40} />
            <GaugeRing value={68} label="ROI" />
            <GaugeRing value={92} color="var(--color-profit)" label="Conf" />
            <GaugeRing value={31} color="var(--color-pending)" label="Risk" />
          </div>
        </Section>

        <Section title="Stage Stepper">
          <GlassSurface tier={2} padded="md" radius="md">
            <StageStepper current="REFURBISH" />
          </GlassSurface>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Compact: </span>
            <StageStepper current="DRAFTING" compact />
          </div>
        </Section>

        <Section title="Tracking Timeline">
          <GlassSurface tier={2} padded="md" radius="md">
            <TrackingTimeline
              stage="out_for_delivery"
              carrier="UPS"
              trackingNumber="1Z 999 AA1 01 2345 6784"
              lastUpdate="2 hours ago · Denver, CO"
              eta="Today by 7:00 PM"
            />
          </GlassSurface>
          <div className="mt-3">
            <TrackingTimeline stage="transit" carrier="FedEx" compact />
          </div>
        </Section>

        <Section title="Countdown Timer">
          <div className="flex flex-wrap items-center gap-3">
            <CountdownTimer endTime={new Date(Date.now() + 5_000).toISOString()} pill />
            <CountdownTimer endTime={new Date(Date.now() + 60_000 * 30).toISOString()} pill />
            <CountdownTimer endTime={new Date(Date.now() + 3600_000 * 5).toISOString()} pill />
            <CountdownTimer endTime={new Date(Date.now() + 86400_000 * 3).toISOString()} pill />
          </div>
        </Section>

        <Section title="Item Thumbnails">
          <div className="flex flex-wrap items-center gap-3">
            <ItemThumbnail src="https://picsum.photos/seed/a/120" size={40} />
            <ItemThumbnail src="https://picsum.photos/seed/b/120" size={56} rounded="lg" />
            <ItemThumbnail src={null} size={40} />
            <ItemThumbnail src="https://broken.example.com/img.jpg" size={40} />
          </div>
        </Section>

        <Section title="Skeleton & Empty State">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassSurface tier={2} padded="md" radius="md" className="flex flex-col gap-2">
              <Skeleton height={18} width="40%" />
              <Skeleton height={14} width="80%" />
              <Skeleton height={14} width="65%" />
              <Skeleton height={14} width="50%" />
            </GlassSurface>
            <EmptyState
              icon={<Package size={20} />}
              title="No items yet"
              description="Start tracking items from your auction sources to populate this view."
              action={<Button variant="primary" leftIcon={<Plus size={13} />}>Add source</Button>}
            />
          </div>
        </Section>

        <Section title="DataTable">
          <FilterBar
            searchValue=""
            onSearchChange={() => {}}
            resultCount={4}
            totalCount={120}
            chips={[{ id: '1', label: 'Status', value: 'Winning', onClear: () => {} }]}
            onClearAll={() => {}}
          />
          <DataTable
            columns={cols}
            data={sampleRows}
            keyField={(r) => r.id}
            onRowClick={() => setSlideOpen(true)}
            density="cozy"
          />
        </Section>

        <Section title="Modals">
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="secondary" onClick={() => setSlideOpen(true)}>Open SlideOver</Button>
          </div>
        </Section>

        <GlassModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          size="lg"
          title="Confirm Action"
          description="This is a glass modal at tier 3 with the standard backdrop, motion, and focus trap."
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm</Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>
              Modal body. Use any layout primitives inside. Backdrop click closes, ESC closes, focus is trapped.
            </p>
            <GlassSurface tier={2} padded="sm" radius="sm">
              <div className="text-sm">A nested glass surface for emphasis.</div>
            </GlassSurface>
          </div>
        </GlassModal>

        <SlideOver
          isOpen={slideOpen}
          onClose={() => setSlideOpen(false)}
          title="Item Detail"
          description="Slide-over right panel"
          footer={
            <>
              <Button variant="ghost" onClick={() => setSlideOpen(false)}>Close</Button>
              <Button variant="secondary" leftIcon={<ExternalLink size={13} />}>Open</Button>
              <Button variant="primary" leftIcon={<Star size={13} />}>Watch</Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <ItemThumbnail src="https://picsum.photos/seed/detail/600/400" size={240} rounded="lg" />
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Current" value={<Money value={4200} size="lg" />} />
              <Stat label="Est." value={<Money value={6800} size="lg" />} />
              <Stat label="Max Bid" value={<Money value={5100} size="lg" tone="accent" />} />
            </div>
          </div>
        </SlideOver>
      </div>
    </ChartThemeProvider>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-headline-md" style={{ color: 'var(--color-fg)' }}>{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-caps">{label}</span>
      <div>{value}</div>
    </div>
  );
}
