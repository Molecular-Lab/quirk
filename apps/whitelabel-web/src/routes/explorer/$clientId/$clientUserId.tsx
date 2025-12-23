/**
 * Private Explorer Route
 * Private end-user report showing personal stats and yield history
 * Route: /explorer/:clientId/:clientUserId
 */

import { createFileRoute } from "@tanstack/react-router"

import { PrivateExplorerPage } from "@/feature/explorer/PrivateExplorerPage"

export const Route = createFileRoute("/explorer/$clientId/$clientUserId")({
	component: PrivateExplorerPage,
})
