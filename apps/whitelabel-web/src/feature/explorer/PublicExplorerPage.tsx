/**
 * Public Explorer Page
 * Public transparency page showing client's overall allocations, TVL, and strategy
 */

import { useState, useEffect } from "react"
import { useParams } from "@tanstack/react-router"
import { Users, TrendingUp, PieChart, Lock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PublicExplorerData {
	clientId: string
	companyName: string
	totalTvl: string
	totalUsers: number
	overallApy: string
	allocations: Array<{
		protocol: string
		allocation: number
		apy: string
		tvl: string
	}>
	strategyType?: string
	lastUpdated: string
}

export function PublicExplorerPage() {
	const { clientId } = useParams({ from: "/explorer/$clientId" })
	const [data, setData] = useState<PublicExplorerData | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchData() {
			try {
				// TODO: Fetch from API
				// const response = await fetch(`/api/v1/explorer/${clientId}`)
				// const result = await response.json()
				// setData(result.data)

				// Mock data for now
				setData({
					clientId,
					companyName: "Quirk",
					totalTvl: "1,250,000",
					totalUsers: 1234,
					overallApy: "4.8%",
					allocations: [
						{ protocol: "Aave", allocation: 50, apy: "4.2%", tvl: "625,000" },
						{ protocol: "Morpho", allocation: 30, apy: "5.8%", tvl: "375,000" },
						{ protocol: "Compound", allocation: 20, apy: "3.9%", tvl: "250,000" },
					],
					strategyType: "Moderate",
					lastUpdated: new Date().toISOString(),
				})
			} catch (error) {
				console.error("Failed to fetch public explorer data:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [clientId])

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
				<p className="text-gray-600">Client not found</p>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Header */}
			<div className="border-b bg-white/80 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-3">
						<Lock className="h-8 w-8 text-green-600" />
						<div>
							<h1 className="text-2xl font-bold text-gray-900">{data.companyName} Transparency</h1>
							<p className="text-sm text-gray-600">Public transparency dashboard</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-6xl space-y-6">
					{/* Key Metrics */}
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Total Value Locked</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-gray-900">${data.totalTvl}</div>
								<p className="mt-1 text-xs text-gray-600">USD across all users</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardDescription className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									Active Users
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</div>
								<p className="mt-1 text-xs text-gray-600">Earning with {data.companyName}</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardDescription className="flex items-center gap-2">
									<TrendingUp className="h-4 w-4" />
									Overall APY
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-green-600">{data.overallApy}</div>
								<p className="mt-1 text-xs text-gray-600">Weighted average</p>
							</CardContent>
						</Card>
					</div>

					{/* Strategy Allocation */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<PieChart className="h-5 w-5" />
								Strategy Allocation
							</CardTitle>
							<CardDescription>
								{data.strategyType && `${data.strategyType} strategy - `}
								How funds are distributed across protocols
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Visual Bar */}
							<div className="mb-6 flex h-12 overflow-hidden rounded-full">
								{data.allocations.map((allocation, index) => (
									<div
										key={index}
										className={`flex items-center justify-center text-sm font-medium text-white ${
											index === 0 ? "bg-blue-500" : index === 1 ? "bg-purple-500" : "bg-green-500"
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
													index === 0 ? "bg-blue-500" : index === 1 ? "bg-purple-500" : "bg-green-500"
												}`}
											/>
											<div>
												<p className="font-semibold text-gray-900">{allocation.protocol}</p>
												<p className="text-sm text-gray-600">{allocation.allocation}% allocation</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-semibold text-green-600">{allocation.apy} APY</p>
											<p className="text-sm text-gray-600">${allocation.tvl} TVL</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Info Footer */}
					<div className="rounded-lg bg-blue-50 p-6 text-center">
						<p className="text-sm text-gray-700">
							<strong className="text-gray-900">🔒 Transparency by Design:</strong> All user funds are visible on-chain.
							This page shows real-time allocation and performance data.
						</p>
						<p className="mt-2 text-xs text-gray-500">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
