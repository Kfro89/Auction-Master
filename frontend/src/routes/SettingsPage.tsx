import { useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const AUCTION_HOUSES = [
  { key: "rmeb", name: "Rolle & McEntire / Whitley" },
  { key: "rol", name: "Roller Auctions" },
  { key: "public_surplus", name: "Public Surplus" },
  { key: "dickensheet", name: "Dickensheet (BidWrangler)" },
  { key: "govdeals", name: "GovDeals" },
]

function CredentialCard({ auctionKey, name }: { auctionKey: string; name: string }) {
  const [cookieJson, setCookieJson] = useState("")
  const [userAgent, setUserAgent] = useState("")
  const [saving, setSaving] = useState(false)
  const [jsonError, setJsonError] = useState("")

  const save = async () => {
    setJsonError("")
    let parsed: Record<string, string>
    try {
      parsed = cookieJson.trim() ? JSON.parse(cookieJson) : {}
    } catch {
      setJsonError("Invalid JSON — must be a {\"name\": \"value\"} object")
      return
    }
    setSaving(true)
    try {
      await apiFetch("/api/credentials/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_house: auctionKey, cookies: parsed, user_agent: userAgent || null }),
      })
      toast.success(`Credentials saved for ${name}`)
      setCookieJson("")
      setUserAgent("")
    } catch {
      toast.error("Failed to save credentials")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{name}</CardTitle>
          <Badge variant="outline" className="text-xs font-mono">{auctionKey}</Badge>
        </div>
        <CardDescription className="text-xs">Paste session cookies to enable bidding on this platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-1.5">
          <Label className="text-xs">Cookies (JSON)</Label>
          <Textarea
            value={cookieJson}
            onChange={e => { setCookieJson(e.target.value); setJsonError("") }}
            placeholder={'{"session_id": "abc123", "auth": "xyz"}'}
            className="font-mono text-xs h-20 resize-none"
          />
          {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">User-Agent <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            value={userAgent}
            onChange={e => setUserAgent(e.target.value)}
            placeholder="Mozilla/5.0…"
            className="text-xs h-8"
          />
        </div>
        <Button size="sm" onClick={save} disabled={saving} className="w-full">
          {saving ? "Saving…" : "Save credentials"}
        </Button>
      </CardContent>
    </Card>
  )
}

export function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-sm font-semibold">Auction house credentials</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Session cookies are encrypted at rest. They are only used to authenticate bids on your behalf.
        </p>
      </div>
      <Separator />
      <div className="grid gap-4">
        {AUCTION_HOUSES.map(({ key, name }) => (
          <CredentialCard key={key} auctionKey={key} name={name} />
        ))}
      </div>
    </div>
  )
}
