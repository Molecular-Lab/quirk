import { createFileRoute } from '@tanstack/react-router'
import { ExplorePage } from '@/feature/dashboard/ExplorePage'

export const Route = createFileRoute('/dashboard/explore')({
	component: ExplorePage,
})
