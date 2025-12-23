/**
 * Private Explorer Page
 * Personal report for an end-user showing their balance, yield, activity, and allocations
 */

import { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { TrendingUp, Activity, PieChart, CheckCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PrivateExplorerData {
	userId: string
	clientUserId: string
	totalBalance: string
	totalDeposited: string
	totalYieldEarned: string
	currentApy: string
	allocations: Array<{
		protocol: string
		allocation: number
		apy: string
		tvl: string
	}>
	depositCount: number
	withdrawalCount: number
	firstDepositAt: string | null
	lastActivityAt: string | null
	status: "pending_onboarding" | "active" | "suspended"
	accountAge: string
	lastUpdated: string
}

export function PrivateExplorerPage() {
	const { clientId, clientUserId } = useParams({ from: "/explorer/$clientId/$clientUserId" })
	const [data, setData] = useState<PrivateExplorerData | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchData() {
			try {
				// TODO: Fetch from API
				// const response = await fetch(`/api/v1/explorer/${clientId}/${clientUserId}`)
				// const result = await response.json()
				// setData(result.data)

				// Mock data for now
				setData({
					userId: "user-123",
					clientUserId,
					totalBalance: "1,250.50",
					totalDeposited: "1,000.00",
					totalYieldEarned: "250.50",
					currentApy: "4.8%",
					allocations: [
						{ protocol: "Aave", allocation: 50, apy: "4.2%", tvl: "625" },
						{ protocol: "Morpho", allocation: 30, apy: "5.8%", tvl: "375" },
						{ protocol: "Compound", allocation: 20, apy: "3.9%", tvl: "250" },
					],
					depositCount: 5,
					withdrawalCount: 2,
					firstDepositAt: "2024-11-15T10:30:00Z",
					lastActivityAt: "2024-12-15T14:20:00Z",
					status: "active",
					accountAge: "32 days",
					lastUpdated: new Date().toISOString(),
				})
			} catch (error) {
				console.error("Failed to fetch private explorer data:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [clientId, clientUserId])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
			</div>
		)
	}

	if (!data) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-gray-600">User not found</p>
			</div>
		)
	}

	const yieldPercentage =
		data.totalDeposited !== "0"
			? ((parseFloat(data.totalYieldEarned) / parseFloat(data.totalDeposited)) * 100).toFixed(2)
			: "0"

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Header */}
			<div className="border-b bg-white/80 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Your Personal Report</h1>
							<p className="text-sm text-gray-600">User: {clientUserId}</p>
						</div>
						<Badge
							variant={data.status === "active" ? "default" : "secondary"}
							className={
								data.status === "active"
									? "bg-green-500 text-white"
									: "bg-yellow-500 text-white"
							}
						>
							{data.status === "active" ? (
								<>
									<CheckCircle className="mr-1 h-3 w-3" />
									Active
								</>
							) : (
								data.status
							)}
						</Badge>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-6xl space-y-6">
					{/* Key Stats */}
					<div className="grid gap-4 md:grid-cols-4">
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Total Balance</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-gray-900">${data.totalBalance}</div>
								<p className="mt-1 text-xs text-gray-600">Current value</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Total Deposited</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-gray-900">${data.totalDeposited}</div>
								<p className="mt-1 text-xs text-gray-600">Principal</p>
							</CardContent>
						</Card>

						<Card className="border-green-200 bg-green-50">
							<CardHeader className="pb-2">
								<CardDescription className="flex items-center gap-2">
									<TrendingUp className="h-4 w-4 text-green-600" />
									Yield Earned
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">${data.totalYieldEarned}</div>
								<p className="mt-1 text-xs text-green-700">+{yieldPercentage}% gain</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Current APY</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-blue-600">{data.currentApy}</div>
								<p className="mt-1 text-xs text-gray-600">Annual yield</p>
							</CardContent>
						</Card>
					</div>

					{/* Account Activity */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Account Activity
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-4">
								<div className="rounded-lg bg-gray-50 p-4">
									<p className="text-sm text-gray-600">Account Age</p>
									<p className="mt-1 text-lg font-semibold text-gray-900">{data.accountAge}</p>
								</div>

								<div className="rounded-lg bg-gray-50 p-4">
									<p className="text-sm text-gray-600">Deposits</p>
									<p className="mt-1 text-lg font-semibold text-gray-900">{data.depositCount} transactions</p>
								</div>

								<div className="rounded-lg bg-gray-50 p-4">
									<p className="text-sm text-gray-600">Withdrawals</p>
									<p className="mt-1 text-lg font-semibold text-gray-900">{data.withdrawalCount} transactions</p>
								</div>

								<div className="rounded-lg bg-gray-50 p-4">
									<p className="text-sm text-gray-600">Last Activity</p>
									<p className="mt-1 text-lg font-semibold text-gray-900">
										{data.lastActivityAt
											? new Date(data.lastActivityAt).toLocaleDateString()
											: "Never"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Portfolio Allocation */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<PieChart className="h-5 w-5" />
								Your Portfolio Allocation
							</CardTitle>
							<CardDescription>Where your money is currently invested</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Visual Bar */}
							<div className="mb-6 flex h-12 overflow-hidden rounded-full">
								{data.allocations.map((allocation, index) => (
									<div
										key={index}
										className={`flex items-center justify-center text-sm font-medium text-white ${
											index === 0
												? "bg-blue-500"
												: index === 1
												? "bg-purple-500"
												: "bg-green-500"
										}`}
										style={{ width: `${allocation.allocation}%` }}
									>
										{allocation.allocation}%
									</div>
								))}
							</div>

							{/* Protocol Details */}
							<div className="space-y-3">
								{data.allocations.map((allocation, index) => (
									<div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
										<div className="flex items-center gap-4">
											<div
												className={`h-3 w-3 rounded-full ${
													index === 0
														? "bg-blue-500"
														: index === 1
														? "bg-purple-500"
														: "bg-green-500"
												}`}
											/>
											<div>
												<p className="font-semibold text-gray-900">{allocation.protocol}</p>
												<p className="text-sm text-gray-600">${allocation.tvl} of your funds</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-semibold text-green-600">{allocation.apy} APY</p>
											<p className="text-sm text-gray-600">{allocation.allocation}%</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Info Footer */}
					<div className="rounded-lg bg-blue-50 p-6 text-center">
						<p className="text-sm text-gray-700">
							<strong className="text-gray-900">🎯 Your Earnings:</strong> You've earned $
							{data.totalYieldEarned} ({yieldPercentage}% return) since your first deposit. Keep it up!
						</p>
						<p className="mt-2 text-xs text-gray-500">
							Last updated: {new Date(data.lastUpdated).toLocaleString()}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
