import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/explore")({
	component: () => <Navigate to="/dashboard/earn" replace />,
})
