/**
 * Demo Wrapper
 * Initializes demo environment with proper product context
 *
 * New Architecture:
 * - Loads products from userStore into demoProductStore
 * - Syncs selected product from demoProductStore to clientContextStore
 * - Renders appropriate demo visualization based on type
 */

import { useEffect } from "react"

import { useNavigate } from "@tanstack/react-router"

import { useClientContextStore } from "@/store/clientContextStore"
import { type VisualizationType, useDemoProductStore } from "@/store/demoProductStore"
import { useUserStore } from "@/store/userStore"

import { CreatorsDemoApp } from "./creators/CreatorsDemoApp"
import { EcommerceDemoApp } from "./ecommerce/EcommerceDemoApp"
import { GigWorkersDemoApp } from "./gig-workers/GigWorkersDemoApp"

interface DemoWrapperProps {
	visualizationType: VisualizationType
}

export function DemoWrapper({ visualizationType }: DemoWrapperProps) {
	const navigate = useNavigate()
	const { organizations, loadOrganizations } = useUserStore()
	const { apiKey: clientApiKey, productId: clientProductId, hasContext } = useClientContextStore()
	const { availableProducts, selectedProductId, selectedProduct, loadProducts, selectVisualization } =
		useDemoProductStore()

	// Load organizations from userStore
	useEffect(() => {
		if (organizations.length === 0) {
			void loadOrganizations()
		}
	}, [organizations.length, loadOrganizations])

	// Load products into demoProductStore
	useEffect(() => {
		if (organizations.length > 0) {
			console.log("[DemoWrapper] 🔄 Loading products with API keys from localStorage")

			// ✅ Load API keys from localStorage (where Dashboard saves them)
			const apiKeysFromLocalStorage = useDemoProductStore.getState().loadApiKeysFromLocalStorage()

			// Load products with fresh API keys
			loadProducts(organizations, apiKeysFromLocalStorage)

			console.log("[DemoWrapper] ✅ Products loaded with API keys:", {
				totalProducts: organizations.length,
				productsWithKeys: Object.keys(apiKeysFromLocalStorage).length,
			})
		}
	}, [organizations, loadProducts])

	// Set visualization type
	useEffect(() => {
		console.log("[DemoWrapper] Setting visualization type:", visualizationType)
		selectVisualization(visualizationType)
	}, [visualizationType, selectVisualization])

	// Verify client context is set (API key + productId synced from product selection)
	useEffect(() => {
		if (selectedProductId && selectedProduct) {
			// Check if clientContextStore has the selected product's context
			if (!hasContext() || clientProductId !== selectedProductId) {
				console.warn("[DemoWrapper] Client context not synced, attempting to sync now...")
				console.log("[DemoWrapper] Expected productId:", selectedProductId, "Got:", clientProductId)
				console.log("[DemoWrapper] Has API key:", !!clientApiKey)

				// IMPORTANT: Instead of redirecting, try to sync the context from demoProductStore
				// This handles the case where user returns from onboarding and stores haven't synced yet
				const { selectedProduct: currentProduct, apiKeys } = useDemoProductStore.getState()
				if (currentProduct?.productId === selectedProductId) {
					console.log("[DemoWrapper] 🔄 Re-syncing context from demoProductStore...")
					const { setClientContext } = useClientContextStore.getState()
					setClientContext({
						clientId: currentProduct.id,
						productId: currentProduct.productId,
						apiKey: apiKeys[currentProduct.productId] || "",
						companyName: currentProduct.companyName,
						businessType: currentProduct.businessType,
					})
					console.log("[DemoWrapper] ✅ Context re-synced successfully")
				} else {
					console.warn("[DemoWrapper] ❌ Cannot sync context - redirecting to /demo")
					navigate({ to: "/demo" })
				}
			} else {
				console.log("[DemoWrapper] ✅ Client context verified:", {
					productId: clientProductId,
					hasApiKey: !!clientApiKey,
					companyName: selectedProduct.companyName,
				})
			}
		}
	}, [selectedProductId, selectedProduct, hasContext, clientProductId, clientApiKey, navigate])

	// Redirect to selector if no product selected
	// ⚠️ Only redirect after products are loaded AND we're sure no product is being selected
	// Add a delay to avoid race conditions during navigation from ProductSelector/DemoSelectorPage
	useEffect(() => {
		// Don't redirect immediately - give time for state to propagate from other components
		// This is critical because:
		// 1. DemoSelectorPage calls selectProduct() then navigate()
		// 2. DemoWrapper mounts while state is still propagating
		// 3. Without delay, we'd redirect before selectedProductId is set
		const timeoutId = setTimeout(() => {
			// Only redirect if:
			// - We have products loaded (not initial state)
			// - Still no product selected after reasonable delay
			// - We have a visualization type set (means user tried to navigate to demo)
			if (availableProducts.length > 0 && !selectedProductId && visualizationType) {
				console.warn("[DemoWrapper] No product selected after timeout, redirecting to selector")
				navigate({ to: "/demo" })
			}
		}, 200) // 200ms delay - enough for state updates to propagate

		return () => {
			clearTimeout(timeoutId)
		}
	}, [availableProducts, selectedProductId, visualizationType, navigate])

	// Render appropriate demo component
	const renderDemo = () => {
		switch (visualizationType) {
			case "ecommerce":
				return <EcommerceDemoApp />
			case "creators":
				return <CreatorsDemoApp />
			case "gig-workers":
				return <GigWorkersDemoApp />
			default:
				return <EcommerceDemoApp />
		}
	}

	// Show loading if waiting for products
	if (organizations.length === 0 || availableProducts.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-25 via-white to-white">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-gray-200 border-t-accent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Loading demo...</p>
				</div>
			</div>
		)
	}

	// Show message if no product selected
	if (!selectedProductId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-25 via-white to-white">
				<div className="text-center max-w-md mx-auto px-6">
					<div className="text-6xl mb-6">🛍️</div>
					<h2 className="text-2xl font-bold text-gray-950 mb-3">No Product Selected</h2>
					<p className="text-gray-600 mb-6">
						Please select a product to start the demo. You'll need an existing product with an API key configured.
					</p>
					<button
						onClick={() => navigate({ to: "/demo" })}
						className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
					>
						Go to Product Selection
					</button>
				</div>
			</div>
		)
	}

	return renderDemo()
}
