import { useEffect, useRef } from "react"

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
	const hasLoadedOrgs = useRef(false)
	const hasRedirected = useRef(false)

	// Load organizations when user is authenticated (only once)
	useEffect(() => {
		if (authenticated && user && privyOrganizationId && !hasLoadedOrgs.current) {
			console.log("[AuthRedirectHandler] User authenticated, loading organizations...")
			hasLoadedOrgs.current = true
			void loadOrganizations()
		}
		// Note: loadOrganizations is a zustand store function (stable, don't include in deps)
	}, [authenticated, user, privyOrganizationId])

	// Reset flag when user logs out
	useEffect(() => {
		if (!authenticated) {
			hasLoadedOrgs.current = false
			hasRedirected.current = false
		}
	}, [authenticated])

	useEffect(() => {
		// Only proceed if Privy is ready and user just authenticated
		if (!ready || !authenticated) return

		// Only redirect once per session
		if (hasRedirected.current) return

		// Only redirect if there's a destination set
		if (!intendedDestination && !isFromGetStarted) return

		// Handle post-authentication redirect
		const handleRedirect = async () => {
			hasRedirected.current = true

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
		// Note: navigate and clearAuthFlow are stable functions (don't include in deps)
	}, [ready, authenticated, intendedDestination, isFromGetStarted])

	return null
}
