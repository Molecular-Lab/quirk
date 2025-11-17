import { createFileRoute } from '@tanstack/react-router'
import { DocumentationPage } from '@/feature/dashboard/DocumentationPage'

export const Route = createFileRoute('/dashboard/docs')({
	component: DocumentationPage,
})
