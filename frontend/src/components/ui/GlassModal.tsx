import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'sheet';

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  sheet: 'max-w-3xl',
};

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: Size;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  hideCloseButton?: boolean;
}

export function GlassModal({
  isOpen,
  onClose,
  size = 'md',
  title,
  description,
  children,
  footer,
  hideCloseButton,
}: GlassModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            style={{
              background: 'rgba(15, 17, 21, 0.32)',
              backdropFilter: 'blur(10px) saturate(140%)',
              WebkitBackdropFilter: 'blur(10px) saturate(140%)',
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full glass-3 overflow-hidden flex flex-col max-h-[90vh]',
              SIZE_CLASSES[size]
            )}
            style={{ borderRadius: 'var(--radius-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || !hideCloseButton) && (
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
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-md transition-colors focus-ring hover:bg-[var(--color-surface-2)] shrink-0"
                    style={{ color: 'var(--color-fg-muted)' }}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="px-6 py-4 hairline-t flex items-center justify-end gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
