import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8000/api'

// ---------- Types ----------

interface Settings {
  ps_zip_code: string
  ps_radius_miles: number
  ps_region: string
  ps_enabled: boolean
  ps_end_hours: number
  ps_category_id: number
}

interface ItemSummary {
  id: number
  external_id: string
  title: string
  current_bid: number
  bid_count: number | null
  end_time: string | null
  status: string | null
  url: string | null
  image_url: string | null
  category: string | null
  agency_name: string | null
  location_state: string | null
  auction_house_name: string | null
}

interface ItemDetail extends ItemSummary {
  description: string | null
  pickup_address: string | null
  pickup_city: string | null
  pickup_zip: string | null
  pickup_name: string | null
  is_dutch_auction: boolean
  may_extend: boolean
  first_seen_at: string | null
  last_seen_at: string | null
  detail_scraped_at: string | null
}

interface Category {
  ps_cat_id: number
  name: string
}

interface WatchlistEntry {
  id: number
  item_id: number
  added_at: string
  notes: string
  item: ItemSummary
}

// ---------- Helpers ----------

function timeLeft(endTime: string | null): string {
  if (!endTime) return '—'
  const end = new Date(endTime).getTime()
  const now = Date.now()
  const diff = end - now
  if (diff <= 0) return 'Ended'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ---------- Components ----------

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer ${
        active
          ? 'border-accent text-accent'
          : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-muted'
      }`}
    >
      {label}
    </button>
  )
}

// ---------- Settings Tab ----------

const RADIUS_OPTIONS = [
  { value: -1, label: 'All (No Limit)' },
  { value: 20, label: '20 miles' },
  { value: 50, label: '50 miles' },
  { value: 100, label: '100 miles' },
  { value: 200, label: '200 miles' },
  { value: 300, label: '300 miles' },
  { value: 400, label: '400 miles' },
  { value: 500, label: '500 miles' },
  { value: 600, label: '600 miles' },
  { value: 700, label: '700 miles' },
  { value: 800, label: '800 miles' },
  { value: 900, label: '900 miles' },
  { value: 1000, label: '1000 miles' },
]

const END_HOURS_OPTIONS = [
  { value: -1, label: 'No Limit' },
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 24, label: '1 day' },
  { value: 120, label: '5 days' },
  { value: 240, label: '10 days' },
]

function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/admin/settings`).then(r => r.json()).then(setSettings)
    fetch(`${API_BASE}/items/categories`).then(r => r.json()).then(setCategories)
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const err = await res.json()
        setSaveMsg(`Error: ${err.detail}`)
      } else {
        setSaveMsg('Settings saved')
        setTimeout(() => setSaveMsg(null), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleScrape = async () => {
    setScraping(true)
    setScrapeResult(null)
    try {
      const res = await fetch(`${API_BASE}/admin/scrape/public-surplus`, { method: 'POST' })
      const data = await res.json()
      if (data.stats) {
        setScrapeResult(
          `Done — ${data.stats.items_seen} seen, ${data.stats.items_new} new, ${data.stats.details_fetched} details`
        )
      } else {
        setScrapeResult(data.message || 'Complete')
      }
    } catch (e: any) {
      setScrapeResult(`Error: ${e.message}`)
    } finally {
      setScraping(false)
    }
  }

  if (!settings) return <div className="p-8 text-text-secondary">Loading settings…</div>

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6 text-text-primary">Public Surplus Configuration</h2>

      <div className="bg-surface-raised rounded-xl border border-border p-6 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">Enable PS Scraping</label>
          <button
            onClick={() => setSettings({ ...settings, ps_enabled: !settings.ps_enabled })}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
              settings.ps_enabled ? 'bg-accent' : 'bg-surface-overlay'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                settings.ps_enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Zip Code</label>
          <input
            type="text"
            maxLength={5}
            placeholder="e.g. 80919"
            value={settings.ps_zip_code}
            onChange={e => setSettings({ ...settings, ps_zip_code: e.target.value.replace(/\D/g, '').slice(0, 5) })}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
          />
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Search Radius</label>
          <select
            value={settings.ps_radius_miles}
            onChange={e => setSettings({ ...settings, ps_radius_miles: parseInt(e.target.value) })}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            {RADIUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Category Filter</label>
          <select
            value={settings.ps_category_id}
            onChange={e => setSettings({ ...settings, ps_category_id: parseInt(e.target.value) })}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value={-1}>All Categories</option>
            {categories.map(c => (
              <option key={c.ps_cat_id} value={c.ps_cat_id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Ending Within */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Auctions Ending Within</label>
          <select
            value={settings.ps_end_hours}
            onChange={e => setSettings({ ...settings, ps_end_hours: parseInt(e.target.value) })}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            {END_HOURS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-surface font-medium text-sm rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {saveMsg && (
            <span className={`text-sm ${saveMsg.startsWith('Error') ? 'text-danger' : 'text-success'}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* Scrape trigger */}
      <div className="mt-6 bg-surface-raised rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-3 text-text-primary">Manual Scrape</h3>
        <p className="text-sm text-text-secondary mb-4">
          Run a Public Surplus scrape now using the settings above.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="px-5 py-2 bg-surface-overlay hover:bg-border text-text-primary font-medium text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {scraping && <span className="w-3 h-3 rounded-full bg-accent animate-pulse-dot" />}
            {scraping ? 'Scraping…' : 'Run Now'}
          </button>
          {scrapeResult && (
            <span className={`text-sm ${scrapeResult.startsWith('Error') ? 'text-danger' : 'text-success'}`}>
              {scrapeResult}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Item Detail Modal ----------

function ItemDetailModal({ itemId, onClose, onWatchlistChange }: { itemId: number; onClose: () => void; onWatchlistChange?: () => void }) {
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [onWatchlist, setOnWatchlist] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/items/${itemId}`).then(r => r.json()).then(setItem)
    // Check if on watchlist
    fetch(`${API_BASE}/items/watchlist/list`)
      .then(r => r.json())
      .then((entries: WatchlistEntry[]) => {
        setOnWatchlist(entries.some(e => e.item_id === itemId))
      })
  }, [itemId])

  const toggleWatchlist = async () => {
    setToggling(true)
    try {
      if (onWatchlist) {
        await fetch(`${API_BASE}/items/watchlist/${itemId}`, { method: 'DELETE' })
        setOnWatchlist(false)
      } else {
        await fetch(`${API_BASE}/items/watchlist/${itemId}`, { method: 'POST' })
        setOnWatchlist(true)
      }
      onWatchlistChange?.()
    } finally {
      setToggling(false)
    }
  }

  if (!item) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-surface-raised rounded-xl p-8 text-text-secondary">Loading…</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface-raised rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary truncate">{item.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
              {item.agency_name && <span>{item.agency_name}</span>}
              {item.location_state && (
                <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-xs font-medium">
                  {item.location_state}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <button
              onClick={toggleWatchlist}
              disabled={toggling}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                onWatchlist
                  ? 'bg-warning/20 text-warning hover:bg-warning/30'
                  : 'text-text-muted hover:bg-surface-overlay hover:text-text-primary'
              }`}
              title={onWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <svg className="w-5 h-5" fill={onWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-overlay rounded-lg transition-colors text-text-muted hover:text-text-primary cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Image + Bid info */}
          <div className="flex gap-5">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-40 h-32 object-cover rounded-lg border border-border flex-shrink-0"
              />
            )}
            <div className="space-y-2">
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wide">Current Bid</span>
                <p className="text-2xl font-bold text-success">{formatPrice(item.current_bid)}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-xs text-text-muted">Bids</span>
                  <p className="text-sm font-medium">{item.bid_count ?? '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-text-muted">Time Left</span>
                  <p className="text-sm font-medium">{timeLeft(item.end_time)}</p>
                </div>
                {item.category && (
                  <div>
                    <span className="text-xs text-text-muted">Category</span>
                    <p className="text-sm font-medium">{item.category}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                {item.is_dutch_auction && (
                  <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs">Dutch</span>
                )}
                {item.may_extend && (
                  <span className="px-2 py-0.5 rounded-full bg-danger/20 text-danger text-xs">May Extend</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <h4 className="text-sm font-semibold text-text-secondary mb-2">Description</h4>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line bg-surface rounded-lg p-3 border border-border-subtle">
                {item.description}
              </p>
            </div>
          )}

          {/* Pickup Location */}
          {(item.pickup_address || item.pickup_city) && (
            <div>
              <h4 className="text-sm font-semibold text-text-secondary mb-2">Pickup Location</h4>
              <div className="text-sm text-text-primary bg-surface rounded-lg p-3 border border-border-subtle">
                {item.pickup_name && <p className="font-medium">{item.pickup_name}</p>}
                {item.pickup_address && <p>{item.pickup_address}</p>}
                <p>
                  {[item.pickup_city, item.location_state, item.pickup_zip].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Link to PS */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              View on Public Surplus
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Items Feed Tab ----------

function ItemsFeedTab() {
  const [items, setItems] = useState<ItemSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (search) params.set('search', search)
    if (categoryFilter) params.set('category', categoryFilter)
    try {
      const res = await fetch(`${API_BASE}/items?${params}`)
      const data = await res.json()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    fetch(`${API_BASE}/items/categories`).then(r => r.json()).then(setCategories)
  }, [])

  return (
    <div className="p-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition w-64"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.ps_cat_id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={fetchItems}
          className="px-4 py-2 bg-surface-overlay hover:bg-border text-text-primary text-sm rounded-lg transition-colors cursor-pointer"
        >
          Refresh
        </button>
        <span className="self-center text-sm text-text-muted">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-text-secondary">Loading items…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg">No items found</p>
          <p className="text-text-muted text-sm mt-1">Configure your zip code and radius in Settings, then run a scrape.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-raised text-text-muted text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Item</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3">Bid</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Time Left</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">State</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className="hover:bg-surface-raised/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-10 h-10 rounded object-cover border border-border flex-shrink-0"
                        />
                      )}
                      <span className="font-medium text-text-primary truncate max-w-xs">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{item.category || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-success">{formatPrice(item.current_bid)}</td>
                  <td className="px-4 py-3 text-right text-text-secondary hidden sm:table-cell">
                    {timeLeft(item.end_time)}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {item.location_state && (
                      <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent text-xs font-medium">
                        {item.location_state}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs hidden xl:table-cell truncate max-w-[200px]">
                    {item.agency_name || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selectedItemId && (
        <ItemDetailModal itemId={selectedItemId} onClose={() => setSelectedItemId(null)} />
      )}
    </div>
  )
}

// ---------- Watchlist Tab ----------

function WatchlistTab() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)

  const fetchWatchlist = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/items/watchlist/list`)
      const data = await res.json()
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  const removeFromWatchlist = async (itemId: number) => {
    await fetch(`${API_BASE}/items/watchlist/${itemId}`, { method: 'DELETE' })
    fetchWatchlist()
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-text-primary">Watchlist</h2>
        <span className="text-sm text-text-muted">
          {entries.length} item{entries.length !== 1 ? 's' : ''} saved
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-secondary">Loading watchlist…</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-text-secondary text-lg">No items on your watchlist</p>
          <p className="text-text-muted text-sm mt-1">Click the star icon on any item to save it here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="bg-surface-raised rounded-xl border border-border p-4 flex items-center gap-4 hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => setSelectedItemId(entry.item_id)}
            >
              {entry.item.image_url && (
                <img
                  src={entry.item.image_url}
                  alt=""
                  className="w-16 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{entry.item.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                  {entry.item.agency_name && <span>{entry.item.agency_name}</span>}
                  {entry.item.category && (
                    <span className="px-1.5 py-0.5 rounded bg-surface-overlay text-text-muted">{entry.item.category}</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-success">{formatPrice(entry.item.current_bid)}</p>
                <p className="text-xs text-text-muted">{timeLeft(entry.item.end_time)}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); removeFromWatchlist(entry.item_id) }}
                className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                title="Remove from Watchlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedItemId && (
        <ItemDetailModal
          itemId={selectedItemId}
          onClose={() => setSelectedItemId(null)}
          onWatchlistChange={fetchWatchlist}
        />
      )}
    </div>
  )
}

// ---------- App ----------

type TabId = 'items' | 'watchlist' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('items')

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface-raised/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">Auction Master</h1>
          </div>
          <nav className="flex">
            <TabButton active={activeTab === 'items'} label="Items Feed" onClick={() => setActiveTab('items')} />
            <TabButton active={activeTab === 'watchlist'} label="Watchlist" onClick={() => setActiveTab('watchlist')} />
            <TabButton active={activeTab === 'settings'} label="Settings" onClick={() => setActiveTab('settings')} />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'items' && <ItemsFeedTab />}
        {activeTab === 'watchlist' && <WatchlistTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}

export default App
