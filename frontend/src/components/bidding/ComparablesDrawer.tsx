import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useComparables } from "@/hooks/useBids"
import { formatMoney, formatDate } from "@/lib/format"
import type { BidItem } from "@/lib/types"

interface ComparablesDrawerProps {
  item: BidItem | null
  onClose: () => void
}

export function ComparablesDrawer({ item, onClose }: ComparablesDrawerProps) {
  const { data, isLoading } = useComparables(item?.id ?? null)

  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="text-sm leading-snug line-clamp-2">{item?.title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No comparables found</p>
          ) : (
            <div className="space-y-3">
              {data.map((comp, idx) => (
                <div key={idx} className="flex gap-3 rounded-lg border p-3 text-sm">
                  {comp.thumbnail && (
                    <img src={comp.thumbnail} alt="" className="h-12 w-12 rounded object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    {comp.url ? (
                      <a href={comp.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 font-medium hover:text-primary">
                        {comp.title}
                      </a>
                    ) : (
                      <p className="line-clamp-2 font-medium">{comp.title}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{formatMoney(comp.price)}</span>
                      {comp.condition && <span>{comp.condition}</span>}
                      {comp.sold_at && <span>{formatDate(comp.sold_at)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
