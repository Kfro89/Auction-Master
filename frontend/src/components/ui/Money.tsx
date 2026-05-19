import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface MoneyProps {
  value: number | null | undefined;
  compact?: boolean;
  showSign?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'auto' | 'neutral' | 'profit' | 'loss' | 'accent';
  currency?: string;
  animate?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<MoneyProps['size']>, string> = {
  xs: 'text-[11px]',
  sm: 'text-[13px]',
  md: 'text-[15px] font-semibold',
  lg: 'text-[20px] font-semibold',
  xl: 'text-[28px] font-semibold tracking-tight',
};

export function Money({
  value,
  compact = false,
  showSign = false,
  className,
  size = 'sm',
  tone = 'auto',
  currency = 'USD',
  animate = false,
}: MoneyProps) {
  if (value === null || value === undefined || isNaN(value)) {
    return (
      <span className={cn('tabular-nums', SIZE_CLASSES[size], className)} style={{ color: 'var(--color-fg-subtle)' }}>
        —
      </span>
    );
  }

  const resolvedTone =
    tone === 'auto' ? (value > 0 ? 'profit' : value < 0 ? 'loss' : 'neutral') : tone;

  const color =
    resolvedTone === 'profit'
      ? 'var(--color-profit)'
      : resolvedTone === 'loss'
      ? 'var(--color-loss)'
      : resolvedTone === 'accent'
      ? 'var(--color-accent)'
      : 'var(--color-fg)';

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
    signDisplay: showSign ? 'exceptZero' : 'auto',
  }).format(value);

  if (animate) {
    return (
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn('tabular-nums whitespace-nowrap', SIZE_CLASSES[size], className)}
        style={{ color }}
      >
        {formatted}
      </motion.span>
    );
  }

  return (
    <span className={cn('tabular-nums whitespace-nowrap', SIZE_CLASSES[size], className)} style={{ color }}>
      {formatted}
    </span>
  );
}

interface PercentProps {
  value: number | null | undefined;
  className?: string;
  showSign?: boolean;
  tone?: 'auto' | 'neutral' | 'profit' | 'loss';
  decimals?: number;
}

export function Percent({ value, className, showSign = true, tone = 'auto', decimals = 1 }: PercentProps) {
  if (value === null || value === undefined || isNaN(value)) {
    return (
      <span className={cn('tabular-nums text-[13px]', className)} style={{ color: 'var(--color-fg-subtle)' }}>
        —
      </span>
    );
  }

  const resolvedTone =
    tone === 'auto' ? (value > 0 ? 'profit' : value < 0 ? 'loss' : 'neutral') : tone;
  const color =
    resolvedTone === 'profit'
      ? 'var(--color-profit)'
      : resolvedTone === 'loss'
      ? 'var(--color-loss)'
      : 'var(--color-fg)';

  const sign = showSign ? (value > 0 ? '+' : '') : '';
  return (
    <span className={cn('tabular-nums text-[13px] font-semibold', className)} style={{ color }}>
      {sign}
      {value.toFixed(decimals)}%
    </span>
  );
}
