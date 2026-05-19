import { useState, type ReactNode } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ItemThumbnailProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  badge?: ReactNode;
  rounded?: 'sm' | 'md' | 'lg';
}

const RADIUS_MAP = {
  sm: 'var(--radius-xs)',
  md: 'var(--radius-sm)',
  lg: 'var(--radius-md)',
};

export function ItemThumbnail({
  src,
  alt = '',
  size = 40,
  className,
  badge,
  rounded = 'md',
}: ItemThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const showFallback = !src || errored;

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden', className)}
      style={{
        width: size,
        height: size,
        borderRadius: RADIUS_MAP[rounded],
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border-hairline)',
      }}
    >
      {showFallback ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: 'var(--color-fg-subtle)' }}
        >
          <ImageIcon size={Math.max(14, size * 0.4)} strokeWidth={1.5} />
        </div>
      ) : (
        <>
          {!loaded && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, var(--color-surface-2) 0%, var(--color-surface-3) 50%, var(--color-surface-2) 100%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s ease-in-out infinite',
              }}
            />
          )}
          <img
            src={src!}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: loaded ? 1 : 0 }}
          />
        </>
      )}
      {badge && (
        <div className="absolute -top-1 -right-1 z-10">
          {badge}
        </div>
      )}
    </div>
  );
}
