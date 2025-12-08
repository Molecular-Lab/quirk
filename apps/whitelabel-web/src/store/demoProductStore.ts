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

	// Visualization selection
	visualizationType: VisualizationType | null

	// Loading state
	isLoadingProducts: boolean
	loadError: string | null

	// Actions
	loadProducts: (products: Organization[]) => void
	loadProductsByPrivyId: (privyOrgId: string) => Promise<void>
	selectProduct: (productId: string, apiKey?: string) => void
	selectVisualization: (type: VisualizationType) => void
	clearSelection: () => void
	reset: () => void

	// Computed getters
	getSelectedApiKey: () => string | null
	hasSelectedProduct: () => boolean
	hasSelectedVisualization: () => boolean
	canStartDemo: () => boolean
}

const initialState = {
	availableProducts: [],
	selectedProductId: null,
	selectedProduct: null,
	visualizationType: null,
	isLoadingProducts: false,
	loadError: null,
}

export const useDemoProductStore = create<DemoProductState>()(
	persist(
		(set, get) => ({
			...initialState,

			// Load products from userStore (called on demo entry - legacy method)
			loadProducts: (products: Organization[]) => {
				set({ availableProducts: products, isLoadingProducts: false, loadError: null })

				// If only one product, auto-select it
				if (products.length === 1) {
					// Load API key for auto-selected product
					const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
					const apiKey = allKeys[products[0].productId]
					get().selectProduct(products[0].productId, apiKey)
				}

				// If selectedProductId exists but not in products, clear it
				const { selectedProductId } = get()
				if (selectedProductId && !products.find((p) => p.productId === selectedProductId)) {
					set({ selectedProductId: null, selectedProduct: null })
				}
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
						const apiKey = allKeys[products[0].productId]
						get().selectProduct(products[0].productId, apiKey)
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
			selectProduct: (productId: string, apiKey?: string) => {
				const product = get().availableProducts.find((p) => p.productId === productId)

				if (!product) {
					console.error(`[demoProductStore] ❌ Product not found: ${productId}`)
					return
				}

				console.log("[demoProductStore] Selecting product:", {
					productId: product.productId,
					companyName: product.companyName,
					apiKeyProvided: !!apiKey,
				})

				set({
					selectedProductId: productId,
					selectedProduct: product,
				})

				// Load API key from localStorage if not provided
				let resolvedApiKey = apiKey
				if (!resolvedApiKey) {
					console.log("[demoProductStore] API key not provided, loading from localStorage...")
					const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
					resolvedApiKey = allKeys[productId]
					console.log("[demoProductStore] localStorage keys:", Object.keys(allKeys))
					console.log("[demoProductStore] Found key for", productId, ":", !!resolvedApiKey)
				}

				// Validate API key exists
				if (!resolvedApiKey) {
					console.error(
						`[demoProductStore] ❌ API key not found for product: ${productId}. Demo may not work correctly.`,
					)
					console.error("[demoProductStore] Please ensure API key is saved in localStorage: b2b:api_keys")
				}

				// Sync to clientContextStore for API calls
				const { setClientContext } = useClientContextStore.getState()
				setClientContext({
					clientId: product.id,
					productId: product.productId,
					apiKey: resolvedApiKey || "",
					companyName: product.companyName,
					businessType: product.businessType,
				})

				console.log("[demoProductStore] ✅ Product selected and synced to clientContextStore:", {
					productId: product.productId,
					companyName: product.companyName,
					hasApiKey: !!resolvedApiKey,
					apiKeyPrefix: resolvedApiKey ? resolvedApiKey.substring(0, 12) + "..." : "MISSING",
				})
			},

			// Select visualization type
			selectVisualization: (type: VisualizationType) => {
				set({ visualizationType: type })
				console.log("[demoProductStore] Visualization selected:", type)
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
				// API key is stored in clientContextStore (synced from userStore)
				const { apiKey } = useClientContextStore.getState()
				return apiKey
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
				// Persist only these fields
				selectedProductId: state.selectedProductId,
				selectedProduct: state.selectedProduct,
				visualizationType: state.visualizationType,
				// Don't persist availableProducts - always reload from userStore
			}),
		},
	),
)
