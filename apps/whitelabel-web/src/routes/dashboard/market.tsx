import { createFileRoute, Navigate } from "@tanstack/react-router"

// Redirect to unified Yield Dashboard (Explore tab)
export const Route = createFileRoute("/dashboard/market")({
	component: () => <Navigate to="/dashboard/yield" search={{ tab: "explore" }} replace />,
})
