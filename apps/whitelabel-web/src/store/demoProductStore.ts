import { create } from "zustand"
import { persist } from "zustand/middleware"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"

import { useClientContextStore } from "./clientContextStore"

// Organization type from userStore
export interface Organization {
	id: string
	productId: string
	companyName: string
	businessType: string
	description?: string
	websiteUrl?: string
	apiKeyPrefix?: string | null
	apiKey?: string | null // ✅ Full API key (stored in Zustand)
	isActive: boolean
	isSandbox: boolean
	createdAt: string
	updatedAt: string
}

export type VisualizationType = "ecommerce" | "creators" | "gig-workers"

interface DemoProductState {
	// Product selection (loaded from userStore on demo entry)
	availableProducts: Organization[]
	selectedProductId: string | null
	selectedProduct: Organization | null

	// API Keys storage (per product)
	apiKeys: Record<string, string> // { productId: apiKey }

	// Visualization selection
	visualizationType: VisualizationType | null

	// Loading state
	isLoadingProducts: boolean
	loadError: string | null

	// Actions
	loadProducts: (products: Organization[], apiKeysMap?: Record<string, string>) => void
	loadProductsByPrivyId: (privyOrgId: string) => Promise<void>
	selectProduct: (productId: string) => void
	selectVisualization: (type: VisualizationType) => void
	setApiKey: (productId: string, apiKey: string) => void
	clearSelection: () => void
	reset: () => void

	// Computed getters
	getSelectedApiKey: () => string | null
	getApiKey: (productId: string) => string | null
	hasSelectedProduct: () => boolean
	hasSelectedVisualization: () => boolean
	canStartDemo: () => boolean
}

const initialState = {
	availableProducts: [],
	selectedProductId: null,
	selectedProduct: null,
	apiKeys: {},
	visualizationType: null,
	isLoadingProducts: false,
	loadError: null,
}

