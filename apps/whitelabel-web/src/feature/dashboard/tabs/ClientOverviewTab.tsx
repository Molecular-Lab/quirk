/**
 * Client Overview Tab
 * Shows Fund Stages (Idle & Earning Balance), Revenue Metrics (MRR, ARR), and Quick Stats
 */

import { useEffect, useState } from "react"

import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react"

import { b2bApiClient } from "@/api/b2bClient"

interface ClientOverviewTabProps {
	productId?: string
	mode: "single" | "aggregate"
}

interface DashboardSummary {
	productId: string
	companyName: string
	balances: {
		totalIdleBalance: string
		totalEarningBalance: string
		totalClientRevenue: string
		totalPlatformRevenue: string
		totalEnduserRevenue: string
	}
	revenue: {
		monthlyRecurringRevenue: string
		annualRunRate: string
		clientRevenuePercent: string
		platformFeePercent: string
		enduserFeePercent: string
		lastCalculatedAt: string | null
	}
	endUsers: {
		totalEndUsers: number
		newUsers30d: number
		activeUsers30d: number
		totalDeposited: string
		totalWithdrawn: string
	}
}

export default function ClientOverviewTab({ productId, mode }: ClientOverviewTabProps) {
	const [loading, setLoading] = useState(true)
	const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchDashboardSummary() {
			try {
				setLoading(true)
				setError(null)

				let response
				if (mode === "aggregate") {
					// Call aggregate endpoint (no productId needed)
					response = await b2bApiClient.client.getAggregateDashboardSummary()
				} else {
					// Call single product endpoint
					if (!productId) {
						setError("Product ID is required for single mode")
						return
					}
					response = await b2bApiClient.client.getDashboardSummary({
						params: { productId },
					})
				}

				if (response.status === 200 && response.body?.data) {
					setDashboardData(response.body.data)
				} else {
					setError("Failed to load dashboard data")
				}
			} catch (err) {
				console.error("[ClientOverviewTab] Error fetching dashboard:", err)
				setError("Failed to load dashboard data")
			} finally {
				setLoading(false)
			}
		}

		fetchDashboardSummary()
	}, [productId, mode])

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
					<p className="text-gray-500">Loading dashboard...</p>
				</div>
			</div>
		)
	}

	if (error || !dashboardData) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<p className="text-red-500">{error || "No data available"}</p>
				</div>
			</div>
		)
	}

	const { balances, revenue, endUsers } = dashboardData

	const formatCurrency = (value: string) => {
		const num = parseFloat(value)
		if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
		if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
		return `$${num.toFixed(2)}`
	}

	// Calculate total balance
	const totalBalance = parseFloat(balances.totalIdleBalance) + parseFloat(balances.totalEarningBalance)

	// Calculate average APY (mock for now - should come from vault data)
	const avgAPY = 8.5

	return (
		<div className="space-y-6">
			{/* Quick Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Balance */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">Total Balance</div>
						<Wallet className="w-4 h-4 text-gray-400" />
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-1">{formatCurrency(totalBalance.toString())}</div>
					<div className="text-sm text-gray-600">
						Idle: {formatCurrency(balances.totalIdleBalance)} • Earning: {formatCurrency(balances.totalEarningBalance)}
					</div>
				</div>

				{/* Total Users */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">Total End-Users</div>
						<Users className="w-4 h-4 text-gray-400" />
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-1">{endUsers.totalEndUsers.toLocaleString()}</div>
					<div className="text-sm text-gray-600">+{endUsers.newUsers30d} new users (30d)</div>
				</div>

				{/* MRR */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">MRR</div>
						<TrendingUp className="w-4 h-4 text-gray-400" />
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-1">{formatCurrency(revenue.monthlyRecurringRevenue)}</div>
					<div className="text-sm text-gray-600">ARR: {formatCurrency(revenue.annualRunRate)}</div>
				</div>

				{/* Average APY */}
				<div className="bg-white border border-gray-150 rounded-xl p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="text-xs font-medium text-gray-500 uppercase">Avg APY</div>
						<DollarSign className="w-4 h-4 text-gray-400" />
					</div>
					<div className="text-3xl font-bold text-gray-950 mb-1">{avgAPY.toFixed(2)}%</div>
					<div className="text-sm text-gray-600">Weighted average</div>
				</div>
			</div>

			{/* Fund Stages Card */}
			<div className="bg-white border border-gray-150 rounded-xl p-6">
				<h3 className="text-xl font-bold text-gray-950 mb-6">Fund Stages</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Idle Balance */}
					<div className="border border-gray-200 rounded-lg p-5 bg-white hover:border-gray-300 transition-all">
						<div className="flex items-start justify-between mb-3">
							<div>
								<div className="text-sm font-medium text-gray-700 mb-1">Idle Balance</div>
								<div className="text-xs text-gray-500">Ready to deploy into DeFi</div>
							</div>
							<Wallet className="w-5 h-5 text-gray-400" />
						</div>
						<div className="text-3xl font-bold text-gray-950">{formatCurrency(balances.totalIdleBalance)}</div>
					</div>

					{/* Earning Balance */}
					<div className="border border-gray-200 rounded-lg p-5 bg-white hover:border-accent/50 transition-all">
						<div className="flex items-start justify-between mb-3">
							<div>
								<div className="text-sm font-medium text-gray-700 mb-1">Earning Balance</div>
								<div className="text-xs text-gray-500">Actively earning yield</div>
							</div>
							<TrendingUp className="w-5 h-5 text-accent" />
						</div>
						<div className="text-3xl font-bold text-accent">{formatCurrency(balances.totalEarningBalance)}</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mt-6">
					<div className="flex items-center justify-between text-xs text-gray-500 mb-2">
						<span>Deployment Progress</span>
						<span>
							{totalBalance > 0 ? ((parseFloat(balances.totalEarningBalance) / totalBalance) * 100).toFixed(1) : 0}%
							deployed
						</span>
					</div>
					<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
							style={{
								width: `${totalBalance > 0 ? (parseFloat(balances.totalEarningBalance) / totalBalance) * 100 : 0}%`,
							}}
						/>
					</div>
				</div>
			</div>

			{/* Revenue Metrics Card */}
			<div className="bg-white border border-gray-150 rounded-xl p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-gray-950">Revenue Metrics</h3>
					{revenue.lastCalculatedAt && (
						<div className="text-xs text-gray-500">
							Last updated: {new Date(revenue.lastCalculatedAt).toLocaleDateString()}
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					{/* Client Revenue */}
					<div className="text-center p-4 border border-gray-100 rounded-lg">
						<div className="text-sm font-medium text-gray-600 mb-2">Your Revenue Share</div>
						<div className="text-2xl font-bold text-accent mb-1">{formatCurrency(balances.totalClientRevenue)}</div>
						<div className="text-xs text-gray-500">{revenue.clientRevenuePercent}% of total yield</div>
					</div>

					{/* Platform Fee */}
					<div className="text-center p-4 border border-gray-100 rounded-lg bg-gray-50">
						<div className="text-sm font-medium text-gray-600 mb-2">Platform Fee</div>
						<div className="text-2xl font-bold text-gray-700 mb-1">{formatCurrency(balances.totalPlatformRevenue)}</div>
						<div className="text-xs text-gray-500">{revenue.platformFeePercent}% of total yield</div>
					</div>

					{/* End-User Revenue */}
					<div className="text-center p-4 border border-gray-100 rounded-lg bg-white">
						<div className="text-sm font-medium text-gray-600 mb-2">End-User Revenue</div>
						<div className="text-2xl font-bold text-gray-950 mb-1">{formatCurrency(balances.totalEnduserRevenue)}</div>
						<div className="text-xs text-gray-500">{revenue.enduserFeePercent}% of total yield</div>
					</div>
				</div>

				{/* MRR & ARR */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="border border-gray-200 rounded-lg p-5 bg-white hover:border-gray-300 transition-all">
						<div className="text-sm font-medium text-gray-600 mb-2">Monthly Recurring Revenue (MRR)</div>
						<div className="text-4xl font-bold text-gray-950 mb-1">
							{formatCurrency(revenue.monthlyRecurringRevenue)}
						</div>
						<div className="text-xs text-gray-500">Based on current earning balance × APY × your revenue share</div>
					</div>

					<div className="border border-gray-200 rounded-lg p-5 bg-white hover:border-gray-300 transition-all">
						<div className="text-sm font-medium text-gray-600 mb-2">Annual Run Rate (ARR)</div>
						<div className="text-4xl font-bold text-gray-950 mb-1">{formatCurrency(revenue.annualRunRate)}</div>
						<div className="text-xs text-gray-500">MRR × 12</div>
					</div>
				</div>
			</div>
		</div>
	)
}
