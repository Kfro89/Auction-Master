import { Badge } from "@/components/ui/badge"

type Status = "winning" | "outbid" | "won" | "lost" | null | undefined

export function BidStatusBadge({ status }: { status: Status }) {
  if (!status) return <Badge variant="secondary">Unknown</Badge>
  if (status === "winning") return <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">Winning</Badge>
  if (status === "won") return <Badge className="bg-green-600/15 text-green-800 dark:text-green-300 border-green-600/30">Won</Badge>
  if (status === "outbid") return <Badge variant="destructive">Outbid</Badge>
  if (status === "lost") return <Badge variant="outline" className="text-muted-foreground">Lost</Badge>
  return <Badge variant="secondary">{status}</Badge>
}
