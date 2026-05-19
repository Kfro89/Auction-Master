import { useMatches, useNavigate } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { clearToken } from "@/lib/auth"
import { LogOut, Command } from "lucide-react"

export function TopBar() {
  const matches = useMatches()
  const navigate = useNavigate()
  const title = matches
    .filter((m) => Boolean((m.handle as { title?: string })?.title))
    .map((m) => (m.handle as { title: string }).title)
    .at(-1) ?? "Auction Master"

  const signOut = () => {
    clearToken()
    navigate("/login")
  }

  return (
    <header className="flex h-12 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <span className="font-medium text-sm flex-1">{title}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground"
        onClick={() => {
          const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
          window.dispatchEvent(e)
        }}
      >
        <Command className="h-3 w-3" />
        <span className="hidden sm:inline">K</span>
      </Button>
      <ThemeToggle />
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={signOut}>
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </Button>
    </header>
  )
}
