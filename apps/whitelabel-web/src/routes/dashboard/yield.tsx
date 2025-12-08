import { createFileRoute } from "@tanstack/react-router"

import { YieldDashboard } from "../../feature/dashboard/YieldDashboard"

export const Route = createFileRoute("/dashboard/yield")({
	component: YieldDashboard,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			tab: (search.tab as "explore" | "strategies" | undefined) || "explore",
		}
	},
})
