import { useEffect, useMemo, useState } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { ArrowDownToLine, ArrowUpFromLine, Info, Loader2, Settings } from "lucide-react"
import { toast } from "sonner"

import { getEffectiveProductStrategies } from "@/api/b2bClientHelpers"
import AaveLogo from "@/assets/aave-aave-logo.svg"
import CompoundLogo from "@/assets/compound-comp-logo.svg"
import MorphoLogo from "@/assets/Morpho-token-icon.svg"
import { EnvironmentSelector } from "@/components/EnvironmentSelector"
import { ProductSwitcher } from "@/components/ProductSwitcher"
import { useAPYCache } from "@/hooks/useAPYCache"
import { useClientWalletBalance } from "@/hooks/useClientWalletBalance"
import { type Allocation, useAPYCacheStore } from "@/store/apyCacheStore"
import { useUserStore } from "@/store/userStore"

import { CategorySection } from "../../components/market/CategorySection"
import { ProtocolCard } from "../../components/market/ProtocolCard"
import { useAllDeFiProtocols } from "../../hooks/useDeFiProtocols"

import { EarnDepositModal } from "./EarnDepositModal"
import { TransactionHistory } from "./TransactionHistory"
import { WithdrawalExecutionModal } from "./WithdrawalExecutionModal"

// Import protocol logos

interface RiskPackage {
	id: number
	name: string
	riskLevel: "conservative" | "moderate" | "aggressive"
	expectedAPY: string
	description: string
}

// Removed: CustomStrategy interface (now handled in ProductConfigPage)

const PACKAGES: RiskPackage[] = [
	{
		id: 1,
		name: "Conservative",
		riskLevel: "conservative",
		expectedAPY: "3-5%",
		description: "Low risk, stable returns with established protocols",
	},
	{
		id: 2,
		name: "Moderate",
		riskLevel: "moderate",
		expectedAPY: "5-7%",
		description: "Balanced risk-reward with diversified allocation",
	},
	{
		id: 3,
		name: "Aggressive",
		riskLevel: "aggressive",
		expectedAPY: "7-10%",
		description: "Higher risk, maximum yield potential",
	},
]

// Mock data for non-DeFi categories
const MOCK_CATEGORIES = [
	{
		id: "cefi",
		title: "CeFi Yield",
		description: "Centralized institutional lending partners",
		opportunities: [
			{
				protocol: "Coinbase",
				token: "USDC",
				supplyAPY: "5.00%",
				tvl: "N/A",
				risk: "Low" as const,
				type: "Lending" as const,
				status: "healthy" as const,
			},
			{
				protocol: "Binance",
				token: "USDT",
				supplyAPY: "4.50%",
				tvl: "N/A",
				risk: "Medium" as const,
				type: "Lending" as const,
				status: "healthy" as const,
			},
		],
	},
	{
		id: "lp",
		title: "Place LP",
		description: "Liquidity provision strategies",
		opportunities: [
			{
				protocol: "Uniswap V3",
				token: "USDC/ETH",
				supplyAPY: "12.4%",
				tvl: "$2.1B",
				risk: "High" as const,
				type: "LP" as const,
				status: "healthy" as const,
			},
			{
				protocol: "Curve",
				token: "3pool",
				supplyAPY: "3.2%",
				tvl: "$450M",
				risk: "Low" as const,
				type: "LP" as const,
				status: "healthy" as const,
			},
		],
	},
]

type TabType = "explore" | "strategies" | "history"

