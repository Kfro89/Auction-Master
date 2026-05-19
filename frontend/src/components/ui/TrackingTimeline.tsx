import { Check, Package, Truck, Home, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export type TrackingStage = 'label' | 'pickup' | 'transit' | 'out_for_delivery' | 'delivered';

const STAGES: { id: TrackingStage; label: string; icon: React.ReactNode }[] = [
  { id: 'label', label: 'Label Created', icon: <Package size={12} /> },
  { id: 'pickup', label: 'Picked Up', icon: <Truck size={12} /> },
  { id: 'transit', label: 'In Transit', icon: <MapPin size={12} /> },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck size={12} /> },
  { id: 'delivered', label: 'Delivered', icon: <Home size={12} /> },
];

interface TrackingTimelineProps {
  stage: TrackingStage;
  carrier?: string;
  trackingNumber?: string;
  lastUpdate?: string;
  eta?: string;
  className?: string;
  compact?: boolean;
}

export function TrackingTimeline({
  stage,
  carrier,
  trackingNumber,
  lastUpdate,
  eta,
  className,
  compact = false,
}: TrackingTimelineProps) {
  const currentIdx = STAGES.findIndex((s) => s.id === stage);

  if (compact) {
    const pct = (currentIdx / (STAGES.length - 1)) * 100;
    return (
      <div className={cn('flex items-center gap-2 min-w-0', className)}>
        <div className="relative flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border-hairline)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: stage === 'delivered' ? 'var(--color-profit)' : 'var(--color-accent)' }}
          />
        </div>
        <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: 'var(--color-fg-muted)' }}>
          {STAGES[currentIdx]?.label ?? '—'}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {(carrier || trackingNumber) && (
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            {carrier && (
              <span className="font-semibold" style={{ color: 'var(--color-fg)' }}>
                {carrier}
              </span>
            )}
            {trackingNumber && (
              <button
                onClick={() => navigator.clipboard?.writeText(trackingNumber)}
                className="font-mono tabular-nums hover:underline focus-ring rounded px-1 -mx-1"
                style={{ color: 'var(--color-fg-muted)' }}
                title="Click to copy"
              >
                {trackingNumber}
              </button>
            )}
          </div>
          {eta && (
            <span className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>
              ETA · {eta}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center">
        {STAGES.map((s, i) => {
          const done = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={false}
                  animate={{ scale: isCurrent ? 1.05 : 1 }}
                  className="flex items-center justify-center w-7 h-7 rounded-full"
                  style={{
                    background: done
                      ? stage === 'delivered'
                        ? 'var(--color-profit)'
                        : 'var(--color-accent)'
                      : isCurrent
                      ? 'var(--color-accent-soft)'
                      : 'var(--color-surface-2)',
                    border: isCurrent
                      ? '2px solid var(--color-accent)'
                      : '1px solid var(--color-border-hairline)',
                    boxShadow: isCurrent ? '0 0 0 4px var(--color-accent-ring)' : 'none',
                    color: done ? 'var(--color-fg-onaccent)' : isCurrent ? 'var(--color-accent)' : 'var(--color-fg-subtle)',
                  }}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : s.icon}
                </motion.div>
                <span
                  className="text-[10px] font-medium uppercase tracking-wide whitespace-nowrap"
                  style={{
                    color: done ? 'var(--color-fg-muted)' : isCurrent ? 'var(--color-accent)' : 'var(--color-fg-subtle)',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className="flex-1 h-px mx-1.5 -mt-3"
                  style={{
                    background: done ? (stage === 'delivered' ? 'var(--color-profit)' : 'var(--color-accent)') : 'var(--color-border-hairline)',
                    minWidth: 16,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {lastUpdate && (
        <div className="text-[11px]" style={{ color: 'var(--color-fg-subtle)' }}>
          Last update · {lastUpdate}
        </div>
      )}
    </div>
  );
}
