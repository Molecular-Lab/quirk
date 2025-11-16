import { createFileRoute } from '@tanstack/react-router'
import { APIKeysPage } from '@/feature/dashboard/APIKeysPage'

export const Route = createFileRoute('/dashboard/api-keys')({
	component: APIKeysPage,
})
