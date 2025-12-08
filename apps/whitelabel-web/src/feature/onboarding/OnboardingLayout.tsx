import { useEffect } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"

import { useOnboardingStore } from "@/store/onboardingStore"
import { useUserStore } from "@/store/userStore"

import { BankAccountForm } from "./components/BankAccountForm"
import { CompanyInfoForm } from "./components/CompanyInfoForm"
import { StepIndicator } from "./components/StepIndicator"
import { StrategySelector } from "./components/StrategySelector"

const TOTAL_STEPS = 3

export function OnboardingLayout() {
	const navigate = useNavigate()
	const { authenticated, ready } = usePrivy()
	const { currentStep } = useOnboardingStore()
	const { organizations } = useUserStore()

	// Redirect if not authenticated
	useEffect(() => {
		if (ready && !authenticated) {
			void navigate({ to: "/login" })
		}
	}, [ready, authenticated, navigate])

	// Redirect to dashboard if user already has products
	useEffect(() => {
		if (authenticated && organizations.length > 0) {
			void navigate({ to: "/dashboard" })
		}
	}, [authenticated, organizations, navigate])

	if (!ready || !authenticated) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-gray-600">Loading...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 relative overflow-hidden">
			{/* Luma-style soft decorative gradients */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/20 via-purple-100/15 to-transparent rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-pink-100/20 via-purple-100/15 to-transparent rounded-full blur-3xl" />
			</div>

			{/* Content */}
			<div className="relative z-10">
				{/* Header */}
				<header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
					<div className="max-w-4xl mx-auto px-6 py-4">
						<h1 className="text-2xl font-bold text-gray-900">Create Your Product</h1>
						<p className="text-sm text-gray-600 mt-1">Set up your white-label DeFi infrastructure</p>
					</div>
				</header>

				{/* Progress Indicator */}
				<div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
					<div className="max-w-4xl mx-auto px-6 py-6">
						<StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
					</div>
				</div>

				{/* Form Content */}
				<div className="max-w-4xl mx-auto px-6 py-8">
					<div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-8">
						{currentStep === 0 && <CompanyInfoForm />}
						{currentStep === 1 && <StrategySelector />}
						{currentStep === 2 && <BankAccountForm />}
					</div>
				</div>
			</div>
		</div>
	)
}
