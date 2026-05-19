import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/format"

export function Money({ value, className }: { value: number | null | undefined; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{formatMoney(value)}</span>
}
