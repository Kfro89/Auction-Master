import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, width, height, rounded = 'sm' }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse', className)}
      style={{
        width,
        height,
        background: `linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-surface-3) 50%, var(--color-surface-2) 100%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.6s ease-in-out infinite',
        borderRadius:
          rounded === 'full'
            ? '9999px'
            : rounded === 'lg'
            ? 'var(--radius-md)'
            : rounded === 'md'
            ? 'var(--radius-sm)'
            : 'var(--radius-xs)',
      }}
    />
  );
}
