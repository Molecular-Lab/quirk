/**
 * Persona Selection Modal
 * Step 2 of 2-step demo initialization
 *
 * Shows after product is selected
 * Cannot be dismissed - user must select a persona to continue
 */

import { useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Check, Loader2 } from "lucide-react"

import { createUser, getUserByClientUserId } from "@/api/b2bClientHelpers"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
	type PersonaProfile,
	type VisualizationType,
	generateDemoClientUserId,
	getAllPersonas,
} from "@/feature/demo/personas"
import { useClientContextStore } from "@/store/clientContextStore"
import { useDemoStore } from "@/store/demoStore"

interface PersonaSelectionModalProps {
	open: boolean
	visualizationType: VisualizationType
	onPersonaSelected: () => void
	onStartOnboarding: (userId: string, clientUserId: string) => void
}

export function PersonaSelectionModal({
	open,
	visualizationType,
	onPersonaSelected,
	onStartOnboarding,
}: PersonaSelectionModalProps) {
	const { user } = usePrivy()
	const privyUserId = user?.id || ""

	const { productId, clientId, hasApiKey } = useClientContextStore()
	const { setPersonaWithUser, setIsCreatingAccount, setError, selectedEnvironment } = useDemoStore()

	const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)

	const personas = getAllPersonas()

	const handleSelectPersona = async (persona: PersonaProfile) => {
		if (!privyUserId) {
			console.error("[PersonaSelectionModal] No Privy user ID")
			return
		}

		setSelectedPersona(persona.id)
		setIsCreating(true)
		setIsCreatingAccount(true)
		setError(null)

		try {
			// Validate context
			if (!productId) {
				throw new Error("No product ID configured. Please select a product first.")
			}

			if (!hasApiKey()) {
				throw new Error("No API key configured.")
			}

			if (!clientId) {
				throw new Error("No client ID found. Please check product configuration.")
			}

			// Generate Static Key for this persona
			const clientUserId = generateDemoClientUserId(privyUserId, visualizationType, persona.id, selectedEnvironment || "sandbox")

			console.log(`[PersonaSelectionModal] 🔑 Generated Static Key:`, clientUserId)

			// ✅ STEP 1: Check if user exists with this Static Key
			console.log(`[PersonaSelectionModal] 🔄 Checking for existing user with Static Key...`)
			let existingUser = await getUserByClientUserId(clientId, clientUserId)

			// ✅ STEP 2: Create user ONLY if doesn't exist
			if (!existingUser) {
				console.log(`[PersonaSelectionModal] 🆕 User not found, creating new user...`)

				const createResponse = await createUser(productId, {
					clientUserId: clientUserId, // Use Static Key as clientUserId
					email: persona.email,
					status: "pending_onboarding",
				})

				console.log(`[PersonaSelectionModal] ✅ New user created:`, createResponse)

				// Fetch the created user to get full details
				existingUser = await getUserByClientUserId(clientId, clientUserId)

				if (!existingUser) {
					throw new Error("Failed to verify user creation")
				}
			} else {
				console.log(`[PersonaSelectionModal] ✅ Existing user found:`, {
					userId: existingUser.id,
					status: existingUser.status,
					clientUserId: existingUser.clientUserId,
				})
			}

			// ✅ STEP 3: Set persona AND user data atomically in demoStore
			console.log(`[PersonaSelectionModal] 💾 Setting persona and user data in store...`)
			setPersonaWithUser(privyUserId, persona.id, visualizationType, existingUser.id, existingUser.clientUserId)

			// ✅ STEP 4: Handle based on user status
			if (existingUser.status === "pending_onboarding") {
				// User needs to complete onboarding
				console.log(`[PersonaSelectionModal] ➡️ User needs onboarding`)
				onStartOnboarding(existingUser.id, existingUser.clientUserId)
			} else if (existingUser.status === "active") {
				// User already completed onboarding
				console.log(`[PersonaSelectionModal] ✅ User is already active, activating earn account...`)
				useDemoStore.getState().activateEarnAccount()
				onPersonaSelected()
			} else {
				throw new Error(`Invalid user status: ${existingUser.status}`)
			}
		} catch (err) {
			console.error(`[PersonaSelectionModal] ❌ Failed to handle persona selection:`, err)
			setError(err instanceof Error ? err.message : "Failed to select persona. Please try again.")
			setSelectedPersona(null)
		} finally {
			setIsCreating(false)
			setIsCreatingAccount(false)
		}
	}

	return (
		<Dialog open={open}>
			<DialogContent className="max-w-2xl" hideClose>
				<DialogHeader>
					<DialogTitle className="text-xl">Choose Your Demo Persona</DialogTitle>
					<DialogDescription>
						Select a persona to experience the demo as an end-user. Each persona has unique characteristics and
						behavior.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
					{personas.map((persona) => {
						const isSelected = selectedPersona === persona.id
						const isLoading = isSelected && isCreating

						return (
							<button
								key={persona.id}
								onClick={() => handleSelectPersona(persona)}
								disabled={isCreating}
								className={`relative p-6 rounded-xl border-2 text-left transition-all ${
									isSelected
										? "border-blue-500 bg-blue-50"
										: "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
								} ${isCreating ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								{/* Avatar */}
								<div className="text-5xl mb-4">{persona.avatar}</div>

								{/* Name & Risk Profile */}
								<div className="mb-3">
									<div className="flex items-center gap-2 mb-1">
										<h3 className="text-xl font-bold text-gray-900">{persona.name}</h3>
										{isSelected && !isLoading && (
											<Check className="w-5 h-5 text-blue-500" />
										)}
										{isLoading && (
											<Loader2 className="w-5 h-5 animate-spin text-blue-500" />
										)}
									</div>
									<p className="text-sm text-gray-600">{persona.email}</p>
								</div>

								{/* Description */}
								<p className="text-sm text-gray-700 mb-3">{persona.description}</p>

								{/* Risk Profile Badge */}
								<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
									<span className={`w-2 h-2 rounded-full ${
										persona.riskProfile === "conservative" ? "bg-green-500" :
										persona.riskProfile === "moderate" ? "bg-yellow-500" :
										"bg-red-500"
									}`}></span>
									{persona.riskProfile.charAt(0).toUpperCase() + persona.riskProfile.slice(1)} Risk
								</div>

								{/* Starting Balance */}
								<div className="mt-4 pt-4 border-t border-gray-200">
									<p className="text-xs text-gray-500">Starting Balance</p>
									<p className="text-lg font-bold text-gray-900">
										${persona.balance.toLocaleString()}
									</p>
								</div>

								{/* Loading Overlay */}
								{isLoading && (
									<div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
										<div className="text-center">
											<Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
											<p className="text-sm text-gray-600">Setting up account...</p>
										</div>
									</div>
								)}
							</button>
						)
					})}
				</div>

				{/* Info Footer */}
				<div className="mt-4 p-4 bg-blue-50 rounded-lg">
					<p className="text-sm text-blue-900">
						💡 <strong>Tip:</strong> You can switch personas anytime by returning to the demo selector.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	)
}
