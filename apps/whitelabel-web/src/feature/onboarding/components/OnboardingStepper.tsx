/**
 * Onboarding Stepper Component
 * Minimal pill-based progress indicator for the onboarding flow
 */

import { cn } from "@/lib/utils"

interface OnboardingStepperProps {
	currentStep: number
	totalSteps: number
}

export function OnboardingStepper({ currentStep, totalSteps }: OnboardingStepperProps) {
	return (
		<div className="flex items-center justify-center gap-2">
			{Array.from({ length: totalSteps }).map((_, index) => {
				const stepNumber = index + 1
				const isCompleted = stepNumber < currentStep
				const isCurrent = stepNumber === currentStep

				return (
					<div
						key={stepNumber}
						className={cn(
							"h-2 rounded-full transition-all duration-300",
							isCurrent && "w-8 bg-gray-900",
							isCompleted && "w-2 bg-violet-400",
							!isCurrent && !isCompleted && "w-2 bg-gray-200"
						)}
					/>
				)
			})}
		</div>
	)
}
