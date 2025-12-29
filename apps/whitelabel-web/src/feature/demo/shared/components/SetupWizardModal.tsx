/**
 * SetupWizardModal Component
 *
 * Simplified 2-step wizard for demo setup:
 * Step 1: Product & API Key Configuration (environment + product + API key in one place)
 * Step 2: Persona Selection
 */

import { useEffect, useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useDemoStore } from "@/store/demoStore"
import { useDemoProductStore } from "@/store/demoProductStore"

import { ProductAndApiKeyStep } from "../pages/ProductAndApiKeyStep"
import { PersonaSelectionStep } from "../pages/PersonaSelectionStep"

export interface SetupWizardModalProps {
	open: boolean
	onComplete: () => void
	onClose?: () => void
}

export function SetupWizardModal({ open, onComplete, onClose }: SetupWizardModalProps) {
	const { setEnvironment, setWizardProduct, completeWizard, resetWizard } = useDemoStore()
	const { selectProduct } = useDemoProductStore()

	const [currentStep, setCurrentStep] = useState<1 | 2>(1)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	// Store selections from Step 1
	const [step1Data, setStep1Data] = useState<{
		productId: string
		environment: "sandbox" | "production"
	} | null>(null)

	// Reset wizard when modal opens
	useEffect(() => {
		if (open) {
			console.log("[SetupWizardModal] Modal opened, resetting wizard")
			resetWizard()
			setCurrentStep(1)
			setStep1Data(null)
			setError(null)
		}
	}, [open, resetWizard])

	const handleStep1Complete = (data: { productId: string; environment: "sandbox" | "production" }) => {
		console.log("[SetupWizardModal] ✅ Step 1 complete:", data)

		// Save selections
		setStep1Data(data)

		// Set environment in demoStore
		setEnvironment(data.environment)

		// Select product in demoProductStore (syncs to clientContextStore)
		// ✅ Pass environment parameter to ensure correct API key is selected
		selectProduct(data.productId, data.environment)

		// Also save to wizard state (for backward compatibility)
		setWizardProduct(data.productId)

		console.log("[SetupWizardModal] ✅ All state synced, advancing to Step 2")

		// Advance to Step 2
		setCurrentStep(2)
		setError(null)
	}

	const handleStep2Complete = () => {
		console.log("[SetupWizardModal] ✅ Step 2 complete, wizard finished")
		completeWizard()
		onComplete()
	}

	const handleBack = () => {
		if (currentStep === 2) {
			setCurrentStep(1)
			setError(null)
		}
	}

	const handleClose = () => {
		if (onClose) {
			onClose()
		}
	}

	// Render current step
	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return <ProductAndApiKeyStep onComplete={handleStep1Complete} />

			case 2:
				if (!step1Data) {
					return (
						<Alert variant="destructive">
							<AlertDescription>Invalid wizard state. Please restart.</AlertDescription>
						</Alert>
					)
				}
				return (
					<PersonaSelectionStep
						productId={step1Data.productId}
						environment={step1Data.environment}
						onComplete={handleStep2Complete}
						isLoading={isLoading}
						setIsLoading={setIsLoading}
					/>
				)

			default:
				return null
		}
	}

	return (
		<Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Demo Setup</DialogTitle>
					<DialogDescription>
						{currentStep === 1
							? "Configure your product and API key"
							: "Choose your demo user persona"}
					</DialogDescription>
				</DialogHeader>

				{/* Step Progress Indicator */}
				<div className="flex items-center justify-center gap-2 mb-4">
					<div
						className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
							currentStep === 1 ? "bg-accent text-white" : "bg-green-500 text-white"
						}`}
					>
						{currentStep > 1 ? "✓" : "1"}
					</div>
					<div className="w-16 h-1 bg-gray-200">
						<div className={`h-full ${currentStep > 1 ? "bg-accent" : "bg-gray-200"} transition-all`} />
					</div>
					<div
						className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
							currentStep === 2 ? "bg-accent text-white" : "bg-gray-200 text-gray-500"
						}`}
					>
						2
					</div>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Step Content */}
				<div className="py-4">{renderStepContent()}</div>

				{/* Navigation Buttons */}
				<div className="flex items-center justify-between pt-4 border-t">
					<div>
						{currentStep > 1 && (
							<Button variant="outline" onClick={handleBack} disabled={isLoading}>
								Back
							</Button>
						)}
					</div>

					<div className="flex items-center gap-2">
						{onClose && (
							<Button variant="ghost" onClick={handleClose} disabled={isLoading}>
								Cancel
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
