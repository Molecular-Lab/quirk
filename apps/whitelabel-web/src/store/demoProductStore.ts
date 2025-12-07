import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useClientContextStore } from "./clientContextStore"

// Organization type from userStore
export interface Organization {
	id: string
	productId: string
	companyName: string
	businessType: string
	description?: string
	websiteUrl?: string
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

	// Actions
	loadProducts: (products: Organization[]) => void
	selectProduct: (productId: string) => void
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
}

export const useDemoProductStore = create<DemoProductState>()(
	persist(
		(set, get) => ({
			...initialState,

			// Load products from userStore (called on demo entry)
			loadProducts: (products: Organization[]) => {
				set({ availableProducts: products })

				// If only one product, auto-select it
				if (products.length === 1) {
					get().selectProduct(products[0].productId)
				}

				// If selectedProductId exists but not in products, clear it
				const { selectedProductId } = get()
				if (selectedProductId && !products.find((p) => p.productId === selectedProductId)) {
					set({ selectedProductId: null, selectedProduct: null })
				}
			},

			// Select product by productId
			selectProduct: (productId: string) => {
				const product = get().availableProducts.find((p) => p.productId === productId)

				if (!product) {
					console.error(`[demoProductStore] Product not found: ${productId}`)
					return
				}

				set({
					selectedProductId: productId,
					selectedProduct: product,
				})

				// Sync to clientContextStore for API calls
				const { setClientContext } = useClientContextStore.getState()
				setClientContext({
					clientId: product.id,
					productId: product.productId,
					apiKey: null, // Will be loaded from userStore
					companyName: product.companyName,
					businessType: product.businessType,
				})
				console.log("[demoProductStore] Product selected:", {
					productId: product.productId,
					companyName: product.companyName,
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
