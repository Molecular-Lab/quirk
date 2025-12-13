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
			loadOrganizations()
		}
	}, [organizations.length, loadOrganizations])

	// Load products into demoProductStore
	useEffect(() => {
		if (organizations.length > 0) {
			// Load API keys from localStorage
			const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")

			console.log("[DemoWrapper] Loading products into demoProductStore:", {
				organizationsCount: organizations.length,
				apiKeysCount: Object.keys(allKeys).length,
			})

			// Load products with API keys
			loadProducts(organizations, allKeys)
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
				console.warn("[DemoWrapper] Client context not synced, please select product again")
				console.log("[DemoWrapper] Expected productId:", selectedProductId, "Got:", clientProductId)
				console.log("[DemoWrapper] Has API key:", !!clientApiKey)

				// Redirect back to selector to reselect
				navigate({ to: "/demo" })
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
	useEffect(() => {
		if (availableProducts.length > 0 && !selectedProductId) {
			console.warn("[DemoWrapper] No product selected, redirecting to selector")
			navigate({ to: "/demo" })
		}
	}, [availableProducts, selectedProductId, navigate])

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

	// Show loading if no product selected yet (redirecting)
	if (!selectedProductId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-25 via-white to-white">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-gray-200 border-t-accent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Redirecting to product selection...</p>
				</div>
			</div>
		)
	}

	return renderDemo()
}
