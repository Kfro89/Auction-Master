import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}
      style={{
        background: 'var(--color-surface-1)',
        border: '1px dashed var(--color-border-hairline)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {icon && (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'var(--color-accent-soft)',
            color: 'var(--color-accent)',
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-headline-sm mb-1" style={{ color: 'var(--color-fg)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-md" style={{ color: 'var(--color-fg-muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
