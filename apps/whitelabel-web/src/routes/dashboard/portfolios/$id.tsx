import { createFileRoute } from "@tanstack/react-router"

import { PortfolioDetailPage } from "@/feature/dashboard/PortfolioDetailPage"

export const Route = createFileRoute("/dashboard/portfolios/$id")({
	component: PortfolioDetailPage,
})
