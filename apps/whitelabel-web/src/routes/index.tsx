import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/feature/LandingPage'

export const Route = createFileRoute('/')({
	component: LandingPage,
})
