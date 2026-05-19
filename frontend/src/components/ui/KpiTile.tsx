import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { GlassSurface } from './GlassSurface';
import { Sparkline } from './Sparkline';
import { cn } from '../../utils/cn';

interface KpiTileProps {
  label: string;
  value: ReactNode;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  sparkData?: number[];
  sparkColor?: string;
  tone?: 'neutral' | 'profit' | 'loss' | 'accent' | 'pending' | 'insight';
  index?: number;
  onClick?: () => void;
  hint?: string;
}

const TONE_COLORS: Record<NonNullable<KpiTileProps['tone']>, string> = {
  neutral: 'var(--color-fg)',
  profit: 'var(--color-profit)',
  loss: 'var(--color-loss)',
  accent: 'var(--color-accent)',
  pending: 'var(--color-pending)',
  insight: 'var(--color-insight)',
};

const TONE_SOFT: Record<NonNullable<KpiTileProps['tone']>, string> = {
  neutral: 'var(--color-surface-2)',
  profit: 'var(--color-profit-soft)',
  loss: 'var(--color-loss-soft)',
  accent: 'var(--color-accent-soft)',
  pending: 'var(--color-pending-soft)',
  insight: 'var(--color-insight-soft)',
};

export function KpiTile({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  sparkData,
  sparkColor,
  tone = 'neutral',
  index = 0,
  onClick,
  hint,
}: KpiTileProps) {
  const showDelta = delta !== undefined && delta !== null && !isNaN(delta);
  const deltaPositive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassSurface
        tier={2}
        radius="md"
        padded="md"
        interactive={!!onClick}
        onClick={onClick}
        className={cn('flex flex-col gap-3 min-h-[112px]', onClick && 'focus-ring')}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-label-caps">{label}</span>
          {icon && (
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: TONE_SOFT[tone], color: TONE_COLORS[tone] }}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div
              className="text-stat-xl truncate"
              style={{ color: tone === 'neutral' ? 'var(--color-fg)' : TONE_COLORS[tone] }}
            >
              {value}
            </div>
            {(showDelta || hint) && (
              <div className="flex items-center gap-2 mt-1">
                {showDelta && (
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums"
                    style={{
                      background: deltaPositive ? 'var(--color-profit-soft)' : 'var(--color-loss-soft)',
                      color: deltaPositive ? 'var(--color-profit)' : 'var(--color-loss)',
                    }}
                  >
                    {deltaPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(delta!).toFixed(1)}%
                  </span>
                )}
                {(deltaLabel || hint) && (
                  <span className="text-[11px]" style={{ color: 'var(--color-fg-muted)' }}>
                    {deltaLabel ?? hint}
                  </span>
                )}
              </div>
            )}
          </div>
          {sparkData && sparkData.length > 1 && (
            <Sparkline data={sparkData} width={72} height={32} stroke={sparkColor ?? TONE_COLORS[tone]} fill={TONE_SOFT[tone]} />
          )}
        </div>
      </GlassSurface>
    </motion.div>
  );
}
