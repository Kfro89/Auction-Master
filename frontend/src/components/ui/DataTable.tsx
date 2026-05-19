import { useState, useMemo, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { cn } from '../../utils/cn';

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  width?: string | number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number | null | undefined;
  className?: string;
  headerClassName?: string;
  sticky?: boolean;
}

export type Density = 'compact' | 'cozy' | 'comfortable';

const ROW_HEIGHTS: Record<Density, string> = {
  compact: 'h-9',
  cozy: 'h-12',
  comfortable: 'h-14',
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: (row: T) => string | number;
  loading?: boolean;
  loadingRowCount?: number;
  emptyState?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  density?: Density;
  className?: string;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
  defaultSort?: { columnId: string; direction: 'asc' | 'desc' };
  rowClassName?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  loading,
  loadingRowCount = 6,
  emptyState,
  onRowClick,
  density = 'cozy',
  className,
  selectable,
  selectedIds,
  onSelectionChange,
  defaultSort,
  rowClassName,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ columnId: string; direction: 'asc' | 'desc' } | undefined>(defaultSort);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col?.sortAccessor) return data;
    const sorted = [...data].sort((a, b) => {
      const av = col.sortAccessor!(a);
      const bv = col.sortAccessor!(b);
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }, [data, sort, columns]);

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev?.columnId !== col.id) return { columnId: col.id, direction: 'desc' };
      if (prev.direction === 'desc') return { columnId: col.id, direction: 'asc' };
      return undefined;
    });
  };

  const toggleRowSelection = (id: string | number) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  if (loading) {
    return (
      <div
        className={cn('overflow-hidden rounded-[var(--radius-md)]', className)}
        style={{
          background: 'var(--color-surface-1)',
          border: '1px solid var(--color-border-hairline)',
        }}
      >
        <table className="w-full">
          <thead style={{ background: 'var(--color-surface-1)' }}>
            <tr className="hairline-b">
              {selectable && <th className="w-10 px-3" />}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn('text-label-caps text-left px-3 py-3', col.headerClassName)}
                  style={{ textAlign: col.align ?? 'left', width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRowCount }).map((_, i) => (
              <tr key={i} className={cn(ROW_HEIGHTS[density], 'hairline-b')}>
                {selectable && <td className="px-3" />}
                {columns.map((col) => (
                  <td key={col.id} className="px-3">
                    <Skeleton height={14} width={col.align === 'right' ? '60%' : '80%'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sortedData.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (sortedData.length === 0) {
    return (
      <EmptyState
        title="No items"
        description="There’s nothing to show here yet."
      />
    );
  }

  return (
    <div
      className={cn('overflow-hidden rounded-[var(--radius-md)]', className)}
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border-hairline)',
        boxShadow: 'var(--shadow-glass-sm)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-table-data" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead
            className="sticky top-[var(--topbar-h)] z-10"
            style={{ background: 'var(--color-surface-1)' }}
          >
            <tr className="hairline-b">
              {selectable && (
                <th className="w-10 px-3">
                  <input
                    type="checkbox"
                    checked={!!selectedIds && selectedIds.size === sortedData.length && sortedData.length > 0}
                    onChange={(e) => {
                      if (!onSelectionChange) return;
                      onSelectionChange(
                        e.target.checked ? new Set(sortedData.map((r) => keyField(r))) : new Set()
                      );
                    }}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => {
                const sortedCol = sort?.columnId === col.id;
                return (
                  <th
                    key={col.id}
                    className={cn(
                      'text-label-caps select-none px-3 py-3',
                      col.sortable && 'cursor-pointer hover:text-[var(--color-fg)] transition-colors',
                      col.headerClassName
                    )}
                    style={{ textAlign: col.align ?? 'left', width: col.width }}
                    onClick={() => toggleSort(col)}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-1',
                        col.align === 'right' && 'flex-row-reverse'
                      )}
                    >
                      {col.header}
                      {col.sortable && (
                        <span style={{ color: sortedCol ? 'var(--color-accent)' : 'var(--color-fg-subtle)' }}>
                          {!sortedCol ? (
                            <ChevronsUpDown size={11} />
                          ) : sort?.direction === 'asc' ? (
                            <ChevronUp size={11} />
                          ) : (
                            <ChevronDown size={11} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => {
              const id = keyField(row);
              const isSelected = selectedIds?.has(id);
              return (
                <motion.tr
                  key={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.01, 0.2) }}
                  className={cn(
                    ROW_HEIGHTS[density],
                    'hairline-b transition-colors',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row)
                  )}
                  style={{
                    background: isSelected ? 'var(--color-accent-soft)' : undefined,
                  }}
                  onClick={() => onRowClick?.(row, i)}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = '';
                  }}
                >
                  {selectable && (
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => toggleRowSelection(id)}
                        aria-label={`Select row ${i + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn('px-3 align-middle', col.className)}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {col.cell(row, i)}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
