import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "@tanstack/react-router"
import { Check, Loader2 } from "lucide-react"

import { createUser } from "@/api/b2bClientHelpers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoDialog } from "@/components/ui/info-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type PersonaType, generateDemoClientUserId, getAllPersonas } from "@/feature/demo/personas"
import { LandingNavbar } from "@/feature/landing/LandingNavbar"
import { type VisualizationType, useDemoProductStore } from "@/store/demoProductStore"
import { useDemoStore } from "@/store/demoStore"
import { useUserStore } from "@/store/userStore"

interface DemoOption {
	id: VisualizationType
	title: string
	description: string
	icon: string
	features: string[]
	path: string
}

const demoOptions: DemoOption[] = [
	{
		id: "ecommerce",
		title: "E-commerce Platform",
		description: "Merchant earnings & idle cash management",
		icon: "🛍️",
		path: "/demo/ecommerce",
		features: ["Merchant balance tracking", "Pending payouts optimization", "Automatic yield generation"],
	},
	{
		id: "creators",
		title: "Creator Platform",
		description: "Revenue management for content creators",
		icon: "🎨",
		path: "/demo/creators",
		features: ["Creator revenue tracking", "Subscription earnings", "Yield on idle creator funds"],
	},
	{
		id: "gig-workers",
		title: "Gig Workers Platform",
		description: "Payouts & tips management for gig economy",
		icon: "🚗",
		path: "/demo/gig-workers",
		features: ["Pending payouts tracking", "Tips & bonuses management", "Instant yield on earnings"],
	},
]

/**
 * Demo Selector Page - 3 Step Flow
 *
 * Step 1: Select visualization type (ecommerce/creators/gig-workers)
 * Step 2: Select existing product (MUST have API key)
 * Step 3: Select persona (Bob/Alice) and create demo user
 *
 * After selection, navigates to /demo/{type} with everything set up.
 */
