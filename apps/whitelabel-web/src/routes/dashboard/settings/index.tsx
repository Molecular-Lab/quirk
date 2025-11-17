import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/feature/dashboard/SettingsPage'

export const Route = createFileRoute('/dashboard/settings/')({
	component: SettingsPage,
})
