import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/shell/AppLayout"
import { ProtectedRoute } from "@/components/shell/ProtectedRoute"
import { LoginPage } from "@/routes/LoginPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/research" replace /> },
          {
            path: "research",
            handle: { title: "Research" },
            lazy: () => import("@/routes/ResearchPage").then((m) => ({ Component: m.ResearchPage })),
          },
          {
            path: "watchlist",
            handle: { title: "Watchlist" },
            lazy: () => import("@/routes/WatchlistPage").then((m) => ({ Component: m.WatchlistPage })),
          },
          {
            path: "bidding",
            handle: { title: "Bidding" },
            lazy: () => import("@/routes/BiddingPage").then((m) => ({ Component: m.BiddingPage })),
          },
          {
            path: "workqueue",
            handle: { title: "Work Queue" },
            lazy: () => import("@/routes/WorkQueuePage").then((m) => ({ Component: m.WorkQueuePage })),
          },
          {
            path: "fulfillment",
            handle: { title: "Fulfillment" },
            lazy: () => import("@/routes/FulfillmentPage").then((m) => ({ Component: m.FulfillmentPage })),
          },
          {
            path: "ledger",
            handle: { title: "Ledger" },
            lazy: () => import("@/routes/LedgerPage").then((m) => ({ Component: m.LedgerPage })),
          },
          {
            path: "settings",
            handle: { title: "Settings" },
            lazy: () => import("@/routes/SettingsPage").then((m) => ({ Component: m.SettingsPage })),
          },
          {
            path: "store",
            handle: { title: "Store" },
            lazy: () => import("@/routes/PlaceholderPage").then((m) => ({ Component: m.PlaceholderPage })),
          },
          {
            path: "vehicles",
            handle: { title: "Vehicles" },
            lazy: () => import("@/routes/PlaceholderPage").then((m) => ({ Component: m.PlaceholderPage })),
          },
          {
            path: "rma",
            handle: { title: "RMA" },
            lazy: () => import("@/routes/PlaceholderPage").then((m) => ({ Component: m.PlaceholderPage })),
          },
        ],
      },
    ],
  },
])
