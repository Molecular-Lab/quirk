/**
 * End-Users Tab
 * Shows user growth metrics and live transaction feed
 */

import { useEffect, useState } from "react"

import { ArrowDown, ArrowUp, TrendingUp, UserPlus, Users } from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"
import { ProductSwitcher } from "@/components/ProductSwitcher"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUserStore } from "@/store/userStore"

interface EndUsersTabProps {
	productId?: string
	mode: "single" | "aggregate"
}

interface GrowthMetrics {
	totalEndUsers: number
	newUsers30d: number
	activeUsers30d: number
	totalDeposited: string
	totalWithdrawn: string
	totalDeposits: number
	totalWithdrawals: number
}

interface Transaction {
	transactionType: "deposit" | "withdrawal"
	id: string
	userId: string
	amount: string
	currency: string
	status: string
	timestamp: string
}

export default function EndUsersTab({ productId: initialProductId }: EndUsersTabProps) {
	const { organizations, activeProductId } = useUserStore()

	// Use activeProductId from store, fallback to initialProductId or first org
	const productId = activeProductId || initialProductId || organizations[0]?.productId

	const [loading, setLoading] = useState(true)
	const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null)
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [totalTransactions, setTotalTransactions] = useState(0)
	const [error, setError] = useState<string | null>(null)

	const pageSize = 20

	useEffect(() => {
		async function fetchData() {
			// Don't fetch if productId is not defined (aggregate mode)
			if (!productId) {
				setLoading(false)
				setError(null)
				setGrowthMetrics(null)
				setTransactions([])
				return
			}

			try {
				setLoading(true)
				setError(null)

				// Fetch growth metrics and transactions in parallel
				const [metricsResponse, transactionsResponse] = await Promise.all([
					b2bApiClient.client.getEndUserGrowthMetrics({ params: { productId } }),
					b2bApiClient.client.getEndUserTransactions({
						params: { productId },
						query: { page: currentPage, limit: pageSize },
					}),
				])

				if (metricsResponse.status === 200) {
					setGrowthMetrics(metricsResponse.body)
				}

				if (transactionsResponse.status === 200) {
					setTransactions(transactionsResponse.body.transactions)
					setTotalTransactions(transactionsResponse.body.pagination.total)
				}
			} catch (err) {
				console.error("[EndUsersTab] Error fetching data:", err)
				setError("Failed to load end-user data")
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [productId, currentPage])

	// Show aggregate mode message when no productId
	if (!productId) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center max-w-md">
					<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Product</h3>
					<p className="text-gray-500">
						End-user metrics are available for individual products. Please select a specific product from the dropdown
						to view detailed user activity.
					</p>
				</div>
			</div>
		)
	}

	if (loading && !growthMetrics) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
					<p className="text-gray-500">Loading end-user data...</p>
				</div>
			</div>
		)
	}

	if (error && !growthMetrics) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<p className="text-red-500">{error}</p>
				</div>
			</div>
		)
	}

	const formatCurrency = (value: string) => {
		const num = parseFloat(value)
		if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
		if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
		return `$${num.toFixed(2)}`
	}

	const totalPages = Math.ceil(totalTransactions / pageSize)

	// Get current product name
	const currentProduct = organizations.find((org) => org.productId === productId)

	return (
		<div className="space-y-6">
			{/* Product Selector */}
			{organizations.length > 1 && (
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-sm font-medium text-gray-700 mb-1">Viewing product:</h3>
						<ProductSwitcher />
					</div>
				</div>
			)}

			{organizations.length === 1 && currentProduct && (
				<div className="mb-4">
					<h3 className="text-sm font-medium text-gray-700">
						Product: <span className="text-gray-900 font-semibold">{currentProduct.companyName}</span>
					</h3>
				</div>
			)}

			{/* Growth Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Users */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">Total Users</div>
						<Users className="w-4 h-4 text-gray-400" />
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-1">
						{growthMetrics?.totalEndUsers.toLocaleString() || 0}
					</div>
					<div className="text-sm text-gray-600">All-time registered</div>
				</div>

				{/* New Users (30d) */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">New Users (30d)</div>
						<UserPlus className="w-4 h-4 text-gray-400" />
					</div>
					<div className="text-3xl font-bold text-green-600 mb-1">
						+{growthMetrics?.newUsers30d.toLocaleString() || 0}
					</div>
					<div className="text-sm text-gray-600">Last 30 days</div>
				</div>

				{/* Active Users (30d) */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">Active Users (30d)</div>
						<TrendingUp className="w-4 h-4 text-gray-400" />
					</div>
					<div className="text-3xl font-bold text-accent mb-1">
						{growthMetrics?.activeUsers30d.toLocaleString() || 0}
					</div>
					<div className="text-sm text-gray-600">
						{growthMetrics && growthMetrics.totalEndUsers > 0
							? `${((growthMetrics.activeUsers30d / growthMetrics.totalEndUsers) * 100).toFixed(1)}% of total`
							: "0% of total"}
					</div>
				</div>

				{/* Net Flow */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">Net Flow</div>
						<ArrowUp className="w-4 h-4 text-green-400" />
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-1">
						{formatCurrency(
							growthMetrics
								? (parseFloat(growthMetrics.totalDeposited) - parseFloat(growthMetrics.totalWithdrawn)).toString()
								: "0",
						)}
					</div>
					<div className="text-sm text-gray-600">Deposits - Withdrawals</div>
				</div>
			</div>

			{/* Deposit/Withdrawal Summary */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Total Deposited */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-start justify-between mb-3">
						<div>
							<div className="text-sm font-medium text-gray-600 mb-1">Total Deposited</div>
							<div className="text-xs text-gray-500">All-time user deposits</div>
						</div>
						<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
							<ArrowUp className="w-5 h-5 text-green-600" />
						</div>
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-2">
						{formatCurrency(growthMetrics?.totalDeposited || "0")}
					</div>
					<div className="text-sm text-gray-600">{growthMetrics?.totalDeposits.toLocaleString() || 0} transactions</div>
				</div>

				{/* Total Withdrawn */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-start justify-between mb-3">
						<div>
							<div className="text-sm font-medium text-gray-600 mb-1">Total Withdrawn</div>
							<div className="text-xs text-gray-500">All-time user withdrawals</div>
						</div>
						<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
							<ArrowDown className="w-5 h-5 text-red-600" />
						</div>
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-2">
						{formatCurrency(growthMetrics?.totalWithdrawn || "0")}
					</div>
					<div className="text-sm text-gray-600">
						{growthMetrics?.totalWithdrawals.toLocaleString() || 0} transactions
					</div>
				</div>
			</div>

			{/* Live Transaction Feed */}
			<div className="bg-white border border-gray-150 rounded-xl overflow-hidden">
				<div className="p-6 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-950">Live Transaction Feed</h3>
					<p className="text-sm text-gray-500 mt-1">Recent deposits and withdrawals</p>
				</div>

				{transactions.length === 0 ? (
					<div className="p-12 text-center">
						<p className="text-gray-500">No transactions yet</p>
					</div>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow className="border-b border-gray-50 bg-gray-50">
									<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
										Type
									</TableHead>
									<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
										User ID
									</TableHead>
									<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
										Amount
									</TableHead>
									<TableHead className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
										Status
									</TableHead>
									<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
										Timestamp
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.map((tx) => (
									<TableRow key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
										<TableCell className="py-4 px-5">
											<div className="flex items-center gap-2">
												{tx.transactionType === "deposit" ? (
													<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
														<ArrowUp className="w-4 h-4 text-green-600" />
													</div>
												) : (
													<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
														<ArrowDown className="w-4 h-4 text-red-600" />
													</div>
												)}
												<span className="font-semibold text-gray-900 text-sm capitalize">{tx.transactionType}</span>
											</div>
										</TableCell>
										<TableCell className="py-4 px-5">
											<code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
												{tx.userId.substring(0, 12)}...
											</code>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="font-semibold text-gray-950 text-sm">
												{formatCurrency(tx.amount)} {tx.currency}
											</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-center">
											<span
												className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
													tx.status === "completed"
														? "bg-green-100 text-green-700 border border-green-200"
														: tx.status === "pending"
															? "bg-yellow-100 text-yellow-700 border border-yellow-200"
															: "bg-gray-100 text-gray-700 border border-gray-200"
												}`}
											>
												{tx.status}
											</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-gray-600 text-sm">
												{new Date(tx.timestamp).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
								<div className="text-sm text-gray-500">
									Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalTransactions)} of{" "}
									{totalTransactions} transactions
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => {
											setCurrentPage((p) => Math.max(1, p - 1))
										}}
										disabled={currentPage === 1}
										className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Previous
									</button>
									<span className="text-sm text-gray-600">
										Page {currentPage} of {totalPages}
									</span>
									<button
										onClick={() => {
											setCurrentPage((p) => Math.min(totalPages, p + 1))
										}}
										disabled={currentPage === totalPages}
										className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}
