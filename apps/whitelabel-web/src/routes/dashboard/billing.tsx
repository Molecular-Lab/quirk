import { createFileRoute } from '@tanstack/react-router'
import { BillingPage } from '@/feature/dashboard/BillingPage'

export const Route = createFileRoute('/dashboard/billing')({
	component: BillingPage,
})
