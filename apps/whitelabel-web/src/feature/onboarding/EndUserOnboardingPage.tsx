/**
 * End-User Onboarding Page
 * 6-step educational flow before account activation
 */

import { useEffect, useState } from "react"

import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { activateUser, getUserByClientUserId } from "@/api/b2bClientHelpers"
import { useClientContextStore } from "@/store/clientContextStore"
import { useDemoStore } from "@/store/demoStore"
import { Button } from "@/components/ui/button"

import { OnboardingStepper } from "./components/OnboardingStepper"
import { FinalStep } from "./steps/FinalStep"
import { GlobalBenefitsStep } from "./steps/GlobalBenefitsStep"
import { InvestmentStrategiesStep } from "./steps/InvestmentStrategiesStep"
import { MoneyJourneyStep } from "./steps/MoneyJourneyStep"
import { StablecoinsStep } from "./steps/StablecoinsStep"
import { WelcomeStep } from "./steps/WelcomeStep"

const TOTAL_STEPS = 6

export function EndUserOnboardingPage() {
	const navigate = useNavigate()
	const { clientUserId } = useParams({ from: "/onboarding/$clientUserId" })
	const search = useSearch({ from: "/onboarding/$clientUserId" })

	const [currentStep, setCurrentStep] = useState(1)
	const [isActivating, setIsActivating] = useState(false)
	const [isCheckingStatus, setIsCheckingStatus] = useState(true)

	// Get productId from store as fallback
	const storedProductId = useClientContextStore((state) => state.productId)

	// Get activateEarnAccount to sync demoStore after successful activation
	const activateEarnAccount = useDemoStore((state) => state.activateEarnAccount)

	// Get userId, clientId, and productId from URL params (passed from demo apps)
	const userId = (search as any)?.userId
	const clientId = (search as any)?.clientId
	const productId = (search as any)?.productId || storedProductId // Fallback to store
	const returnPath = (search as any)?.returnPath || "/demo"

	console.log("[EndUserOnboardingPage] productId:", productId, "from URL:", (search as any)?.productId, "from store:", storedProductId)

	// Check if user is already activated on mount
	useEffect(() => {
		async function checkUserStatus() {
			if (!clientId || !clientUserId) {
				console.log("[EndUserOnboardingPage] Missing clientId or clientUserId, skipping status check")
				setIsCheckingStatus(false)
				return
			}

			try {
				console.log("[EndUserOnboardingPage] Checking user status for:", { clientId, clientUserId })
				const user = await getUserByClientUserId(clientId, clientUserId)

				if (user?.status === "active") {
					console.log("[EndUserOnboardingPage] User already activated, redirecting...")
					toast.info("You've already completed onboarding!")
					navigate({ to: returnPath || "/" })
					return
				}

				console.log("[EndUserOnboardingPage] User status:", user?.status || "not found")
			} catch (error) {
				console.error("[EndUserOnboardingPage] Failed to check user status:", error)
			}

			setIsCheckingStatus(false)
		}

		checkUserStatus()
	}, [clientId, clientUserId, navigate, returnPath])

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleOpenAccount = async () => {
		if (!userId || !productId) {
			toast.error("Missing required user information. Please start over.")
			return
		}

		setIsActivating(true)
		try {
			await activateUser(userId, productId)

			// Sync demoStore state BEFORE navigating back to demo app
			// This ensures the demo app shows the Earn UI with balance, not PersonaSelector
			activateEarnAccount()
			console.log("[EndUserOnboardingPage] Called activateEarnAccount() - hasEarnAccount is now true")

			toast.success("Account activated successfully! Welcome aboard!")

			// Redirect to return path after a short delay
			setTimeout(() => {
				navigate({ to: returnPath })
			}, 1500)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to activate account. Please try again.")
			console.error("Activation error:", error)
		} finally {
			setIsActivating(false)
		}
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <WelcomeStep />
			case 2:
				return <StablecoinsStep />
			case 3:
				return <GlobalBenefitsStep />
			case 4:
				return <InvestmentStrategiesStep productId={productId} />
			case 5:
				return <MoneyJourneyStep productId={productId} />
			case 6:
				return <FinalStep productId={productId} />
			default:
				return null
		}
	}

	// Show loading while checking user status
	if (isCheckingStatus) {
		return (
			<div className="min-h-screen gradient-bg flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
			</div>
		)
	}

	return (
		<div className="min-h-screen gradient-bg flex flex-col">
			{/* Header */}
			<header className="flex items-center justify-center px-4 py-6">
				<OnboardingStepper currentStep={currentStep} totalSteps={TOTAL_STEPS} />
			</header>

			{/* Content */}
			<main className="flex-1 flex flex-col px-6 pb-8 pt-4 overflow-y-auto">
				<div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
					{renderStep()}
				</div>
			</main>

			{/* Footer */}
			<footer className="px-6 pb-8 pt-4">
				<div className="max-w-md mx-auto w-full space-y-3">
					{currentStep < TOTAL_STEPS ? (
						<>
							<Button
								variant="onboarding"
								size="xl"
								className="w-full"
								onClick={handleNext}
							>
								Continue
								<ArrowRight className="w-5 h-5" />
							</Button>
							{currentStep > 1 && (
								<Button
									variant="onboarding-secondary"
									size="xl"
									className="w-full"
									onClick={handlePrevious}
								>
									<ArrowLeft className="w-4 h-4" />
									Go Back
								</Button>
							)}
						</>
					) : (
						<Button
							variant="onboarding"
							size="xl"
							className="w-full"
							onClick={handleOpenAccount}
							disabled={isActivating}
						>
							{isActivating ? (
								<>
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Activating...
								</>
							) : (
								<>
									<Check className="w-5 h-5" />
									Get Started
								</>
							)}
						</Button>
					)}
				</div>
			</footer>
		</div>
	)
}
