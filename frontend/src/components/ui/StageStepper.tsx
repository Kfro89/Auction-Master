import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const INVENTORY_STAGES = [
  'WON',
  'PAID',
  'STAGING',
  'REFURBISH',
  'DRAFTING',
  'LISTED',
  'SOLD',
] as const;

export type InventoryStage = (typeof INVENTORY_STAGES)[number];

const STAGE_LABEL: Record<InventoryStage, string> = {
  WON: 'Won',
  PAID: 'Paid',
  STAGING: 'Staging',
  REFURBISH: 'Refurb',
  DRAFTING: 'Drafting',
  LISTED: 'Listed',
  SOLD: 'Sold',
};

interface StageStepperProps {
  current: InventoryStage;
  onSelect?: (stage: InventoryStage) => void;
  compact?: boolean;
  className?: string;
}

export function StageStepper({ current, onSelect, compact = false, className }: StageStepperProps) {
  const currentIdx = INVENTORY_STAGES.indexOf(current);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {INVENTORY_STAGES.map((stage, i) => {
          const done = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={stage}
              className="relative flex items-center"
              title={STAGE_LABEL[stage]}
            >
              <div
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: done
                    ? 'var(--color-accent)'
                    : isCurrent
                    ? 'var(--color-accent)'
                    : 'var(--color-border-strong)',
                  boxShadow: isCurrent ? '0 0 0 3px var(--color-accent-ring)' : 'none',
                }}
              />
              {i < INVENTORY_STAGES.length - 1 && (
                <div
                  className="w-3 h-px"
                  style={{
                    background: done ? 'var(--color-accent)' : 'var(--color-border-hairline)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      {INVENTORY_STAGES.map((stage, i) => {
        const done = i < currentIdx;
        const isCurrent = i === currentIdx;
        const interactive = !!onSelect;
        return (
          <div key={stage} className="flex items-center flex-1 last:flex-initial">
            <button
              type="button"
              onClick={() => interactive && onSelect(stage)}
              disabled={!interactive}
              className={cn(
                'flex flex-col items-center gap-1.5 group',
                interactive && 'cursor-pointer focus-ring rounded-md p-1 -m-1'
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                className="relative flex items-center justify-center w-7 h-7 rounded-full"
                style={{
                  background: done
                    ? 'var(--color-accent)'
                    : isCurrent
                    ? 'var(--color-accent-soft)'
                    : 'var(--color-surface-2)',
                  border: isCurrent ? '2px solid var(--color-accent)' : '1px solid var(--color-border-hairline)',
                  boxShadow: isCurrent ? '0 0 0 4px var(--color-accent-ring)' : 'none',
                }}
              >
                {done ? (
                  <Check size={14} strokeWidth={3} style={{ color: 'var(--color-fg-onaccent)' }} />
                ) : (
                  <span
                    className="text-[10px] font-semibold tabular-nums"
                    style={{
                      color: isCurrent ? 'var(--color-accent)' : 'var(--color-fg-subtle)',
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </motion.div>
              <span
                className="text-[10px] font-medium uppercase tracking-wide whitespace-nowrap"
                style={{
                  color: done
                    ? 'var(--color-fg-muted)'
                    : isCurrent
                    ? 'var(--color-accent)'
                    : 'var(--color-fg-subtle)',
                }}
              >
                {STAGE_LABEL[stage]}
              </span>
            </button>
            {i < INVENTORY_STAGES.length - 1 && (
              <div
                className="flex-1 h-px mx-1.5 -mt-3"
                style={{
                  background: done ? 'var(--color-accent)' : 'var(--color-border-hairline)',
                  minWidth: 12,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function nextStage(current: InventoryStage): InventoryStage | null {
  const idx = INVENTORY_STAGES.indexOf(current);
  if (idx < 0 || idx >= INVENTORY_STAGES.length - 1) return null;
  return INVENTORY_STAGES[idx + 1];
}

export function prevStage(current: InventoryStage): InventoryStage | null {
  const idx = INVENTORY_STAGES.indexOf(current);
  if (idx <= 0) return null;
  return INVENTORY_STAGES[idx - 1];
}
