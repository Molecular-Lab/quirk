/**
 * Product Selector Component (Sheet UI)
 * Alternative to the Select dropdown in DemoSelectorPage
 *
 * Flow:
 * 1. Fetch products by PrivyID when component mounts
 * 2. Display products in Sheet UI
 * 3. User selects a product
 * 4. Update demoProductStore (which syncs to clientContextStore)
 */

import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Building2, ChevronRight, Loader2, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { InfoDialog } from "@/components/ui/info-dialog"
import { useDemoProductStore } from "@/store/demoProductStore"

export function ProductSelector() {
	const { user } = usePrivy()
	const privyOrganizationId = user?.id || null

	const [isOpen, setIsOpen] = useState(false)
	const [loadingProductId, setLoadingProductId] = useState<string | null>(null)
	const [apiKeyErrorDialog, setApiKeyErrorDialog] = useState<{
		open: boolean
		productName: string
	}>({ open: false, productName: "" })
	const [errorDialog, setErrorDialog] = useState<{
		open: boolean
		message: string
	}>({ open: false, message: "" })

	const {
		availableProducts,
		isLoadingProducts,
		loadError,
		selectedProduct,
		loadProductsByPrivyId,
		selectProduct,
		hasSelectedProduct,
	} = useDemoProductStore()

	// Fetch products when sheet opens
	useEffect(() => {
		if (isOpen && availableProducts.length === 0 && privyOrganizationId) {
			loadProducts()
		}
	}, [isOpen, privyOrganizationId])

	const loadProducts = async () => {
		if (!privyOrganizationId) {
			return
		}

		console.log("[ProductSelector] Loading products for privyOrgId:", privyOrganizationId)
		await loadProductsByPrivyId(privyOrganizationId)
	}

	const handleSelectProduct = async (productId: string) => {
		console.log("[ProductSelector] Selecting product:", productId)
		setLoadingProductId(productId)

		try {
			// Check if API key exists in store (should be loaded from localStorage already)
			const apiKey = useDemoProductStore.getState().getApiKey(productId)

			if (!apiKey) {
				const product = availableProducts.find((p) => p.productId === productId)
				setApiKeyErrorDialog({
					open: true,
					productName: product?.companyName || productId,
				})
				setLoadingProductId(null)
				return
			}

			// Select product (this will sync to clientContextStore)
			selectProduct(productId)

			console.log("[ProductSelector] ✅ Product selected")

			// Close sheet
			setIsOpen(false)
		} catch (error) {
			console.error("[ProductSelector] Failed to select product:", error)
			setErrorDialog({
				open: true,
				message: "Failed to select product. Please try again.",
			})
		} finally {
			setLoadingProductId(null)
		}
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant={hasSelectedProduct() ? "outline" : "default"} size="lg" className="gap-2">
					{hasSelectedProduct() ? (
						<>
							<Package className="w-4 h-4" />
							Demo as: {selectedProduct?.companyName}
						</>
					) : (
						<>
							<Package className="w-4 h-4" />
							Select Product to Demo
						</>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Package className="w-5 h-5" />
						Select Product to Demo
					</SheetTitle>
					<SheetDescription>
						Choose which product you want to demo. You'll interact with it as an end-user.
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-4">
					{/* Loading State */}
					{isLoadingProducts && (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
						</div>
					)}

					{/* Error State */}
					{loadError && (
						<div className="rounded-lg bg-red-50 border border-red-200 p-4">
							<p className="text-sm text-red-800">Error: {loadError}</p>
							<Button onClick={loadProducts} variant="outline" size="sm" className="mt-2">
								Retry
							</Button>
						</div>
					)}

					{/* Empty State */}
					{!isLoadingProducts && !loadError && availableProducts.length === 0 && (
						<div className="text-center py-12">
							<Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
							<p className="text-sm text-gray-600 mb-4">
								You haven't created any products yet. Go to Dashboard to register your first product.
							</p>
							<Button onClick={() => (window.location.href = "/dashboard/onboarding")} variant="default">
								Create Product
							</Button>
						</div>
					)}

					{/* Products List */}
					{!isLoadingProducts && availableProducts.length > 0 && (
						<div className="space-y-3">
							{availableProducts.map((product) => {
								const isSelected = selectedProduct?.productId === product.productId
								const isLoading = loadingProductId === product.productId

								return (
									<button
										key={product.id}
										onClick={() => handleSelectProduct(product.productId)}
										disabled={isLoading || !product.isActive}
										className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
											isSelected
												? "border-blue-500 bg-blue-50"
												: product.isActive
													? "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
													: "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
										}`}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												{/* Company Name */}
												<div className="flex items-center gap-2 mb-1">
													<h4 className="font-semibold text-gray-900">{product.companyName}</h4>
													{isSelected && (
														<span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded">
															SELECTED
														</span>
													)}
													{!product.isActive && (
														<span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
															INACTIVE
														</span>
													)}
													{product.isSandbox && (
														<span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
															SANDBOX
														</span>
													)}
												</div>

												{/* Business Type */}
												<p className="text-sm text-gray-600 mb-2">{product.businessType}</p>

												{/* Product ID */}
												<div className="flex items-center gap-2 text-xs text-gray-500">
													<code className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">
														{product.productId}
													</code>
													{product.apiKeyPrefix && (
														<span className="text-xs text-gray-400">
															Key: {product.apiKeyPrefix}***
														</span>
													)}
												</div>

												{/* Description */}
												{product.description && (
													<p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
												)}
											</div>

											{/* Action Icon */}
											<div className="ml-4">
												{isLoading ? (
													<Loader2 className="w-5 h-5 animate-spin text-blue-500" />
												) : (
													<ChevronRight
														className={`w-5 h-5 ${isSelected ? "text-blue-500" : "text-gray-400"}`}
													/>
												)}
											</div>
										</div>
									</button>
								)
							})}
						</div>
					)}

					{/* Refresh Button */}
					{!isLoadingProducts && availableProducts.length > 0 && (
						<div className="pt-4 border-t">
							<Button onClick={loadProducts} variant="outline" size="sm" className="w-full">
								Refresh Products
							</Button>
						</div>
					)}
				</div>
			</SheetContent>

			{/* API Key Error Dialog */}
			<InfoDialog
				open={apiKeyErrorDialog.open}
				onOpenChange={(open) => setApiKeyErrorDialog({ open, productName: "" })}
				title="⚠️ API Key Not Found"
				description={`API key not found for ${apiKeyErrorDialog.productName}.\n\nPlease go to Dashboard → API Testing to regenerate your API key first.`}
			/>

			{/* Generic Error Dialog */}
			<InfoDialog
				open={errorDialog.open}
				onOpenChange={(open) => setErrorDialog({ open, message: "" })}
				title="Error"
				description={errorDialog.message}
			/>
		</Sheet>
	)
}
