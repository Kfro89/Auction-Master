import { Search, Command, Bell, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  onCmdK?: () => void;
  rightSlot?: React.ReactNode;
  endingSoonCount?: number;
}

export function TopBar({ title, subtitle, onCmdK, rightSlot, endingSoonCount = 0 }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 hairline-b"
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--color-glass-1-bg)',
        backdropFilter: 'blur(var(--blur-shell)) saturate(var(--saturate-glass))',
        WebkitBackdropFilter: 'blur(var(--blur-shell)) saturate(var(--saturate-glass))',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {title && (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0"
          >
            <h1 className="text-headline-md truncate" style={{ color: 'var(--color-fg)' }}>
              {title}
            </h1>
            {subtitle && (
              <div className="text-xs truncate" style={{ color: 'var(--color-fg-muted)' }}>
                {subtitle}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {endingSoonCount > 0 && (
          <span
            className="status-pill"
            style={{
              background: 'var(--color-pending-soft)',
              color: 'var(--color-pending)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-pending)' }}
            />
            {endingSoonCount} ending soon
          </span>
        )}

        {rightSlot}

        <button
          onClick={onCmdK}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all focus-ring',
            'hover:bg-[var(--color-surface-2)]'
          )}
          style={{
            background: 'var(--color-surface-1)',
            color: 'var(--color-fg-muted)',
            border: '1px solid var(--color-border-hairline)',
          }}
        >
          <Search size={13} />
          <span>Search</span>
          <kbd
            className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
            style={{
              background: 'var(--color-surface-2)',
              color: 'var(--color-fg-subtle)',
            }}
          >
            <Command size={9} /> K
          </kbd>
        </button>

        <button
          className="p-2 rounded-md transition-colors focus-ring hover:bg-[var(--color-surface-2)]"
          style={{ color: 'var(--color-fg-muted)' }}
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all focus-ring btn-primary"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New</span>
        </button>
      </div>
    </header>
  );
}
