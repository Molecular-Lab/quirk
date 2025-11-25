import { createFileRoute } from "@tanstack/react-router"

import { APITestingPage } from "@/feature/dashboard/APITestingPage"

export const Route = createFileRoute("/dashboard/api-testing")({
	component: APITestingPage,
})
