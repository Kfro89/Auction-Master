import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_STYLES: Record<ToastTone, { color: string; icon: ReactNode }> = {
  success: { color: 'var(--color-profit)', icon: <CheckCircle2 size={16} /> },
  error: { color: 'var(--color-loss)', icon: <XCircle size={16} /> },
  warning: { color: 'var(--color-pending)', icon: <AlertCircle size={16} /> },
  info: { color: 'var(--color-accent)', icon: <Info size={16} /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) => toast({ tone: 'success', title, description }), [toast]);
  const error = useCallback((title: string, description?: string) => toast({ tone: 'error', title, description }), [toast]);
  const info = useCallback((title: string, description?: string) => toast({ tone: 'info', title, description }), [toast]);
  const warning = useCallback((title: string, description?: string) => toast({ tone: 'warning', title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = TONE_STYLES[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="glass-3 rounded-xl pointer-events-auto overflow-hidden flex items-start gap-3 px-4 py-3 min-w-[280px]"
                style={{ borderLeft: `3px solid ${style.color}` }}
              >
                <div style={{ color: style.color }} className="mt-0.5 shrink-0">
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>
                    {t.title}
                  </div>
                  {t.description && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-fg-muted)' }}>
                      {t.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 p-1 rounded transition-colors hover:bg-[var(--color-surface-2)] focus-ring"
                  style={{ color: 'var(--color-fg-subtle)' }}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
