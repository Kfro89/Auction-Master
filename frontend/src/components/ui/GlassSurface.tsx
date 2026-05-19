import { type ReactNode, type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tier?: 1 | 2 | 3;
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padded?: boolean | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children?: ReactNode;
}

const RADIUS_MAP = {
  xs: 'var(--radius-xs)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
};

const PAD_MAP = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  ({ tier = 2, radius = 'md', padded, interactive, className, style, children, ...props }, ref) => {
    const padClass =
      padded === true ? PAD_MAP.md : padded ? PAD_MAP[padded as 'sm' | 'md' | 'lg'] : '';

    return (
      <div
        ref={ref}
        className={cn(
          `glass-${tier}`,
          padClass,
          interactive && 'transition-all duration-200 ease-[var(--ease-apple-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-glass-lg)] cursor-pointer',
          className
        )}
        style={{ borderRadius: RADIUS_MAP[radius], ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassSurface.displayName = 'GlassSurface';
