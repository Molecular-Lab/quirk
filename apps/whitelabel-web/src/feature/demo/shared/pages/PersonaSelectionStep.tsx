/**
 * PersonaSelectionStep Component (Step 4)
 *
 * Final step: User selects a persona (Bob/Alice)
 * Creates end-user account with Static Key including environment
 * Format: {privyUserId}:{platform}:{persona}:{environment}
 */

import { useState } from "react"

import { useNavigate } from "@tanstack/react-router"
import { usePrivy } from "@privy-io/react-auth"
import { Check, Loader2 } from "lucide-react"

import { createUser, getUserByClientUserId } from "@/api/b2bClientHelpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useClientContextStore } from "@/store/clientContextStore"
import { useDemoStore } from "@/store/demoStore"
import { useDemoProductStore } from "@/store/demoProductStore"
import { type PersonaProfile, generateDemoClientUserId, getAllPersonas } from "@/feature/demo/personas"

export interface PersonaSelectionStepProps {
	productId: string
	environment: "sandbox" | "production"
	onComplete: () => void
	isLoading: boolean
	setIsLoading: (loading: boolean) => void
}

export function PersonaSelectionStep({
	productId,
	environment,
	onComplete,
	isLoading,
	setIsLoading,
}: PersonaSelectionStepProps) {
	const { user } = usePrivy()
	const navigate = useNavigate()
	const privyUserId = user?.id || ""

	const { clientId, hasApiKey } = useClientContextStore()
	const { setPersonaWithUser, setIsCreatingAccount, setError } = useDemoStore()
	const { visualizationType } = useDemoProductStore()

	const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
	const [error, setLocalError] = useState<string | null>(null)

	const personas = getAllPersonas()

	const handleSelectPersona = async (persona: PersonaProfile) => {
		if (!privyUserId) {
			setLocalError("No Privy user ID found. Please log in.")
			return
		}

		if (!visualizationType) {
			setLocalError("No platform selected. Please restart the wizard.")
			return
		}

		setSelectedPersona(persona.id)
		setIsLoading(true)
		setIsCreatingAccount(true)
		setError(null)
		setLocalError(null)

		try {
			// Validate context
			if (!productId) {
				throw new Error("No product ID configured. Please select a product first.")
			}

			console.log("[PersonaSelectionStep] 🔍 DEBUG: API key check:", {
				hasApiKey: hasApiKey(),
				clientId,
				productId,
				environment,
				clientContextApiKey: useClientContextStore.getState().apiKey,
			})

			if (!hasApiKey()) {
				throw new Error("No API key configured.")
			}

			if (!clientId) {
				throw new Error("No client ID found. Please check product configuration.")
			}

			// Generate Static Key with environment (4-part format)
			const clientUserId = generateDemoClientUserId(privyUserId, visualizationType, persona.id, environment)

			console.log(`[PersonaSelectionStep] 🔑 Generated Static Key (v6):`, {
				clientUserId,
				privyUserId,
				visualizationType,
				persona: persona.id,
				environment,
			})

			// Check if user exists with this Static Key
			console.log(`[PersonaSelectionStep] 🔄 Checking for existing user with Static Key...`)
			let existingUser = await getUserByClientUserId(clientId, clientUserId)

			// Create user ONLY if doesn't exist
			if (!existingUser) {
				console.log(`[PersonaSelectionStep] 🆕 User not found, creating new user...`)

				const createResponse = await createUser(productId, {
					clientUserId: clientUserId, // Use Static Key as clientUserId
					email: persona.email,
					status: "pending_onboarding",
				})

				console.log(`[PersonaSelectionStep] ✅ New user created:`, createResponse)

				// Fetch the created user to get full details
				existingUser = await getUserByClientUserId(clientId, clientUserId)

				if (!existingUser) {
					throw new Error("Failed to verify user creation")
				}
			} else {
				console.log(`[PersonaSelectionStep] ✅ Existing user found:`, {
					userId: existingUser.id,
					status: existingUser.status,
					clientUserId: existingUser.clientUserId,
					environment,
				})
			}

			// Set persona AND user data atomically in demoStore
			console.log(`[PersonaSelectionStep] 💾 Setting persona and user data in store...`)
			setPersonaWithUser(privyUserId, persona.id, visualizationType, existingUser.id, existingUser.clientUserId)

			// Handle based on user status
			if (existingUser.status === "pending_onboarding") {
				// User needs to complete onboarding
				console.log(`[PersonaSelectionStep] ➡️ User needs onboarding, navigating...`, {
					userId: existingUser.id,
					clientId,
					productId,
					clientUserId: existingUser.clientUserId,
				})
				navigate({
					to: "/onboarding/$clientUserId",
					params: { clientUserId: existingUser.clientUserId },
					search: {
						userId: existingUser.id,
						clientId: clientId,
						productId: productId,
						returnPath: window.location.pathname,
					},
				})
			} else if (existingUser.status === "active") {
				// User already completed onboarding
				console.log(`[PersonaSelectionStep] ✅ User is already active, activating earn account...`)
				useDemoStore.getState().activateEarnAccount()
				onComplete()
			} else {
				throw new Error(`Invalid user status: ${existingUser.status}`)
			}
		} catch (err) {
			console.error(`[PersonaSelectionStep] ❌ Failed to handle persona selection:`, err)
			const errorMessage = err instanceof Error ? err.message : "Failed to select persona. Please try again."
			setError(errorMessage)
			setLocalError(errorMessage)
			setSelectedPersona(null)
		} finally {
			setIsLoading(false)
			setIsCreatingAccount(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="text-center mb-6">
				<h3 className="text-lg font-semibold text-gray-900">Choose Your Demo Persona</h3>
				<p className="text-sm text-gray-500 mt-1">
					Select a persona to experience the demo as an end-user in <strong>{environment}</strong> environment
				</p>
			</div>

			{/* Environment Info */}
			<div className="flex items-center justify-center gap-3 mb-4">
				<Badge variant={environment === "sandbox" ? "default" : "secondary"} className="text-sm px-4 py-1">
					{environment === "sandbox" ? "🧪" : "🚀"} {environment?.toUpperCase() || "UNKNOWN"}
				</Badge>
				<Badge variant="outline" className="text-sm px-4 py-1">
					{visualizationType?.toUpperCase().replace("-", " ") || "UNKNOWN"}
				</Badge>
			</div>

			{/* Error Alert */}
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Persona Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{personas.map((persona) => {
					const isSelected = selectedPersona === persona.id
					const isThisLoading = isSelected && isLoading

					return (
						<Card
							key={persona.id}
							className={`cursor-pointer transition-all ${
								isSelected ? "border-accent border-2 shadow-md" : "border-gray-200 hover:border-accent/50"
							}`}
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										<span className="text-4xl">{persona.avatar}</span>
										<div>
											<CardTitle className="text-lg">{persona.name}</CardTitle>
											<CardDescription className="text-xs mt-1">{persona.email}</CardDescription>
										</div>
									</div>
									{isSelected && !isThisLoading && (
										<Check className="w-5 h-5 text-accent" />
									)}
								</div>
							</CardHeader>

							<CardContent className="space-y-3">
								<p className="text-sm text-gray-600">{persona.description}</p>

								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">Risk Profile:</span>
										<Badge variant="outline" className="capitalize">
											{persona.riskProfile}
										</Badge>
									</div>
								</div>

								<Button
									onClick={() => handleSelectPersona(persona)}
									disabled={isLoading}
									variant={isSelected ? "default" : "outline"}
									className="w-full mt-4"
								>
									{isThisLoading ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Creating Account...
										</>
									) : isSelected ? (
										"Selected"
									) : (
										"Select Persona"
									)}
								</Button>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{/* Info */}
			<div className="mt-6 p-4 bg-blue-50 rounded-lg">
				<p className="text-sm text-blue-900">
					<strong>💡 How it works:</strong> Each persona has a unique account in the selected environment. Your
					data is isolated from other environments and platforms.
				</p>
			</div>
		</div>
	)
}
