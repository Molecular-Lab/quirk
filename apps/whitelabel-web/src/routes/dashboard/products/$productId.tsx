import { createFileRoute, redirect } from "@tanstack/react-router"

import { ProductConfigPage } from "@/feature/dashboard/ProductConfigPage"
import { useUserStore } from "@/store/userStore"

export const Route = createFileRoute("/dashboard/products/$productId")({
	component: ProductConfigPage,
	beforeLoad: ({ params }) => {
		const { organizations, setActiveOrganization } = useUserStore.getState()
		const { productId } = params

		// Validate that productId exists in user's organizations
		const product = organizations.find((org) => org.productId === productId)

		if (!product) {
			// Product not found - redirect to products list
			console.warn(`[ProductConfig] Product ${productId} not found, redirecting to list`)
			throw redirect({
				to: "/dashboard/products",
			})
		}

		// Set as active product if not already active
		const { activeProductId } = useUserStore.getState()
		if (activeProductId !== productId) {
			console.log(`[ProductConfig] Setting active product to ${productId}`)
			setActiveOrganization(productId)
		}
	},
})
