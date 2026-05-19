import { NavLink, useLocation } from "react-router-dom"
import {
  Search,
  Gavel,
  Star,
  Package,
  ShoppingCart,
  Store,
  BookOpen,
  Settings,
  RotateCcw,
  Car,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { title: "Research", url: "/research", icon: Search },
  { title: "Watchlist", url: "/watchlist", icon: Star },
  { title: "Bidding", url: "/bidding", icon: Gavel },
]

const WORKFLOW_ITEMS = [
  { title: "Work Queue", url: "/workqueue", icon: Package },
  { title: "Fulfillment", url: "/fulfillment", icon: ShoppingCart },
  { title: "Store", url: "/store", icon: Store },
]

const OTHER_ITEMS = [
  { title: "Ledger", url: "/ledger", icon: BookOpen },
  { title: "Vehicles", url: "/vehicles", icon: Car },
  { title: "RMA", url: "/rma", icon: RotateCcw },
  { title: "Settings", url: "/settings", icon: Settings },
]

function NavGroup({ label, items }: { label: string; items: typeof NAV_ITEMS }) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active}>
                  <NavLink to={item.url} className={cn("flex items-center gap-2")}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <span className="text-sm font-semibold tracking-tight text-foreground">Auction Master</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Acquire" items={NAV_ITEMS} />
        <NavGroup label="Workflow" items={WORKFLOW_ITEMS} />
        <NavGroup label="Other" items={OTHER_ITEMS} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
