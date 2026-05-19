import { useSearchParams } from "react-router-dom"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ValuationPanel } from "./ValuationPanel"
import { BidForm } from "./BidForm"
import type { ResearchItem } from "@/lib/types"

export function ItemDetailSheet({ items }: { items: ResearchItem[] }) {
  const [params, setParams] = useSearchParams()
  const itemId = params.get("item") ? Number(params.get("item")) : null
  const item = items.find((i) => i.id === itemId) ?? null
  const defaultTab = params.get("tab") ?? "overview"

  const close = () => {
    const next = new URLSearchParams(params)
    next.delete("item")
    next.delete("tab")
    setParams(next)
  }

  return (
    <Sheet open={item !== null} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[600px] p-0 flex flex-col">
        {item && (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <SheetTitle className="text-sm leading-snug line-clamp-2">{item.title}</SheetTitle>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.auction_house_name && <Badge variant="secondary" className="text-xs">{item.auction_house_name}</Badge>}
                    {item.condition && <Badge variant="outline" className="text-xs">{item.condition}</Badge>}
                    {item.lot_number && <span className="text-xs text-muted-foreground">Lot #{item.lot_number}</span>}
                  </div>
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue={defaultTab} className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="mx-6 mt-3 w-auto justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bid">Place Bid</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 py-4">
                <TabsContent value="overview" className="mt-0">
                  <ValuationPanel item={item} />
                </TabsContent>

                <TabsContent value="bid" className="mt-0">
                  <BidForm item={item} onSuccess={close} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
