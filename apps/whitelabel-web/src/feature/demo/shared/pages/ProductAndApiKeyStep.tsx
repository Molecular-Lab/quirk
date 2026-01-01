/**
 * ProductAndApiKeyStep Component (Unified Step 1)
 *
 * Combines Environment Selection + Product Selection + API Key Management
 * All state is set in one place, preventing sync issues
 */

import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Building2, CheckCircle2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useDemoProductStore } from "@/store/demoProductStore"

export interface ProductAndApiKeyStepProps {
	onComplete: (data: { productId: string; environment: "sandbox" | "production" }) => void
}

export function ProductAndApiKeyStep({ onComplete }: ProductAndApiKeyStepProps) {
	const { user } = usePrivy()
	const privyOrganizationId = user?.id ?? null

	const { availableProducts, isLoadingProducts, loadError, loadProductsByPrivyId, isProductReady } =
		useDemoProductStore()

	// Local state
	const [selectedEnvironment, setSelectedEnvironment] = useState<"sandbox" | "production">("sandbox")
	const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

	// Fetch products when component mounts
	useEffect(() => {
		if (availableProducts.length === 0 && privyOrganizationId) {
			void loadProductsByPrivyId(privyOrganizationId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [privyOrganizationId])

	const selectedProduct = availableProducts.find((p) => p.productId === selectedProductId)
	const hasApiKey = selectedProductId ? isProductReady(selectedProductId, selectedEnvironment) : false

	const handleRefresh = async () => {
		if (!privyOrganizationId) return
		await loadProductsByPrivyId(privyOrganizationId)
	}

	const canProceed = selectedProductId && hasApiKey

	const handleNext = () => {
		if (!selectedProductId || !selectedEnvironment) return


		onComplete({
			productId: selectedProductId,
			environment: selectedEnvironment,
		})
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900">Configure Demo</h3>
				<p className="text-sm text-gray-500 mt-1">Select environment, product, and configure API key</p>
			</div>

			{/* Environment Toggle */}
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">Environment</label>
				<div className="grid grid-cols-2 gap-3">
					<button
						onClick={() => {
							setSelectedEnvironment("sandbox")
						}}
						className={cn(
							"p-4 rounded-lg border transition-all text-left hover:shadow-lg cursor-pointer",
							selectedEnvironment === "sandbox" ? "border-gray-500 bg-accent/5 shadow-lg" : "border-gray-200",
						)}
					>
						<div className="text-2xl mb-2">🧪</div>
						<div className="font-semibold text-gray-900">Sandbox</div>
						<div className="text-xs text-gray-500 mt-1">Safe testing environment</div>
					</button>

					<button
						onClick={() => {
							setSelectedEnvironment("production")
						}}
						className={cn(
							"p-4 rounded-lg border transition-all text-left hover:shadow-lg cursor-pointer",
							selectedEnvironment === "production" ? "border-gray-500 bg-accent/5 shadow-lg" : "border-gray-200",
						)}
					>
						<div className="text-2xl mb-2">🚀</div>
						<div className="font-semibold text-gray-900">Production</div>
						<div className="text-xs text-gray-500 mt-1">Live environment</div>
					</button>
				</div>
			</div>

			{/* Product Selection */}
			<div className="space-y-2">
				<label className="block text-sm font-medium text-gray-700">Product</label>

				{/* Loading State */}
				{isLoadingProducts && (
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<Skeleton key={i} className="h-20 w-full" />
						))}
					</div>
				)}

				{/* Error State */}
				{loadError && (
					<Alert variant="destructive">
						<AlertDescription>
							<p className="font-medium">Failed to load products</p>
							<p className="text-sm mt-1">{loadError}</p>
							<Button onClick={handleRefresh} variant="outline" size="sm" className="mt-3">
								Retry
							</Button>
						</AlertDescription>
					</Alert>
				)}

				{/* Empty State */}
				{!isLoadingProducts && !loadError && availableProducts.length === 0 && (
					<div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
						<Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
						<h4 className="text-sm font-semibold text-gray-900 mb-1">No Products Found</h4>
						<p className="text-xs text-gray-600 mb-3">Create your first product in the Dashboard</p>
						<Button onClick={() => (window.location.href = "/dashboard/onboarding")} size="sm">
							Create Product
						</Button>
					</div>
				)}

				{/* Products List */}
				{!isLoadingProducts && availableProducts.length > 0 && (
					<div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
						{availableProducts.map((product) => {
							const isSelected = selectedProductId === product.productId
							const productHasKey = isProductReady(product.productId, selectedEnvironment)

							return (
								<button
									key={product.id}
									onClick={() => {
										setSelectedProductId(product.productId)
									}}
									disabled={!product.isActive}
									className={cn(
										"w-full text-left p-3 rounded-lg border transition-all",
										isSelected && "border-accent bg-accent/5",
										!isSelected && product.isActive && "border-gray-200 hover:border-accent/30 hover:bg-gray-50",
										!product.isActive && "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed",
									)}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-semibold text-sm text-gray-900 truncate">{product.companyName}</h4>
												{isSelected && (
													<Badge variant="default" className="text-xs">
														SELECTED
													</Badge>
												)}
											</div>
											<code className="text-xs text-gray-500 font-mono">{product.productId}</code>
										</div>

										{productHasKey && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />}
									</div>
								</button>
							)
						})}
					</div>
				)}
			</div>

			{/* API Key Auto-Configuration Status */}
			{selectedProduct && (
				<div className="p-4 bg-green-50 rounded-lg border border-green-200">
					<div className="flex items-center gap-2 text-green-700">
						<CheckCircle2 className="w-5 h-5 flex-shrink-0" />
						<div>
							<p className="font-medium text-sm">Demo API keys configured automatically</p>
							<p className="text-xs text-green-600 mt-1">
								Environment:{" "}
								<strong>{selectedEnvironment === "sandbox" ? "Sandbox (Test)" : "Production (Live)"}</strong>
							</p>
						</div>
					</div>
				</div>
			)}

			{/* API Key Not Generated - Redirect to Dashboard */}
			{selectedProduct && !hasApiKey && (
				<Alert className="bg-yellow-50 border-yellow-200">
					<AlertDescription>
						<div className="space-y-3">
							<p className="text-sm font-medium text-gray-900">API key not generated yet</p>
							<p className="text-xs text-gray-600">
								You need to generate an API key for this product in the dashboard before using the demo.
							</p>
							<Button
								onClick={() => {
									window.open(`/dashboard/products/${selectedProduct.productId}`, "_blank")
								}}
								variant="outline"
								size="sm"
								className="w-full"
							>
								Go to Dashboard to Generate Key
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Next Button */}
			<div className="pt-4 border-t">
				<Button onClick={handleNext} disabled={!canProceed} className="w-full" size="lg">
					Next: Choose Persona
				</Button>
			</div>
		</div>
	)
}
