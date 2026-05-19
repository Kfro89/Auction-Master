import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Command } from 'lucide-react';
import { useCommandContext } from '../contexts/CommandContext';
import { cn } from '../utils/cn';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const NAV_COMMANDS = [
  { label: 'Go to Research', tab: 'research' },
  { label: 'Go to Watchlist', tab: 'watchlist' },
  { label: 'Go to Bidding', tab: 'bidding' },
  { label: 'Go to Work Queue', tab: 'work-queue' },
  { label: 'Go to Fulfillment', tab: 'fulfillment' },
  { label: 'Go to Store', tab: 'store' },
  { label: 'Go to Ledger', tab: 'ledger' },
  { label: 'Go to Vehicles', tab: 'vehicles' },
  { label: 'Go to Settings', tab: 'settings' },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { contextCommands } = useCommandContext();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => setSelectedIndex(0), [query]);

  const allCommands = useMemo(
    () => [
      ...NAV_COMMANDS.map((c) => ({
        id: c.tab,
        label: c.label,
        action: () => {
          onNavigate(c.tab);
          onClose();
        },
        group: 'Navigation',
      })),
      ...contextCommands,
    ],
    [contextCommands, onNavigate, onClose]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allCommands;
    return allCommands.filter((c) => c.label.toLowerCase().includes(q));
  }, [allCommands, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((c) => {
      const g = c.group || 'Other';
      (groups[g] ||= []).push(c);
    });
    return groups;
  }, [filtered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filtered.length > 0) setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (filtered.length > 0) {
        const safe = selectedIndex < filtered.length ? selectedIndex : 0;
        filtered[safe].action();
      }
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[210] flex items-start justify-center pt-[15vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            style={{
              background: 'rgba(15, 17, 21, 0.36)',
              backdropFilter: 'blur(12px) saturate(140%)',
              WebkitBackdropFilter: 'blur(12px) saturate(140%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[640px] glass-3 overflow-hidden flex flex-col"
            style={{ borderRadius: 'var(--radius-xl)' }}
            onKeyDown={handleKeyDown}
          >
            <div
              className="flex items-center px-5 py-4 hairline-b"
              style={{ background: 'transparent' }}
            >
              <Search size={18} style={{ color: 'var(--color-fg-subtle)' }} className="mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-base font-medium"
                style={{
                  color: 'var(--color-fg)',
                }}
                placeholder="Type a command or search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd
                className="ml-3 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-fg-subtle)',
                }}
              >
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-fg-muted)' }}>
                  No matches for <span className="font-semibold">"{query}"</span>
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-2 last:mb-0">
                    <div className="text-label-caps px-3 py-1.5">{group}</div>
                    {items.map((cmd) => {
                      const globalIndex = filtered.findIndex((c) => c.id === cmd.id);
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => cmd.action()}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors',
                            isSelected ? '' : ''
                          )}
                          style={{
                            background: isSelected ? 'var(--color-accent-soft)' : 'transparent',
                            color: isSelected ? 'var(--color-accent)' : 'var(--color-fg)',
                          }}
                        >
                          <span className="font-medium">{cmd.label}</span>
                          {isSelected && (
                            <ArrowRight size={14} style={{ color: 'var(--color-accent)' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div
              className="px-4 py-2.5 hairline-t flex items-center justify-between text-[11px]"
              style={{ color: 'var(--color-fg-subtle)' }}
            >
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'var(--color-surface-2)' }}>↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'var(--color-surface-2)' }}>↵</kbd>
                  Select
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Command size={10} /> + K to toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CommandPalette;
