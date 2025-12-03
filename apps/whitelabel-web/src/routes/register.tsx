import { createFileRoute } from "@tanstack/react-router"

import StrategySelectionPage from "@/feature/registration/StrategySelectionPage"

export const Route = createFileRoute("/register")({
	component: StrategySelectionPage,
})
