import { createFileRoute } from "@tanstack/react-router"

import { LandingPage } from "@/feature/landing/LandingPage"

export const Route = createFileRoute("/")({
	component: LandingPage,
})
