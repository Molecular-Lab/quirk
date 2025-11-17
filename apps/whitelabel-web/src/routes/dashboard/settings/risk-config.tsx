import { createFileRoute } from '@tanstack/react-router'
import { RiskConfigPage } from '@/feature/dashboard/RiskConfigPage'

export const Route = createFileRoute('/dashboard/settings/risk-config')({
	component: RiskConfigPage,
})
