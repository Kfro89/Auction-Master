import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface SidebarContextValue {
  pinned: boolean;
  hovered: boolean;
  expanded: boolean;
  setPinned: (pinned: boolean) => void;
  setHovered: (hovered: boolean) => void;
  togglePinned: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

const STORAGE_KEY = 'am_sidebar_pinned';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [pinned, setPinnedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });
  const [hovered, setHovered] = useState(false);

  const setPinned = useCallback((next: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(next));
    setPinnedState(next);
  }, []);

  const togglePinned = useCallback(() => setPinned(!pinned), [pinned, setPinned]);

  const expanded = pinned || hovered;

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-w',
      expanded ? 'var(--sidebar-w-expanded)' : 'var(--sidebar-w-collapsed)'
    );
  }, [expanded]);

  return (
    <SidebarContext.Provider value={{ pinned, hovered, expanded, setPinned, setHovered, togglePinned }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
