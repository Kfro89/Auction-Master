import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Gavel, Package, BarChart3, Settings, Eye, Car, Landmark, Shield, Truck,
  Sparkles, Sun, Moon, Monitor, ChevronsLeft, ChevronsRight, LogOut, User
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTheme, type Theme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Pipeline',
    items: [
      { id: 'research', label: 'Research', icon: <Search size={18} strokeWidth={1.75} /> },
      { id: 'watchlist', label: 'Watchlist', icon: <Eye size={18} strokeWidth={1.75} /> },
      { id: 'bidding', label: 'Bidding', icon: <Gavel size={18} strokeWidth={1.75} /> },
      { id: 'work-queue', label: 'Work Queue', icon: <Package size={18} strokeWidth={1.75} /> },
      { id: 'fulfillment', label: 'Fulfillment', icon: <Truck size={18} strokeWidth={1.75} /> },
    ],
  },
  {
    title: 'Listings',
    items: [
      { id: 'store', label: 'Store', icon: <BarChart3 size={18} strokeWidth={1.75} /> },
      { id: 'vehicles', label: 'Vehicles', icon: <Car size={18} strokeWidth={1.75} /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'ledger', label: 'Ledger', icon: <Landmark size={18} strokeWidth={1.75} /> },
      { id: 'rma', label: 'Returns', icon: <Shield size={18} strokeWidth={1.75} /> },
    ],
  },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const { expanded, pinned, togglePinned, setHovered } = useSidebar();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const themes: { value: Theme; icon: ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={14} />, label: 'Light' },
    { value: 'system', icon: <Monitor size={14} />, label: 'Auto' },
    { value: 'dark', icon: <Moon size={14} />, label: 'Dark' },
  ];

  return (
    <motion.nav
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col py-3 glass-1"
      style={{
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
      }}
      initial={false}
      animate={{ width: expanded ? 'var(--sidebar-w-expanded)' : 'var(--sidebar-w-collapsed)' }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo + Pin */}
      <div className={cn('flex items-center mb-4 px-3', expanded ? 'justify-between' : 'justify-center')}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex shrink-0 items-center justify-center rounded-lg w-9 h-9"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-insight))',
              boxShadow: '0 4px 12px -2px var(--color-accent-ring)',
            }}
          >
            <Sparkles size={18} strokeWidth={2} className="text-white" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="text-headline-sm whitespace-nowrap"
                style={{ color: 'var(--color-fg)' }}
              >
                Auction Master
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePinned}
              className="p-1.5 rounded-md transition-colors focus-ring shrink-0"
              style={{ color: pinned ? 'var(--color-accent)' : 'var(--color-fg-subtle)' }}
              title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
            >
              {pinned ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Sections */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-2 min-h-0">
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-0.5">
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-label-caps px-2 py-1"
                  style={{ color: 'var(--color-fg-subtle)' }}
                >
                  {section.title}
                </motion.div>
              )}
            </AnimatePresence>
            {section.items.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                active={activeTab === item.id}
                expanded={expanded}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom — settings, theme, user */}
      <div className="px-2 mt-2 flex flex-col gap-1.5">
        <NavButton
          item={{ id: 'settings', label: 'Settings', icon: <Settings size={18} strokeWidth={1.75} /> }}
          active={activeTab === 'settings'}
          expanded={expanded}
          onClick={() => onTabChange('settings')}
        />

        <div
          className="rounded-lg p-1 flex items-center gap-1"
          style={{ background: 'var(--color-surface-2)' }}
        >
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all focus-ring',
                theme === t.value
                  ? ''
                  : 'opacity-60 hover:opacity-100'
              )}
              style={{
                background: theme === t.value ? 'var(--color-surface-1)' : 'transparent',
                color: theme === t.value ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                boxShadow: theme === t.value ? 'var(--shadow-glass-sm)' : 'none',
              }}
              title={`${t.label} theme (currently ${resolvedTheme})`}
            >
              {t.icon}
              {expanded && <span>{t.label}</span>}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((s) => !s)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors focus-ring',
              userMenuOpen ? '' : 'hover:bg-[var(--color-surface-2)]'
            )}
            style={{ background: userMenuOpen ? 'var(--color-surface-2)' : 'transparent' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'var(--color-accent-soft)',
                color: 'var(--color-accent)',
              }}
            >
              <User size={14} />
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--color-fg)' }}>
                    Account
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-lg overflow-hidden glass-3"
              >
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    else {
                      localStorage.removeItem('am_token');
                      window.location.reload();
                    }
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
                  style={{ color: 'var(--color-loss)' }}
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}

function NavButton({
  item,
  active,
  expanded,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={!expanded ? item.label : undefined}
      className={cn(
        'group relative flex items-center w-full rounded-lg transition-all focus-ring',
        expanded ? 'px-2.5 py-2 gap-2.5' : 'p-2 justify-center'
      )}
      style={{
        background: active ? 'var(--color-accent-soft)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-fg-muted)',
      }}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: 'var(--color-accent)' }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-medium whitespace-nowrap flex-1 text-left"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {expanded && item.badge !== undefined && item.badge > 0 && (
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums"
          style={{ background: 'var(--color-accent)', color: 'var(--color-fg-onaccent)' }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
