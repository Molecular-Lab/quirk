/**
 * PersonaSelector Component
 *
 * Displays persona selection (Bob/Alice) and handles demo user creation.
 * This component is shown when entering a demo app (/demo/{type}) before
 * the user has selected a persona.
 *
 * Static Key Format: {privyUserId}:{visualizationType}:{persona}
 * Example: did:privy:abc123:gig-workers:bob
 *
 * Flow:
 * 1. Show persona cards (Bob: conservative, Alice: aggressive)
 * 2. User clicks "Start Demo as {name}"
 * 3. Generate Static Key and call createUser API with it as clientUserId (status: "pending_onboarding")
 * 4. Update demoStore: setPersona → setEndUser (do NOT activate - user needs onboarding first)
 * 5. Hide this component and show the demo UI
 * 6. Demo app detects pending_onboarding status and redirects to /onboarding
 * 7. After onboarding completes, demo app calls activateEarnAccount()
 */

import { useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Check, Loader2 } from "lucide-react"

import { createUser } from "@/api/b2bClientHelpers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	type PersonaType,
	type VisualizationType,
	getAllPersonas,
	generateDemoClientUserId,
} from "@/feature/demo/personas"
import { useDemoProductStore } from "@/store/demoProductStore"
import { useDemoStore } from "@/store/demoStore"

interface PersonaSelectorProps {
	visualizationType: VisualizationType
	onDemoStarted?: () => void // Callback when demo is ready
}

