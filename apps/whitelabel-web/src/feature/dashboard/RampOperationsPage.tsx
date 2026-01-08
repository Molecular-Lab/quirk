import { useEffect, useState } from "react"

import { ArrowDownToLine, DollarSign, RefreshCw, UserPlus, Users, Zap } from "lucide-react"

import { listPendingDeposits, listPendingWithdrawals } from "@/api/b2bClientHelpers"
import { EnvironmentSelector } from "@/components/EnvironmentSelector"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClientContextStore } from "@/store/clientContextStore"
import { useEnvironmentStore } from "@/store/environmentStore"

import { OffRampModal } from "./OffRampModal"
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

interface WithdrawalOrder {
	id: string
	userId: string
	requestedAmount: string
	status: "PENDING" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED"
	createdAt: string
	withdrawal_method?: "crypto" | "fiat_to_client" | "fiat_to_end_user"
	destination_currency?: string
}

export function RampOperationsPage() {
	// On-Ramp state
	const [orders, setOrders] = useState<DepositOrder[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
	const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)

	// Off-Ramp state
	const [withdrawals, setWithdrawals] = useState<WithdrawalOrder[]>([])
	const [isWithdrawalsLoading, setIsWithdrawalsLoading] = useState(true)
	const [withdrawalError, setWithdrawalError] = useState<string | null>(null)
	const [selectedWithdrawalIds, setSelectedWithdrawalIds] = useState<Set<string>>(new Set())
	const [isOffRampModalOpen, setIsOffRampModalOpen] = useState(false)

	// Get client context (for display purposes only)
	const { clientId, productId, hasContext } = useClientContextStore()

	// ✅ Get environment from store to filter data
	const { apiEnvironment } = useEnvironmentStore()

	useEffect(() => {
		// Log client context for debugging
		console.log("[OperationsDashboard] Client context (Dashboard - Privy auth):", {
			hasContext: hasContext(),
			clientId: clientId?.substring(0, 8) + "...",
			productId,
			environment: apiEnvironment,
		})

		loadPendingOrders()
		loadPendingWithdrawals()
	}, [clientId, apiEnvironment]) // ✅ Refetch when environment changes

	const loadPendingOrders = async (forceRefresh = false) => {
		setIsLoading(true)
		setError(null) // Clear any previous errors

		// Dashboard uses Privy authentication (x-privy-org-id header)
		// No API key needed for operations dashboard
		console.log("[OperationsDashboard] Loading pending deposits (Dashboard - Privy auth)", {
			environment: apiEnvironment,
		})

		try {
			// Add timestamp to prevent browser caching
			const timestamp = forceRefresh ? `?_t=${Date.now()}` : ""
			console.log(
				`[OperationsDashboard] Loading pending orders (forceRefresh=${forceRefresh}, environment=${apiEnvironment})${timestamp}`,
			)

			// ✅ Pass environment to filter deposits
			const response = await listPendingDeposits(apiEnvironment)
			console.log("[OperationsDashboard] Pending deposits response:", response)

			// API returns { deposits: [...], summary: [...] }
			if (response && typeof response === "object" && "deposits" in response) {
				const deposits = (response as any).deposits
				console.log("[OperationsDashboard] Deposits array:", deposits)

				// Map deposit response to DepositOrder interface
				const mappedOrders: DepositOrder[] = (Array.isArray(deposits) ? deposits : []).map((dep: any) => ({
					orderId: dep.orderId || dep.id || "",
					userId: dep.userId || "",
					amount: dep.fiatAmount || dep.cryptoAmount || dep.amount || "0", // ✅ Use fiatAmount (human-readable USD)
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
			setError(error instanceof Error ? error.message : "Failed to load pending deposits")
			setOrders([])
		} finally {
			setIsLoading(false)
		}
	}

	const loadPendingWithdrawals = async (_forceRefresh = false) => {
		setIsWithdrawalsLoading(true)
		setWithdrawalError(null)

		console.log("[OperationsDashboard] Loading pending withdrawals", {
			environment: apiEnvironment,
		})

		try {
			// ✅ Pass environment to filter withdrawals (clientId no longer needed)
			const response = await listPendingWithdrawals(apiEnvironment)
			console.log("[OperationsDashboard] Pending withdrawals response:", response)

			if (response && typeof response === "object" && "withdrawals" in response) {
				const withdrawalList = (response as any).withdrawals
				console.log("[OperationsDashboard] Withdrawals array:", withdrawalList)
				console.log(`[OperationsDashboard] Found ${withdrawalList?.length || 0} withdrawals for environment: ${apiEnvironment}`)

				const mappedWithdrawals: WithdrawalOrder[] = (Array.isArray(withdrawalList) ? withdrawalList : []).map(
					(w: any) => ({
						id: w.id || "",
						userId: w.userId || "",
						requestedAmount: w.requestedAmount || "0",
						status: w.status || "PENDING",
						createdAt: w.createdAt || new Date().toISOString(),
						withdrawal_method: w.withdrawal_method,
						destination_currency: w.destination_currency,
					}),
				)

				console.log("[OperationsDashboard] Mapped withdrawals:", mappedWithdrawals)
				console.log(`[OperationsDashboard] Setting ${mappedWithdrawals.length} withdrawals in state`)
				setWithdrawals(mappedWithdrawals)
			} else {
				setWithdrawals([])
			}
		} catch (error) {
			console.error("[OperationsDashboard] Failed to load withdrawals:", error)
			setWithdrawalError(error instanceof Error ? error.message : "Failed to load pending withdrawals")
			setWithdrawals([])
		} finally {
			setIsWithdrawalsLoading(false)
		}
	}

	// On-Ramp handlers
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

	// Off-Ramp handlers
	const handleToggleWithdrawalSelect = (withdrawalId: string) => {
		setSelectedWithdrawalIds((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(withdrawalId)) {
				newSet.delete(withdrawalId)
			} else {
				newSet.add(withdrawalId)
			}
			return newSet
		})
	}

	const handleSelectAllWithdrawals = () => {
		if (selectedWithdrawalIds.size === withdrawals.length) {
			setSelectedWithdrawalIds(new Set())
		} else {
			setSelectedWithdrawalIds(new Set(withdrawals.map((w) => w.id)))
		}
	}

	const handleProcessSelectedWithdrawals = () => {
		if (selectedWithdrawalIds.size === 0) {
			alert("Please select at least one withdrawal to process")
			return
		}
		setIsOffRampModalOpen(true)
	}

	// Calculate summary stats for On-Ramp
	const totalPendingOrders = orders.length
	const totalPendingAmount = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0)
	const uniqueCurrencies = [...new Set(orders.map((order) => order.currency))]

	// Calculate summary stats for Off-Ramp
	const totalPendingWithdrawals = withdrawals.length
	const totalWithdrawalAmount = withdrawals.reduce((sum, w) => sum + parseFloat(w.requestedAmount), 0)
	const uniqueWithdrawalCurrencies = [
		...new Set(withdrawals.map((w) => w.destination_currency || "USD").filter(Boolean)),
	]

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
					<div className="border-b border-gray-150 pb-4">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<Users className="w-6 h-6 text-gray-400" />
								<h1 className="text-3xl font-bold text-gray-950">Ramp Operations</h1>
							</div>
							<EnvironmentSelector />
						</div>
						<p className="text-gray-600 mt-1">Process on-ramp deposits and off-ramp withdrawals</p>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 py-8">
				{/* Tabs */}
				<Tabs defaultValue="onramp" className="w-full">
					<TabsList className="mb-6">
						<TabsTrigger value="onramp">On-Ramp (Deposits)</TabsTrigger>
						<TabsTrigger value="offramp">Off-Ramp (Withdrawals)</TabsTrigger>
					</TabsList>

					<TabsContent value="onramp">
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium text-gray-600">New Users Waiting</p>
									<UserPlus className="w-5 h-5 text-gray-400" />
								</div>
								<p className="text-3xl font-bold text-gray-900">{totalPendingOrders}</p>
								<p className="text-xs text-gray-500 mt-1">
									{uniqueCurrencies.length} {uniqueCurrencies.length === 1 ? "currency" : "currencies"}
								</p>
							</div>

							<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium text-gray-600">Total Onboarding Value</p>
									<DollarSign className="w-5 h-5 text-gray-400" />
								</div>
								<p className="text-3xl font-bold text-gray-900">
									${totalPendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</p>
								<p className="text-xs text-gray-500 mt-1">Pending USDC minting</p>
							</div>
						</div>
						{/* Pending Orders List */}
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
							<div className="px-6 py-4 border-b border-gray-200 bg-white">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center gap-2">
											<UserPlus className="w-6 h-6 text-blue-600" />
											<h2 className="text-xl font-bold text-gray-900">Pending User Onboarding Requests</h2>
										</div>
										<p className="text-sm text-gray-600 mt-1">
											Select orders and click "Onboard Selected" to process via on-ramp
										</p>
									</div>
									<div className="flex items-center gap-3">
										{/* Refresh Button */}
										<button
											onClick={() => loadPendingOrders(true)}
											disabled={isLoading}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
											title="Refresh pending orders"
										>
											<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
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
													className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
												<Checkbox
													checked={selectedOrderIds.has(order.orderId)}
													onCheckedChange={() => {
														handleToggleSelect(order.orderId)
													}}
													className="w-5 h-5"
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
					</TabsContent>

					<TabsContent value="offramp">
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium text-gray-600">Pending Withdrawals</p>
									<ArrowDownToLine className="w-5 h-5 text-gray-400" />
								</div>
								<p className="text-3xl font-bold text-gray-900">{totalPendingWithdrawals}</p>
								<p className="text-xs text-gray-500 mt-1">
									{uniqueWithdrawalCurrencies.length}{" "}
									{uniqueWithdrawalCurrencies.length === 1 ? "currency" : "currencies"}
								</p>
							</div>

							<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium text-gray-600">Total Withdrawal Value</p>
									<DollarSign className="w-5 h-5 text-gray-400" />
								</div>
								<p className="text-3xl font-bold text-gray-900">
									$
									{totalWithdrawalAmount.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</p>
								<p className="text-xs text-gray-500 mt-1">USDC to convert to fiat</p>
							</div>
						</div>

						{/* Pending Withdrawals List */}
						<div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
							<div className="px-6 py-4 border-b border-gray-200 bg-white">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center gap-2">
											<ArrowDownToLine className="w-6 h-6 text-orange-600" />
											<h2 className="text-xl font-bold text-gray-900">Pending Withdrawal Requests</h2>
										</div>
										<p className="text-sm text-gray-600 mt-1">
											Select withdrawals and click "Process Selected" to convert USDC to fiat
										</p>
									</div>
									<div className="flex items-center gap-3">
										{/* Refresh Button */}
										<button
											onClick={() => loadPendingWithdrawals(true)}
											disabled={isWithdrawalsLoading}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
											title="Refresh pending withdrawals"
										>
											<RefreshCw className={`w-4 h-4 ${isWithdrawalsLoading ? "animate-spin" : ""}`} />
											Refresh
										</button>

										{withdrawals.length > 0 && (
											<>
												<button
													onClick={handleSelectAllWithdrawals}
													className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
												>
													{selectedWithdrawalIds.size === withdrawals.length ? "Deselect All" : "Select All"}
												</button>
												<button
													onClick={handleProcessSelectedWithdrawals}
													disabled={selectedWithdrawalIds.size === 0}
													className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													<DollarSign className="w-4 h-4" />
													Process Selected ({selectedWithdrawalIds.size})
												</button>
											</>
										)}
									</div>
								</div>
							</div>

							{withdrawalError ? (
								<div className="px-6 py-12 text-center">
									<div className="p-4 bg-red-50 rounded-2xl max-w-md mx-auto">
										<div className="p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
											<Zap className="w-8 h-8 text-red-600" />
										</div>
										<p className="font-semibold text-lg text-red-900">Failed to Load Withdrawals</p>
										<p className="text-sm mt-2 text-red-700">{withdrawalError}</p>
										<button
											onClick={() => {
												setWithdrawalError(null)
												loadPendingWithdrawals()
											}}
											className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
										>
											Retry
										</button>
									</div>
								</div>
							) : isWithdrawalsLoading ? (
								<div className="px-6 py-12 text-center text-gray-500">Loading withdrawals...</div>
							) : withdrawals.length === 0 ? (
								<div className="px-6 py-12 text-center text-gray-500">
									<div className="p-4 bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
										<ArrowDownToLine className="w-12 h-12 text-gray-300" />
									</div>
									<p className="font-semibold text-lg text-gray-700">No pending withdrawals</p>
									<p className="text-sm mt-1 text-gray-500">All withdrawal requests have been processed</p>
								</div>
							) : (
								<div className="divide-y divide-gray-200">
									{withdrawals.map((withdrawal) => (
										<div
											key={withdrawal.id}
											className={`px-6 py-4 transition-colors ${
												selectedWithdrawalIds.has(withdrawal.id) ? "bg-orange-50" : "hover:bg-gray-50"
											}`}
										>
											<div className="flex items-center gap-4">
												{/* Checkbox */}
												<Checkbox
													checked={selectedWithdrawalIds.has(withdrawal.id)}
													onCheckedChange={() => {
														handleToggleWithdrawalSelect(withdrawal.id)
													}}
													className="w-5 h-5"
												/>

												{/* Withdrawal Details */}
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<h3 className="font-semibold text-gray-900">Withdrawal #{withdrawal.id.slice(-8)}</h3>
														<span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
															{withdrawal.status}
														</span>
														{withdrawal.withdrawal_method && (
															<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
																{withdrawal.withdrawal_method.replace(/_/g, " ")}
															</span>
														)}
													</div>
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
														<div>
															<p className="text-gray-500">User ID</p>
															<p className="font-medium text-gray-900">{withdrawal.userId.slice(0, 20)}...</p>
														</div>
														<div>
															<p className="text-gray-500">Amount</p>
															<p className="font-medium text-gray-900">{withdrawal.requestedAmount} USDC</p>
														</div>
														<div>
															<p className="text-gray-500">Destination</p>
															<p className="font-medium text-gray-900">{withdrawal.destination_currency || "USD"}</p>
														</div>
														<div>
															<p className="text-gray-500">Created</p>
															<p className="font-medium text-gray-900">{formatDate(withdrawal.createdAt)}</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>
			</div>

			{/* On-Ramp Modal */}
			<OnRampModal
				isOpen={isOnboardingModalOpen}
				onClose={() => {
					setIsOnboardingModalOpen(false)
				}}
				selectedOrderIds={Array.from(selectedOrderIds)}
				orders={orders}
				onComplete={() => {
					console.log("[OperationsDashboard] Deposit completed - refreshing orders list")

					// Clear selection
					setSelectedOrderIds(new Set())

					// Force refresh with cache-busting
					// Add small delay to ensure backend has processed the completion
					setTimeout(() => {
						loadPendingOrders(true)
					}, 500)
				}}
			/>

			{/* Off-Ramp Modal */}
			<OffRampModal
				isOpen={isOffRampModalOpen}
				onClose={() => {
					setIsOffRampModalOpen(false)
				}}
				selectedWithdrawalIds={Array.from(selectedWithdrawalIds)}
				withdrawals={withdrawals}
				onComplete={() => {
					console.log("[OperationsDashboard] Off-ramp completed - refreshing withdrawals list")

					// Clear selection
					setSelectedWithdrawalIds(new Set())

					// Force refresh with cache-busting
					setTimeout(() => {
						loadPendingWithdrawals(true)
					}, 500)
				}}
			/>
		</div>
	)
}
