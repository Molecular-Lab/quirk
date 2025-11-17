import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsPage } from '@/feature/dashboard/AnalyticsPage'

export const Route = createFileRoute('/dashboard/analytics')({
	component: AnalyticsPage,
})
