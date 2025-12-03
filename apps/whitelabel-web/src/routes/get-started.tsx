import { useEffect } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { useUserStore } from "@/store/userStore"

export const Route = createFileRoute("/get-started")({
	component: GetStartedPage,
})

function GetStartedPage() {
	const navigate = useNavigate()
	const { authenticated, ready, login } = usePrivy()
	const { organizations, loadOrganizations, isAuthenticated } = useUserStore()

	// Trigger login if not authenticated
	useEffect(() => {
		if (ready && !authenticated) {
			login()
		}
	}, [ready, authenticated, login])

	// Check for existing products after authentication
	useEffect(() => {
		const checkExisting = async () => {
			if (authenticated && isAuthenticated()) {
				// Load user's organizations from database
				await loadOrganizations()

				// Check if user has products
				if (organizations.length > 0) {
					// Redirect to dashboard
					void navigate({ to: "/dashboard" })
				} else {
					// New user - redirect to onboarding
					void navigate({ to: "/onboarding" })
				}
			}
		}

		void checkExisting()
	}, [authenticated, isAuthenticated, organizations.length, loadOrganizations, navigate])

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
				<p className="text-gray-600">Redirecting...</p>
			</div>
		</div>
	)
}