export function YieldDashboard() {
	// Read tab from URL query params (for redirects from old routes)
	const searchParams = useSearch({ from: "/dashboard/earn" })
	const [activeTab, setActiveTab] = useState<TabType>((searchParams as any).tab || "explore")
	const [selectedPackage, setSelectedPackage] = useState<RiskPackage>(PACKAGES[0])
	// Removed: showTooltip, isOptimizing (no longer needed in read-only view)

	// Modal state management
	const [showDepositModal, setShowDepositModal] = useState(false)
	const [showWithdrawModal, setShowWithdrawModal] = useState(false)

	// Query client for cache invalidation
	const queryClient = useQueryClient()

	// Removed: Custom strategy state (now handled in ProductConfigPage)

	// ✅ Multi-product support: Get active product ID
	const { activeProductId, organizations } = useUserStore()

	// ✅ Load strategy from database for current product
	const [loadedStrategy, setLoadedStrategy] = useState<any>(null)
	const [isLoadingStrategy, setIsLoadingStrategy] = useState(true)

	// Fetch real DeFi protocol data
	const { protocols, isLoading, errors } = useAllDeFiProtocols("USDC", 8453)

	// ✅ Use client wallet balance (platform vault balance from client_vaults table)
	const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useClientWalletBalance()

	// ✅ Fetch APY data for real-time calculations
	const { apys, isLoading: isAPYLoading } = useAPYCache("USDC", 8453)
	const calculateExpectedAPY = useAPYCacheStore((state) => state.calculateExpectedAPY)

	// Calculate blended APY from loaded strategy
	const blendedAPY = useMemo(() => {
		if (!apys || !loadedStrategy?.lending) {
			return "0.00"
		}

		const allocs: Allocation[] = [
			{ protocol: "aave" as const, percentage: loadedStrategy.lending.aave || 0 },
			{ protocol: "compound" as const, percentage: loadedStrategy.lending.compound || 0 },
			{ protocol: "morpho" as const, percentage: loadedStrategy.lending.morpho || 0 },
		]

		return calculateExpectedAPY(allocs)
	}, [loadedStrategy, apys, calculateExpectedAPY])

	// ✅ Load strategy from database when product changes
	useEffect(() => {
		const loadProductStrategy = async () => {
			if (!activeProductId) {
				console.log("[YieldDashboard] No active product ID")
				setIsLoadingStrategy(false)
				return
			}

			try {
				setIsLoadingStrategy(true)
				console.log(`[YieldDashboard] Loading strategy for product: ${activeProductId}`)

				const { strategies, source } = await getEffectiveProductStrategies(activeProductId)

				console.log("[YieldDashboard] Loaded strategy:", { strategies, source })
				setLoadedStrategy(strategies)

				// Detect risk profile from loaded strategy
				if (strategies?.lending) {
					// Detect risk profile from allocations
					const { aave, compound, morpho } = strategies.lending
					if (aave === 60 && compound === 30 && morpho === 10) {
						setSelectedPackage(PACKAGES[0]) // Conservative
					} else if (aave === 40 && compound === 35 && morpho === 25) {
						setSelectedPackage(PACKAGES[1]) // Moderate
					} else if (aave === 20 && compound === 25 && morpho === 55) {
						setSelectedPackage(PACKAGES[2]) // Aggressive
					}
				}
			} catch (error) {
				console.error("[YieldDashboard] Error loading strategy:", error)
				toast.error("Failed to load product strategy")
			} finally {
				setIsLoadingStrategy(false)
			}
		}

		void loadProductStrategy()
	}, [activeProductId])

	// Removed: Protocol allocations state (no longer needed, data comes from loadedStrategy)
	// Removed: All configuration functions (now handled in ProductConfigPage)
	// handlePackageSelect, updateAllocation, handleSave, handleSaveCustomStrategy,
	// loadCustomStrategy, deleteCustomStrategy, calculateBlendedAPY, createNewCustomStrategy

	// Calculate stats
	const bestAPY = protocols.length > 0 ? Math.max(...protocols.map((p) => parseFloat(p.supplyAPY))).toFixed(2) : "0.00"
	const bestProtocol = protocols.find((p) => parseFloat(p.supplyAPY).toFixed(2) === bestAPY)?.protocol || "N/A"
	const totalTVL = protocols.reduce((sum, p) => sum + parseFloat(p.tvl || "0"), 0)

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto px-6 py-6">
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-4">
							<h1 className="text-3xl font-bold text-gray-900">Earn</h1>
							{/* ✅ Product Switcher for multi-product support */}
							{organizations.length > 0 && <ProductSwitcher />}
						</div>
						{/* ✅ Environment Selector - switch between sandbox/production */}
						<EnvironmentSelector />
					</div>
					<p className="text-gray-600">Explore protocols and manage your yield strategies</p>
					{isLoadingStrategy && (
						<div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
							<Loader2 className="w-4 h-4 animate-spin" />
							Loading strategy configuration...
						</div>
					)}
				</div>

				{/* Tabs */}
				<div className="mb-6 border-b border-gray-200">
					<div className="flex gap-8">
						<button
							onClick={() => {
								setActiveTab("explore")
							}}
							className={`pb-4 px-1 font-semibold transition-colors relative ${
								activeTab === "explore" ? "text-green-600" : "text-gray-500 hover:text-gray-700"
							}`}
						>
							Explore Protocols
							{activeTab === "explore" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>}
						</button>
						<button
							onClick={() => {
								setActiveTab("strategies")
							}}
							className={`pb-4 px-1 font-semibold transition-colors relative ${
								activeTab === "strategies" ? "text-green-600" : "text-gray-500 hover:text-gray-700"
							}`}
						>
							My Strategies
							{activeTab === "strategies" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
							)}
						</button>
						<button
							onClick={() => {
								setActiveTab("history")
							}}
							className={`pb-4 px-1 font-semibold transition-colors relative ${
								activeTab === "history" ? "text-green-600" : "text-gray-500 hover:text-gray-700"
							}`}
						>
							Transaction History
							{activeTab === "history" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>}
						</button>
					</div>
				</div>

				{/* Explore Tab */}
				{activeTab === "explore" && (
					<div className="space-y-6">
						{/* Stats Overview */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
								<p className="text-gray-500 text-sm mb-1">Total TVL</p>
								<div className="flex items-end justify-between">
									<span className="text-2xl font-bold text-gray-900">
										{isLoading ? (
											<div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
										) : (
											`$${(totalTVL / 1_000_000).toFixed(1)}M`
										)}
									</span>
									<span className="text-green-600 text-sm font-medium">Live</span>
								</div>
							</div>

							<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
								<p className="text-gray-500 text-sm mb-1">Best APY</p>
								<div className="flex items-end justify-between">
									<span className="text-2xl font-bold text-gray-900">
										{isLoading ? <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div> : `${bestAPY}%`}
									</span>
									<span className="text-green-600 text-sm font-medium capitalize">{bestProtocol}</span>
								</div>
							</div>

							<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
								<p className="text-gray-500 text-sm mb-1">Active Protocols</p>
								<div className="flex items-end justify-between">
									<span className="text-2xl font-bold text-gray-900">{protocols.length}</span>
									<span className="text-green-600 text-sm font-medium">Optimized</span>
								</div>
							</div>
						</div>

						{/* Error Display */}
						{errors.length > 0 && (
							<div className="bg-red-50 border border-red-200 rounded-2xl p-4">
								<p className="text-red-700 font-semibold mb-2">⚠ Some protocols failed to load:</p>
								<ul className="text-sm text-red-600 space-y-1">
									{errors.map((err: any, idx: number) => (
										<li key={idx}>
											• {err.protocol}: {err.error?.message || "Unknown error"}
										</li>
									))}
								</ul>
							</div>
						)}

						{/* DeFi Category */}
						<CategorySection
							id="defi"
							title="DeFi Lending"
							description="Decentralized protocols with real-time data from Yield Engine"
							defaultExpanded={true}
						>
							{isLoading ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{[1, 2, 3].map((i) => (
										<div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-pulse">
											<div className="h-10 bg-gray-200 rounded-full mb-3"></div>
											<div className="h-8 bg-gray-200 rounded mb-2"></div>
											<div className="h-6 bg-gray-200 rounded"></div>
										</div>
									))}
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{protocols.map((protocol) => (
										<ProtocolCard key={protocol.protocol} data={protocol} />
									))}
								</div>
							)}
						</CategorySection>

						{/* CeFi Category */}
						<CategorySection
							id="cefi"
							title="CeFi Yield"
							description="Centralized institutional lending partners"
							defaultExpanded={false}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{MOCK_CATEGORIES[0].opportunities.map((opp, idx) => (
									<div
										key={idx}
										className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all"
									>
										<div className="flex justify-between items-start mb-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-700">
													{opp.protocol[0]}
												</div>
												<div>
													<h3 className="font-bold text-gray-900">{opp.protocol}</h3>
													<span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{opp.type}</span>
												</div>
											</div>
											<div
												className={`text-xs font-medium px-2 py-1 rounded-full ${
													opp.risk === "Low"
														? "bg-emerald-50 text-emerald-700 border border-emerald-200"
														: opp.risk === "Medium"
															? "bg-amber-50 text-amber-700 border border-amber-200"
															: "bg-rose-50 text-rose-700 border border-rose-200"
												}`}
											>
												{opp.risk} Risk
											</div>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-2xl font-bold text-green-600">{opp.supplyAPY}</span>
											<span className="text-sm text-gray-500">{opp.token}</span>
										</div>
									</div>
								))}
							</div>
						</CategorySection>

						{/* LP Category */}
						<CategorySection
							id="lp"
							title="Liquidity Provision"
							description="Liquidity provision and market making strategies"
							defaultExpanded={false}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{MOCK_CATEGORIES[1].opportunities.map((opp, idx) => (
									<div
										key={idx}
										className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all"
									>
										<div className="flex justify-between items-start mb-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-700">
													{opp.protocol[0]}
												</div>
												<div>
													<h3 className="font-bold text-gray-900">{opp.protocol}</h3>
													<span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{opp.type}</span>
												</div>
											</div>
											<div
												className={`text-xs font-medium px-2 py-1 rounded-full ${
													opp.risk === "Low"
														? "bg-emerald-50 text-emerald-700 border border-emerald-200"
														: opp.risk === "Medium"
															? "bg-amber-50 text-amber-700 border border-amber-200"
															: "bg-rose-50 text-rose-700 border border-rose-200"
												}`}
											>
												{opp.risk} Risk
											</div>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-2xl font-bold text-green-600">{opp.supplyAPY}</span>
											<span className="text-sm text-gray-500">{opp.token}</span>
										</div>
									</div>
								))}
							</div>
						</CategorySection>
					</div>
				)}

				{/* Strategies Tab */}
				{activeTab === "strategies" && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
						{/* Left Side: Active Strategy from Database (Read-Only) */}
						<div className="space-y-6">
							{isLoadingStrategy ? (
								<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
									<div className="flex items-center justify-center py-12">
										<Loader2 className="w-8 h-8 animate-spin text-green-600" />
										<span className="ml-3 text-gray-600">Loading strategy configuration...</span>
									</div>
								</div>
							) : loadedStrategy ? (
								<>
									{/* Active Strategy Card */}
									<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-300 shadow-lg">
										<div className="flex items-start justify-between mb-6">
											<div>
												<div className="flex items-center gap-3 mb-2">
													<div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
														<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
															<path
																fillRule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clipRule="evenodd"
															/>
														</svg>
													</div>
													<h3 className="text-2xl font-bold text-gray-900">Active Strategy</h3>
												</div>
												<p className="text-sm text-gray-600 ml-13">{selectedPackage.name} Risk Profile</p>
											</div>
											<span
												className={`px-3 py-1 ${loadedStrategy ? "bg-green-600" : "bg-gray-400"} text-white text-xs font-bold rounded-full shadow-md`}
											>
												{loadedStrategy ? "CONFIGURED" : "UNCONFIGURED"}
											</span>
										</div>

										{/* Strategy Details */}
										<div className="space-y-4">
											<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-green-200">
												<p className="text-xs font-semibold text-gray-500 mb-3">PROTOCOL ALLOCATION</p>
												<div className="space-y-3">
													{/* Aave */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															<img src={AaveLogo} alt="Aave" className="w-8 h-8" />
															<span className="text-sm font-medium text-gray-700">Aave V3</span>
														</div>
														<span className="text-2xl font-bold text-gray-900">
															{loadedStrategy.lending?.aave || 0}%
														</span>
													</div>

													{/* Compound */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															<img src={CompoundLogo} alt="Compound" className="w-8 h-8" />
															<span className="text-sm font-medium text-gray-700">Compound V3</span>
														</div>
														<span className="text-2xl font-bold text-gray-900">
															{loadedStrategy.lending?.compound || 0}%
														</span>
													</div>

													{/* Morpho */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-3">
															<img src={MorphoLogo} alt="Morpho" className="w-8 h-8" />
															<span className="text-sm font-medium text-gray-700">Morpho</span>
														</div>
														<span className="text-2xl font-bold text-gray-900">
															{loadedStrategy.lending?.morpho || 0}%
														</span>
													</div>
												</div>
											</div>

											{/* Expected APY */}
											<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-green-200">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-xs font-semibold text-gray-500 mb-1">EXPECTED APY</p>
														{isAPYLoading ? (
															<div className="flex items-center gap-2">
																<Loader2 className="w-4 h-4 animate-spin text-gray-400" />
																<p className="text-sm text-gray-400">Loading...</p>
															</div>
														) : (
															<p className="text-sm text-gray-600">Based on current protocol rates</p>
														)}
													</div>
													<div className="text-right">
														{isAPYLoading ? (
															<div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
														) : (
															<p className="text-3xl font-bold text-green-600">{blendedAPY}%</p>
														)}
													</div>
												</div>
											</div>
										</div>

										{/* Configure Button */}
										<div className="mt-6">
											<a
												href={`/dashboard/products/${activeProductId}`}
												className="block w-full py-4 px-6 bg-white border-2 border-green-600 text-green-700 rounded-2xl font-semibold text-center hover:bg-green-50 transition-all shadow-sm hover:shadow-md"
											>
												<div className="flex items-center justify-center gap-2">
													<Settings className="w-5 h-5" />
													<span>Configure Risk Profile</span>
												</div>
											</a>
										</div>
									</div>

									{/* Info Card */}
									<div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
										<div className="flex items-start gap-3">
											<Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
											<div>
												<h4 className="font-semibold text-blue-900 mb-1">How It Works</h4>
												<p className="text-sm text-blue-700 leading-relaxed">
													Your deposits are automatically allocated across protocols according to this strategy. To
													change your risk profile or adjust allocations, click "Configure Risk Profile" above.
												</p>
											</div>
										</div>
									</div>
								</>
							) : (
								<div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-8">
									<div className="text-center py-8">
										<div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<Settings className="w-8 h-8 text-yellow-600" />
										</div>
										<h3 className="text-xl font-bold text-gray-900 mb-2">No Strategy Configured</h3>
										<p className="text-gray-600 mb-6">
											Set up your risk profile and protocol allocations to start earning.
										</p>
										<a
											href={`/dashboard/products/${activeProductId}`}
											className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-all"
										>
											<Settings className="w-5 h-5" />
											<span>Configure Strategy Now</span>
										</a>
									</div>
								</div>
							)}
						</div>

						{/* Right Side: Execute Actions (Deposit & Withdraw) */}
						<div className="space-y-6">
							{/* Balance Card */}
							<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
								<h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Your Balance</h3>
								{balanceLoading ? (
									<div className="animate-pulse space-y-3">
										<div className="h-12 bg-gray-200 rounded w-48"></div>
										<div className="h-4 bg-gray-200 rounded w-32"></div>
									</div>
								) : balanceError ? (
									<div className="text-center py-6">
										<p className="text-red-500 text-sm mb-2">Error loading balance</p>
										<p className="text-xs text-gray-400">Please try refreshing the page</p>
									</div>
								) : balanceData ? (
									<>
										<div className="mb-2">
											<p className="text-4xl font-bold text-gray-900">
												$
												{balanceData.totalBalance.toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
												<span className="text-lg text-gray-500 ml-2 font-normal">USDC</span>
											</p>
										</div>
										<p className="text-sm text-gray-600 mb-2">
											Idle: ${balanceData.totalIdleBalance.toFixed(2)} • Earning: $
											{balanceData.totalEarningBalance.toFixed(2)}
										</p>
										<p className="text-sm text-green-600 font-medium">
											Yield Earned: $
											{balanceData.totalCumulativeYield.toLocaleString(undefined, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</p>
									</>
								) : (
									<>
										<div className="mb-2">
											<p className="text-4xl font-bold text-gray-900">
												$0.00
												<span className="text-lg text-gray-500 ml-2 font-normal">USDC</span>
											</p>
										</div>
										<p className="text-sm text-gray-500">No deposits yet. Click "Deposit" to start earning yield.</p>
									</>
								)}
							</div>

							{/* Action Buttons */}
							<div className="space-y-4">
								{/* Deposit Button */}
								<button
									onClick={() => {
										setShowDepositModal(true)
									}}
									disabled={balanceLoading || !balanceData || !loadedStrategy}
									className="w-full group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
								>
									<div className="relative z-10 flex items-center justify-between">
										<div className="text-left">
											<div className="flex items-center gap-3 mb-2">
												<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
													<ArrowDownToLine className="w-5 h-5" />
												</div>
												<span className="text-2xl font-bold">Deposit</span>
											</div>
											<p className="text-sm text-white/80">
												{loadedStrategy ? "Fund your yield strategy" : "Configure strategy first"}
											</p>
										</div>
										<svg
											className="w-8 h-8 transform group-hover:translate-x-1 transition-transform"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
										</svg>
									</div>
									<div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
								</button>

								{/* Withdraw Button */}
								<button
									onClick={() => {
										setShowWithdrawModal(true)
									}}
									disabled={balanceLoading || !balanceData || !loadedStrategy}
									className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
								>
									<div className="relative z-10 flex items-center justify-between">
										<div className="text-left">
											<div className="flex items-center gap-3 mb-2">
												<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
													<ArrowUpFromLine className="w-5 h-5" />
												</div>
												<span className="text-2xl font-bold">Withdraw</span>
											</div>
											<p className="text-sm text-white/80">
												{loadedStrategy ? "Access your funds" : "Configure strategy first"}
											</p>
										</div>
										<svg
											className="w-8 h-8 transform group-hover:translate-x-1 transition-transform"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
										</svg>
									</div>
									<div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
								</button>
							</div>

							{/* Stats Card */}
							{loadedStrategy && (
								<div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
									<h4 className="text-sm font-semibold text-gray-700 mb-4">Quick Stats</h4>
									<div className="space-y-3">
										<div className="flex items-center justify-between py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">Risk Profile</span>
											<span className="text-sm font-semibold text-gray-900">{selectedPackage.name}</span>
										</div>
										<div className="flex items-center justify-between py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">Expected APY</span>
											{isAPYLoading ? (
												<div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
											) : (
												<span className="text-sm font-semibold text-green-600">{blendedAPY}%</span>
											)}
										</div>
										<div className="flex items-center justify-between py-2">
											<span className="text-sm text-gray-600">Protocols</span>
											<span className="text-sm font-semibold text-gray-900">3 Active</span>
										</div>
									</div>
								</div>
							)}

							{/* Tips Card */}
							<div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
								<div className="flex items-start gap-3">
									<div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
										<svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									</div>
									<div>
										<h4 className="font-semibold text-purple-900 mb-1 text-sm">Pro Tip</h4>
										<p className="text-xs text-purple-700 leading-relaxed">
											Deposits are processed instantly. Your funds start earning yield immediately according to your
											configured strategy.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Transaction History Tab */}
				{activeTab === "history" && (
					<div className="mt-6">
						<TransactionHistory />
					</div>
				)}
			</div>

			{/* Deposit Modal */}
			{/* ✅ Modal automatically uses activeProductId from store via useProducts() hook */}
			{/* ✅ Strategy from database (loadedStrategy) is used by the deposit execution */}
			<EarnDepositModal
				isOpen={showDepositModal}
				onClose={() => {
					setShowDepositModal(false)
					// Refresh balance after deposit
					void queryClient.invalidateQueries({ queryKey: ["clientWalletBalance"] })
				}}
				onComplete={() => {
					// Refresh balance after successful deposit
					void queryClient.invalidateQueries({ queryKey: ["clientWalletBalance"] })
				}}
				configuredRiskProfile={selectedPackage.riskLevel}
				configuredBlendedAPY={blendedAPY}
				hasConfiguredStrategy={!!loadedStrategy}
			/>

			{/* Withdrawal Modal */}
			{/* ✅ Modal automatically uses activeProductId from store via useProducts() hook */}
			<WithdrawalExecutionModal
				isOpen={showWithdrawModal}
				onClose={() => {
					setShowWithdrawModal(false)
					// Refresh balance after withdrawal
					void queryClient.invalidateQueries({ queryKey: ["clientWalletBalance"] })
				}}
			/>
		</div>
	)
}
