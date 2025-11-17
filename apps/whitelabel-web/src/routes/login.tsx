import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/feature/auth/LoginPage'

export const Route = createFileRoute('/login')({
	component: LoginPage,
})
