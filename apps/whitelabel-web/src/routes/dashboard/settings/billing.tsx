import { createFileRoute } from '@tanstack/react-router'
import { BillingPage } from '@/feature/dashboard/BillingPage'

export const Route = createFileRoute('/dashboard/settings/billing')({
	component: BillingPage,
})
