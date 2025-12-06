/**
 * useProducts Hook
 *
 * Manages products (organizations) data and operations.
 * Wraps useUserStore's organizations logic with product-specific features.
 */

import { useEffect, useState } from "react"

import type { Organization } from "@/store/userStore"
import { useUserStore } from "@/store/userStore"

export interface UseProductsReturn {
	products: Organization[]
	isLoading: boolean
	error: string | null
	loadProducts: () => Promise<void>
	selectProduct: (productId: string) => void
	activeProductId: string | null
	isLoaded: boolean
	getProductById: (productId: string) => Organization | undefined
}

export function useProducts(): UseProductsReturn {
	const {
		organizations,
		loadOrganizations,
		isOrganizationsLoaded,
		privyOrganizationId,
		setActiveOrganization,
		activeProductId,
	} = useUserStore()

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Auto-load products when component mounts (if user is authenticated and not yet loaded)
	useEffect(() => {
		if (privyOrganizationId && !isOrganizationsLoaded && !isLoading) {
			void loadProducts()
		}
	}, [privyOrganizationId, isOrganizationsLoaded])

	/**
	 * Load all products for the authenticated user
	 */
	const loadProducts = async () => {
		if (!privyOrganizationId) {
			setError("User not authenticated")
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			await loadOrganizations()
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to load products"
			setError(errorMessage)
			console.error("[useProducts] Error loading products:", err)
		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Select a product and set it as active
	 */
	const selectProduct = (productId: string) => {
		const product = organizations.find((org) => org.productId === productId)

		if (!product) {
			console.warn(`[useProducts] Product ${productId} not found`)
			return
		}

		setActiveOrganization(productId)
		console.log("[useProducts] Selected product:", product.companyName)
	}

	/**
	 * Get product by ID
	 */
	const getProductById = (productId: string) => {
		return organizations.find((org) => org.productId === productId)
	}

	return {
		products: organizations,
		isLoading,
		error,
		loadProducts,
		selectProduct,
		activeProductId,
		isLoaded: isOrganizationsLoaded,
		getProductById,
	}
}
