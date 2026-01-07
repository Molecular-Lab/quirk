/**
 * Portfolio Tab
 * Shows DeFi strategy allocations and portfolio performance
 */

import { Link } from "@tanstack/react-router"
import { ExternalLink, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data - will be replaced with real data from API
const MOCK_PORTFOLIOS = [
	{
		id: "1",
		name: "DeFi Token Mix",
		tokens: "-",
		currentValue: 0,
		totalReturn: "-",
		status: "active",
	},
]

const MOCK_STRATEGIES = [
	{ name: "Balanced Portfolio", value: 45000, return: "+12.5%", allocation: "45%", color: "bg-accent" },
	{ name: "Conservative Fund", value: 30000, return: "+8.2%", allocation: "30%", color: "bg-gray-700" },
	{ name: "Aggressive Yield", value: 25000, return: "+18.7%", allocation: "25%", color: "bg-gray-500" },
]

export default function PortfolioTab(): React.JSX.Element {
	const formatCurrency = (value: number) => {
		if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
		if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
		return `$${value.toFixed(2)}`
	}

	const totalValue = MOCK_STRATEGIES.reduce((sum, strategy) => sum + strategy.value, 0)

	return (
		<div className="space-y-6">
			{/* Strategy Allocation Overview */}
			<div className="bg-white border border-gray-150 rounded-xl p-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-xl font-bold text-gray-950">Strategy Allocation</h3>
						<p className="text-sm text-gray-500 mt-1">Your DeFi yield strategy breakdown</p>
					</div>
					<Link
						to="/dashboard/market"
						className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
					>
						View Market Analysis
						<ExternalLink className="w-4 h-4" />
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Strategy Breakdown */}
					<div className="space-y-4">
						{MOCK_STRATEGIES.map((strategy, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className={`w-3 h-3 rounded-full ${strategy.color}`}></div>
									<div>
										<div className="font-semibold text-gray-900 text-sm">{strategy.name}</div>
										<div className="text-xs text-gray-500">{strategy.allocation} allocation</div>
									</div>
								</div>
								<div className="text-right">
									<div className="font-semibold text-gray-900 text-sm">{formatCurrency(strategy.value)}</div>
									<div className="text-xs text-green-600">{strategy.return}</div>
								</div>
							</div>
						))}
					</div>

					{/* Portfolio Summary */}
					<div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg p-6">
						<div className="text-sm font-medium text-gray-600 mb-2">Total Portfolio Value</div>
						<div className="text-4xl font-bold text-gray-950 mb-4">{formatCurrency(totalValue)}</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Total Return</span>
								<span className="font-semibold text-green-600">+$12,450 (+14.2%)</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Average APY</span>
								<span className="font-semibold text-gray-900">12.8%</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Risk Level</span>
								<span className="font-semibold text-yellow-600">Moderate</span>
							</div>
						</div>

						<div className="mt-6 pt-4 border-t border-gray-200">
							<Link
								to="/dashboard/market"
								className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
							>
								<TrendingUp className="w-4 h-4" />
								Customize Strategy
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Portfolios List */}
			<div className="bg-white border border-gray-150 rounded-xl overflow-hidden">
				<div className="p-6 border-b border-gray-100">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-xl font-bold text-gray-950">My Portfolios</h3>
							<p className="text-sm text-gray-500 mt-1">Manage your product portfolios</p>
						</div>
						<div className="flex gap-3">
							<Link
								to="/demo"
								className="bg-white text-gray-950 px-5 py-2.5 rounded-lg hover:bg-gray-25 font-medium text-sm transition-all inline-block border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
							>
								Go to Demo
							</Link>
							<Link
								to="/onboarding/create-product"
								className="bg-accent text-white px-5 py-2.5 rounded-lg hover:bg-accent/90 font-medium text-sm transition-all inline-block shadow-sm"
							>
								Create new portfolio
							</Link>
						</div>
					</div>
				</div>

				<Tabs defaultValue="active" className="w-full">
					<TabsList className="flex gap-8 px-6 pt-4 border-b border-gray-100 bg-transparent h-auto p-0 rounded-none w-full justify-start">
						<TabsTrigger
							value="active"
							className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-gray-900 -mb-px bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
						>
							Active ({MOCK_PORTFOLIOS.filter((p) => p.status === "active").length})
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
								{MOCK_PORTFOLIOS.map((portfolio) => (
									<TableRow key={portfolio.id} className="hover:bg-gray-50 transition-colors group">
										<TableCell className="py-4 px-5">
											<div className="flex items-center gap-2.5">
												<div className="w-2 h-2 rounded-full bg-accent"></div>
												<span className="font-semibold text-gray-900 text-sm">{portfolio.name}</span>
											</div>
										</TableCell>
										<TableCell className="py-4 px-5">
											<span className="text-gray-600 text-sm">{portfolio.tokens}</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-gray-900 font-semibold text-sm">
												{formatCurrency(portfolio.currentValue)}
											</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<span className="text-gray-600 text-sm">{portfolio.totalReturn}</span>
										</TableCell>
										<TableCell className="py-4 px-5 text-right">
											<Link
												to="/dashboard/portfolios/$id"
												params={{ id: portfolio.id }}
												className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
											>
												View
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TabsContent>

					<TabsContent value="drafts" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-xl overflow-hidden p-8 text-center">
							<p className="text-gray-500">No draft portfolios</p>
						</div>
					</TabsContent>

					<TabsContent value="archived" className="mt-0">
						<div className="bg-white border border-gray-100 rounded-xl overflow-hidden p-8 text-center">
							<p className="text-gray-500">No archived portfolios</p>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
