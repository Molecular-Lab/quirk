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
	endUserClientUserId: string | null // The static key: {privyUserId}:{platform}:{persona}:{environment}
	hasEarnAccount: boolean

	// Setup Wizard state
	setupWizardOpen: boolean
	setupWizardStep: 1 | 2 | 3 | 4
	wizardSelections: {
		environment: "sandbox" | "production" | null
		productId: string | null
		persona: PersonaType | null
	}

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
	setPersonaWithUser: (
		privyUserId: string,
		persona: PersonaType,
		visualizationType: VisualizationType,
		endUserId: string,
		endUserClientUserId: string,
	) => void // Atomic operation: set persona AND user data together
	resetPersona: () => void
	getPersonaUserId: () => string | null
	hasPersona: () => boolean
	hasPersonaForType: (visualizationType: VisualizationType) => boolean // Check if persona is selected for a specific demo type

	// Environment management
	setEnvironment: (environment: "sandbox" | "production") => void

	// Wizard management
	openSetupWizard: () => void
	closeSetupWizard: () => void
	setWizardStep: (step: 1 | 2 | 3 | 4) => void
	setWizardEnvironment: (env: "sandbox" | "production") => void
	setWizardProduct: (productId: string) => void
	setWizardPersona: (persona: PersonaType) => void
	completeWizard: () => void
	resetWizard: () => void

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
	// Wizard state
	setupWizardOpen: false,
	setupWizardStep: 1,
	wizardSelections: {
		environment: null,
		productId: null,
		persona: null,
	},
	// UI state
	isCreatingAccount: false,
	isDepositing: false,
	error: null,
	deposits: [],
	// ✅ START AS TRUE - Let components render immediately
	// Zustand persist will overwrite this with persisted data synchronously
	_hasHydrated: true,
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
			 * Format: {privyUserId}:{visualizationType}:{persona}:{environment}
			 *
			 * IMPORTANT: This resets all end-user state to ensure clean state
			 * when switching personas or platforms.
			 */
			setPersona: (privyUserId, persona, visualizationType) => {
				const currentState = get()
				const profile = getPersonaProfile(persona)
				// Generate Static Key: {privyUserId}:{platform}:{persona}:{environment}
				const clientUserId = generateDemoClientUserId(
					privyUserId,
					visualizationType,
					persona,
					currentState.selectedEnvironment,
				)

				console.log("[demoStore] ✅ setPersona() called:", {
					privyUserId,
					persona,
					visualizationType,
					environment: currentState.selectedEnvironment,
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
					newEnvironment: currentState.selectedEnvironment,
					newClientUserId: clientUserId,
					endUserStateReset: true,
				})
			},

			/**
			 * ATOMIC operation: Set persona AND end-user data together
			 * This prevents race conditions where setPersona() clears endUserId
			 * before setEndUser() can set it, causing localStorage to persist null values.
			 */
			setPersonaWithUser: (privyUserId, persona, visualizationType, endUserId, endUserClientUserId) => {
				const currentState = get()
				const profile = getPersonaProfile(persona)
				const staticKeyClientUserId = generateDemoClientUserId(
					privyUserId,
					visualizationType,
					persona,
					currentState.selectedEnvironment,
				)

				console.log("[demoStore] ✅ setPersonaWithUser() called (ATOMIC):", {
					privyUserId,
					persona,
					visualizationType,
					environment: currentState.selectedEnvironment,
					endUserId,
					endUserClientUserId,
					staticKeyClientUserId,
					previousPersona: currentState.selectedPersona,
				})

				// Single atomic update - Zustand persist only writes to localStorage ONCE
				set({
					selectedPersona: persona,
					selectedVisualizationType: visualizationType,
					personaData: {
						...profile,
						clientUserId: staticKeyClientUserId,
					},
					endUserId,
					endUserClientUserId,
					hasEarnAccount: false, // User needs to complete onboarding
					deposits: [],
					error: null,
				})

				console.log("[demoStore] ✅ setPersonaWithUser() state updated atomically")
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
			// WIZARD MANAGEMENT
			// ==========================================

			openSetupWizard: () => {
				console.log("[demoStore] ✅ openSetupWizard()")
				set({ setupWizardOpen: true, setupWizardStep: 1 })
			},

			closeSetupWizard: () => {
				console.log("[demoStore] ✅ closeSetupWizard()")
				set({ setupWizardOpen: false })
			},

			setWizardStep: (step) => {
				console.log("[demoStore] ✅ setWizardStep():", step)
				set({ setupWizardStep: step })
			},

			setWizardEnvironment: (env) => {
				console.log("[demoStore] ✅ setWizardEnvironment():", env)
				set((state) => ({
					wizardSelections: {
						...state.wizardSelections,
						environment: env,
					},
				}))
			},

			setWizardProduct: (productId) => {
				console.log("[demoStore] ✅ setWizardProduct():", productId)
				set((state) => ({
					wizardSelections: {
						...state.wizardSelections,
						productId,
					},
				}))
			},

			setWizardPersona: (persona) => {
				console.log("[demoStore] ✅ setWizardPersona():", persona)
				set((state) => ({
					wizardSelections: {
						...state.wizardSelections,
						persona,
					},
				}))
			},

			completeWizard: () => {
				const { wizardSelections } = get()
				console.log("[demoStore] ✅ completeWizard() - applying selections:", wizardSelections)

				// Apply wizard selections to actual state
				if (wizardSelections.environment) {
					set({ selectedEnvironment: wizardSelections.environment })
				}

				// Close wizard and reset selections
				set({
					setupWizardOpen: false,
					wizardSelections: {
						environment: null,
						productId: null,
						persona: null,
					},
				})
			},

			resetWizard: () => {
				console.log("[demoStore] ✅ resetWizard()")
				set({
					setupWizardStep: 1,
					wizardSelections: {
						environment: null,
						productId: null,
						persona: null,
					},
				})
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
			version: 6, // Bumped to add environment to Static Key format + wizard state
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
					// Wizard state
					setupWizardOpen: state.setupWizardOpen,
					setupWizardStep: state.setupWizardStep,
					wizardSelections: state.wizardSelections,
					// DO NOT persist _hasHydrated (should reset to false on every page load)
				}) as Partial<DemoStore>,
			migrate: (persistedState, version) => {
				const state = persistedState as Partial<DemoStore>

				// Version 6: Add environment to Static Key format
				if (!version || version < 6) {
					console.log("[demoStore] Migrating from version", version, "to 6 - Environment in Static Key")

					// Migrate old Static Keys (3-part) to new format (4-part with environment)
					if (state.endUserClientUserId) {
						const hasEnvironmentSuffix =
							state.endUserClientUserId.endsWith(":sandbox") ||
							state.endUserClientUserId.endsWith(":production")

						if (!hasEnvironmentSuffix) {
							// Old 3-part format detected, append :sandbox
							console.log("[demoStore] Migrating Static Key:", state.endUserClientUserId)
							state.endUserClientUserId = `${state.endUserClientUserId}:sandbox`
							state.selectedEnvironment = "sandbox"
							console.log("[demoStore] New Static Key:", state.endUserClientUserId)
						}
					}

					return {
						...state,
						setupWizardOpen: false,
						setupWizardStep: 1,
						wizardSelections: {
							environment: null,
							productId: null,
							persona: null,
						},
					} as Partial<DemoStore>
				}

				// Version 5: Static Key format + removed DB sync
				if (version < 5) {
					console.log("[demoStore] Migrating from version", version, "to 5 - Static Key format")
					return {
						...state,
						selectedPersona: null,
						selectedVisualizationType: null,
						personaData: null,
						endUserId: null,
						endUserClientUserId: null,
						hasEarnAccount: false,
						deposits: [],
						setupWizardOpen: false,
						setupWizardStep: 1,
						wizardSelections: {
							environment: null,
							productId: null,
							persona: null,
						},
					} as Partial<DemoStore>
				}

				return state as Partial<DemoStore>
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
			(state) => {
				if (!state._hasHydrated) {
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
 * Demo Flow with Static Keys (v6)
 *
 * Static Key Format: {privyUserId}:{platform}:{persona}:{environment}
 * Example: did:privy:abc123:gig-workers:bob:sandbox
 *
 * Flow:
 * 1. User selects Platform (ecommerce/creators/gig-workers)
 *    → demoProductStore.selectVisualization(platform)
 *    → demoStore.resetDemo() (clears all state for clean start)
 *
 * 2. Setup Wizard Opens (4 steps)
 *    → Step 1: Select Environment (sandbox/production)
 *       demoStore.setWizardEnvironment(env)
 *    → Step 2: Select Product (to get API key)
 *       demoProductStore.selectProduct(productId)
 *       clientContextStore synced automatically
 *    → Step 3: API Key Setup (conditional - if missing)
 *       Manual entry or navigate to Dashboard
 *    → Step 4: Select Persona (Bob/Alice)
 *       Generate Static Key: {privyId}:{platform}:{persona}:{environment}
 *       Call: createUser(clientId, { clientUserId: staticKey })
 *       Returns: { id: endUserId, ... }
 *       demoStore.setPersonaWithUser(privyId, persona, platform, endUserId, staticKey)
 *       demoStore.completeWizard()
 *
 * 3. Demo Starts
 *    → hasEarnAccount = true after onboarding
 *    → User can deposit/withdraw
 *
 * Usage Example:
 *
 * const handleSelectPersona = async (persona: PersonaType) => {
 *   const { productId } = useClientContext()
 *   const { selectedEnvironment, setPersonaWithUser, completeWizard } = useDemoStore()
 *
 *   // Generate Static Key with environment
 *   const clientUserId = generateDemoClientUserId(
 *     privyUserId,
 *     visualizationType,
 *     persona,
 *     selectedEnvironment
 *   )
 *
 *   // Create/Get end-user with Static Key
 *   const result = await createUser(productId, {
 *     clientUserId,
 *     status: 'pending_onboarding',
 *   })
 *
 *   // Update stores atomically
 *   setPersonaWithUser(privyUserId, persona, visualizationType, result.id, clientUserId)
 *   completeWizard()
 *
 *   // Navigate to demo
 *   navigate({ to: `/demo/${visualizationType}` })
 * }
 */
