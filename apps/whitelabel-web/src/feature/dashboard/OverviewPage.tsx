import { useEffect, useState } from "react"

import { Link } from "@tanstack/react-router"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

import { getDashboardMetrics } from "@/api/b2bClientHelpers"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserStore } from "@/store/userStore"

import TimeFilter, { type TimeRange } from "../../components/dashboard/TimeFilter"

// Mock data generators
const generateMockData = (range: TimeRange) => {
	const now = new Date()
	const data: { date: string; tvl: number; users: number; apy: number; revenue: number }[] = []

	let days = 7
	const dateFormat: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }

	if (range === "daily") days = 7
	else if (range === "weekly")
		days = 12 * 7 // 12 weeks
	else if (range === "monthly")
		days = 12 * 30 // 12 months
	else if (range === "yearly") days = 5 * 365 // 5 years

	for (let i = days; i >= 0; i--) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)

		let dateLabel = date.toLocaleDateString("en-US", dateFormat)
		if (range === "monthly") dateLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
		if (range === "yearly") dateLabel = date.getFullYear().toString()

		// Generate realistic growth curves
		const progress = 1 - i / days
		const tvl = 50000 + progress * 450000 + Math.random() * 50000
		const users = Math.floor(100 + progress * 4900 + Math.random() * 200)
		const apy = 8 + Math.random() * 7 // 8-15%
		const revenue = tvl * 0.015 // 1.5% of TVL

		data.push({
			date: dateLabel,
			tvl: Math.floor(tvl),
			users,
			apy: parseFloat(apy.toFixed(2)),
			revenue: Math.floor(revenue),
		})
	}

	return data
}

const MOCK_STRATEGIES = [
	{ name: "Balanced Portfolio", value: 45000, return: "+12.5%", color: "bg-accent" },
	{ name: "Conservative Fund", value: 30000, return: "+8.2%", color: "bg-gray-700" },
	{ name: "Aggressive Yield", value: 25000, return: "+18.7%", color: "bg-gray-500" },
]

const MOCK_END_USERS = [
	{
		id: "1",
		name: "Alice Chen",
		walletAddress: "0x742d...a3f9",
		stakedAmount: 15000,
		apyEarned: 450,
		status: "active",
		joinDate: "2024-10-15",
		apy: 12.5,
	},
	{
		id: "2",
		name: "Bob Martinez",
		walletAddress: "0x8a3c...b2d1",
		stakedAmount: 8500,
		apyEarned: 255,
		status: "active",
		joinDate: "2024-11-01",
		apy: 11.8,
	},
	{
		id: "3",
		name: "Carol Wu",
		walletAddress: "0x1f7e...c8a2",
		stakedAmount: 22000,
		apyEarned: 770,
		status: "active",
		joinDate: "2024-09-28",
		apy: 13.2,
	},
	{
		id: "4",
		name: "David Kim",
		walletAddress: "0x9d2b...f4e3",
		stakedAmount: 12500,
		apyEarned: 375,
		status: "active",
		joinDate: "2024-11-08",
		apy: 10.9,
	},
	{
		id: "5",
		name: "Emma Johnson",
		walletAddress: "0x5c8a...d1b7",
		stakedAmount: 6800,
		apyEarned: 204,
		status: "active",
		joinDate: "2024-11-12",
		apy: 11.5,
	},
]

interface DashboardMetrics {
	fundStages: {
		available: string
		staked: string
		total: string
	}
	revenue: {
		total: string
		clientShare: string
		endUserShare: string
		clientSharePercent: string
	}
	stats: {
		totalUsers: number
		activeUsers: number
		apy: string
		vaults: number
	}
	strategies: {
		category: string
		target: number
		allocated: number
		isActive: boolean
	}[]
}

