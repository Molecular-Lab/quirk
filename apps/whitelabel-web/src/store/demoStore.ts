/**
 * Demo Store
 * Manages end-user simulation state for demo apps
 *
 * NOTE: Client context (productId, clientId, apiKey) is now managed by:
 * - demoProductStore: Product selection within demo
 * - clientContextStore: Shared API context (synced from demoProductStore)
 *
 * This store only handles:
 * - End-user account state (simulating app user)
 * - Deposit flow state
 * - UI state for demo interactions
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useClientContextStore } from "./clientContextStore"

export interface DemoState {
	// End-user state (created via "Start Earning")
	endUserId: string | null
	endUserClientUserId: string | null // The demo_user_xxx ID
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
}

export interface DemoStore extends DemoState {
	// End-user setters
	setEndUser: (data: { endUserId: string; endUserClientUserId: string }) => void
	setHasEarnAccount: (hasAccount: boolean) => void

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
	endUserId: null,
	endUserClientUserId: null,
	hasEarnAccount: false,
	isCreatingAccount: false,
	isDepositing: false,
	error: null,
	deposits: [],
}

export const useDemoStore = create<DemoStore>()(
	persist(
		(set, get) => ({
			...initialState,

			// Set end-user after "Start Earning"
			setEndUser: (data) => {
				console.log("[demoStore] Setting end-user:", {
					endUserId: data.endUserId,
					clientUserId: data.endUserClientUserId,
				})

				set({
					endUserId: data.endUserId,
					endUserClientUserId: data.endUserClientUserId,
					hasEarnAccount: true,
					isCreatingAccount: false,
					error: null,
				})
			},

			setHasEarnAccount: (hasAccount) => {
				set({ hasEarnAccount: hasAccount })
			},

			setIsCreatingAccount: (isCreating) => {
				set({ isCreatingAccount: isCreating })
			},

			setIsDepositing: (isDepositing) => {
				set({ isDepositing: isDepositing })
			},

			setError: (error) => {
				set({ error })
			},

			addDeposit: (deposit) => {
				const deposits = get().deposits
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
			partialize: (state) =>
				({
					endUserId: state.endUserId,
					endUserClientUserId: state.endUserClientUserId,
					hasEarnAccount: state.hasEarnAccount,
					deposits: state.deposits,
				}) as Partial<DemoStore>,
		},
	),
)

/**
 * Usage Example (Updated for demoProductStore + clientContextStore architecture):
 *
 * // 1. Client context is now managed by demoProductStore + clientContextStore
 * // Demo components should NOT interact with demoStore for client context
 *
 * // 2. Start Earning - Create end-user account
 * const { setIsCreatingAccount, setEndUser, setError } = useDemoStore()
 * const { productId } = useClientContext()  // Get from clientContextStore
 *
 * const handleStartEarning = async () => {
 *   setIsCreatingAccount(true)
 *   setError(null)
 *
 *   const demoUserId = `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
 *
 *   const response = await createUser(productId, {
 *     clientUserId: demoUserId,
 *     email: 'demo@example.com',
 *   })
 *
 *   setEndUser({
 *     endUserId: response.id,
 *     endUserClientUserId: demoUserId,
 *   })
 * }
 *
 * // 3. Deposit - Create deposit order
 * const { endUserId, setIsDepositing, addDeposit } = useDemoStore()
 *
 * const handleDeposit = async (amount: number) => {
 *   setIsDepositing(true)
 *
 *   const response = await createFiatDeposit({
 *     userId: endUserId,
 *     amount: amount.toString(),
 *     currency: 'USD',
 *     tokenSymbol: 'USDC',
 *   })
 *
 *   addDeposit({
 *     orderId: response.orderId,
 *     amount: amount.toString(),
 *     currency: 'USD',
 *     status: 'pending',
 *     createdAt: new Date().toISOString(),
 *   })
 *
 *   setIsDepositing(false)
 * }
 */
