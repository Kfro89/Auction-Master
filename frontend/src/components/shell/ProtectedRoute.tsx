import { useEffect } from "react"
import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { getToken, onUnauthorized } from "@/lib/auth"

export function ProtectedRoute() {
  const navigate = useNavigate()

  useEffect(() => {
    return onUnauthorized(() => navigate("/login", { replace: true }))
  }, [navigate])

  if (!getToken()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
