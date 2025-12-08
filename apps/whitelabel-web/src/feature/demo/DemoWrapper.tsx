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
	const { organizations, loadOrganizations, apiKey } = useUserStore()
	const { setClientContext, syncToLocalStorage } = useClientContextStore()
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
			console.log("[DemoWrapper] Loading products into demoProductStore:", organizations.length)
			loadProducts(organizations)
		}
	}, [organizations, loadProducts])

	// Set visualization type
	useEffect(() => {
		console.log("[DemoWrapper] Setting visualization type:", visualizationType)
		selectVisualization(visualizationType)
	}, [visualizationType, selectVisualization])

	// Sync selected product to clientContextStore
	useEffect(() => {
		if (selectedProduct && selectedProductId && apiKey) {
			console.log("[DemoWrapper] Syncing product to clientContextStore:", {
				productId: selectedProductId,
				companyName: selectedProduct.companyName,
			})

			setClientContext({
				clientId: selectedProduct.id,
				productId: selectedProductId,
				apiKey: apiKey,
				companyName: selectedProduct.companyName,
				businessType: selectedProduct.businessType,
			})

			syncToLocalStorage()
		}
	}, [selectedProduct, selectedProductId, apiKey, setClientContext, syncToLocalStorage])

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
