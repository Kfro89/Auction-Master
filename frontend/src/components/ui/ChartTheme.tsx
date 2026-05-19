import { createContext, useContext, type ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ChartThemeTokens {
  axis: string;
  axisLabel: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  font: string;
  accent: string;
  profit: string;
  loss: string;
  pending: string;
  insight: string;
  palette: string[];
}

const ChartThemeContext = createContext<ChartThemeTokens | null>(null);

export function ChartThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const tokens: ChartThemeTokens = {
    axis: isDark ? 'rgba(255,255,255,0.4)' : '#8A92A0',
    axisLabel: isDark ? 'rgba(255,255,255,0.62)' : '#5E6573',
    grid: isDark ? 'rgba(255,255,255,0.06)' : '#E8E7E4',
    tooltipBg: isDark ? 'rgba(28,31,40,0.96)' : 'rgba(255,255,255,0.96)',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.08)' : '#E8E7E4',
    tooltipText: isDark ? 'rgba(255,255,255,0.96)' : '#0F1115',
    font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter Variable", system-ui',
    accent: isDark ? '#0A84FF' : '#0066FF',
    profit: isDark ? '#30D158' : '#0E8A4A',
    loss: isDark ? '#FF453A' : '#D11414',
    pending: isDark ? '#FFD60A' : '#B8860B',
    insight: isDark ? '#BF5AF2' : '#7B4BBF',
    palette: isDark
      ? ['#0A84FF', '#30D158', '#FFD60A', '#BF5AF2', '#FF9F0A', '#5AC8FA', '#FF453A', '#64D2FF']
      : ['#0066FF', '#0E8A4A', '#B8860B', '#7B4BBF', '#D17A00', '#0099C7', '#D11414', '#0077A8'],
  };

  return <ChartThemeContext.Provider value={tokens}>{children}</ChartThemeContext.Provider>;
}

export function useChartTheme(): ChartThemeTokens {
  const ctx = useContext(ChartThemeContext);
  if (ctx) return ctx;
  return {
    axis: '#8A92A0',
    axisLabel: '#5E6573',
    grid: '#E8E7E4',
    tooltipBg: 'rgba(255,255,255,0.96)',
    tooltipBorder: '#E8E7E4',
    tooltipText: '#0F1115',
    font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter Variable", system-ui',
    accent: '#0066FF',
    profit: '#0E8A4A',
    loss: '#D11414',
    pending: '#B8860B',
    insight: '#7B4BBF',
    palette: ['#0066FF', '#0E8A4A', '#B8860B', '#7B4BBF', '#D17A00', '#0099C7', '#D11414', '#0077A8'],
  };
}

/** Standard Recharts tooltip content matching the design system */
export function ChartTooltip(props: any) {
  const { active, payload, label } = props;
  const tokens = useChartTheme();
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: tokens.tooltipBg,
        border: `1px solid ${tokens.tooltipBorder}`,
        borderRadius: 'var(--radius-sm)',
        padding: '8px 10px',
        boxShadow: 'var(--shadow-glass-md)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        fontFamily: tokens.font,
        minWidth: 120,
      }}
    >
      {label !== undefined && (
        <div
          style={{
            color: tokens.tooltipText,
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 4,
            opacity: 0.7,
          }}
        >
          {label}
        </div>
      )}
      {payload.map((p: any, i: number) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 13,
            color: tokens.tooltipText,
            padding: '2px 0',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color ?? p.fill }} />
            {p.name}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}
