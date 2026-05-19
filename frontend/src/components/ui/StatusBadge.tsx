import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type StatusTone = 'profit' | 'loss' | 'pending' | 'accent' | 'insight' | 'neutral' | 'subtle';

interface StatusBadgeProps {
  tone?: StatusTone;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  children?: ReactNode;
  className?: string;
  /** Legacy API: pass a status string for auto-mapping */
  status?: string;
  /** Legacy alias for `pulse` */
  animatePulse?: boolean;
}

const TONES: Record<StatusTone, { bg: string; fg: string; dot: string }> = {
  profit: { bg: 'var(--color-profit-soft)', fg: 'var(--color-profit)', dot: 'var(--color-profit)' },
  loss: { bg: 'var(--color-loss-soft)', fg: 'var(--color-loss)', dot: 'var(--color-loss)' },
  pending: { bg: 'var(--color-pending-soft)', fg: 'var(--color-pending)', dot: 'var(--color-pending)' },
  accent: { bg: 'var(--color-accent-soft)', fg: 'var(--color-accent)', dot: 'var(--color-accent)' },
  insight: { bg: 'var(--color-insight-soft)', fg: 'var(--color-insight)', dot: 'var(--color-insight)' },
  neutral: { bg: 'var(--color-surface-2)', fg: 'var(--color-fg)', dot: 'var(--color-fg-muted)' },
  subtle: { bg: 'transparent', fg: 'var(--color-fg-subtle)', dot: 'var(--color-fg-subtle)' },
};

const SIZES = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-[12px] px-2.5 py-1',
};

function statusToTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (['winning', 'won', 'profit', 'paid', 'delivered', 'sold'].includes(s)) return 'profit';
  if (['outbid', 'outbid_near', 'lost', 'loss', 'reserve_not_met', 'failed', 'returned'].includes(s)) return 'loss';
  if (['shipped', 'in_transit', 'staging', 'drafting'].includes(s)) return 'accent';
  if (['pending', 'refurbish'].includes(s)) return 'pending';
  if (['listed'].includes(s)) return 'insight';
  return 'neutral';
}

export function StatusBadge({
  tone,
  size = 'sm',
  dot,
  pulse,
  children,
  className,
  status,
  animatePulse,
}: StatusBadgeProps) {
  const resolvedTone = tone ?? (status ? statusToTone(status) : 'neutral');
  const shouldPulse = pulse ?? animatePulse ?? false;
  const t = TONES[resolvedTone];
  const label = children ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        SIZES[size],
        resolvedTone === 'subtle' && 'border border-[var(--color-border-hairline)]',
        className
      )}
      style={{ background: t.bg, color: t.fg }}
    >
      {dot && (
        <span className="relative flex items-center">
          <span className="block w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} />
          {shouldPulse && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: t.dot,
                animation: 'pulse-ring 1.6s ease-out infinite',
              }}
            />
          )}
        </span>
      )}
      {label}
    </span>
  );
}