export function DemoSelectorPage() {
	const navigate = useNavigate()
	const { user } = usePrivy()
	const privyUserId = user?.id

	const { organizations, loadOrganizations } = useUserStore()
	const {
		availableProducts,
		selectedProductId,
		selectedProduct,
		visualizationType,
		loadProducts,
		selectProduct,
		selectVisualization,
	} = useDemoProductStore()
	const { selectedEnvironment, setEnvironment, setEndUser, setPersona } = useDemoStore()

	const [step, setStep] = useState<1 | 2 | 3>(1)
	const [selectedPersona, setSelectedPersonaLocal] = useState<PersonaType | null>(null)
	const [isCreatingDemo, setIsCreatingDemo] = useState(false)
	const [createError, setCreateError] = useState<string | null>(null)
	const [apiKeyErrorDialog, setApiKeyErrorDialog] = useState<{
		open: boolean
		productName: string
	}>({ open: false, productName: "" })

	// Load products from userStore on mount
	useEffect(() => {
		// Load organizations if not already loaded
		if (organizations.length === 0) {
			void loadOrganizations()
		} else {
			console.log("[DemoSelectorPage] 🔄 Loading products with API keys from localStorage")

			// ✅ Load API keys from localStorage (where Dashboard saves them)
			const apiKeysFromLocalStorage = useDemoProductStore.getState().loadApiKeysFromLocalStorage()

			// Load products with fresh API keys
			loadProducts(organizations, apiKeysFromLocalStorage)

			console.log("[DemoSelectorPage] ✅ Products loaded with API keys:", {
				totalProducts: organizations.length,
				productsWithKeys: Object.keys(apiKeysFromLocalStorage).length,
			})
		}
	}, [organizations, loadOrganizations, loadProducts])

	const handleVisualizationSelect = (demoId: VisualizationType) => {
		console.log("[DemoSelectorPage] Visualization selected:", demoId)
		selectVisualization(demoId)
		// Don't auto-advance to step 2 - let user click Continue button
	}

	const handleContinueToProducts = () => {
		if (!visualizationType) {
			return
		}
		setStep(2)
	}

	const handleProductSelect = (productId: string) => {
		console.log("[DemoSelectorPage] Selecting product:", productId)

		// Check if API key exists in demoProductStore
		const { getApiKey } = useDemoProductStore.getState()
		const apiKey = getApiKey(productId)

		if (!apiKey) {
			const product = availableProducts.find((p) => p.productId === productId)
			setApiKeyErrorDialog({
				open: true,
				productName: product?.companyName || productId,
			})
			return
		}

		// Select product (API key is already in store)
		selectProduct(productId)
		console.log("[DemoSelectorPage] ✅ Product selected with API key")
	}

	const handleContinueToPersona = () => {
		if (!visualizationType || !selectedProductId) {
			return
		}

		// Verify API key exists for selected product
		const { getApiKey } = useDemoProductStore.getState()
		const apiKey = getApiKey(selectedProductId)

		if (!apiKey) {
			const product = availableProducts.find((p) => p.productId === selectedProductId)
			setApiKeyErrorDialog({
				open: true,
				productName: product?.companyName || selectedProductId,
			})
			return
		}

		// Go to step 3 for persona selection
		setStep(3)
	}

	const handleStartDemo = async (personaId: PersonaType) => {
		console.log("[DemoSelectorPage] 🚀 handleStartDemo() called:", {
			personaId,
			privyUserId,
			selectedProductId,
			visualizationType,
		})

		if (!privyUserId || !selectedProductId || !selectedProduct || !visualizationType) {
			console.error("[DemoSelectorPage] ❌ Missing required context:", {
				hasPrivyUserId: !!privyUserId,
				hasSelectedProductId: !!selectedProductId,
				hasSelectedProduct: !!selectedProduct,
				hasVisualizationType: !!visualizationType,
			})
			setCreateError("Missing required context. Please go back and try again.")
			return
		}

		setSelectedPersonaLocal(personaId)
		setIsCreatingDemo(true)
		setCreateError(null)

		try {
			// Generate the client_user_id format: {privy_id}:{type}:{persona}
			const clientUserId = generateDemoClientUserId(privyUserId, visualizationType, personaId)

			console.log("[DemoSelectorPage] 📋 Generated Static Key:", {
				privyUserId,
				productId: selectedProductId,
				clientId: selectedProduct.id,
				clientUserId,
				visualizationType,
				persona: personaId,
				environment: selectedEnvironment,
			})

			// Call API to create/get user with Static Key as clientUserId
			console.log("[DemoSelectorPage] 🔄 Calling createUser API...")
			const result = await createUser(selectedProduct.id, {
				clientUserId,
				status: "pending_onboarding",
			})

			console.log("[DemoSelectorPage] ✅ createUser API response:", result)

			// IMPORTANT: Order matters here!
			// 1. setPersona() FIRST - this resets old state (endUserId, hasEarnAccount, deposits)
			// 2. setEndUser() SECOND - sets the NEW endUserId for this session
			// 3. DO NOT call activateEarnAccount() - user needs to complete onboarding first!
			//    The demo app will check user status and redirect to onboarding if needed.

			// Step 1: Set persona (clears old state from previous demo session)
			console.log("[DemoSelectorPage] 🔄 Step 1: Calling setPersona()...")
			setPersona(privyUserId, personaId, visualizationType)

			// Step 2: Set the new end-user (persists after setPersona's reset)
			console.log("[DemoSelectorPage] 🔄 Step 2: Calling setEndUser()...")
			setEndUser({
				endUserId: result.id, // API returns 'id' not 'endUserId'
				endUserClientUserId: clientUserId,
			})

			// NOTE: We DO NOT call activateEarnAccount() here because:
			// - User was created with status "pending_onboarding"
			// - They need to complete onboarding flow first
			// - The demo app will detect pending_onboarding status and redirect to /onboarding
			// - After onboarding completes, the app will call activateEarnAccount()

			console.log("[DemoSelectorPage] ✅ Demo user created - ready for onboarding flow")

			// Navigate to the demo page
			const demo = demoOptions.find((d) => d.id === visualizationType)
			if (demo) {
				console.log("[DemoSelectorPage] 🔀 Navigating to demo:", demo.path)
				navigate({ to: demo.path })
			}
		} catch (err) {
			console.error("[DemoSelectorPage] Failed to create demo:", err)
			setCreateError(err instanceof Error ? err.message : "Failed to start demo. Please try again.")
			setSelectedPersonaLocal(null)
		} finally {
			setIsCreatingDemo(false)
		}
	}

	// Products with API keys only
	const productsWithApiKeys = availableProducts.filter((p) => {
		const { getApiKey } = useDemoProductStore.getState()
		return !!getApiKey(p.productId)
	})

	const canContinue = Boolean(visualizationType && selectedProductId)

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-25 via-white to-white">
			{/* Navbar */}
			<LandingNavbar />

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
				{/* Step Indicator - 3 Steps */}
				<div className="flex items-center justify-center gap-4 mb-12">
					<div className="flex items-center gap-2">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full ${
								step >= 1 ? "bg-accent text-white" : "bg-gray-200 text-gray-500"
							}`}
						>
							{visualizationType ? <Check className="w-5 h-5" /> : "1"}
						</div>
						<span className={`text-sm font-medium ${step >= 1 ? "text-gray-950" : "text-gray-500"}`}>
							Choose Platform
						</span>
					</div>

					<div className="w-16 h-0.5 bg-gray-200" />

					<div className="flex items-center gap-2">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full ${
								step >= 2 ? "bg-accent text-white" : "bg-gray-200 text-gray-500"
							}`}
						>
							{selectedProductId && step >= 2 ? <Check className="w-5 h-5" /> : "2"}
						</div>
						<span className={`text-sm font-medium ${step >= 2 ? "text-gray-950" : "text-gray-500"}`}>
							Select Product
						</span>
					</div>

					<div className="w-16 h-0.5 bg-gray-200" />

					<div className="flex items-center gap-2">
						<div
							className={`flex items-center justify-center w-8 h-8 rounded-full ${
								step >= 3 ? "bg-accent text-white" : "bg-gray-200 text-gray-500"
							}`}
						>
							{selectedPersona ? <Check className="w-5 h-5" /> : "3"}
						</div>
						<span className={`text-sm font-medium ${step >= 3 ? "text-gray-950" : "text-gray-500"}`}>
							Select Persona
						</span>
					</div>
				</div>

				{/* Step 1: Choose Platform Visualization */}
				{step === 1 && (
					<div>
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-gray-950 mb-4">Where do you want to see Quirk embedded?</h1>
							<p className="text-lg text-gray-600">
								Choose a platform to see how your Quirk Earn product works in different contexts
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
							{demoOptions.map((demo) => (
								<Card
									key={demo.id}
									className={`cursor-pointer transition-all hover:shadow-xl hover:border-gray-300 ${
										visualizationType === demo.id ? "border-accent border-2 shadow-lg" : ""
									}`}
									onClick={() => {
										handleVisualizationSelect(demo.id)
									}}
								>
									<CardHeader>
										<div className="text-6xl mb-4 text-center">{demo.icon}</div>
										<CardTitle className="text-xl text-center">{demo.title}</CardTitle>
										<CardDescription className="text-center">{demo.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2 mb-6">
											{demo.features.map((feature, i) => (
												<li key={i} className="flex items-start gap-2 text-sm text-gray-600">
													<Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
													<span>{feature}</span>
												</li>
											))}
										</ul>
										<Button
											className="w-full"
											variant={visualizationType === demo.id ? "default" : "outline"}
											onClick={(e) => {
												e.stopPropagation()
												handleVisualizationSelect(demo.id)
											}}
										>
											{visualizationType === demo.id ? "Selected" : "Select Platform"}
										</Button>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Continue Button */}
						{visualizationType && (
							<div className="flex justify-center mt-8">
								<Button size="lg" onClick={handleContinueToProducts}>
									Continue to Product Selection
								</Button>
							</div>
						)}
					</div>
				)}

				{/* Step 2: Select Product */}
				{step === 2 && (
					<div>
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-gray-950 mb-4">Which product do you want to test?</h1>
							<p className="text-lg text-gray-600">
								Select one of your products to see how it works in{" "}
								<span className="font-semibold text-gray-950">
									{demoOptions.find((d) => d.id === visualizationType)?.title}
								</span>
							</p>
						</div>

						<div className="max-w-xl mx-auto">
							<Card>
								<CardHeader>
									<CardTitle>Product Selection</CardTitle>
									<CardDescription>
										Your demo will use the real API key and configuration from the selected product
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Product Selector */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">Choose Product</label>
										<Select value={selectedProductId ?? undefined} onValueChange={handleProductSelect}>
											<SelectTrigger>
												<SelectValue placeholder="Select a product..." />
											</SelectTrigger>
											<SelectContent>
												{availableProducts.map((product) => {
													const { getApiKey } = useDemoProductStore.getState()
													const hasApiKey = !!getApiKey(product.productId)
													return (
														<SelectItem key={product.productId} value={product.productId} disabled={!hasApiKey}>
															<div className="flex flex-col">
																<span className="font-medium">
																	{product.companyName}
																	{!hasApiKey && <span className="text-amber-600 ml-2">(No API Key)</span>}
																</span>
																<span className="text-xs text-gray-500">{product.productId}</span>
															</div>
														</SelectItem>
													)
												})}
											</SelectContent>
										</Select>
									</div>

									{/* Environment Selector */}
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">Environment</label>
										<Select
											value={selectedEnvironment}
											onValueChange={(value) => {
												setEnvironment(value as "sandbox" | "production")
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="sandbox">
													<div className="flex items-center gap-2">
														<span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
														<span>Sandbox</span>
													</div>
												</SelectItem>
												<SelectItem value="production">
													<div className="flex items-center gap-2">
														<span className="inline-flex h-2 w-2 rounded-full bg-orange-500" />
														<span>Production</span>
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Selected Product Info */}
									{selectedProductId && (
										<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
											<h4 className="text-sm font-semibold text-gray-950 mb-2">Selected Product</h4>
											{availableProducts
												.filter((p) => p.productId === selectedProductId)
												.map((product) => (
													<div key={product.productId} className="space-y-1 text-sm">
														<div className="flex justify-between">
															<span className="text-gray-600">Company:</span>
															<span className="font-medium text-gray-950">{product.companyName}</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-600">Product ID:</span>
															<span className="font-mono text-xs text-gray-700">{product.productId}</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-600">Type:</span>
															<span className="text-gray-700">{product.businessType}</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-600">Status:</span>
															<span className={`${product.isActive ? "text-green-600" : "text-gray-500"} font-medium`}>
																{product.isActive ? "Active" : "Inactive"}
															</span>
														</div>
													</div>
												))}
										</div>
									)}

									{/* No Products Warning */}
									{availableProducts.length === 0 && (
										<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
											<p className="text-sm text-amber-800">
												<strong>No products found.</strong> Please create a product in the Dashboard first, then
												generate an API key.
											</p>
											<Button
												variant="outline"
												className="mt-3"
												onClick={() => navigate({ to: "/dashboard/products" })}
											>
												Go to Dashboard
											</Button>
										</div>
									)}

									{/* No API Keys Warning */}
									{availableProducts.length > 0 && productsWithApiKeys.length === 0 && (
										<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
											<p className="text-sm text-amber-800">
												<strong>No products with API keys found.</strong> Please generate an API key for at least one
												product in the Dashboard → API Testing section.
											</p>
											<Button
												variant="outline"
												className="mt-3"
												onClick={() => navigate({ to: "/dashboard/products" })}
											>
												Go to Dashboard
											</Button>
										</div>
									)}

									{/* Action Buttons */}
									<div className="flex gap-3">
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => {
												setStep(1)
												// Keep visualization selected, just go back to step 1
											}}
										>
											Back to Platforms
										</Button>
										<Button className="flex-1" disabled={!canContinue} onClick={handleContinueToPersona}>
											Continue to Persona
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				)}

				{/* Step 3: Select Persona */}
				{step === 3 && (
					<div>
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-gray-950 mb-4">Choose your demo persona</h1>
							<p className="text-lg text-gray-600">
								Test the{" "}
								<span className="font-semibold text-gray-950">
									{demoOptions.find((d) => d.id === visualizationType)?.title}
								</span>{" "}
								demo with different user profiles
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

						{/* Not Signed In Warning */}
						{!privyUserId && (
							<div className="max-w-xl mx-auto mb-8">
								<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
									<p className="text-sm text-amber-800">
										<strong>Please sign in first.</strong> You need to be signed in to start a demo session.
									</p>
								</div>
							</div>
						)}

						{/* Persona Cards */}
						<div className="max-w-3xl mx-auto">
							<div className="grid md:grid-cols-2 gap-6 mb-8">
								{getAllPersonas().map((persona) => {
									const isSelected = selectedPersona === persona.id
									const isCurrentlyLoading = isCreatingDemo && isSelected

									return (
										<Card
											key={persona.id}
											className={`cursor-pointer transition-all hover:shadow-lg ${
												isSelected ? "border-gray-300 shadow-lg ring-1 ring-gray-200" : "hover:border-gray-300"
											} ${isCreatingDemo && !isSelected ? "opacity-50 pointer-events-none" : ""} ${!privyUserId ? "opacity-50 pointer-events-none" : ""}`}
											onClick={() => !isCreatingDemo && privyUserId && handleStartDemo(persona.id)}
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
													{isSelected &&
														(isCurrentlyLoading ? (
															<Loader2 className="w-6 h-6 text-accent animate-spin" />
														) : (
															<Check className="w-6 h-6 text-accent" />
														))}
												</div>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													{/* Starting Balance */}
													<div className="p-3 bg-gray-50 rounded-lg">
														<p className="text-xs text-gray-600 mb-1">Starting Balance</p>
														<p className="text-2xl font-bold text-gray-950">${persona.balance.toLocaleString()}</p>
													</div>

													{/* Risk Profile */}
													<div>
														<p className="text-xs text-gray-600 mb-1">Risk Profile</p>
														<p className="text-sm font-medium text-gray-900 capitalize">{persona.riskProfile}</p>
													</div>

													{/* Description */}
													<p className="text-sm text-gray-600">{persona.description}</p>

													{/* Start Button */}
													<Button
														className="w-full"
														variant={isSelected ? "default" : "outline"}
														disabled={isCreatingDemo || !privyUserId}
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
							{createError && (
								<div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
									<p className="text-sm text-red-800">
										<strong>Error:</strong> {createError}
									</p>
								</div>
							)}

							{/* Back Button */}
							<div className="flex justify-center">
								<Button
									variant="outline"
									onClick={() => {
										setStep(2)
										setSelectedPersonaLocal(null)
										setCreateError(null)
									}}
								>
									Back to Product Selection
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* API Key Error Dialog */}
			<InfoDialog
				open={apiKeyErrorDialog.open}
				onOpenChange={(open) => {
					setApiKeyErrorDialog({ open, productName: "" })
				}}
				title="API Key Not Found"
				description={`API key not found for ${apiKeyErrorDialog.productName}.\n\nPlease go to Dashboard → API Testing to view or regenerate your API key first.`}
			/>
		</div>
	)
}
