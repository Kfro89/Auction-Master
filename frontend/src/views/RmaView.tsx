import { useState } from 'react';
import { Camera, ShieldAlert, Search, Loader2 } from 'lucide-react';
import { Button, GlassSurface, StatusBadge, EmptyState } from '../components/ui';
import { useToast } from '../components/shell/ToastProvider';
import { formatItemName } from '../utils/formatters';

interface InventoryItem {
  id: number;
  anti_tamper_tag?: string;
  title?: string;
  product_name?: string;
  brand?: string;
  condition?: string;
}

export default function RmaView() {
  const { success, error: toastError } = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [itemIdInput, setItemIdInput] = useState('');
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchItem = async () => {
    if (!itemIdInput) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${itemIdInput}`);
      if (res.ok) {
        setItem(await res.json());
      } else {
        toastError('Item not found');
        setItem(null);
      }
    } catch {
      toastError('Network error');
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <GlassSurface tier={2} radius="md" padded="md" className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
          <span className="text-label-caps">Item ID</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={itemIdInput}
              onChange={(e) => setItemIdInput(e.target.value)}
              placeholder="e.g. 123"
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleFetchItem}
              disabled={loading || !itemIdInput}
              leftIcon={loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            >
              Fetch
            </Button>
          </div>
        </div>
        {item && (
          <div className="flex items-center gap-2">
            <StatusBadge tone="profit" dot>Loaded</StatusBadge>
            <span className="text-sm" style={{ color: 'var(--color-fg)' }}>
              {formatItemName(item)}
            </span>
          </div>
        )}
      </GlassSurface>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-4">
          <h2 className="text-headline-md" style={{ color: 'var(--color-fg)' }}>
            Original Staging
          </h2>
          <div className="flex flex-col gap-1">
            <span className="text-label-caps">Anti-Tamper Tag</span>
            <span
              className="text-base font-mono px-3 py-2 rounded-md w-fit"
              style={{
                background: 'var(--color-surface-1)',
                border: '1px solid var(--color-border-hairline)',
                color: 'var(--color-fg)',
              }}
            >
              {item?.anti_tamper_tag || '—'}
            </span>
          </div>
          <div
            className="flex-1 min-h-[220px] rounded-md flex items-center justify-center"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px dashed var(--color-border-hairline)',
              color: 'var(--color-fg-subtle)',
            }}
          >
            <Camera size={40} strokeWidth={1.25} />
          </div>
        </GlassSurface>

        <GlassSurface tier={2} radius="md" padded="md" className="flex flex-col gap-4">
          <h2 className="text-headline-md" style={{ color: 'var(--color-fg)' }}>
            Verification
          </h2>

          <Button
            variant="secondary"
            size="lg"
            leftIcon={<Camera size={16} />}
            className="w-full"
            disabled={!item}
          >
            Activate Scanner
          </Button>

          <div className="flex-1" />

          <label
            className="flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors"
            style={{
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-border-hairline)',
            }}
          >
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm" style={{ color: 'var(--color-fg)' }}>
              I confirm the anti-tamper tag is intact and matches original photos.
            </span>
          </label>

          <Button
            variant="destructive"
            size="lg"
            disabled={!confirmed || !item}
            className="w-full"
            leftIcon={<ShieldAlert size={16} />}
            onClick={() => success('Refund issued', `Item ${item?.id}`)}
          >
            Issue Refund
          </Button>
        </GlassSurface>
      </div>

      {!item && (
        <EmptyState
          icon={<ShieldAlert size={20} />}
          title="No item loaded"
          description="Enter an inventory item ID above to begin return verification."
        />
      )}
    </div>
  );
}
