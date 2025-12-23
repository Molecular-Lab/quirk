import { useEffect, useState } from "react"

import { useNavigate } from "@tanstack/react-router"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoDialog } from "@/components/ui/info-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type PersonaType, getAllPersonas } from "@/feature/demo/personas"
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

export function DemoSelectorPage() {
	const navigate = useNavigate()
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
	const { selectedPersona, setPersona, hasPersona } = useDemoStore()

	const [step, setStep] = useState<1 | 2 | 3>(1)
	const [apiKeyErrorDialog, setApiKeyErrorDialog] = useState<{
		open: boolean
		productName: string
	}>({ open: false, productName: "" })
	const personas = getAllPersonas()

	// Load products from userStore on mount
	useEffect(() => {
		// Load organizations if not already loaded
		if (organizations.length === 0) {
			loadOrganizations()
		} else {
			// Load API keys from localStorage
			const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")

			console.log("[DemoSelectorPage] Loading products with API keys:", {
				organizationsCount: organizations.length,
				apiKeysCount: Object.keys(allKeys).length,
				availableKeys: Object.keys(allKeys),
			})

			// Load into demoProductStore with API keys
			loadProducts(organizations, allKeys)
		}
	}, [organizations, loadOrganizations, loadProducts])

	// Auto-advance to step 2 when visualization selected
	useEffect(() => {
		if (visualizationType && step === 1) {
			setStep(2)
		}
	}, [visualizationType, step])

	// Auto-advance to step 3 when product selected
	useEffect(() => {
		if (selectedProductId && step === 2) {
			setStep(3)
		}
	}, [selectedProductId, step])

	const handleVisualizationSelect = (demoId: VisualizationType) => {
		selectVisualization(demoId)
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
		setStep(3)
	}

	const handlePersonaSelect = (personaId: PersonaType) => {
		if (!selectedProduct || !visualizationType) return

		console.log("[DemoSelectorPage] Selecting persona:", personaId)
		setPersona(personaId, selectedProduct.companyName, visualizationType)
		console.log("[DemoSelectorPage] ✅ Persona selected")
	}

	const handleStartDemo = () => {
		if (!visualizationType || !selectedProductId) {
			return
		}

		// Double-check API key exists in demoProductStore before navigation
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

		const demo = demoOptions.find((d) => d.id === visualizationType)
		if (demo) {
			console.log("[DemoSelectorPage] Starting demo:", demo.path)
			navigate({ to: demo.path })
		}
	}

	// Check visualization, product, API key, AND persona all exist
	const canStartDemo = Boolean(
		visualizationType &&
			selectedProductId &&
			hasPersona() &&
			(() => {
				const { getApiKey } = useDemoProductStore.getState()
				return !!getApiKey(selectedProductId)
			})(),
	)

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-25 via-white to-white">
			{/* Navbar */}
			<LandingNavbar />

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
				{/* Step Indicator */}
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
							{selectedProductId ? <Check className="w-5 h-5" /> : "2"}
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
							Choose Persona
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
												{availableProducts.map((product) => (
													<SelectItem key={product.productId} value={product.productId}>
														<div className="flex flex-col">
															<span className="font-medium">{product.companyName}</span>
															<span className="text-xs text-gray-500">{product.productId}</span>
														</div>
													</SelectItem>
												))}
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

									{/* Action Buttons */}
									<div className="flex gap-3">
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => {
												setStep(1)
												selectVisualization(null as any)
											}}
										>
											Back to Platforms
										</Button>
										<Button
											className="flex-1"
											disabled={!selectedProductId}
											onClick={() => {
												setStep(3)
											}}
										>
											Next: Choose Persona
										</Button>
									</div>

									{/* No Products Warning */}
									{availableProducts.length === 0 && (
										<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
											<p className="text-sm text-yellow-800">
												<strong>No products found.</strong> Please create a product first from the dashboard.
											</p>
											<Button
												variant="link"
												className="mt-2 p-0 h-auto text-yellow-900"
												onClick={() => navigate({ to: "/onboarding/create-product" })}
											>
												Create Product →
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				)}

				{/* Step 3: Choose Persona */}
				{step === 3 && (
					<div>
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-gray-950 mb-4">Choose your demo persona</h1>
							<p className="text-lg text-gray-600">Test different user scenarios with pre-configured personas</p>
						</div>

						<div className="max-w-3xl mx-auto">
							<div className="grid md:grid-cols-2 gap-6 mb-8">
								{personas.map((persona) => (
									<Card
										key={persona.id}
										className={`cursor-pointer transition-all ${
											selectedPersona === persona.id ? "border-gray-200 shadow-lg ring-1 ring-gray-100" : ""
										}`}
										onClick={() => {
											handlePersonaSelect(persona.id)
										}}
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
												{selectedPersona === persona.id && <Check className="w-6 h-6 text-accent" />}
											</div>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												<div className="p-3 bg-gray-50 rounded-lg">
													<p className="text-xs text-gray-600 mb-1">Starting Balance</p>
													<p className="text-2xl font-bold text-gray-950">${persona.balance.toLocaleString()}</p>
												</div>
												<div>
													<p className="text-xs text-gray-600 mb-1">Risk Profile</p>
													<p className="text-sm font-medium text-gray-900 capitalize">{persona.riskProfile}</p>
												</div>
												<p className="text-sm text-gray-600">{persona.description}</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Action Buttons */}
							<Card>
								<CardContent className="pt-6">
									<div className="flex gap-3">
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => {
												setStep(2)
											}}
										>
											Back to Products
										</Button>
										<Button className="flex-1" disabled={!canStartDemo} onClick={handleStartDemo}>
											Start Demo
										</Button>
									</div>
								</CardContent>
							</Card>
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
				title="⚠️ API Key Not Found"
				description={`API key not found for ${apiKeyErrorDialog.productName}.\n\nPlease go to Dashboard → API Testing to view or regenerate your API key first.`}
			/>
		</div>
	)
}
