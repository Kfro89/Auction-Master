import { useBids } from "@/hooks/useBids"
import { BidsTable, BidsTableSkeleton } from "@/components/bidding/BidsTable"
import { EmptyState } from "@/components/common/EmptyState"

export function BiddingPage() {
  const { data, isLoading, isError } = useBids()

  if (isLoading) return <div className="p-6"><BidsTableSkeleton /></div>
  if (isError) return (
    <div className="p-6">
      <EmptyState title="Failed to load bids" description="Check your connection and try again" />
    </div>
  )

  const active = data?.filter((i) => !i.is_hidden_from_active) ?? []

  return (
    <div className="p-6">
      <BidsTable items={active} />
    </div>
  )
}
