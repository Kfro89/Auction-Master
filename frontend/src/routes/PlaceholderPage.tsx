import { useMatches } from "react-router-dom"

export function PlaceholderPage() {
  const matches = useMatches()
  const handle = matches[matches.length - 1]?.handle as { title?: string } | undefined

  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{handle?.title ?? "Coming soon"}</p>
        <p className="text-sm text-muted-foreground">This view is in progress</p>
      </div>
    </div>
  )
}
