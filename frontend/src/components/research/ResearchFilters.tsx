import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCcw, ScanSearch, LayoutGrid, List } from "lucide-react"

interface ResearchFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  showArchived: boolean
  onShowArchivedChange: (v: boolean) => void
  endingSoon: boolean
  onEndingSoonChange: (v: boolean) => void
  primaryCategories: string[]
  subCategories: string[]
  tags: string[]
  selectedPrimaryCategory: string
  onPrimaryCategoryChange: (v: string) => void
  selectedSubCategory: string
  onSubCategoryChange: (v: string) => void
  selectedTag: string
  onTagChange: (v: string) => void
  onScan: () => void
  onReevaluate: () => void
  isScanning: boolean
  isReevaluating: boolean
  viewMode: 'table' | 'grid'
  onViewModeChange: (mode: 'table' | 'grid') => void
}

export function ResearchFilters({
  search, onSearchChange,
  showArchived, onShowArchivedChange,
  endingSoon, onEndingSoonChange,
  primaryCategories, subCategories, tags,
  selectedPrimaryCategory, onPrimaryCategoryChange,
  selectedSubCategory, onSubCategoryChange,
  selectedTag, onTagChange,
  onScan, onReevaluate,
  isScanning, isReevaluating,
  viewMode, onViewModeChange
}: ResearchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 pb-4 justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search items…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-64"
        />

        <Select value={selectedPrimaryCategory} onValueChange={onPrimaryCategoryChange}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Primary Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Primary</SelectItem>
            {primaryCategories.filter(Boolean).map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSubCategory} onValueChange={onSubCategoryChange} disabled={subCategories.length === 0}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Sub Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sub</SelectItem>
            {subCategories.filter(Boolean).map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTag} onValueChange={onTagChange}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.filter(Boolean).map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-2">
          <Switch id="ending-soon" checked={endingSoon} onCheckedChange={onEndingSoonChange} />
          <Label htmlFor="ending-soon" className="text-sm cursor-pointer">Ending in 24h</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="show-archived" checked={showArchived} onCheckedChange={onShowArchivedChange} />
          <Label htmlFor="show-archived" className="text-sm cursor-pointer">Show archived</Label>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-md mr-2">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-9 px-0 rounded-r-none"
            onClick={() => onViewModeChange('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-9 px-0 rounded-l-none"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={onScan} disabled={isScanning}>
          <ScanSearch className="mr-2 h-4 w-4" />
          {isScanning ? "Scanning..." : "Scan for New"}
        </Button>
        <Button variant="outline" size="sm" onClick={onReevaluate} disabled={isReevaluating}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          {isReevaluating ? "Reevaluating..." : "Reevaluate"}
        </Button>
      </div>
    </div>
  )
}