export function PersonaSelector({ visualizationType, onDemoStarted }: PersonaSelectorProps) {
	const navigate = useNavigate()
	const { user } = usePrivy()
	const privyUserId = user?.id

	// Get product info from demoProductStore
	const { selectedProductId, selectedProduct } = useDemoProductStore()

	// Get demoStore state
	const { selectedEnvironment, setEndUser, setPersona } = useDemoStore()

	// Local state
	const [selectedPersona, setSelectedPersonaLocal] = useState<PersonaType | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const personas = getAllPersonas()

	const handleStartDemo = async (personaId: PersonaType) => {
		console.log("[PersonaSelector] 🚀 handleStartDemo() called:", {
			personaId,
			privyUserId,
			selectedProductId,
			visualizationType,
		})

		if (!privyUserId || !selectedProductId || !selectedProduct) {
			console.error("[PersonaSelector] ❌ Missing required context:", {
				hasPrivyUserId: !!privyUserId,
				hasSelectedProductId: !!selectedProductId,
				hasSelectedProduct: !!selectedProduct,
			})
			setError("Missing required context. Please go back and select a product.")
			return
		}

		setSelectedPersonaLocal(personaId)
		setIsLoading(true)
		setError(null)

		try {
			// Generate the new client_user_id format: {privy_id}:{type}:{persona}
			const clientUserId = generateDemoClientUserId(
				privyUserId,
				visualizationType,
				personaId
			)

			console.log("[PersonaSelector] 📋 Generated Static Key:", {
				privyUserId,
				productId: selectedProductId,
				clientId: selectedProduct.id,
				clientUserId,
				visualizationType,
				persona: personaId,
				environment: selectedEnvironment,
			})

			// Call API to create/get user with Static Key as clientUserId
			console.log("[PersonaSelector] 🔄 Calling createUser API...")
			const result = await createUser(selectedProduct.id, {
				clientUserId,
				status: "pending_onboarding",
			})

			console.log("[PersonaSelector] ✅ createUser API response:", result)

			// IMPORTANT: Order matters here!
			// 1. setPersona() FIRST - this resets old state (endUserId, hasEarnAccount, deposits)
			// 2. setEndUser() SECOND - sets the NEW endUserId for this session
			// 3. DO NOT call activateEarnAccount() - user needs to complete onboarding first!
			//    The demo app will check user status and redirect to onboarding if needed.

			// Step 1: Set persona (clears old state from previous demo session)
			console.log("[PersonaSelector] 🔄 Step 1: Calling setPersona()...")
			setPersona(privyUserId, personaId, visualizationType)

			// Step 2: Set the new end-user (persists after setPersona's reset)
			console.log("[PersonaSelector] 🔄 Step 2: Calling setEndUser()...")
			setEndUser({
				endUserId: result.id, // API returns 'id' not 'endUserId'
				endUserClientUserId: clientUserId,
			})

			// NOTE: We DO NOT call activateEarnAccount() here because:
			// - User was created with status "pending_onboarding"
			// - They need to complete onboarding flow first
			// - The demo app will detect pending_onboarding status and redirect to /onboarding
			// - After onboarding completes, the app will call activateEarnAccount()

			console.log("[PersonaSelector] ✅ Demo user created - ready for onboarding flow")

			// CRITICAL: Wait for Zustand to persist to localStorage before navigating
			// This ensures persona state is saved before any page navigation/reload
			await new Promise((resolve) => setTimeout(resolve, 300))

			// Notify parent that demo is ready
			if (onDemoStarted) {
				console.log("[PersonaSelector] 📢 Calling onDemoStarted() callback")
				onDemoStarted()
			}
		} catch (err) {
			console.error("[PersonaSelector] ❌ Failed to start demo:", err)
			setError(err instanceof Error ? err.message : "Failed to start demo. Please try again.")
			setSelectedPersonaLocal(null)
		} finally {
			setIsLoading(false)
		}
	}

	const handleBackToProducts = () => {
		navigate({ to: "/demo" })
	}

	// Get display info for the demo type
	const demoTypeDisplayName = {
		ecommerce: "E-commerce",
		creators: "Creators",
		"gig-workers": "Gig Workers",
	}[visualizationType]

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
			{/* Header */}
			<div className="max-w-4xl mx-auto px-6 pt-24 pb-8">
				{/* Back Button */}
				<button
					onClick={handleBackToProducts}
					className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					<span>Back to product selection</span>
				</button>

				{/* Title */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-950 mb-4">Choose your demo persona</h1>
					<p className="text-lg text-gray-600">
						Test the <span className="font-semibold">{demoTypeDisplayName}</span> demo with different user profiles
					</p>
					{selectedProduct && (
						<p className="text-sm text-gray-500 mt-2">
							Using product: <span className="font-medium">{selectedProduct.companyName}</span>
						</p>
					)}
				</div>

				{/* Environment Badge */}
				<div className="flex justify-center mb-8">
					{selectedEnvironment === "production" ? (
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-300">
							<span className="inline-flex h-2 w-2 rounded-full bg-orange-500" />
							Production Environment
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
							<span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
							Sandbox Environment
						</span>
					)}
				</div>
			</div>

			{/* Persona Cards */}
			<div className="max-w-3xl mx-auto px-6 pb-12">
				<div className="grid md:grid-cols-2 gap-6 mb-8">
					{personas.map((persona) => {
						const isSelected = selectedPersona === persona.id
						const isCurrentlyLoading = isLoading && isSelected

						return (
							<Card
								key={persona.id}
								className={`cursor-pointer transition-all hover:shadow-lg ${
									isSelected ? "border-gray-300 shadow-lg ring-1 ring-gray-200" : "hover:border-gray-300"
								} ${isLoading && !isSelected ? "opacity-50 pointer-events-none" : ""}`}
								onClick={() => !isLoading && handleStartDemo(persona.id)}
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<span className="text-5xl">{persona.avatar}</span>
											<div>
												<CardTitle className="text-2xl">{persona.name}</CardTitle>
												<p className="text-sm text-gray-600 mt-1">{persona.email}</p>
											</div>
										</div>
										{isSelected && (
											isCurrentlyLoading ? (
												<Loader2 className="w-6 h-6 text-accent animate-spin" />
											) : (
												<Check className="w-6 h-6 text-accent" />
											)
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Starting Balance */}
										<div className="p-3 bg-gray-50 rounded-lg">
											<p className="text-xs text-gray-600 mb-1">Starting Balance</p>
											<p className="text-2xl font-bold text-gray-950">
												${persona.balance.toLocaleString()}
											</p>
										</div>

										{/* Risk Profile */}
										<div>
											<p className="text-xs text-gray-600 mb-1">Risk Profile</p>
											<p className="text-sm font-medium text-gray-900 capitalize">
												{persona.riskProfile}
											</p>
										</div>

										{/* Description */}
										<p className="text-sm text-gray-600">{persona.description}</p>

										{/* Start Button */}
										<Button
											className="w-full"
											variant={isSelected ? "default" : "outline"}
											disabled={isLoading}
											onClick={(e) => {
												e.stopPropagation()
												handleStartDemo(persona.id)
											}}
										>
											{isCurrentlyLoading ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Starting...
												</>
											) : (
												`Start Demo as ${persona.name}`
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>

				{/* Error Message */}
				{error && (
					<div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
						<p className="text-sm text-red-800">
							<strong>Error:</strong> {error}
						</p>
					</div>
				)}

				{/* Missing Context Warning */}
				{!selectedProductId && (
					<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
						<p className="text-sm text-amber-800">
							<strong>No product selected.</strong> Please go back and select a product first.
						</p>
						<Button
							variant="outline"
							className="mt-3"
							onClick={handleBackToProducts}
						>
							Go to Product Selection
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
