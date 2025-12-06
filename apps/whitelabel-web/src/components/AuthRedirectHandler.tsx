import { useEffect } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"

import { useAuthFlowStore } from "@/hooks/useAuthFlow"
import { useUserStore } from "@/store/userStore"

/**
 * Component that handles authentication redirects and loads user organizations
 * Should be placed inside the Router context
 */
export function AuthRedirectHandler() {
	const navigate = useNavigate()
	const { ready, authenticated, user } = usePrivy()
	const { intendedDestination, isFromGetStarted, clearAuthFlow } = useAuthFlowStore()
	const { loadOrganizations, privyOrganizationId } = useUserStore()

	// Load organizations when user is authenticated
	useEffect(() => {
		if (authenticated && user && privyOrganizationId) {
			console.log("[AuthRedirectHandler] User authenticated, loading organizations...")
			void loadOrganizations()
		}
	}, [authenticated, user, privyOrganizationId, loadOrganizations])

	useEffect(() => {
		// Only proceed if Privy is ready and user just authenticated
		if (!ready || !authenticated) return

		// Handle post-authentication redirect
		const handleRedirect = async () => {
			// Small delay to ensure authentication is fully processed
			await new Promise((resolve) => setTimeout(resolve, 100))

			if (intendedDestination) {
				console.log("Redirecting to intended destination:", intendedDestination)
				navigate({ to: intendedDestination as any })
				clearAuthFlow()
			} else if (isFromGetStarted) {
				console.log("Redirecting to onboarding from Get Started")
				navigate({ to: "/onboarding/create-product" })
				clearAuthFlow()
			}
		}

		handleRedirect()
	}, [ready, authenticated, intendedDestination, isFromGetStarted, navigate, clearAuthFlow])

	return null
}
