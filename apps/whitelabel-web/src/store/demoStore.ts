/**
 * Demo Store
 * Manages end-user simulation state for demo apps
 *
 * NOTE: Client context (productId, clientId, apiKey) is now managed by:
 * - demoProductStore: Product selection within demo
 * - clientContextStore: Shared API context (synced from demoProductStore)
 *
 * This store handles:
 * - End-user account state (simulating app user)
 * - Demo persona selection (Bob/Alice)
 * - Deposit flow state
 * - UI state for demo interactions
 *
 * Static Key Format: {privyUserId}:{platform}:{persona}
 * Each persona gets a separate end_user with separate balance.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useClientContextStore } from "./clientContextStore"
import {
	type PersonaType,
	type PersonaProfile,
	type VisualizationType,
	generateDemoClientUserId,
	getPersonaProfile,
} from "@/feature/demo/personas"

export interface DemoState {
	// Persona selection (Bob/Alice) - scoped by visualization type
	selectedPersona: PersonaType | null
	selectedVisualizationType: VisualizationType | null // Track which demo type the persona was selected for
	personaData: (PersonaProfile & { clientUserId: string }) | null

	// Environment selection (sandbox/production)
	selectedEnvironment: "sandbox" | "production"

	// End-user state (created via "Start Earning")
	endUserId: string | null
	endUserClientUserId: string | null // The static key: {privyUserId}:{platform}:{persona}
	hasEarnAccount: boolean

	// UI state
	isCreatingAccount: boolean
	isDepositing: boolean
	error: string | null

	// Deposit history (for demo)
	deposits: {
		orderId: string
		amount: string
		currency: string
		status: "pending" | "completed" | "failed"
		createdAt: string
	}[]

	// Hydration tracking (for preventing race conditions)
	_hasHydrated: boolean
}

export interface DemoStore extends DemoState {
	// Persona management
	setPersona: (privyUserId: string, persona: PersonaType, visualizationType: VisualizationType) => void
	resetPersona: () => void
	getPersonaUserId: () => string | null
	hasPersona: () => boolean
	hasPersonaForType: (visualizationType: VisualizationType) => boolean // Check if persona is selected for a specific demo type

	// Environment management
	setEnvironment: (environment: "sandbox" | "production") => void

	// End-user setters
	setEndUser: (data: { endUserId: string; endUserClientUserId: string }) => void
	setHasEarnAccount: (hasAccount: boolean) => void
	activateEarnAccount: () => void // Call after onboarding completes

	// UI state setters
	setIsCreatingAccount: (isCreating: boolean) => void
	setIsDepositing: (isDepositing: boolean) => void
	setError: (error: string | null) => void

	// Deposit management
	addDeposit: (deposit: {
		orderId: string
		amount: string
		currency: string
		status: "pending" | "completed" | "failed"
		createdAt: string
	}) => void

	// Getters (now reference clientContextStore for client context)
	canStartEarning: () => boolean
	canDeposit: () => boolean

	// Reset
	resetEndUser: () => void
	resetDemo: () => void
}

const initialState: DemoState = {
	selectedPersona: null,
	selectedVisualizationType: null,
	personaData: null,
	selectedEnvironment: "sandbox",
	endUserId: null,
	endUserClientUserId: null,
	hasEarnAccount: false,
	// UI state
	isCreatingAccount: false,
	isDepositing: false,
	error: null,
	deposits: [],
	_hasHydrated: false,
}

const store = create<DemoStore>()(
	persist(
		(set, get) => ({
			...initialState,

			// ==========================================
			// PERSONA MANAGEMENT
			// ==========================================

			/**
			 * Set persona and generate Static Key clientUserId
			 * Format: {privyUserId}:{visualizationType}:{persona}
			 *
			 * IMPORTANT: This resets all end-user state to ensure clean state
			 * when switching personas or platforms.
			 */
			setPersona: (privyUserId, persona, visualizationType) => {
				const currentState = get()
				const profile = getPersonaProfile(persona)
				// Generate Static Key: {privyUserId}:{platform}:{persona}
				const clientUserId = generateDemoClientUserId(privyUserId, visualizationType, persona)

				console.log("[demoStore] ✅ setPersona() called:", {
					privyUserId,
					persona,
					visualizationType,
					clientUserId,
					previousPersona: currentState.selectedPersona,
					previousVisualizationType: currentState.selectedVisualizationType,
					previousEndUserId: currentState.endUserId,
					previousHasEarnAccount: currentState.hasEarnAccount,
				})

				set({
					selectedPersona: persona,
					selectedVisualizationType: visualizationType,
					personaData: {
						...profile,
						clientUserId,
					},
					// CRITICAL: Reset ALL end-user state when changing persona
					// This fixes the stale endUserId bug
					endUserId: null,
					endUserClientUserId: null,
					hasEarnAccount: false,
					deposits: [],
					error: null,
				})

				console.log("[demoStore] ✅ setPersona() state updated:", {
					newPersona: persona,
					newVisualizationType: visualizationType,
					newClientUserId: clientUserId,
					endUserStateReset: true,
				})
			},

			// Reset persona selection
			resetPersona: () => {
				const currentState = get()
				console.log("[demoStore] ✅ resetPersona() called:", {
					previousPersona: currentState.selectedPersona,
					previousVisualizationType: currentState.selectedVisualizationType,
					previousEndUserId: currentState.endUserId,
					previousHasEarnAccount: currentState.hasEarnAccount,
				})

				set({
					selectedPersona: null,
					selectedVisualizationType: null,
					personaData: null,
					// Also reset end-user state
					endUserId: null,
					endUserClientUserId: null,
					hasEarnAccount: false,
					deposits: [],
				})

				console.log("[demoStore] ✅ resetPersona() - all state cleared")
			},

			// Get persona's client user ID
			getPersonaUserId: () => {
				return get().personaData?.clientUserId || null
			},

			// Check if persona is selected (any type)
			hasPersona: () => {
				return !!get().selectedPersona
			},

			// Check if persona is selected for a specific visualization type
			hasPersonaForType: (visualizationType: VisualizationType) => {
				const { selectedPersona, selectedVisualizationType } = get()
				const result = !!selectedPersona && selectedVisualizationType === visualizationType

				console.log("[demoStore] 🔍 hasPersonaForType() check:", {
					requestedType: visualizationType,
					selectedPersona,
					selectedVisualizationType,
					matches: result,
				})

				return result
			},

			// ==========================================
			// ENVIRONMENT MANAGEMENT
			// ==========================================

			// Set environment (sandbox/production)
			setEnvironment: (environment) => {
				console.log("[demoStore] Setting environment:", environment)
				set({ selectedEnvironment: environment })
			},

			// ==========================================
			// END-USER MANAGEMENT
			// ==========================================

			// Set end-user data (does NOT automatically activate earn account)
			// Call setHasEarnAccount(true) or activateEarnAccount() after onboarding
			setEndUser: (data) => {
				const currentState = get()
				console.log("[demoStore] ✅ setEndUser() called:", {
					endUserId: data.endUserId,
					clientUserId: data.endUserClientUserId,
					previousEndUserId: currentState.endUserId,
					previousClientUserId: currentState.endUserClientUserId,
					hasEarnAccount: currentState.hasEarnAccount,
				})

				set({
					endUserId: data.endUserId,
					endUserClientUserId: data.endUserClientUserId,
					// Don't auto-set hasEarnAccount - it should be set separately after onboarding
					isCreatingAccount: false,
					error: null,
				})

				console.log("[demoStore] ✅ setEndUser() state updated:", {
					newEndUserId: data.endUserId,
					newClientUserId: data.endUserClientUserId,
				})
			},

			setHasEarnAccount: (hasAccount) => {
				console.log("[demoStore] ✅ setHasEarnAccount():", hasAccount)
				set({ hasEarnAccount: hasAccount })
			},

			// Activate earn account after onboarding completes
			activateEarnAccount: () => {
				const currentState = get()
				console.log("[demoStore] ✅ activateEarnAccount() called:", {
					previousHasEarnAccount: currentState.hasEarnAccount,
					endUserId: currentState.endUserId,
					endUserClientUserId: currentState.endUserClientUserId,
				})
				set({ hasEarnAccount: true })
				console.log("[demoStore] ✅ activateEarnAccount() - hasEarnAccount set to true")
			},

			setIsCreatingAccount: (isCreating) => {
				console.log("[demoStore] ✅ setIsCreatingAccount():", isCreating)
				set({ isCreatingAccount: isCreating })
			},

			setIsDepositing: (isDepositing) => {
				console.log("[demoStore] ✅ setIsDepositing():", isDepositing)
				set({ isDepositing: isDepositing })
			},

			setError: (error) => {
				console.log("[demoStore] ⚠️ setError():", error)
				set({ error })
			},

			addDeposit: (deposit) => {
				const deposits = get().deposits
				console.log("[demoStore] ✅ addDeposit():", {
					deposit,
					previousDepositCount: deposits.length,
				})
				set({
					deposits: [deposit, ...deposits],
				})
			},

			// Check if can start earning (references clientContextStore for client context)
			canStartEarning: () => {
				const { hasEarnAccount, isCreatingAccount } = get()
				const { productId, apiKey } = useClientContextStore.getState()
				const hasClientContext = !!(productId && apiKey)
				return hasClientContext && !hasEarnAccount && !isCreatingAccount
			},

			// Check if can deposit (references clientContextStore for client context)
			canDeposit: () => {
				const { hasEarnAccount, isDepositing } = get()
				const { productId, apiKey } = useClientContextStore.getState()
				const hasClientContext = !!(productId && apiKey)
				return hasClientContext && hasEarnAccount && !isDepositing
			},

			// Reset end-user state (for testing)
			resetEndUser: () => {
				set({
					endUserId: null,
					endUserClientUserId: null,
					hasEarnAccount: false,
					isCreatingAccount: false,
					error: null,
				})
			},

			// Reset entire demo state
			resetDemo: () => {
				set(initialState)
			},
		}),
		{
			name: "proxify-demo-state",
			version: 5, // Bumped to use Static Key format and remove DB sync
			partialize: (state) =>
				({
					selectedPersona: state.selectedPersona,
					selectedVisualizationType: state.selectedVisualizationType,
					personaData: state.personaData,
					selectedEnvironment: state.selectedEnvironment,
					endUserId: state.endUserId,
					endUserClientUserId: state.endUserClientUserId,
					hasEarnAccount: state.hasEarnAccount,
					deposits: state.deposits,
					// DO NOT persist _hasHydrated (should reset to false on every page load)
				}) as Partial<DemoStore>,
			migrate: (persistedState, version) => {
				// Version 5: Static Key format + removed DB sync
				// Reset state to force clean demo flow with new Static Key format
				if (!version || version < 5) {
					console.log("[demoStore] Migrating from version", version, "to 5 - Static Key format")
					return {
						...persistedState,
						selectedPersona: null,
						selectedVisualizationType: null,
						personaData: null,
						endUserId: null,
						endUserClientUserId: null,
						hasEarnAccount: false,
						deposits: [],
					} as Partial<DemoStore>
				}
				return persistedState as Partial<DemoStore>
			},
			// Mark hydration complete when Zustand finishes loading from localStorage
			onRehydrateStorage: () => {
				console.log("[demoStore] 🔄 Rehydration started...")
				return (state, error) => {
					if (error) {
						console.error("[demoStore] ❌ Rehydration failed:", error)
					} else {
						console.log("[demoStore] ✅ Rehydration complete, setting _hasHydrated = true")
						if (state) {
							state._hasHydrated = true
						}
					}
				}
			},
		},
	),
)

