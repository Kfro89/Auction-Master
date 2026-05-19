import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  filled?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 28,
  stroke,
  fill,
  filled = true,
  className,
}: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return { line: '', area: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const padding = 2;

    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = height - padding - ((d - min) / range) * (height - padding * 2);
      return [x, y] as const;
    });

    const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const area = `${line} L${width},${height} L0,${height} Z`;
    return { line, area };
  }, [data, width, height]);

  const strokeColor = stroke ?? 'var(--color-accent)';
  const fillColor = fill ?? 'var(--color-accent-soft)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      {filled && (
        <motion.path
          d={path.area}
          fill={fillColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
      )}
      <motion.path
        d={path.line}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

interface SparkbarProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkbar({ data, width = 80, height = 28, color, className }: SparkbarProps) {
  const max = Math.max(...data, 1);
  const barW = width / data.length - 1;
  const fill = color ?? 'var(--color-accent)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      {data.map((d, i) => {
        const barH = Math.max((d / max) * height, 2);
        return (
          <rect
            key={i}
            x={i * (barW + 1)}
            y={height - barH}
            width={barW}
            height={barH}
            fill={fill}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

interface GaugeRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showValue?: boolean;
  label?: string;
}

export function GaugeRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  color,
  trackColor,
  showValue = true,
  label,
}: GaugeRingProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const c = color ?? 'var(--color-accent)';
  const tc = trackColor ?? 'var(--color-border-hairline)';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={tc} strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={c}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--color-fg)' }}>
            {Math.round(pct * 100)}%
          </span>
          {label && (
            <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
