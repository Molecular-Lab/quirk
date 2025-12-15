import { useState, useEffect } from "react"

import { Link, useNavigate } from "@tanstack/react-router"
import { Building2, Check, Copy, Key, Loader2, Plus, RefreshCw, Settings, X } from "lucide-react"
import { toast } from "sonner"

import { useProducts } from "@/hooks/useProducts"
import type { Organization } from "@/store/userStore"

export function ProductsListPage() {
	const { products, isLoading, error, loadProducts, isLoaded } = useProducts()
	const navigate = useNavigate()
	const [copiedId, setCopiedId] = useState<string | null>(null)
	const [apiKeys, setApiKeys] = useState<Record<string, string>>({})

	// Load API keys from localStorage
	useEffect(() => {
		const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
		setApiKeys(allKeys)
		console.log("[ProductsListPage] Loaded API keys from localStorage:", Object.keys(allKeys))
	}, [products]) // Reload when products change

	const handleCopyToClipboard = (text: string, id: string, label: string) => {
		navigator.clipboard.writeText(text)
		setCopiedId(id)
		toast.success(`${label} copied!`)
		setTimeout(() => {
			setCopiedId(null)
		}, 2000)
	}

	const handleConfigureClick = (product: Organization) => {
		// Navigate to detail page (the route will handle setting it as active)
		void navigate({ to: `/dashboard/products/${product.productId}` })
	}

	const handleRefresh = async () => {
		await loadProducts()
		toast.success("Products refreshed")
	}

	if (isLoading && !isLoaded) {
		return (
			<div className="min-h-full bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
					<p className="text-gray-600">Loading products...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="min-h-full bg-gray-50 flex items-center justify-center">
				<div className="text-center max-w-md">
					<X className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Products</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={handleRefresh}
						className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-full bg-gray-50">
			<div className="max-w-4xl mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-8 flex items-start justify-between">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
						<p className="text-gray-600">Manage your Proxify products and configurations</p>
					</div>
					<button
						onClick={handleRefresh}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						Refresh
					</button>
				</div>

				{/* Products List */}
				{products.length === 0 ? (
					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
						<Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h2>
						<p className="text-gray-600 mb-6">Create your first product to start earning yield</p>
						<Link to="/onboarding/create-product">
							<button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
								<Plus className="w-5 h-5" />
								Create Product
							</button>
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{products.map((product) => {
							// ✅ Check BOTH database apiKeyPrefix AND localStorage
							const apiKeyFromLocalStorage = apiKeys[product.productId]
							const hasApiKey = !!product.apiKeyPrefix || !!apiKeyFromLocalStorage
							
							return (
								<div
									key={product.productId}
									className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
								>
									<div className="p-6">
										{/* Header Row */}
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
													<Building2 className="w-6 h-6 text-gray-600" />
												</div>
												<div>
													<div className="flex items-center gap-2">
														<h3 className="text-xl font-semibold text-gray-900">{product.companyName}</h3>
														<span
															className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
																product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
															}`}
														>
															{product.isActive ? "Enabled" : "Disabled"}
														</span>
													</div>
													<p className="text-sm text-gray-600 mt-1">
														{product.businessType} · Created {new Date(product.createdAt).toLocaleDateString()}
													</p>
												</div>
											</div>
										</div>

										{/* Product Details */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
											{/* Product ID */}
											<div className="bg-gray-50 rounded-lg p-3">
												<label className="block text-xs font-medium text-gray-600 mb-1">Product ID</label>
												<div className="flex items-center gap-2">
													<code className="text-sm font-mono text-gray-900 flex-1 truncate">{product.productId}</code>
													<button
														onClick={() => {
															handleCopyToClipboard(product.productId, `product-${product.id}`, "Product ID")
														}}
														className="p-1.5 hover:bg-gray-200 rounded transition-colors"
														title="Copy Product ID"
													>
														{copiedId === `product-${product.id}` ? (
															<Check className="w-4 h-4 text-green-600" />
														) : (
															<Copy className="w-4 h-4 text-gray-600" />
														)}
													</button>
												</div>
											</div>

											{/* API Key Status */}
											<div className="bg-gray-50 rounded-lg p-3">
												<label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
												<div className="flex items-center gap-2">
													{hasApiKey ? (
														<>
															<code className="text-sm font-mono text-gray-900 flex-1 truncate">
																{product.apiKeyPrefix}...
															</code>
															<button
																onClick={() => {
																	handleCopyToClipboard(
																		product.apiKeyPrefix ?? "",
																		`api-${product.id}`,
																		"API Key Prefix",
																	)
																}}
																className="p-1.5 hover:bg-gray-200 rounded transition-colors"
																title="Copy API Key Prefix"
															>
																{copiedId === `api-${product.id}` ? (
																	<Check className="w-4 h-4 text-green-600" />
																) : (
																	<Copy className="w-4 h-4 text-gray-600" />
																)}
															</button>
															<span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
																Generated
															</span>
														</>
													) : (
														<div className="flex items-center gap-2 text-sm text-orange-600">
															<Key className="w-4 h-4" />
															<span>Not Generated</span>
														</div>
													)}
												</div>
											</div>
										</div>

										{/* Description (if available) */}
										{product.description && (
											<div className="mb-4">
												<p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{product.description}</p>
											</div>
										)}

										{/* Actions */}
										<div className="flex items-center gap-3">
											<button
												onClick={() => {
													handleConfigureClick(product)
												}}
												className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all shadow-sm"
											>
												<Settings className="w-4 h-4" />
												Configure Product
											</button>

											{product.websiteUrl && (
												<a
													href={product.websiteUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
												>
													Visit Website
												</a>
											)}
										</div>
									</div>
								</div>
							)
						})}
					</div>
				)}

				{/* Create New Product Button */}
				{products.length > 0 && (
					<div className="mt-6">
						<Link to="/onboarding/create-product">
							<button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all">
								<Plus className="w-5 h-5" />
								Create New Product
							</button>
						</Link>
					</div>
				)}
			</div>
		</div>
	)
}
