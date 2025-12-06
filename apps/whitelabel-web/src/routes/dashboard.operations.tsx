import { createFileRoute } from "@tanstack/react-router"

import { RampOperationsPage } from "@/feature/dashboard/RampOperationsPage"

export const Route = createFileRoute("/dashboard/operations")({
	component: RampOperationsPage,
})
