import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, TrendingUp, Repeat, BarChart3, Plus, Trash2, Pencil, Search,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Button, KpiTile, DataTable, FilterBar, StatusBadge, Money,
  GlassSurface, GlassModal, EmptyState, ChartThemeProvider, ChartTooltip, useChartTheme,
} from '../components/ui';
import type { Column, Density, FilterChip, StatusTone } from '../components/ui';
import { useToast } from '../components/shell/ToastProvider';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface BusinessExpense {
  id: number;
  date: string;
  amount: number;
  payee: string;
  category: string;
  description?: string;
  is_recurring?: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
}

interface ExpenseStats {
  by_category: Record<string, number>;
  monthly: Record<string, number>;
  totals: { month: number; ytd: number; recurring_monthly: number };
}

const DEFAULT_STATS: ExpenseStats = {
  by_category: {},
  monthly: {},
  totals: { month: 0, ytd: 0, recurring_monthly: 0 },
};

const CATEGORY_OPTIONS = [
  'Auto/Travel',
  'Supplies',
  'Rent',
  'Software',
  'Legal',
] as const;

function categoryTone(category: string): StatusTone {
  const c = category.toLowerCase();
  if (c.includes('software') || c.includes('legal') || c.includes('auto')) return 'insight';
  if (c.includes('supplies')) return 'accent';
  return 'neutral';
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function priorYearMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function last12Months(monthly: Record<string, number>): { ym: string; label: string; value: number }[] {
  const out: { ym: string; label: string; value: number }[] = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({
      ym,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      value: Number(monthly[ym] ?? 0),
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// View
// ─────────────────────────────────────────────────────────────────────────────
export default function LedgerView() {
  return (
    <ChartThemeProvider>
      <LedgerViewInner />
    </ChartThemeProvider>
  );
}

function LedgerViewInner() {
  const { success, error: toastError } = useToast();
  const chartTheme = useChartTheme();

  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [stats, setStats] = useState<ExpenseStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [density, setDensity] = useState<Density>('cozy');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BusinessExpense | null>(null);

  // ─── Data loading
  const loadData = async () => {
    try {
      const [listResp, statsResp] = await Promise.all([
        fetch('/api/expenses/'),
        fetch('/api/expenses/stats'),
      ]);
      if (listResp.ok) {
        const data = await listResp.json();
        setExpenses(Array.isArray(data) ? data : data?.items ?? []);
      }
      if (statsResp.ok) {
        const raw = await statsResp.json();
        setStats({
          by_category: raw?.by_category ?? {},
          monthly: raw?.monthly ?? {},
          totals: {
            month: Number(raw?.totals?.month ?? 0),
            ytd: Number(raw?.totals?.ytd ?? 0),
            recurring_monthly: Number(raw?.totals?.recurring_monthly ?? 0),
          },
        });
      }
    } catch (e) {
      console.error('Failed to load ledger:', e);
      toastError('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Derived: KPIs
  const monthDelta = useMemo(() => {
    const cur = stats.monthly[currentYearMonth()];
    const prior = stats.monthly[priorYearMonth()];
    if (cur === undefined || prior === undefined || prior === 0) return undefined;
    return ((cur - prior) / prior) * 100;
  }, [stats.monthly]);

  const biggestCategory = useMemo(() => {
    const entries = Object.entries(stats.by_category);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return { name: entries[0][0], amount: Number(entries[0][1]) };
  }, [stats.by_category]);

  // ─── Derived: charts
  const categoryChartData = useMemo(() => {
    return Object.entries(stats.by_category)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [stats.by_category]);

  const monthlySeries = useMemo(() => last12Months(stats.monthly), [stats.monthly]);

  const topPayees = useMemo(() => {
    const byPayee: Record<string, number> = {};
    for (const e of expenses) {
      byPayee[e.payee] = (byPayee[e.payee] ?? 0) + Number(e.amount ?? 0);
    }
    return Object.entries(byPayee)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const topPayeesMax = topPayees[0]?.amount ?? 0;

  // ─── Filtering for table
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter((e) => {
      if (q && !e.payee?.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q)) {
        return false;
      }
      if (categoryFilter.length > 0 && !categoryFilter.includes(e.category)) {
        return false;
      }
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [expenses, search, categoryFilter, dateFrom, dateTo]);

  const filterChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = [];
    for (const c of categoryFilter) {
      chips.push({
        id: `cat-${c}`,
        label: 'Category',
        value: c,
        onClear: () => setCategoryFilter((prev) => prev.filter((x) => x !== c)),
      });
    }
    if (dateFrom) chips.push({ id: 'from', label: 'From', value: dateFrom, onClear: () => setDateFrom('') });
    if (dateTo) chips.push({ id: 'to', label: 'To', value: dateTo, onClear: () => setDateTo('') });
    return chips;
  }, [categoryFilter, dateFrom, dateTo]);

  // ─── Mutations
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const previous = expenses;
    setExpenses((p) => p.filter((x) => x.id !== id));
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('failed');
      success('Expense deleted');
      loadData();
    } catch {
      setExpenses(previous);
      toastError('Could not delete expense');
    }
  };

  // ─── Table columns
  const columns: Column<BusinessExpense>[] = [
    {
      id: 'date',
      header: 'Date',
      width: 110,
      sortable: true,
      sortAccessor: (e) => e.date,
      cell: (e) => (
        <span className="text-sm tabular-nums" style={{ color: 'var(--color-fg)' }}>
          {formatDateLabel(e.date)}
        </span>
      ),
    },
    {
      id: 'payee',
      header: 'Payee',
      sortable: true,
      sortAccessor: (e) => e.payee?.toLowerCase() ?? '',
      cell: (e) => (
        <span className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
          {e.payee}
        </span>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      width: 150,
      cell: (e) => (
        <StatusBadge tone={categoryTone(e.category)} size="xs">
          {e.category}
        </StatusBadge>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: (e) => (
        <span
          className="text-sm truncate block max-w-[320px]"
          style={{ color: 'var(--color-fg-muted)' }}
          title={e.description}
        >
          {e.description ?? '—'}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      align: 'right',
      width: 120,
      sortable: true,
      sortAccessor: (e) => Number(e.amount ?? 0),
      cell: (e) => <Money value={Number(e.amount ?? 0)} size="sm" tone="loss" />,
    },
    {
      id: 'recurring',
      header: 'Recurring',
      width: 110,
      align: 'center',
      cell: (e) =>
        e.is_recurring ? (
          <StatusBadge tone="insight" size="xs" dot>
            {e.recurring_frequency ?? 'monthly'}
          </StatusBadge>
        ) : (
          <span style={{ color: 'var(--color-fg-subtle)' }}>—</span>
        ),
    },
    {
      id: 'actions',
      header: '',
      width: 90,
      align: 'right',
      cell: (e) => (
        <div className="flex items-center gap-1 justify-end" onClick={(ev) => ev.stopPropagation()}>
          <button
            type="button"
            className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
            title="Edit (coming soon)"
            style={{ color: 'var(--color-fg-muted)' }}
            disabled
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(e)}
            className="p-1.5 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
            title="Delete expense"
            style={{ color: 'var(--color-fg-muted)' }}
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ─── Top dashboard surface ─────────────────────────────────────── */}
      <GlassSurface tier={2} padded="md" className="flex flex-col gap-5">
        {/* KPI tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiTile
            label="This Month Spend"
            value={<Money value={stats.totals.month} compact size="xl" tone="loss" />}
            icon={<DollarSign size={14} />}
            tone="loss"
            delta={monthDelta}
            deltaLabel="vs prior month"
            index={0}
          />
          <KpiTile
            label="YTD Spend"
            value={<Money value={stats.totals.ytd} compact size="xl" />}
            icon={<TrendingUp size={14} />}
            tone="neutral"
            index={1}
          />
          <KpiTile
            label="Recurring Monthly"
            value={<Money value={stats.totals.recurring_monthly} size="xl" tone="accent" />}
            icon={<Repeat size={14} />}
            tone="insight"
            index={2}
          />
          <KpiTile
            label="Biggest Category"
            value={
              biggestCategory ? (
                <span className="text-[20px] font-semibold tracking-tight" style={{ color: 'var(--color-fg)' }}>
                  {biggestCategory.name} ·{' '}
                  <span style={{ color: 'var(--color-accent)' }}>
                    ${Math.round(biggestCategory.amount).toLocaleString()}
                  </span>
                </span>
              ) : (
                <span className="text-[20px]" style={{ color: 'var(--color-fg-subtle)' }}>—</span>
              )
            }
            icon={<BarChart3 size={14} />}
            tone="accent"
            index={3}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pie chart */}
          <GlassSurface tier={1} radius="md" padded="md" className="flex flex-col gap-3 min-h-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-label-caps">By Category</span>
              <span className="text-[11px]" style={{ color: 'var(--color-fg-subtle)' }}>
                {categoryChartData.length} categories
              </span>
            </div>
            {categoryChartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-fg-subtle)' }}>
                <span className="text-sm">No spending yet</span>
              </div>
            ) : (
              <>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive
                      >
                        {categoryChartData.map((_, i) => (
                          <Cell key={i} fill={chartTheme.palette[i % chartTheme.palette.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {categoryChartData.slice(0, 5).map((d, i) => (
                    <li key={d.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 truncate" style={{ color: 'var(--color-fg-muted)' }}>
                        <span
                          aria-hidden
                          className="inline-block rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            background: chartTheme.palette[i % chartTheme.palette.length],
                          }}
                        />
                        <span className="truncate">{d.name}</span>
                      </span>
                      <Money value={d.value} size="xs" />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </GlassSurface>

          {/* Area chart - spend over time */}
          <GlassSurface tier={1} radius="md" padded="md" className="flex flex-col gap-3 min-h-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-label-caps">Last 12 Months</span>
              <span className="text-[11px]" style={{ color: 'var(--color-fg-subtle)' }}>
                Monthly spend
              </span>
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ledger-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: chartTheme.axis, fontSize: 11, fontFamily: chartTheme.font }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartTheme.axis, fontSize: 11, fontFamily: chartTheme.font }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${Number(v) >= 1000 ? `${Math.round(Number(v) / 1000)}k` : v}`}
                    width={44}
                  />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    fill="url(#ledger-area)"
                    isAnimationActive
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassSurface>

          {/* Top 5 payees */}
          <GlassSurface tier={1} radius="md" padded="md" className="flex flex-col gap-3 min-h-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-label-caps">Top Payees</span>
              <span className="text-[11px]" style={{ color: 'var(--color-fg-subtle)' }}>
                All-time
              </span>
            </div>
            {topPayees.length === 0 ? (
              <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--color-fg-subtle)' }}>
                <span className="text-sm">No payees yet</span>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {topPayees.map((p) => {
                  const pct = topPayeesMax > 0 ? Math.max(2, (p.amount / topPayeesMax) * 100) : 0;
                  return (
                    <li key={p.name} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-fg)' }}
                          title={p.name}
                        >
                          {p.name}
                        </span>
                        <Money value={p.amount} size="sm" />
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--color-surface-2)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: 'var(--color-accent)',
                            transition: 'width 400ms ease-out',
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassSurface>
        </div>
      </GlassSurface>

      {/* ─── Filter bar ────────────────────────────────────────────────── */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search payee or description…"
        chips={filterChips}
        onClearAll={() => {
          setCategoryFilter([]);
          setDateFrom('');
          setDateTo('');
        }}
        density={density}
        onDensityChange={setDensity}
        resultCount={filtered.length}
        totalCount={expenses.length}
        filtersSlot={
          <>
            <div className="flex flex-col gap-1">
              <span className="text-label-caps">Category</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORY_OPTIONS.map((c) => {
                  const active = categoryFilter.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setCategoryFilter((prev) =>
                          active ? prev.filter((x) => x !== c) : [...prev, c]
                        )
                      }
                      className="text-xs px-2.5 h-7 rounded-md transition-colors focus-ring"
                      style={{
                        background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-1)',
                        color: active ? 'var(--color-accent)' : 'var(--color-fg-muted)',
                        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border-hairline)'}`,
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-caps">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-2 rounded-md text-xs"
                style={{
                  background: 'var(--color-surface-1)',
                  color: 'var(--color-fg)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-caps">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-2 rounded-md text-xs"
                style={{
                  background: 'var(--color-surface-1)',
                  color: 'var(--color-fg)',
                  border: '1px solid var(--color-border-hairline)',
                }}
              />
            </div>
          </>
        }
      />

      {/* ─── Table ─────────────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={filtered}
        keyField={(e) => e.id}
        loading={loading}
        density={density}
        defaultSort={{ columnId: 'date', direction: 'desc' }}
        emptyState={
          <EmptyState
            icon={<Search size={20} />}
            title={search || categoryFilter.length || dateFrom || dateTo ? 'No matches' : 'No expenses logged'}
            description={
              search || categoryFilter.length || dateFrom || dateTo
                ? 'Try clearing filters or adjusting your search.'
                : 'Log your first business expense with the + button below.'
            }
          />
        }
      />

      {/* ─── Floating add button ──────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        aria-label="New expense"
        className="fixed bottom-6 right-6 z-30 rounded-full flex items-center justify-center focus-ring transition-transform hover:scale-105 active:scale-95"
        style={{
          width: 52,
          height: 52,
          background: 'var(--color-accent)',
          color: 'white',
          boxShadow: 'var(--shadow-glass-md, 0 8px 32px rgba(0,0,0,0.16))',
          border: '1px solid color-mix(in srgb, white 16%, transparent)',
          backdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <Plus size={22} strokeWidth={2} />
      </button>

      {/* ─── Create modal ─────────────────────────────────────────────── */}
      <CreateExpenseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(created) => {
          // Optimistic prepend; refresh stats from server
          setExpenses((prev) => [created, ...prev]);
          loadData();
        }}
      />

      {/* ─── Delete confirm ───────────────────────────────────────────── */}
      <GlassModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        title="Delete expense?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-2 text-sm" style={{ color: 'var(--color-fg-muted)' }}>
            <p>
              This will permanently remove the expense{' '}
              <span style={{ color: 'var(--color-fg)' }}>“{deleteTarget.payee}”</span> on{' '}
              <span style={{ color: 'var(--color-fg)' }}>{formatDateLabel(deleteTarget.date)}</span>.
            </p>
            <p>This action cannot be undone.</p>
          </div>
        )}
      </GlassModal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create modal
// ─────────────────────────────────────────────────────────────────────────────
interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (e: BusinessExpense) => void;
}

function CreateExpenseModal({ isOpen, onClose, onCreated }: CreateExpenseModalProps) {
  const { success, error: toastError } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Supplies');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [submitting, setSubmitting] = useState(false);

  // Reset when reopened
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setPayee('');
      setAmount('');
      setCategory('Supplies');
      setDescription('');
      setIsRecurring(false);
      setFrequency('monthly');
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = parseFloat(amount);
    if (!payee.trim()) {
      toastError('Payee is required');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toastError('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    const body: Record<string, unknown> = {
      date,
      payee: payee.trim(),
      amount: amt,
      category,
      description: description.trim() || undefined,
      is_recurring: isRecurring,
    };
    if (isRecurring) body.recurring_frequency = frequency;

    try {
      const res = await fetch('/api/expenses/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = (await res.json()) as BusinessExpense;
      onCreated(created);
      success('Expense logged');
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Could not save expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="New Expense"
      description="Log a one-time or recurring business expense."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={() => handleSubmit()} isLoading={submitting}>
            Save expense
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="modal-input"
            />
          </FieldLabel>
          <FieldLabel label="Amount">
            <div className="relative">
              <span
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--color-fg-muted)' }}
              >
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="modal-input pl-6"
              />
            </div>
          </FieldLabel>
        </div>

        <FieldLabel label="Payee">
          <input
            type="text"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            placeholder="Vendor name"
            className="modal-input"
            autoFocus
          />
        </FieldLabel>

        <FieldLabel label="Category">
          <input
            list="ledger-categories"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="modal-input"
          />
          <datalist id="ledger-categories">
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FieldLabel>

        <FieldLabel label="Description (optional)">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes"
            className="modal-input resize-none"
          />
        </FieldLabel>

        <label
          className="flex items-center gap-3 cursor-pointer px-3 h-10 rounded-md"
          style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-border-hairline)',
          }}
        >
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <span className="text-sm" style={{ color: 'var(--color-fg)' }}>
            Recurring expense
          </span>
        </label>

        {isRecurring && (
          <FieldLabel label="Frequency">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as typeof frequency)}
              className="modal-input"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </FieldLabel>
        )}
      </form>

      {/* Local field styling — keeps spec compliance with semantic vars */}
      <style>{`
        .modal-input {
          width: 100%;
          height: 38px;
          padding: 0 10px;
          font-size: 13px;
          color: var(--color-fg);
          background: var(--color-surface-1);
          border: 1px solid var(--color-border-hairline);
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 120ms ease, background 120ms ease;
        }
        textarea.modal-input { height: auto; padding: 8px 10px; line-height: 1.4; }
        .modal-input:focus {
          border-color: var(--color-accent);
          background: var(--color-surface-2);
        }
      `}</style>
    </GlassModal>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-label-caps">{label}</span>
      {children}
    </label>
  );
}