// Export the store
export const useDemoStore = store

// Subscribe to hydration completion
// This ensures _hasHydrated is set even if onRehydrateStorage doesn't fire
if (typeof window !== 'undefined') {
	// Wait for next tick to ensure persist middleware is initialized
	setTimeout(() => {
		const unsubscribe = store.subscribe(
			(state) => state._hasHydrated,
			(hasHydrated) => {
				if (!hasHydrated) {
					console.log('[demoStore] 🔧 Manually setting _hasHydrated = true')
					store.setState({ _hasHydrated: true })
					unsubscribe()
				}
			}
		)
		// Give it 100ms, then force hydration complete if not already set
		setTimeout(() => {
			if (!store.getState()._hasHydrated) {
				console.log('[demoStore] ⚡ Force-setting _hasHydrated = true after timeout')
				store.setState({ _hasHydrated: true })
			}
		}, 100)
	}, 0)
}

/**
 * Hook to check if Zustand has finished hydrating from localStorage
 *
 * Usage in components:
 *   const hasHydrated = useHydrated()
 *
 *   if (!hasHydrated) {
 *     return <LoadingSpinner />  // Wait for hydration
 *   }
 *
 * This prevents race conditions where components try to read state
 * before Zustand has finished loading from localStorage.
 */
export const useHydrated = () => {
	const hasHydrated = useDemoStore((state) => state._hasHydrated)
	return hasHydrated
}

