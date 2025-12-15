import { createFileRoute } from "@tanstack/react-router"

import DashboardPage from "@/feature/dashboard/DashboardPage"

export const Route = createFileRoute("/dashboard/")({
	component: DashboardPage,
})
