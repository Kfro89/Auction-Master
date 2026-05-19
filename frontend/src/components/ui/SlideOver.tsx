import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function SlideOver({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = '480px',
}: SlideOverProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[190] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            style={{ background: 'rgba(15, 17, 21, 0.24)' }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="relative h-full glass-3 flex flex-col overflow-hidden"
            style={{
              width: `min(${width}, 100vw)`,
              borderTopLeftRadius: 'var(--radius-xl)',
              borderBottomLeftRadius: 'var(--radius-xl)',
            }}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 hairline-b">
              <div className="min-w-0">
                {title && (
                  <h2 className="text-headline-md" style={{ color: 'var(--color-fg)' }}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-fg-muted)' }}>
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors focus-ring hover:bg-[var(--color-surface-2)] shrink-0"
                style={{ color: 'var(--color-fg-muted)' }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="px-6 py-4 hairline-t flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
