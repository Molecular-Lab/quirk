import { createFileRoute, redirect, useParams } from "@tanstack/react-router"

import { ProductConfigPage } from "@/feature/dashboard/ProductConfigPage"
import { useUserStore } from "@/store/userStore"

// Wrapper component that forces re-mount when productId changes
function ProductConfigPageWrapper() {
	const { productId } = useParams({ from: "/dashboard/products/$productId" })

	// Use productId as key to force complete re-mount when switching products
	// This ensures all state is fresh and prevents stale data
	return <ProductConfigPage key={productId} />
}

export const Route = createFileRoute("/dashboard/products/$productId")({
	component: ProductConfigPageWrapper,
	beforeLoad: ({ params }) => {
		const { organizations, setActiveOrganization, isOrganizationsLoaded } = useUserStore.getState()
		const { productId } = params

		// If organizations haven't loaded yet, allow navigation (component will handle loading state)
		if (!isOrganizationsLoaded) {
			setActiveOrganization(productId)
			return
		}

		// Validate that productId exists in user's organizations
		const product = organizations.find((org) => org.productId === productId)

		if (!product) {
			// Product not found - redirect to products list
			console.warn(`[ProductConfig] Product ${productId} not found, redirecting to list`)
			throw redirect({
				to: "/dashboard/products",
			})
		}

		// Set as active product (always update to ensure consistency)
		setActiveOrganization(productId)
	},
})
