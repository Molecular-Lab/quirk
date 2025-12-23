/**
 * End-User Onboarding Route
 * Educational flow for new users before activating their account
 * Route: /onboarding/:clientUserId
 */

import { createFileRoute } from "@tanstack/react-router"

import { EndUserOnboardingPage } from "@/feature/onboarding/EndUserOnboardingPage"

export const Route = createFileRoute("/onboarding/$clientUserId")({
	component: EndUserOnboardingPage,
})
