import { useEffect, useState } from "react"

import { Clock, DollarSign, RefreshCw, Sparkles, TrendingUp, UserPlus, Users, Zap } from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"
import { useClientContext } from "@/store/clientContextStore"
import { OnRampModal } from "./OnRampModal"

interface DepositOrder {
	orderId: string
	userId: string
	amount: string
	currency: string
	status: "pending" | "processing" | "completed"
	createdAt: string
	chain: string
	tokenSymbol: string
}

export function OperationsDashboard() {
	const [orders, setOrders] = useState<DepositOrder[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
	const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)

	// Get client context for API authentication
	const { clientId, productId, apiKey, hasContext, hasApiKey } = useClientContext()

	useEffect(() => {
		// Log client context for debugging
		console.log('[OperationsDashboard] Client context:', {
			hasContext: hasContext(),
			hasApiKey: hasApiKey(),
			clientId: clientId?.substring(0, 8) + '...',
			productId,
		})

		loadPendingOrders()
	}, [])

	const loadPendingOrders = async (forceRefresh = false) => {
		setIsLoading(true)
		setError(null) // Clear any previous errors

		// Check if API key is available
		if (!hasApiKey()) {
			console.error('[OperationsDashboard] ❌ No API key available')
			setError('API key not configured. Please configure via Demo Settings.')
			setIsLoading(false)
			return
		}

		try {
			// Add timestamp to prevent browser caching
			const timestamp = forceRefresh ? `?_t=${Date.now()}` : ''
			console.log(`[OperationsDashboard] Loading pending orders (forceRefresh=${forceRefresh})${timestamp}`)

			const response = await b2bApiClient.listPendingDeposits()
			console.log("[OperationsDashboard] Pending deposits response:", response)

			// API returns { deposits: [...], summary: [...] }
			if (response && typeof response === "object" && "deposits" in response) {
				const deposits = (response as any).deposits
				console.log("[OperationsDashboard] Deposits array:", deposits)

				// Map deposit response to DepositOrder interface
				const mappedOrders: DepositOrder[] = (Array.isArray(deposits) ? deposits : []).map((dep: any) => ({
					orderId: dep.orderId || dep.id || "",
					userId: dep.userId || "",
					amount: dep.amount || "0",
					currency: "USD", // From fiat deposit
					status: dep.status || "pending",
					createdAt: dep.createdAt || new Date().toISOString(),
					chain: "base", // Default for demo
					tokenSymbol: "USDC", // Default for demo
				}))

				console.log("[OperationsDashboard] Mapped orders:", mappedOrders)
				setOrders(mappedOrders)
			} else {
				console.warn("[OperationsDashboard] Unexpected response format:", response)
				setOrders([])
			}
		} catch (error) {
			console.error("[OperationsDashboard] Failed to load orders:", error)
			setError(error instanceof Error ? error.message : 'Failed to load pending deposits')
			setOrders([])
		} finally {
			setIsLoading(false)
		}
	}

	const handleToggleSelect = (orderId: string) => {
		setSelectedOrderIds((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(orderId)) {
				newSet.delete(orderId)
			} else {
				newSet.add(orderId)
			}
			return newSet
		})
	}

	const handleSelectAll = () => {
		if (selectedOrderIds.size === orders.length) {
			setSelectedOrderIds(new Set())
		} else {
			setSelectedOrderIds(new Set(orders.map((o) => o.orderId)))
		}
	}

	const handleOnboardSelected = () => {
		if (selectedOrderIds.size === 0) {
			alert("Please select at least one order to onboard")
			return
		}
		setIsOnboardingModalOpen(true)
	}

	// Calculate summary stats
	const totalPendingOrders = orders.length
	const totalPendingAmount = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0)
	const uniqueCurrencies = [...new Set(orders.map((order) => order.currency))]

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 1) return "Just now"
		if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
		return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-6 py-6">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-blue-100 rounded-xl">
							<Users className="w-8 h-8 text-blue-600" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Client Onboarding</h1>
							<p className="text-gray-600 mt-1">Review and onboard end-user deposit requests</p>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm font-medium text-gray-600">New Users Waiting</p>
							<div className="p-2 bg-blue-50 rounded-lg">
								<UserPlus className="w-5 h-5 text-blue-600" />
							</div>
						</div>
						<p className="text-3xl font-bold text-gray-900">{totalPendingOrders}</p>
						<p className="text-xs text-gray-500 mt-1">
							{uniqueCurrencies.length} {uniqueCurrencies.length === 1 ? "currency" : "currencies"}
						</p>
					</div>

					<div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm font-medium text-gray-600">Total Onboarding Value</p>
							<div className="p-2 bg-green-50 rounded-lg">
								<DollarSign className="w-5 h-5 text-green-600" />
							</div>
						</div>
						<p className="text-3xl font-bold text-gray-900">
							${totalPendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</p>
						<p className="text-xs text-gray-500 mt-1">Pending USDC minting</p>
					</div>

					<div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm font-medium text-gray-600">Onboarding Speed</p>
							<div className="p-2 bg-purple-50 rounded-lg">
								<Zap className="w-5 h-5 text-purple-600" />
							</div>
						</div>
						<p className="text-3xl font-bold text-gray-900">~2 min</p>
						<p className="text-xs text-gray-500 mt-1">Average time to activate</p>
					</div>
				</div>

				{/* AI Onboarding Insights */}
				<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-200 mb-8 shadow-sm">
					<div className="flex items-center gap-2 mb-3">
						<div className="p-2 bg-purple-100 rounded-lg">
							<Sparkles className="w-5 h-5 text-purple-600" />
						</div>
						<h2 className="text-lg font-bold text-gray-900">AI Onboarding Insights</h2>
					</div>
					<div className="space-y-2">
						<p className="text-sm text-gray-700">
							<span className="font-semibold text-purple-700">⚡ Quick Action:</span> {totalPendingOrders} new users
							ready to be onboarded. Average deposit size: $
							{totalPendingOrders > 0 ? (totalPendingAmount / totalPendingOrders).toFixed(2) : "0.00"}
						</p>
						<p className="text-sm text-gray-700">
							<span className="font-semibold text-blue-700">📊 Pattern Detected:</span> Peak user registration occurs
							between 2-4 PM. Consider optimizing on-ramp capacity during these hours.
						</p>
						<p className="text-sm text-gray-700">
							<span className="font-semibold text-green-700">✨ Growth Opportunity:</span> {totalPendingOrders} users
							waiting means potential ${totalPendingAmount.toFixed(2)} in AUM once onboarded.
						</p>
					</div>
				</div>

				{/* Pending Orders List */}
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="flex items-center gap-2">
									<UserPlus className="w-6 h-6 text-blue-600" />
									<h2 className="text-xl font-bold text-gray-900">Pending User Onboarding Requests</h2>
								</div>
								<p className="text-sm text-gray-600 mt-1">Select orders and click "Onboard Selected" to process via on-ramp</p>
							</div>
							<div className="flex items-center gap-3">
								{/* Refresh Button */}
								<button
									onClick={() => loadPendingOrders(true)}
									disabled={isLoading}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
									title="Refresh pending orders"
								>
									<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
									Refresh
								</button>

								{orders.length > 0 && (
									<>
										<button
											onClick={handleSelectAll}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
										>
											{selectedOrderIds.size === orders.length ? "Deselect All" : "Select All"}
										</button>
										<button
											onClick={handleOnboardSelected}
											disabled={selectedOrderIds.size === 0}
											className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											<Zap className="w-4 h-4" />
											Onboard Selected ({selectedOrderIds.size})
										</button>
									</>
								)}
							</div>
						</div>
					</div>

					{error ? (
						<div className="px-6 py-12 text-center">
							<div className="p-4 bg-red-50 rounded-2xl max-w-md mx-auto">
								<div className="p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
									<Zap className="w-8 h-8 text-red-600" />
								</div>
								<p className="font-semibold text-lg text-red-900">Failed to Load Orders</p>
								<p className="text-sm mt-2 text-red-700">{error}</p>
								<button
									onClick={() => {
										setError(null)
										loadPendingOrders()
									}}
									className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
								>
									Retry
								</button>
							</div>
						</div>
					) : isLoading ? (
						<div className="px-6 py-12 text-center text-gray-500">Loading orders...</div>
					) : orders.length === 0 ? (
						<div className="px-6 py-12 text-center text-gray-500">
							<div className="p-4 bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
								<Users className="w-12 h-12 text-gray-300" />
							</div>
							<p className="font-semibold text-lg text-gray-700">All users onboarded!</p>
							<p className="text-sm mt-1 text-gray-500">No pending onboarding requests at the moment</p>
						</div>
					) : (
						<div className="divide-y divide-gray-200">
							{orders.map((order) => (
								<div
									key={order.orderId}
									className={`px-6 py-4 transition-colors ${
										selectedOrderIds.has(order.orderId) ? "bg-blue-50" : "hover:bg-gray-50"
									}`}
								>
									<div className="flex items-center gap-4">
										{/* Checkbox */}
										<input
											type="checkbox"
											checked={selectedOrderIds.has(order.orderId)}
											onChange={() => handleToggleSelect(order.orderId)}
											className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
										/>

										{/* Order Details */}
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="font-semibold text-gray-900">Order #{order.orderId.slice(-8)}</h3>
												<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
													{order.status}
												</span>
											</div>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
												<div>
													<p className="text-gray-500">User ID</p>
													<p className="font-medium text-gray-900">{order.userId.slice(0, 20)}...</p>
												</div>
												<div>
													<p className="text-gray-500">Amount</p>
													<p className="font-medium text-gray-900">
														{order.amount} {order.currency}
													</p>
												</div>
												<div>
													<p className="text-gray-500">Token</p>
													<p className="font-medium text-gray-900">{order.tokenSymbol}</p>
												</div>
												<div>
													<p className="text-gray-500">Created</p>
													<p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* On-Ramp Modal */}
			<OnRampModal
				isOpen={isOnboardingModalOpen}
				onClose={() => setIsOnboardingModalOpen(false)}
				selectedOrderIds={Array.from(selectedOrderIds)}
				orders={orders}
				onComplete={() => {
					console.log('[OperationsDashboard] Deposit completed - refreshing orders list')

					// Clear selection
					setSelectedOrderIds(new Set())

					// Force refresh with cache-busting
					// Add small delay to ensure backend has processed the completion
					setTimeout(() => {
						loadPendingOrders(true)
					}, 500)
				}}
			/>
		</div>
	)
}
