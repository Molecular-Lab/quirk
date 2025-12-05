import { createFileRoute, Navigate } from "@tanstack/react-router"

// Redirect to unified Yield Dashboard (Strategies tab)
export const Route = createFileRoute("/dashboard/explore")({
	component: () => <Navigate to="/dashboard/yield" search={{ tab: "strategies" }} replace />,
})
