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

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"

import { useClientContextStore } from "@/store/clientContextStore"
import { type VisualizationType, useDemoProductStore } from "@/store/demoProductStore"

import { CreatorsDemoApp } from "./creators/CreatorsDemoApp"
import { EcommerceDemoApp } from "./ecommerce/EcommerceDemoApp"
import { GigWorkersDemoApp } from "./gig-workers/GigWorkersDemoApp"

interface DemoWrapperProps {
	visualizationType: VisualizationType
}

export function DemoWrapper({ visualizationType }: DemoWrapperProps) {
	const navigate = useNavigate()
	const { user } = usePrivy()
	const privyOrganizationId = user?.id ?? null

	const { apiKey: clientApiKey, productId: clientProductId, hasContext } = useClientContextStore()
	const {
		availableProducts,
		selectedProductId,
		selectedProduct,
		loadProductsByPrivyId,
		isLoadingProducts,
		selectVisualization,
	} = useDemoProductStore()

	// NOTE: State reset now happens in DemoSelectorPage when platform is clicked
	// This prevents race conditions and ensures clean state before navigation

	// ✅ FORCE FRESH API FETCH: Load products directly from API (no localStorage)
	useEffect(() => {
		if (availableProducts.length === 0 && privyOrganizationId && !isLoadingProducts) {
			console.log("[DemoWrapper] 🔄 Force fetching products from API (no localStorage)...")
			void loadProductsByPrivyId(privyOrganizationId)
		}
	}, [availableProducts.length, privyOrganizationId, isLoadingProducts, loadProductsByPrivyId])

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

	// NOTE: Removed redirect logic - wizard handles product selection now
	// The wizard will open automatically if no product is selected (handled in BaseDemoApp)

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

	// Auto-redirect to selector if products not loaded after 3 seconds
	useEffect(() => {
		if (availableProducts.length === 0 && !isLoadingProducts) {
			const timeout = setTimeout(() => {
				if (availableProducts.length === 0) {
					console.log("[DemoWrapper] ⚠️ Products not loaded after 3s, redirecting to selector...")
					navigate({ to: "/demo" })
				}
			}, 3000)

			return () => {
				clearTimeout(timeout)
			}
		}
	}, [availableProducts.length, isLoadingProducts, navigate])

	// Show loading if waiting for products
	if (availableProducts.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-25 via-white to-white">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-gray-200 border-t-accent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Loading demo...</p>
					<p className="text-xs text-gray-400 mt-2">Fetching fresh data from API...</p>
				</div>
			</div>
		)
	}

	// Wizard will handle product selection - just render the demo
	return renderDemo()
}
