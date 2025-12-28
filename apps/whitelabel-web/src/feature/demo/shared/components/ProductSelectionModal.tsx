/**
 * Product Selection Modal
 * Step 1 of 2-step demo initialization
 *
 * Shows when user navigates to /demo/{platform} without a product selected
 * Cannot be dismissed - user must select a product to continue
 */

import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Building2, ChevronRight, Loader2, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InfoDialog } from "@/components/ui/info-dialog"
import { useDemoProductStore } from "@/store/demoProductStore"

interface ProductSelectionModalProps {
	open: boolean
	onProductSelected: () => void
}

export function ProductSelectionModal({ open, onProductSelected }: ProductSelectionModalProps) {
	const { user } = usePrivy()
	const privyOrganizationId = user?.id ?? null

	const [loadingProductId, setLoadingProductId] = useState<string | null>(null)
	const [apiKeyErrorDialog, setApiKeyErrorDialog] = useState<{
		open: boolean
		productName: string
	}>({ open: false, productName: "" })

	const { availableProducts, isLoadingProducts, loadError, selectedProduct, loadProductsByPrivyId, selectProduct } =
		useDemoProductStore()

	// Fetch products when modal opens
	useEffect(() => {
		if (open && availableProducts.length === 0 && privyOrganizationId) {
			void loadProducts()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, privyOrganizationId])

	const loadProducts = async () => {
		if (!privyOrganizationId) {
			return
		}

		// eslint-disable-next-line no-console
		console.log("[ProductSelectionModal] Loading products for privyOrgId:", privyOrganizationId)
		await loadProductsByPrivyId(privyOrganizationId)
	}

	const handleSelectProduct = async (productId: string) => {
		// eslint-disable-next-line no-console
		console.log("[ProductSelectionModal] Selecting product:", productId)
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

			console.log("[ProductSelectionModal] ✅ Product selected, proceeding to persona selection")

			// Notify parent that product was selected
			onProductSelected()
		} catch (error) {
			console.error("[ProductSelectionModal] Failed to select product:", error)
		} finally {
			setLoadingProductId(null)
		}
	}

	return (
		<>
			{/* Main Dialog - Cannot be dismissed (no onOpenChange) */}
			<Dialog open={open}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" hideClose>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-xl">
							<Package className="w-6 h-6" />
							Select Product to Demo
						</DialogTitle>
						<DialogDescription>
							Choose which product you want to demo. You'll interact with it as an end-user.
						</DialogDescription>
					</DialogHeader>

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
													</div>

													{/* Business Type */}
													<p className="text-sm text-gray-600 mb-2">{product.businessType}</p>

													{/* Product ID */}
													<div className="flex items-center gap-2 text-xs text-gray-500">
														<code className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">
															{product.productId}
														</code>
														{product.apiKeyPrefix && (
															<span className="text-xs text-gray-400">Key: {product.apiKeyPrefix}***</span>
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
														<ChevronRight className={`w-5 h-5 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
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
				</DialogContent>
			</Dialog>

			{/* API Key Error Dialog */}
			<InfoDialog
				open={apiKeyErrorDialog.open}
				onOpenChange={(open) => setApiKeyErrorDialog({ open, productName: "" })}
				title="⚠️ API Key Not Found"
				description={`API key not found for ${apiKeyErrorDialog.productName}.\n\nPlease go to Dashboard → API Testing to regenerate your API key first.`}
			/>
		</>
	)
}
