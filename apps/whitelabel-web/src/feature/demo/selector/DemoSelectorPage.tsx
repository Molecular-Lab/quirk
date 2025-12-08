import { useEffect, useState } from "react"

import { useNavigate } from "@tanstack/react-router"
import { Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type VisualizationType, useDemoProductStore } from "@/store/demoProductStore"
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
	const { availableProducts, selectedProductId, visualizationType, loadProducts, selectProduct, selectVisualization } =
		useDemoProductStore()

	const [step, setStep] = useState<1 | 2>(1)

	// Load products from userStore on mount
	useEffect(() => {
		// Load organizations if not already loaded
		if (organizations.length === 0) {
			loadOrganizations()
		} else {
			// Load into demoProductStore
			loadProducts(organizations)
		}
	}, [organizations, loadOrganizations, loadProducts])

	// Auto-advance to step 2 when visualization selected
	useEffect(() => {
		if (visualizationType && step === 1) {
			setStep(2)
		}
	}, [visualizationType, step])

	const handleVisualizationSelect = (demoId: VisualizationType) => {
		selectVisualization(demoId)
		setStep(2)
	}

	const handleProductSelect = (productId: string) => {
		selectProduct(productId)
	}

	const handleStartDemo = () => {
		if (!visualizationType || !selectedProductId) {
			return
		}

		const demo = demoOptions.find((d) => d.id === visualizationType)
		if (demo) {
			navigate({ to: demo.path })
		}
	}

	const canStartDemo = visualizationType && selectedProductId

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-25 via-white to-white">
			{/* Header */}
			<header className="max-w-7xl mx-auto px-6 py-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Sparkles className="size-6 text-accent" />
						<span className="text-xl font-bold text-gray-950">Quirk Demo</span>
					</div>
					<Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
						Back to Dashboard
					</Button>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-6 pb-12">
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
										<Button className="flex-1" disabled={!canStartDemo} onClick={handleStartDemo}>
											Start Demo
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
			</div>
		</div>
	)
}
