import { createFileRoute } from '@tanstack/react-router'
import { PortfoliosListPage } from '@/feature/dashboard/PortfoliosListPage'

export const Route = createFileRoute('/dashboard/portfolios/')({
	component: PortfoliosListPage,
})
