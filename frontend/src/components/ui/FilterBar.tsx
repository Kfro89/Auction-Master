import { type ReactNode, useState } from 'react';
import { Search, X, SlidersHorizontal, LayoutGrid, Rows3, Rows4 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { Density } from './DataTable';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  onClear: () => void;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChip[];
  onClearAll?: () => void;
  density?: Density;
  onDensityChange?: (d: Density) => void;
  rightSlot?: ReactNode;
  resultCount?: number;
  totalCount?: number;
  filtersSlot?: ReactNode;
}

export function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search…',
  chips = [],
  onClearAll,
  density,
  onDensityChange,
  rightSlot,
  resultCount,
  totalCount,
  filtersSlot,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasChips = chips.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="relative flex items-center gap-2 px-3 rounded-md flex-1 min-w-[200px] max-w-md"
          style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-border-hairline)',
            height: 36,
          }}
        >
          <Search size={14} style={{ color: 'var(--color-fg-subtle)' }} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--color-fg)' }}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange?.('')}
              className="p-0.5 rounded transition-colors hover:bg-[var(--color-surface-2)]"
              style={{ color: 'var(--color-fg-subtle)' }}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {filtersSlot && (
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              'flex items-center gap-1.5 px-3 rounded-md text-xs font-medium transition-all focus-ring',
              showFilters ? '' : ''
            )}
            style={{
              height: 36,
              background: showFilters ? 'var(--color-accent-soft)' : 'var(--color-surface-1)',
              border: '1px solid var(--color-border-hairline)',
              color: showFilters ? 'var(--color-accent)' : 'var(--color-fg)',
            }}
          >
            <SlidersHorizontal size={13} />
            Filters
            {hasChips && (
              <span
                className="ml-1 px-1.5 rounded-full text-[10px] font-bold tabular-nums"
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-fg-onaccent)',
                }}
              >
                {chips.length}
              </span>
            )}
          </button>
        )}

        {density !== undefined && onDensityChange && (
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-md"
            style={{
              height: 36,
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-border-hairline)',
            }}
          >
            {(['compact', 'cozy', 'comfortable'] as Density[]).map((d) => (
              <button
                key={d}
                onClick={() => onDensityChange(d)}
                className="px-2 rounded transition-colors focus-ring"
                style={{
                  height: 28,
                  background: density === d ? 'var(--color-surface-2)' : 'transparent',
                  color: density === d ? 'var(--color-fg)' : 'var(--color-fg-subtle)',
                }}
                title={`${d.charAt(0).toUpperCase() + d.slice(1)} density`}
              >
                {d === 'compact' ? <Rows4 size={12} /> : d === 'cozy' ? <Rows3 size={12} /> : <LayoutGrid size={12} />}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {resultCount !== undefined && (
          <div className="text-xs tabular-nums" style={{ color: 'var(--color-fg-muted)' }}>
            <span style={{ color: 'var(--color-fg)', fontWeight: 600 }}>{resultCount}</span>
            {totalCount !== undefined && totalCount !== resultCount && (
              <span> of {totalCount}</span>
            )}
          </div>
        )}

        {rightSlot}
      </div>

      <AnimatePresence>
        {showFilters && filtersSlot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="rounded-md p-3 flex flex-wrap items-end gap-3"
              style={{
                background: 'var(--color-surface-1)',
                border: '1px solid var(--color-border-hairline)',
              }}
            >
              {filtersSlot}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasChips && (
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium"
              style={{
                background: 'var(--color-accent-soft)',
                color: 'var(--color-accent)',
              }}
            >
              <span style={{ color: 'var(--color-fg-muted)' }}>{chip.label}:</span>
              <span>{chip.value}</span>
              <button
                onClick={chip.onClear}
                className="p-0.5 rounded hover:bg-[var(--color-accent)]/10"
                aria-label={`Remove ${chip.label} filter`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="text-[11px] font-medium underline-offset-2 hover:underline transition-colors"
              style={{ color: 'var(--color-fg-muted)' }}
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
