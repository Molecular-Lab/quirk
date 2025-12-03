import { createFileRoute } from "@tanstack/react-router"

import { OnboardingLayout } from "@/feature/onboarding/OnboardingLayout"

export const Route = createFileRoute("/onboarding")({
	component: OnboardingLayout,
})
