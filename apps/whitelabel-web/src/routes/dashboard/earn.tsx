import { createFileRoute } from "@tanstack/react-router"

import { YieldDashboard } from "../../feature/dashboard/YieldDashboard"

export const Route = createFileRoute("/dashboard/earn")({
	component: YieldDashboard,
})
