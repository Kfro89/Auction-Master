import { useState, type FormEvent } from 'react';
import { Loader2, Lock, Moon, Sun, Monitor } from 'lucide-react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AmbientBackdrop } from '../components/shell/AmbientBackdrop';
import { GlassSurface } from '../components/ui';

interface LoginViewProps {
  onLogin: (token: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  return (
    <ThemeProvider>
      <LoginScreen onLogin={onLogin} />
    </ThemeProvider>
  );
}

function LoginScreen({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data?.access_token;
        if (typeof token === 'string' && token.length > 0) {
          localStorage.setItem('am_token', token);
          onLogin(token);
        } else {
          setError('Server response missing access token');
        }
      } else {
        let detail = 'Invalid username or password';
        try {
          const errData = await response.json();
          if (typeof errData?.detail === 'string') detail = errData.detail;
          else if (errData?.detail?.message) detail = errData.detail.message;
        } catch {
          /* ignore */
        }
        setError(detail);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AmbientBackdrop />
      <div className="relative min-h-screen flex items-center justify-center p-6">
        {/* Theme toggle in top-right */}
        <div className="fixed top-4 right-4 z-30">
          <ThemeToggle />
        </div>

        <GlassSurface
          tier={3}
          radius="lg"
          padded="lg"
          className="w-full"
          style={{ maxWidth: 420 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-1">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                  boxShadow: '0 8px 24px color-mix(in srgb, var(--color-accent) 35%, transparent)',
                }}
              >
                <Lock size={22} strokeWidth={2} />
              </div>
              <div className="text-center">
                <h1
                  className="text-headline-lg"
                  style={{ color: 'var(--color-fg)' }}
                >
                  Auction Master
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-fg-muted)' }}>
                  Sign in to continue
                </p>
              </div>
            </div>

            <FormField label="Username">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                required
                autoComplete="username"
                className="login-input"
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="login-input"
              />
            </FormField>

            {error && (
              <div
                role="alert"
                className="text-sm px-3 py-2 rounded-md"
                style={{
                  background: 'color-mix(in srgb, var(--color-loss) 10%, transparent)',
                  color: 'var(--color-loss)',
                  border: '1px solid color-mix(in srgb, var(--color-loss) 22%, transparent)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="h-11 rounded-md font-semibold text-sm transition-all focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--color-accent)',
                color: 'white',
                boxShadow: '0 4px 14px color-mix(in srgb, var(--color-accent) 28%, transparent)',
              }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <Loader2 size={14} className="animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </GlassSurface>
      </div>

      <style>{`
        .login-input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          font-size: 14px;
          color: var(--color-fg);
          background: var(--color-surface-1);
          border: 1px solid var(--color-border-hairline);
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 120ms ease, background 120ms ease, box-shadow 120ms ease;
        }
        .login-input:focus {
          border-color: var(--color-accent);
          background: var(--color-surface-2);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 16%, transparent);
        }
      `}</style>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-caps">{label}</span>
      {children}
    </label>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options: { value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun size={14} />, label: 'Light' },
    { value: 'dark', icon: <Moon size={14} />, label: 'Dark' },
    { value: 'system', icon: <Monitor size={14} />, label: 'System' },
  ];
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-md p-0.5"
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border-hairline)',
        backdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {options.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-label={o.label}
            title={o.label}
            className="h-7 w-7 rounded flex items-center justify-center transition-colors focus-ring"
            style={{
              background: active ? 'var(--color-surface-2)' : 'transparent',
              color: active ? 'var(--color-fg)' : 'var(--color-fg-muted)',
            }}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}
