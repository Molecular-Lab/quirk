/**
 * Public Explorer Route
 * Public transparency page showing client's overall allocations and stats
 * Route: /explorer/:clientId
 */

import { createFileRoute } from "@tanstack/react-router"

import { PublicExplorerPage } from "@/feature/explorer/PublicExplorerPage"

export const Route = createFileRoute("/explorer/$clientId")({
	component: PublicExplorerPage,
})