export const useDemoProductStore = create<DemoProductState>()(
	persist(
		(set, get) => ({
			...initialState,

			// Load products from userStore (called on demo entry)
			loadProducts: (products: Organization[], apiKeysMap?: Record<string, string>) => {
				const currentApiKeys = get().apiKeys

				console.log("[demoProductStore] Loading products:", {
					count: products.length,
					hasApiKeys: !!apiKeysMap,
					apiKeysCount: apiKeysMap ? Object.keys(apiKeysMap).length : 0,
					existingApiKeysCount: Object.keys(currentApiKeys).length,
				})

				// Merge new API keys with existing ones (preserve existing keys)
				const apiKeys = {
					...currentApiKeys, // Keep existing API keys
					...(apiKeysMap || {}), // Add/override with new keys if provided
				}

				set({
					availableProducts: products,
					apiKeys,
					isLoadingProducts: false,
					loadError: null
				})

				// If only one product, auto-select it
				if (products.length === 1) {
					get().selectProduct(products[0].productId)
				}

				// If selectedProductId exists but not in products, clear it
				const { selectedProductId } = get()
				if (selectedProductId && !products.find((p) => p.productId === selectedProductId)) {
					set({ selectedProductId: null, selectedProduct: null })
				}

				console.log("[demoProductStore] ✅ Products loaded, API keys preserved:", {
					totalApiKeys: Object.keys(apiKeys).length,
					products: products.map(p => ({
						productId: p.productId,
						hasApiKey: !!apiKeys[p.productId],
						apiKeyPrefix: apiKeys[p.productId]?.substring(0, 12) || 'NOT_SET'
					}))
				})
			},

			// NEW: Load products by Privy ID (API call)
			loadProductsByPrivyId: async (privyOrgId: string) => {
				console.log("[demoProductStore] Loading products for privyOrgId:", privyOrgId)
				set({ isLoadingProducts: true, loadError: null })

				try {
					const response = await listOrganizationsByPrivyId(privyOrgId)
					const products: Organization[] = response.organizations.map((org: any) => ({
						id: org.id,
						productId: org.productId,
						companyName: org.companyName,
						businessType: org.businessType,
						description: org.description,
						websiteUrl: org.websiteUrl,
						apiKeyPrefix: org.apiKeyPrefix,
						isActive: org.isActive,
						isSandbox: org.isSandbox,
						createdAt: org.createdAt,
						updatedAt: org.updatedAt,
					}))

					set({ availableProducts: products, isLoadingProducts: false, loadError: null })

					// If only one product, auto-select it
					if (products.length === 1) {
						const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
							// Set API keys from localStorage before selecting
					const { apiKeys: currentKeys } = get()
					set({ apiKeys: { ...currentKeys, ...allKeys } })
					get().selectProduct(products[0].productId)
					}

					console.log("[demoProductStore] ✅ Loaded products:", products.length)
				} catch (error) {
					console.error("[demoProductStore] Failed to load products:", error)
					set({
						loadError: error instanceof Error ? error.message : "Failed to load products",
						isLoadingProducts: false,
					})
				}
			},

			// Select product by productId
			selectProduct: (productId: string) => {
				const { availableProducts, apiKeys } = get()
				const product = availableProducts.find((p) => p.productId === productId)

				if (!product) {
					console.error(`[demoProductStore] ❌ Product not found: ${productId}`)
					return
				}

				// Get API key from store
				const apiKey = apiKeys[productId]

				console.log("[demoProductStore] Selecting product:", {
					productId: product.productId,
					companyName: product.companyName,
					hasApiKey: !!apiKey,
					apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + "..." : "NOT_SET",
				})

				set({
					selectedProductId: productId,
					selectedProduct: product,
				})

				// Validate API key exists
				if (!apiKey) {
					console.error(
						`[demoProductStore] ❌ API key not found for product: ${productId}. Demo may not work correctly.`,
					)
					console.error("[demoProductStore] Please regenerate API key from Dashboard → Products → Configure Product")
					console.error("[demoProductStore] Current API keys in store:", Object.keys(apiKeys))
					console.error("[demoProductStore] Available products:", availableProducts.map(p => p.productId))
					// Don't return - still set up the product context (will just fail API calls)
				}

				// Sync to clientContextStore for API calls
				const { setClientContext } = useClientContextStore.getState()
				setClientContext({
					clientId: product.id,
					productId: product.productId,
					apiKey: apiKey || "", // Empty string if no API key
					companyName: product.companyName,
					businessType: product.businessType,
				})

				console.log("[demoProductStore] ✅ Product selected and synced to clientContextStore:", {
					productId: product.productId,
					companyName: product.companyName,
					hasApiKey: !!apiKey,
					apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + "..." : "NOT_SET",
				})
			},

			// Select visualization type
			selectVisualization: (type: VisualizationType) => {
				set({ visualizationType: type })
				console.log("[demoProductStore] Visualization selected:", type)
			},

			// Set API key for a specific product
			setApiKey: (productId: string, apiKey: string) => {
				const { apiKeys } = get()
				set({
					apiKeys: {
						...apiKeys,
						[productId]: apiKey,
					}
				})
				console.log("[demoProductStore] API key set for product:", productId)
			},

			// Clear current selection (reset to selector)
			clearSelection: () => {
				set({
					selectedProductId: null,
					selectedProduct: null,
					visualizationType: null,
				})
			},

			// Full reset (clear everything including available products)
			reset: () => {
				set(initialState)
			},

			// Computed: Get API key for selected product
			getSelectedApiKey: () => {
				const { selectedProductId, apiKeys } = get()
				if (!selectedProductId) return null
				return apiKeys[selectedProductId] || null
			},

			// Computed: Get API key for specific product
			getApiKey: (productId: string) => {
				const { apiKeys } = get()
				return apiKeys[productId] || null
			}, // Computed: Check if product is selected
			hasSelectedProduct: () => {
				return get().selectedProductId !== null
			},

			// Computed: Check if visualization is selected
			hasSelectedVisualization: () => {
				return get().visualizationType !== null
			},

			// Computed: Check if ready to start demo
			canStartDemo: () => {
				return get().hasSelectedProduct() && get().hasSelectedVisualization()
			},
		}),
		{
			name: "proxify-demo-product-state", // localStorage key
			partialize: (state) => ({
				// Persist these fields
				selectedProductId: state.selectedProductId,
				selectedProduct: state.selectedProduct,
				visualizationType: state.visualizationType,
				apiKeys: state.apiKeys, // ✅ Persist API keys in Zustand
				// Don't persist availableProducts - always reload from userStore
			}),
		},
	),
)
