import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface ResearchFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  showArchived: boolean
  onShowArchivedChange: (v: boolean) => void
  endingSoon: boolean
  onEndingSoonChange: (v: boolean) => void
}

export function ResearchFilters({
  search, onSearchChange,
  showArchived, onShowArchivedChange,
  endingSoon, onEndingSoonChange,
}: ResearchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 pb-4">
      <Input
        placeholder="Search items…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 w-64"
      />
      <div className="flex items-center gap-2">
        <Switch id="ending-soon" checked={endingSoon} onCheckedChange={onEndingSoonChange} />
        <Label htmlFor="ending-soon" className="text-sm cursor-pointer">Ending in 24h</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="show-archived" checked={showArchived} onCheckedChange={onShowArchivedChange} />
        <Label htmlFor="show-archived" className="text-sm cursor-pointer">Show archived</Label>
      </div>
    </div>
  )
}
