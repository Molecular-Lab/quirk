import { createFileRoute } from "@tanstack/react-router"

import { OverviewPage } from "@/feature/dashboard/OverviewPage"

export const Route = createFileRoute("/dashboard/")({
	component: OverviewPage,
})
