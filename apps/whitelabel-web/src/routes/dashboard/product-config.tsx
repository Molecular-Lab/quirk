import { createFileRoute, redirect } from "@tanstack/react-router"

// Redirect to /dashboard/products for backward compatibility
export const Route = createFileRoute("/dashboard/product-config")({
	beforeLoad: () => {
		throw redirect({
			to: "/dashboard/products",
		})
	},
})
