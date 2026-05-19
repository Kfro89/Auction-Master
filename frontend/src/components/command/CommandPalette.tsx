import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Search, Gavel, Star, Package, ShoppingCart,
  Store, BookOpen, Settings, RotateCcw, Car,
} from "lucide-react"
import { subscribeCommands } from "@/hooks/useCommandRegistry"

const NAV_COMMANDS = [
  { id: "nav-research",   label: "Research",    url: "/research",    Icon: Search },
  { id: "nav-watchlist",  label: "Watchlist",   url: "/watchlist",   Icon: Star },
  { id: "nav-bidding",    label: "Bidding",     url: "/bidding",     Icon: Gavel },
  { id: "nav-workqueue",  label: "Work Queue",  url: "/workqueue",   Icon: Package },
  { id: "nav-fulfillment",label: "Fulfillment", url: "/fulfillment", Icon: ShoppingCart },
  { id: "nav-store",      label: "Store",       url: "/store",       Icon: Store },
  { id: "nav-ledger",     label: "Ledger",      url: "/ledger",      Icon: BookOpen },
  { id: "nav-vehicles",   label: "Vehicles",    url: "/vehicles",    Icon: Car },
  { id: "nav-rma",        label: "RMA",         url: "/rma",         Icon: RotateCcw },
  { id: "nav-settings",   label: "Settings",    url: "/settings",    Icon: Settings },
]

interface PageCommand {
  id: string
  label: string
  group: string
  action: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [pageCommands, setPageCommands] = useState<PageCommand[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = subscribeCommands(setPageCommands)
    return unsub
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const run = useCallback((action: () => void) => {
    setOpen(false)
    action()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {pageCommands.length > 0 && (
          <>
            <CommandGroup heading="Page actions">
              {pageCommands.map((cmd) => (
                <CommandItem key={cmd.id} onSelect={() => run(cmd.action)}>
                  {cmd.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigate">
          {NAV_COMMANDS.map(({ id, label, url, Icon }) => (
            <CommandItem key={id} onSelect={() => run(() => navigate(url))}>
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
