import StrategySelectionPage from '@/feature/registration/StrategySelectionPage'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/register')({
  component: StrategySelectionPage,
})
