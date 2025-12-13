import { createFileRoute } from '@tanstack/react-router'
import { MyStrategiesPage } from '../../feature/dashboard/MyStrategiesPage'

export const Route = createFileRoute('/dashboard/strategies')({
  component: MyStrategiesPage,
})
