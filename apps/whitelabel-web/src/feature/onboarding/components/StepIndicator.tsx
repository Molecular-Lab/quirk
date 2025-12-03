import { Check } from "lucide-react"

interface StepIndicatorProps {
	currentStep: number
	totalSteps: number
}

const STEP_LABELS = ["Company Info", "Strategy Ranking", "Banking (Optional)"]

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
	return (
		<div className="w-full">
			<div className="flex items-center justify-between">
				{Array.from({ length: totalSteps }).map((_, index) => (
					<div key={index} className="flex-1 flex items-center">
						{/* Step Circle */}
						<div className="relative flex flex-col items-center">
							<div
								className={`
									w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
									transition-colors duration-200
									${
										index < currentStep
											? "bg-gray-900 text-white"
											: index === currentStep
												? "bg-gray-900 text-white ring-4 ring-gray-200"
												: "bg-gray-100 text-gray-400"
									}
								`}
							>
								{index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
							</div>
							<div className="mt-2 text-xs font-medium text-gray-600 text-center max-w-[100px]">
								{STEP_LABELS[index]}
							</div>
						</div>

						{/* Connector Line */}
						{index < totalSteps - 1 && (
							<div
								className={`
									flex-1 h-0.5 mx-2 transition-colors duration-200
									${index < currentStep ? "bg-gray-900" : "bg-gray-200"}
								`}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
