import { createFileRoute } from "@tanstack/react-router"

import { StrategiesPage } from "../../feature/dashboard/StrategiesPage"

export const Route = createFileRoute("/dashboard/explore")({
	component: StrategiesPage,
})
