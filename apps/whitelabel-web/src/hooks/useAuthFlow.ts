import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthFlowState {
	intendedDestination: string | null
	setIntendedDestination: (destination: string | null) => void
	isFromGetStarted: boolean
	setIsFromGetStarted: (value: boolean) => void
	clearAuthFlow: () => void
}

// Zustand store for auth flow state
export const useAuthFlowStore = create<AuthFlowState>()(
	persist(
		(set) => ({
			intendedDestination: null,
			setIntendedDestination: (destination) => set({ intendedDestination: destination }),
			isFromGetStarted: false,
			setIsFromGetStarted: (value) => set({ isFromGetStarted: value }),
			clearAuthFlow: () => set({ intendedDestination: null, isFromGetStarted: false }),
		}),
		{
			name: "auth-flow-storage",
		},
	),
)

/**
 * Hook to manage authentication flow and redirects
 */
export function useAuthFlow() {
	const navigate = useNavigate()
	const { ready, authenticated, user } = usePrivy()
	const { intendedDestination, isFromGetStarted, clearAuthFlow } = useAuthFlowStore()
	const [hasRedirected, setHasRedirected] = useState(false)

	useEffect(() => {
		// Only proceed if Privy is ready and user is authenticated
		if (!ready || !authenticated || hasRedirected) return

		// Handle post-authentication redirect
		if (intendedDestination) {
			setHasRedirected(true)
			navigate({ to: intendedDestination as any })
			clearAuthFlow()
		} else if (isFromGetStarted) {
			// Redirect to onboarding if coming from "Get Started"
			setHasRedirected(true)
			navigate({ to: "/onboarding/create-product" })
			clearAuthFlow()
		}
	}, [ready, authenticated, intendedDestination, isFromGetStarted, navigate, clearAuthFlow, hasRedirected])

	return {
		ready,
		authenticated,
		user,
	}
}
