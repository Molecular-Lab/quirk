import { createFileRoute } from "@tanstack/react-router"

import { MarketPage } from "../../feature/dashboard/MarketPage"

export const Route = createFileRoute("/dashboard/market")({
	component: MarketPage,
})
