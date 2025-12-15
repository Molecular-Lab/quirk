import { createFileRoute } from "@tanstack/react-router"

import { ExploreProtocolsPage } from "../../feature/dashboard/ExploreProtocolsPage"

export const Route = createFileRoute("/dashboard/explore")({
	component: ExploreProtocolsPage,
})
