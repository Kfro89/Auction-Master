import { cn } from "@/lib/utils"
import { formatPercent } from "@/lib/format"

export function Percent({ value, colorCode = false, className }: { value: number | null | undefined; colorCode?: boolean; className?: string }) {
  const color = colorCode && value != null
    ? value >= 0.2 ? "text-green-600 dark:text-green-400"
      : value >= 0 ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400"
    : ""
  return <span className={cn("tabular-nums", color, className)}>{formatPercent(value)}</span>
}
