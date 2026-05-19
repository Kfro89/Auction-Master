import { useTheme } from '../../contexts/ThemeContext';

export function AmbientBackdrop() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: isDark ? '#0A0B10' : '#FBFAF8' }}
    >
      <div
        className="absolute inset-[-20%]"
        style={{
          willChange: 'transform',
          animation: 'ambient-drift 45s ease-in-out infinite',
          background: isDark
            ? `
              radial-gradient(60% 50% at 20% 25%, rgba(42, 26, 74, 0.55), transparent 60%),
              radial-gradient(50% 45% at 80% 20%, rgba(26, 21, 48, 0.50), transparent 60%),
              radial-gradient(55% 50% at 75% 85%, rgba(10, 58, 74, 0.45), transparent 65%),
              radial-gradient(40% 40% at 15% 90%, rgba(38, 24, 60, 0.40), transparent 65%)
            `
            : `
              radial-gradient(60% 50% at 22% 25%, rgba(255, 233, 219, 0.65), transparent 60%),
              radial-gradient(55% 50% at 80% 18%, rgba(233, 228, 255, 0.55), transparent 60%),
              radial-gradient(50% 50% at 78% 82%, rgba(220, 245, 234, 0.55), transparent 65%),
              radial-gradient(45% 45% at 18% 92%, rgba(255, 241, 222, 0.45), transparent 65%)
            `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );
}
