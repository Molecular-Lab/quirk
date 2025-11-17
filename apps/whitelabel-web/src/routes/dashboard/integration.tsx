import { createFileRoute } from '@tanstack/react-router'
import { IntegrationPage } from '../../feature/dashboard/IntegrationPage'

export const Route = createFileRoute('/dashboard/integration')({
  component: IntegrationPage,
})
