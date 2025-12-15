import { createFileRoute, Navigate } from "@tanstack/react-router"

// Redirect to the new Explore page for backward compatibility
export const Route = createFileRoute("/dashboard/yield")({
	component: () => <Navigate to="/dashboard/explore" replace />,
})
