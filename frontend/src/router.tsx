import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/shell/AppLayout"
import { ProtectedRoute } from "@/components/shell/ProtectedRoute"
import { LoginPage } from "@/routes/LoginPage"
import { PlaceholderPage } from "@/routes/PlaceholderPage"

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
            element: <PlaceholderPage />,
          },
          {
            path: "fulfillment",
            handle: { title: "Fulfillment" },
            element: <PlaceholderPage />,
          },
          {
            path: "store",
            handle: { title: "Store" },
            element: <PlaceholderPage />,
          },
          {
            path: "ledger",
            handle: { title: "Ledger" },
            element: <PlaceholderPage />,
          },
          {
            path: "vehicles",
            handle: { title: "Vehicles" },
            element: <PlaceholderPage />,
          },
          {
            path: "rma",
            handle: { title: "RMA" },
            element: <PlaceholderPage />,
          },
          {
            path: "settings",
            handle: { title: "Settings" },
            element: <PlaceholderPage />,
          },
        ],
      },
    ],
  },
])
