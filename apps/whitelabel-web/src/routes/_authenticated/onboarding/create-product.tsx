import { createFileRoute } from "@tanstack/react-router"

import { CreateProduct } from "@/feature/onboarding/CreateProduct"

export const Route = createFileRoute("/_authenticated/onboarding/create-product")({
	component: CreateProduct,
})
