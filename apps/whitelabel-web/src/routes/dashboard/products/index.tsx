import { createFileRoute } from "@tanstack/react-router"

import { ProductsListPage } from "@/feature/dashboard/ProductsListPage"

export const Route = createFileRoute("/dashboard/products/")({
	component: ProductsListPage,
})
