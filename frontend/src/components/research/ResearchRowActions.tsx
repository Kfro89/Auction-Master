import { MoreHorizontal, Star, Archive, ExternalLink, Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ResearchItem } from "@/lib/types"

interface ResearchRowActionsProps {
  item: ResearchItem
  onWatch: (item: ResearchItem) => void
  onArchive: (item: ResearchItem) => void
  onBid: (item: ResearchItem) => void
}

export function ResearchRowActions({ item, onWatch, onArchive, onBid }: ResearchRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-7 w-7 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onWatch(item)}>
          <Star className="h-4 w-4 mr-2" />
          {item.is_watched ? "Unwatch" : "Watch"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onBid(item)}>
          <Gavel className="h-4 w-4 mr-2" />
          Place bid
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {item.url && (
          <DropdownMenuItem asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in new tab
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onArchive(item)}
          className={item.is_archived ? "" : "text-muted-foreground"}
        >
          <Archive className="h-4 w-4 mr-2" />
          {item.is_archived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
