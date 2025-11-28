/**
 * Client Context Store
 *
 * THE SINGLE SOURCE OF TRUTH for current client context
 * Used by: Dashboard, API Testing, Demo, Onboarding
 *
 * Manages:
 * - clientId (UUID from database)
 * - productId (test_product_001)
 * - apiKey (test_pk_...)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ClientContext {
	// Current client identifiers
	clientId: string | null        // UUID from database (e.g., "9be8eac3-a21d-4f1a-a846-65751d6d6fa9")
	productId: string | null       // Product ID (e.g., "test_product_001")
	apiKey: string | null          // API key (e.g., "test_pk_2a2463f87bfd6756822f48698fedd4ef")

	// Client info (optional, for display)
	companyName: string | null
	businessType: string | null
}

export interface ClientContextStore extends ClientContext {
	// Setters
	setClientContext: (context: {
		clientId: string
		productId: string
		apiKey: string
		companyName?: string
		businessType?: string
	}) => void

	setClientId: (clientId: string) => void
	setProductId: (productId: string) => void
	setApiKey: (apiKey: string) => void

	// Getters
	hasContext: () => boolean
	hasApiKey: () => boolean

	// Sync
	syncToLocalStorage: () => void

	// Reset
	clearContext: () => void
}

const initialState: ClientContext = {
	clientId: null,
	productId: null,
	apiKey: null,
	companyName: null,
	businessType: null,
}

export const useClientContext = create<ClientContextStore>()(
	persist(
		(set, get) => ({
			...initialState,

			// Set complete client context
			setClientContext: (context) => {
				console.log('[ClientContextStore] Setting client context:', {
					clientId: context.clientId,
					productId: context.productId,
					apiKey: context.apiKey.substring(0, 12) + '...',
					companyName: context.companyName,
					businessType: context.businessType,
				})

				set({
					clientId: context.clientId,
					productId: context.productId,
					apiKey: context.apiKey,
					companyName: context.companyName || null,
					businessType: context.businessType || null,
				})

				// Sync to localStorage for b2bApiClient
				localStorage.setItem('b2b:api_key', context.apiKey)
				localStorage.setItem('b2b:product_id', context.productId)
				localStorage.setItem('b2b:client_id', context.clientId)

				console.log('[ClientContextStore] ✅ Context saved and synced to localStorage')
			},

			// Set individual fields
			setClientId: (clientId) => {
				set({ clientId })
				localStorage.setItem('b2b:client_id', clientId)
			},

			setProductId: (productId) => {
				set({ productId })
				localStorage.setItem('b2b:product_id', productId)
			},

			setApiKey: (apiKey) => {
				set({ apiKey })
				localStorage.setItem('b2b:api_key', apiKey)
				console.log('[ClientContextStore] API key updated:', apiKey.substring(0, 12) + '...')
			},

			// Check if context is complete
			hasContext: () => {
				const { clientId, productId, apiKey } = get()
				return !!(clientId && productId && apiKey)
			},

			// Check if API key exists
			hasApiKey: () => {
				return !!get().apiKey
			},

			// Sync current state to localStorage
			syncToLocalStorage: () => {
				const { clientId, productId, apiKey } = get()
				if (clientId) localStorage.setItem('b2b:client_id', clientId)
				if (productId) localStorage.setItem('b2b:product_id', productId)
				if (apiKey) localStorage.setItem('b2b:api_key', apiKey)
			},

			// Clear all context
			clearContext: () => {
				set(initialState)
				localStorage.removeItem('b2b:api_key')
				localStorage.removeItem('b2b:product_id')
				localStorage.removeItem('b2b:client_id')
				console.log('[ClientContextStore] Context cleared')
			},
		}),
		{
			name: 'proxify-client-context',
			partialize: (state) => ({
				clientId: state.clientId,
				productId: state.productId,
				apiKey: state.apiKey,
				companyName: state.companyName,
				businessType: state.businessType,
			}),
		},
	),
)

/**
 * Hook to get current API key
 * Checks store first, then localStorage
 */
export function useApiKey(): string | null {
	const apiKey = useClientContext((state) => state.apiKey)

	if (!apiKey) {
		// Fallback to localStorage
		return localStorage.getItem('b2b:api_key')
	}

	return apiKey
}

/**
 * Hook to ensure context is synced
 */
export function useSyncClientContext() {
	const { syncToLocalStorage } = useClientContext()

	React.useEffect(() => {
		syncToLocalStorage()
	}, [syncToLocalStorage])
}