/**
 * Demo Flow with Static Keys
 *
 * Static Key Format: {privyUserId}:{platform}:{persona}
 * Example: did:privy:abc123:gig-workers:bob
 *
 * Flow:
 * 1. User selects Platform (ecommerce/creators/gig-workers)
 *    → demoProductStore.selectVisualization(platform)
 *
 * 2. User selects Product (to get API key for that platform)
 *    → demoProductStore.selectProduct(productId)
 *    → clientContextStore synced automatically
 *
 * 3. User selects Persona (Bob/Alice)
 *    → Generate Static Key: {privyId}:{platform}:{persona}
 *    → Call: createUser(clientId, { clientUserId: staticKey })
 *    → Returns: { id: endUserId, ... }
 *    → demoStore.setPersona(privyId, persona, platform)
 *    → demoStore.setEndUser({ endUserId, endUserClientUserId: staticKey })
 *    → demoStore.activateEarnAccount()
 *    → Navigate to /demo/{platform}
 *
 * Usage Example:
 *
 * const handleSelectPersona = async (persona: PersonaType) => {
 *   const { productId } = useClientContext()
 *   const { setPersona, setEndUser, activateEarnAccount } = useDemoStore()
 *
 *   // Generate Static Key
 *   const clientUserId = generateDemoClientUserId(privyUserId, visualizationType, persona)
 *
 *   // Create/Get end-user with Static Key
 *   const result = await createUser(productId, {
 *     clientUserId,
 *     status: 'pending_onboarding',
 *   })
 *
 *   // Update stores in correct order
 *   setPersona(privyUserId, persona, visualizationType)
 *   setEndUser({ endUserId: result.id, endUserClientUserId: clientUserId })
 *   activateEarnAccount()
 *
 *   // Navigate to demo
 *   navigate({ to: `/demo/${visualizationType}` })
 * }
 */
