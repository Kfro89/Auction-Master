import { useResearchItems } from "@/hooks/useResearchItems"
import { ResearchTable, ResearchTableSkeleton } from "@/components/research/ResearchTable"
import { EmptyState } from "@/components/common/EmptyState"

export function ResearchPage() {
  const { data, isLoading, isError } = useResearchItems()

  if (isLoading) return <div className="p-6"><ResearchTableSkeleton /></div>
  if (isError) return (
    <div className="p-6">
      <EmptyState title="Failed to load items" description="Check your connection and try again" />
    </div>
  )

  return (
    <div className="p-6">
      <ResearchTable items={data ?? []} />
    </div>
  )
}
