import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useCountdown } from "@/hooks/useCountdown"

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h < 24) return `${h}h ${m}m`
  const d = Math.floor(h / 24)
  return `${d}d ${h % 24}h`
}

export function CountdownBadge({ endTime }: { endTime: string | null | undefined }) {
  const s = useCountdown(endTime)

  if (s === null) return <Badge variant="secondary">—</Badge>
  if (s <= 0) return <Badge variant="destructive">Ended</Badge>

  const variant =
    s < 60 ? "destructive" :
    s < 3600 ? "outline" :
    "secondary"

  const extraClass = s < 3600 && s >= 60 ? "border-orange-400 text-orange-600 dark:text-orange-400" : ""

  const badge = (
    <Badge variant={variant} className={extraClass}>
      {formatSeconds(s)}
    </Badge>
  )

  if (s < 10) {
    return (
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
        className="inline-flex"
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}
