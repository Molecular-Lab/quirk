import { createFileRoute } from "@tanstack/react-router"

import { OperationsDashboard } from "@/feature/dashboard/OperationsDashboard"

export const Route = createFileRoute("/dashboard/onboarding")({
	component: OperationsDashboard,
})