export function OverviewPage() {
	const { getActiveOrganization } = useUserStore()
	const activeOrg = getActiveOrganization()
	const clientId = activeOrg?.id

	const [timeRange, setTimeRange] = useState<TimeRange>("daily")
	const [selectedMetric, setSelectedMetric] = useState<"tvl" | "users" | "apy" | "revenue">("tvl")
	const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
	const [, setIsLoading] = useState(true)

	// Fetch real dashboard data
	useEffect(() => {
		const fetchDashboardMetrics = async () => {
			if (!clientId) {
				setIsLoading(false)
				return
			}

			try {
				setIsLoading(true)
				const response = await getDashboardMetrics(clientId)
				console.log("[OverviewPage] Dashboard metrics:", response)
				setDashboardMetrics(response as DashboardMetrics)
			} catch (error) {
				console.error("[OverviewPage] Failed to fetch dashboard metrics:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchDashboardMetrics()
	}, [clientId])

	const data = generateMockData(timeRange)
	const latestData = data[data.length - 1]

	// Use real data if available, otherwise fall back to mock data
	const totalValue = dashboardMetrics ? parseFloat(dashboardMetrics.fundStages.total) : latestData.tvl
	const totalUsers = dashboardMetrics ? dashboardMetrics.stats.totalUsers : latestData.users
	const avgAPY = dashboardMetrics ? parseFloat(dashboardMetrics.stats.apy) : latestData.apy
	const totalRevenue = dashboardMetrics ? parseFloat(dashboardMetrics.revenue.total) : latestData.revenue

	const metrics = {
		tvl: {
			label: "Total Assets Under Management",
			value: `$${totalValue.toLocaleString()}`,
			change: dashboardMetrics
				? `Available: $${parseFloat(dashboardMetrics.fundStages.available).toLocaleString()} | Staked: $${parseFloat(dashboardMetrics.fundStages.staked).toLocaleString()}`
				: "+$52,340 (+15.2%)",
			color: "#00D9A3",
		},
		users: {
			label: "Total Users",
			value: totalUsers.toLocaleString(),
			change: dashboardMetrics
				? `Active: ${dashboardMetrics.stats.activeUsers} | Vaults: ${dashboardMetrics.stats.vaults}`
				: "+342 (+7.1%)",
			color: "#3B82F6",
		},
		apy: {
			label: "Average APY",
			value: `${avgAPY.toFixed(2)}%`,
			change: dashboardMetrics
				? `Weighted avg across ${dashboardMetrics.stats.vaults} vaults`
				: "+1.2% from last period",
			color: "#8B5CF6",
		},
		revenue: {
			label: "Total Revenue Generated",
			value: `$${totalRevenue.toLocaleString()}`,
			change: dashboardMetrics
				? `Your cut (${dashboardMetrics.revenue.clientSharePercent}%): $${parseFloat(dashboardMetrics.revenue.clientShare).toLocaleString()}`
				: "+$845 (+12.3%)",
			color: "#F59E0B",
		},
	}

	const currentMetric = metrics[selectedMetric]

	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header with Time Filter */}
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-[32px] font-bold text-gray-950">Dashboard</h1>
					<TimeFilter value={timeRange} onChange={setTimeRange} />
				</div>

				{/* Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					{Object.entries(metrics).map(([key, metric]) => (
						<div
							key={key}
							className={`bg-white/90 backdrop-blur-md border rounded-xl p-6 cursor-pointer transition-all ${
								selectedMetric === key
									? "border-accent shadow-lg ring-2 ring-accent/20"
									: "border-gray-150 hover:border-gray-200 hover:shadow-md"
							}`}
							onClick={() => {
								setSelectedMetric(key as typeof selectedMetric)
							}}
						>
							<div className="text-xs font-medium text-gray-500 mb-2">{metric.label}</div>
							<div className="text-3xl font-bold text-gray-950 mb-1">{metric.value}</div>
							<div className="text-sm text-gray-700 font-medium">{metric.change}</div>
						</div>
					))}
				</div>

				{/* Main Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
					{/* Chart Card */}
					<div className="lg:col-span-2 bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-6">
						<div className="flex items-start justify-between mb-6">
							<div>
								<div className="text-gray-500 text-xs font-medium mb-1">{currentMetric.label}</div>
								<div className="text-[56px] font-bold text-gray-950 leading-none mb-2">{currentMetric.value}</div>
								<div className="text-sm text-gray-700 font-medium">{currentMetric.change}</div>
							</div>
							<div className="flex gap-1">
								{(["tvl", "users", "apy", "revenue"] as const).map((metric) => (
									<button
										key={metric}
										onClick={() => {
											setSelectedMetric(metric)
										}}
										className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
											selectedMetric === metric
												? "font-semibold text-gray-900 bg-white"
												: "text-gray-500 hover:text-gray-900 hover:bg-white"
										}`}
									>
										{metric.toUpperCase()}
									</button>
								))}
							</div>
						</div>

						<div className="h-[280px] -mx-2">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={data}>
									<XAxis
										dataKey="date"
										axisLine={false}
										tickLine={false}
										tick={{ fill: "#9ca3af", fontSize: 11 }}
										dy={10}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: "white",
											border: "1px solid #e5e7eb",
											borderRadius: "12px",
											padding: "8px 12px",
											fontSize: "12px",
										}}
									/>
									<Line
										type="monotone"
										dataKey={selectedMetric}
										stroke={currentMetric.color}
										strokeWidth={2.5}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Right Stats */}
					<div className="space-y-4">
						<div className="bg-gray-50 rounded-3xl p-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-medium text-gray-500">DeFi Strategies</span>
							</div>
							<div className="text-[56px] font-bold text-gray-900 leading-none mb-4">
								{dashboardMetrics ? dashboardMetrics.strategies.length : 3}
							</div>
							<div className="space-y-2">
								{dashboardMetrics
									? dashboardMetrics.strategies.map((strategy, idx) => (
											<div key={idx} className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-2">
													<div
														className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-accent" : idx === 1 ? "bg-gray-700" : "bg-gray-500"}`}
													></div>
													<span className="text-xs text-gray-600">{strategy.category}</span>
												</div>
												<span className="text-xs font-medium text-gray-950">{strategy.target}%</span>
											</div>
										))
									: MOCK_STRATEGIES.map((strategy, idx) => (
											<div key={idx} className="flex items-center gap-2">
												<div className={`w-2 h-2 rounded-full ${strategy.color}`}></div>
												<span className="text-xs text-gray-600">{strategy.name}</span>
											</div>
										))}
							</div>
						</div>

						<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-6">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-medium text-gray-500">Fund Breakdown</span>
							</div>
							{dashboardMetrics ? (
								<>
									<div className="mb-4">
										<div className="text-xs text-gray-500 mb-1">Available (Stage 1)</div>
										<div className="text-2xl font-bold text-gray-950">
											${parseFloat(dashboardMetrics.fundStages.available).toLocaleString()}
										</div>
									</div>
									<div className="mb-4">
										<div className="text-xs text-gray-500 mb-1">Staked in DeFi (Stage 2)</div>
										<div className="text-2xl font-bold text-gray-950">
											${parseFloat(dashboardMetrics.fundStages.staked).toLocaleString()}
										</div>
									</div>
									<div className="pt-3 border-t border-gray-200">
										<div className="text-xs text-gray-500 mb-1">Total Revenue (Stage 3)</div>
										<div className="text-2xl font-bold text-gray-950">
											${parseFloat(dashboardMetrics.revenue.total).toLocaleString()}
										</div>
										<div className="text-xs text-gray-500 mt-2">
											End-users: ${parseFloat(dashboardMetrics.revenue.endUserShare).toLocaleString()}
										</div>
									</div>
								</>
							) : (
								<>
									<div className="text-[56px] font-bold text-gray-950 leading-none mb-2">
										${MOCK_STRATEGIES.reduce((sum, s) => sum + s.value, 0).toLocaleString()}
									</div>
									<div className="text-sm text-gray-700 font-medium">
										+{((MOCK_STRATEGIES.reduce((sum, s) => sum + s.value, 0) / 90000) * 100 - 100).toFixed(1)}% Total
										Return
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				{/* End-Users Section */}
				<div className="flex items-center justify-between mb-5 mt-10">
					<div>
						<h2 className="text-[28px] font-bold text-gray-950">End-Users</h2>
						<p className="text-sm text-gray-500 mt-1">Users staking through your platform</p>
					</div>
					<div className="flex items-center gap-3">
						<div className="text-right">
							<div className="text-xs text-gray-500">Total Users</div>
							<div className="text-2xl font-bold text-gray-950">{MOCK_END_USERS.length}</div>
						</div>
						<div className="text-right">
							<div className="text-xs text-gray-500">Total Staked</div>
							<div className="text-2xl font-bold text-gray-950">
								${MOCK_END_USERS.reduce((sum, user) => sum + user.stakedAmount, 0).toLocaleString()}
							</div>
						</div>
					</div>
				</div>

				{/* End-Users Table */}
				<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-10">
					<Table>
						<TableHeader>
							<TableRow className="border-b border-gray-50 bg-gray-50">
								<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									User
								</TableHead>
								<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Wallet Address
								</TableHead>
								<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Staked Amount
								</TableHead>
								<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									APY Earned
								</TableHead>
								<TableHead className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Current APY
								</TableHead>
								<TableHead className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Status
								</TableHead>
								<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Join Date
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{MOCK_END_USERS.map((user) => (
								<TableRow key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
									<TableCell className="py-4 px-5">
										<div className="flex items-center gap-2.5">
											<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
												{user.name.charAt(0)}
											</div>
											<span className="font-semibold text-gray-900 text-sm">{user.name}</span>
										</div>
									</TableCell>
									<TableCell className="py-4 px-5">
										<code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{user.walletAddress}</code>
									</TableCell>
									<TableCell className="py-4 px-5 text-right">
										<span className="text-gray-950 font-semibold text-sm">${user.stakedAmount.toLocaleString()}</span>
									</TableCell>
									<TableCell className="py-4 px-5 text-right">
										<span className="text-gray-700 font-semibold text-sm">+${user.apyEarned.toLocaleString()}</span>
									</TableCell>
									<TableCell className="py-4 px-5 text-center">
										<span className="text-gray-700 font-semibold text-sm">{user.apy}%</span>
									</TableCell>
									<TableCell className="py-4 px-5 text-center">
										<span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
											Active
										</span>
									</TableCell>
									<TableCell className="py-4 px-5">
										<span className="text-gray-600 text-sm">
											{new Date(user.joinDate).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{/* Portfolios Section */}
				<div className="flex items-center justify-between mb-5 mt-10">
					<h2 className="text-[28px] font-bold text-gray-950">My Portfolios</h2>
					<div className="flex gap-3">
						<Link
							to="/demo"
							className="bg-white text-gray-950 px-5 py-2.5 rounded-lg hover:bg-gray-25 font-medium text-sm transition-all inline-block border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
						>
							Go to Demo
						</Link>
						<Link
							to="/onboarding/create-product"
							className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 font-medium text-sm transition-all inline-block shadow-sm"
						>
							Create new portfolio
						</Link>
					</div>
				</div>

				{/* Portfolios Tabs */}
				<Tabs defaultValue="active" className="w-full">
					<TabsList className="flex gap-8 mb-4 border-b border-gray-100 bg-transparent h-auto p-0 rounded-none w-full justify-start">
						<TabsTrigger
							value="active"
							className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-gray-900 -mb-px bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
						>
							Active (1)
						</TabsTrigger>
						<TabsTrigger
							value="drafts"
							className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-gray-900 -mb-px bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
						>
							Drafts (0)
						</TabsTrigger>
						<TabsTrigger
							value="archived"
							className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-gray-900 -mb-px bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
						>
							Archived (0)
						</TabsTrigger>
					</TabsList>

					<TabsContent value="active" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow className="border-b border-gray-50">
										<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Portfolio ↕
										</TableHead>
										<TableHead className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Current Tokens
										</TableHead>
										<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Current Value ↕
										</TableHead>
										<TableHead className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Total Return ↕
										</TableHead>
										<TableHead className="w-24"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow className="hover:bg-gray-50 transition-colors group">
										<TableCell className="py-4 px-5">
											<div className="flex items-center gap-2.5">
												<div className="w-2 h-2 rounded-full bg-primary-500"></div>
												<span className="font-semibold text-gray-900 text-sm">DeFi Token Mix</span>
											</div>
										</TableCell>
										<TableCell className="py-4 px-5">
											<span className="text-gray-600 text-sm">-</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-gray-900 font-semibold text-sm">$0.00</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-gray-600 text-sm">-</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<button className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
												View
											</button>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					</TabsContent>

					<TabsContent value="drafts" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden p-8 text-center">
							<p className="text-gray-500">No draft portfolios</p>
						</div>
					</TabsContent>

					<TabsContent value="archived" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-2xl overflow-hidden p-8 text-center">
							<p className="text-gray-500">No archived portfolios</p>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
