import { create } from "zustand"
import { persist } from "zustand/middleware"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"

import { useClientContextStore } from "./clientContextStore"
import { useDemoStore } from "./demoStore"

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

				console.log("[demoProductStore] 🔄 loadProducts() called:", {
					organizationsCount: products.length,
					apiKeysMapCount: apiKeysMap ? Object.keys(apiKeysMap).length : 0,
					apiKeysMapProductIds: apiKeysMap ? Object.keys(apiKeysMap) : [],
					existingApiKeysCount: Object.keys(currentApiKeys).length,
				})

				// Merge new API keys with existing ones (preserve existing keys)
				const apiKeys = {
					...currentApiKeys, // Keep existing API keys
					...(apiKeysMap || {}), // Add/override with new keys if provided
				}

				// Log per-product API key status for debugging
				products.forEach((org) => {
					const hasApiKey = !!(apiKeys[org.productId] || apiKeys[`${org.productId}_sandbox`])
					console.log(`[demoProductStore] 📋 Processing product ${org.productId}:`, {
						companyName: org.companyName,
						productId: org.productId,
						hasApiKey,
						apiKeyFound: hasApiKey ? "YES" : "NO",
						apiKeySource: apiKeys[org.productId] ? "direct" : apiKeys[`${org.productId}_sandbox`] ? "sandbox" : "none",
					})
				})

				set({
					availableProducts: products,
					apiKeys,
					isLoadingProducts: false,
					loadError: null,
				})

				// If only one product, auto-select it
				if (products.length === 1) {
					get().selectProduct(products[0].productId)
				}

				// If selectedProductId exists but not in products, clear it
				const { selectedProductId, selectedProduct } = get()
				if (selectedProductId && !products.find((p) => p.productId === selectedProductId)) {
					console.log("[demoProductStore] Clearing stale product selection - product no longer exists")
					set({ selectedProductId: null, selectedProduct: null })
				} else if (selectedProduct) {
					// Also check if persisted selectedProduct.id (database UUID) is stale
					const freshProduct = products.find((p) => p.productId === selectedProductId)
					if (freshProduct && freshProduct.id !== selectedProduct.id) {
						// Database UUID changed - update selectedProduct with fresh data
						console.log("[demoProductStore] Updated stale product ID:", {
							oldId: selectedProduct.id,
							newId: freshProduct.id,
						})
						set({ selectedProduct: freshProduct })

						// Also update clientContextStore with fresh ID
						const { setClientContext } = useClientContextStore.getState()
						setClientContext({
							clientId: freshProduct.id,
							productId: freshProduct.productId,
							apiKey: get().apiKeys[freshProduct.productId] || "",
							companyName: freshProduct.companyName,
							businessType: freshProduct.businessType,
						})
					}
				}

				console.log("[demoProductStore] ✅ Products loaded:", {
					total: products.length,
					totalApiKeys: Object.keys(apiKeys).length,
					productsWithKeys: products.filter((p) => !!apiKeys[p.productId]).length,
					productDetails: products.map((p) => ({
						productId: p.productId,
						companyName: p.companyName,
						hasApiKey: !!apiKeys[p.productId],
						apiKeyPrefix: apiKeys[p.productId]?.substring(0, 12) || "NOT_SET",
					})),
				})
			},

			// NEW: Load API keys from localStorage (where Dashboard saves them)
			loadApiKeysFromLocalStorage: () => {
				try {
					// Read from multi-org storage (current standard)
					const apiKeysJson = localStorage.getItem("b2b:api_keys")
					if (apiKeysJson) {
						const apiKeysMap = JSON.parse(apiKeysJson)
						console.log("[demoProductStore] 📋 Loaded API keys from localStorage:", {
							productIds: Object.keys(apiKeysMap),
							count: Object.keys(apiKeysMap).length,
						})

						set({ apiKeys: apiKeysMap })
						return apiKeysMap
					}

					// Fallback: Read from legacy single-org storage
					const legacyKey = localStorage.getItem("b2b:api_key")
					if (legacyKey) {
						console.log("[demoProductStore] 📋 Loaded legacy API key from localStorage")
						// We don't know which product this belongs to, so we can't use it
						// User should regenerate keys in Dashboard
					}

					console.warn("[demoProductStore] ⚠️ No API keys found in localStorage")
					return {}
				} catch (error) {
					console.error("[demoProductStore] ❌ Failed to load API keys from localStorage:", error)
					return {}
				}
			},

			// NEW: Load products by Privy ID (API call)
			loadProductsByPrivyId: async (privyOrgId: string) => {
				console.log("[demoProductStore] Loading products for privyOrgId:", privyOrgId)
				set({ isLoadingProducts: true, loadError: null })

				try {
					const response = await listOrganizationsByPrivyId(privyOrgId)
					const products: Organization[] = (response as any).organizations.map((org: any) => ({
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

					// Validate persisted selection against fresh products
					const { selectedProductId, selectedProduct } = get()
					if (selectedProductId && !products.find((p) => p.productId === selectedProductId)) {
						console.log("[demoProductStore] Clearing stale product selection after API load")
						set({ selectedProductId: null, selectedProduct: null })
					} else if (selectedProduct) {
						const freshProduct = products.find((p) => p.productId === selectedProductId)
						if (freshProduct && freshProduct.id !== selectedProduct.id) {
							console.log("[demoProductStore] Updated stale product ID after API load:", {
								oldId: selectedProduct.id,
								newId: freshProduct.id,
							})
							set({ selectedProduct: freshProduct })

							// Update clientContextStore with fresh ID
							const { setClientContext } = useClientContextStore.getState()
							setClientContext({
								clientId: freshProduct.id,
								productId: freshProduct.productId,
								apiKey: get().apiKeys[freshProduct.productId] || "",
								companyName: freshProduct.companyName,
								businessType: freshProduct.businessType,
							})
						}
					}

					// If only one product, auto-select it
					if (products.length === 1) {
						// Use API keys already loaded in store (from Zustand persistence)
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
				const { availableProducts, apiKeys, selectedProductId: previousProductId } = get()
				const product = availableProducts.find((p) => p.productId === productId)

				console.log("[demoProductStore] 🚀 selectProduct() called:", {
					productId,
					previousProductId,
					availableProductsCount: availableProducts.length,
					totalApiKeys: Object.keys(apiKeys).length,
				})

				if (!product) {
					console.error(`[demoProductStore] ❌ Product not found: ${productId}`)
					return
				}

				// Get current environment from demoStore
				const environment = useDemoStore.getState().selectedEnvironment

				// Get API key with environment awareness
				const envKey = apiKeys[`${productId}_${environment}`]
				const apiKey = envKey || apiKeys[productId]

				console.log("[demoProductStore] 📋 Product details:", {
					productId: product.productId,
					clientId: product.id,
					companyName: product.companyName,
					environment,
					hasApiKey: !!apiKey,
					apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + "..." : "NOT_SET",
					isActive: product.isActive,
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
					console.error(
						"[demoProductStore] Available products:",
						availableProducts.map((p) => p.productId),
					)
					// Don't return - still set up the product context (will just fail API calls)
				}

				// Sync to clientContextStore for API calls
				console.log("[demoProductStore] 🔄 Syncing to clientContextStore...")
				const { setClientContext } = useClientContextStore.getState()
				setClientContext({
					clientId: product.id,
					productId: product.productId,
					apiKey: apiKey || "", // Empty string if no API key
					companyName: product.companyName,
					businessType: product.businessType,
				})

				// ✅ FIX: Reset demoStore state when switching products
				// This ensures the old persona and end-user from a different product doesn't persist
				// Each product may have different platform (ecommerce/creators/gig-workers)
				console.log("[demoProductStore] 🔄 Resetting demoStore state (persona + end-user)...")
				const demoStore = useDemoStore.getState()
				demoStore.resetPersona() // Clears persona + end-user state
				demoStore.resetEndUser() // Extra safety: ensure end-user state is reset

				console.log("[demoProductStore] ✅ Product selected and synced to clientContextStore:", {
					productId: product.productId,
					clientId: product.id,
					companyName: product.companyName,
					hasApiKey: !!apiKey,
					apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + "..." : "NOT_SET",
					demoStateReset: true,
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
					},
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

			// Computed: Get API key for selected product (considers current environment)
			getSelectedApiKey: () => {
				const { selectedProductId, apiKeys } = get()
				if (!selectedProductId) return null

				// Get current environment from demoStore
				const environment = useDemoStore.getState().selectedEnvironment

				// Try environment-specific key first
				const envKey = apiKeys[`${selectedProductId}_${environment}`]
				if (envKey) return envKey

				return apiKeys[selectedProductId] || null
			},

			// Computed: Get API key for specific product (considers current environment)
			getApiKey: (productId: string) => {
				const { apiKeys } = get()
				// Get current environment from demoStore
				const environment = useDemoStore.getState().selectedEnvironment

				// Try environment-specific key first
				const envKey = apiKeys[`${productId}_${environment}`]
				if (envKey) return envKey

				// Fallback to non-environment key (backward compatibility)
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
