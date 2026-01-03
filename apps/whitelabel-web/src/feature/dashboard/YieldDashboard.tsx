import { useState } from "react"

import { useSearch } from "@tanstack/react-router"
import axios from "axios"

import { ENV } from "@/config/env"
import { useEnvironmentStore } from "@/store/environmentStore"
import { useUserStore } from "@/store/userStore"

import { ContextualAIPanel } from "../../components/chat/ContextualAIPanel"
import { CategorySection } from "../../components/market/CategorySection"
import { ProtocolCard } from "../../components/market/ProtocolCard"
import { useAllDeFiProtocols } from "../../hooks/useDeFiProtocols"
import { useUserBalance } from "../../hooks/useUserBalance"

const API_BASE_URL = ENV.API_URL

interface ProtocolAllocation {
	id: "aave" | "compound" | "morpho"
	name: string
	description: string
	allocation: number
	expectedAPY: string
	tvl: string
}

interface RiskPackage {
	id: number
	name: string
	riskLevel: "conservative" | "moderate" | "aggressive"
	expectedAPY: string
	description: string
}

interface CustomStrategy {
	id: string
	name: string
	description: string
	allocations: ProtocolAllocation[]
	createdAt: string
	expectedAPY?: string
}

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

type TabType = "explore" | "strategies"

export function YieldDashboard() {
	// Read tab from URL query params (for redirects from old routes)
	const searchParams = useSearch({ from: "/dashboard/yield" })
	const [activeTab, setActiveTab] = useState<TabType>((searchParams as any).tab || "explore")
	const [selectedPackage, setSelectedPackage] = useState<RiskPackage>(PACKAGES[0])
	const [showTooltip, setShowTooltip] = useState<string | null>(null)
	const [isOptimizing, setIsOptimizing] = useState(false)

	// Custom strategy state
	const [strategyMode, setStrategyMode] = useState<"preset" | "custom">("preset")
	const [customStrategyName, setCustomStrategyName] = useState("")
	const [customStrategyDescription, setCustomStrategyDescription] = useState("")
	const [savedStrategies, setSavedStrategies] = useState<CustomStrategy[]>(() => {
		const saved = localStorage.getItem("custom-strategies")
		return saved ? JSON.parse(saved) : []
	})
	const [selectedCustomStrategy, setSelectedCustomStrategy] = useState<CustomStrategy | null>(null)

	// Fetch real DeFi protocol data
	const { protocols, isLoading, errors } = useAllDeFiProtocols("USDC", 8453)

	const privyWalletAddress = useUserStore((state) => state.privyWalletAddress)
	const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)

	const { data: balance, isLoading: balanceLoading } = useUserBalance({
		walletAddress: privyWalletAddress,
		environment: apiEnvironment,
		token: "usdc",
	})

	// Protocol allocations
	const [allocations, setAllocations] = useState<ProtocolAllocation[]>([
		{
			id: "aave",
			name: "Aave V3",
			description: "Established lending protocol with high TVL",
			allocation: 50,
			expectedAPY: "0.00",
			tvl: "0",
		},
		{
			id: "compound",
			name: "Compound V3",
			description: "Battle-tested money market protocol",
			allocation: 30,
			expectedAPY: "0.00",
			tvl: "0",
		},
		{
			id: "morpho",
			name: "Morpho",
			description: "Next-gen yield optimizer",
			allocation: 20,
			expectedAPY: "0.00",
			tvl: "0",
		},
	])

	const handlePackageSelect = async (pkg: RiskPackage) => {
		setSelectedPackage(pkg)
		setIsOptimizing(true)

		try {
			// Updated API contract: send riskLevel directly (not nested in riskProfile)
			const response = await axios.post(`${API_BASE_URL}/defi/optimize`, {
				token: "USDC",
				chainId: 8453,
				riskLevel: pkg.riskLevel, // "conservative" | "moderate" | "aggressive"
			})

			const { allocation, expectedBlendedAPY, confidence } = response.data

			const newAllocations: ProtocolAllocation[] = allocation.map((alloc: any) => ({
				id: alloc.protocol,
				name: alloc.protocol === "aave" ? "Aave V3" : alloc.protocol === "compound" ? "Compound V3" : "Morpho",
				description: alloc.rationale,
				allocation: alloc.percentage,
				expectedAPY: alloc.expectedAPY,
				tvl: alloc.tvl,
			}))

			setAllocations(newAllocations)

			// Log optimization results for debugging
			console.log(`✅ Optimization complete:`, {
				riskLevel: pkg.riskLevel,
				blendedAPY: expectedBlendedAPY,
				confidence,
				allocations: newAllocations,
			})
		} catch (error) {
			console.error("Failed to optimize allocation:", error)
			alert("Failed to get optimized allocation. Using default strategy.")
		} finally {
			setIsOptimizing(false)
		}
	}

	const updateAllocation = (id: string, value: string) => {
		const numValue = parseInt(value) || 0
		const constrainedValue = Math.min(Math.max(0, numValue), 100)
		setAllocations((prev) => prev.map((s) => (s.id === id ? { ...s, allocation: constrainedValue } : s)))
	}

	const totalAllocation = allocations.reduce((sum, s) => sum + s.allocation, 0)
	const isValid = totalAllocation === 100

	const handleSave = () => {
		if (strategyMode === "custom") {
			handleSaveCustomStrategy()
		} else {
			console.log("Saving strategy allocation:", allocations)
			console.log("Selected package:", selectedPackage)
			alert("Configuration saved! (Mock implementation)")
		}
	}

	const handleSaveCustomStrategy = () => {
		if (!customStrategyName.trim()) {
			alert("Please enter a strategy name")
			return
		}

		const customStrategy: CustomStrategy = {
			id: Date.now().toString(),
			name: customStrategyName,
			description: customStrategyDescription,
			allocations: [...allocations],
			createdAt: new Date().toISOString(),
			expectedAPY: calculateBlendedAPY(),
		}

		const updatedStrategies = [...savedStrategies, customStrategy]
		setSavedStrategies(updatedStrategies)
		localStorage.setItem("custom-strategies", JSON.stringify(updatedStrategies))

		alert(`✓ Custom strategy "${customStrategyName}" saved successfully!`)
		setCustomStrategyName("")
		setCustomStrategyDescription("")
	}

	const loadCustomStrategy = (strategy: CustomStrategy) => {
		setAllocations(strategy.allocations)
		setSelectedCustomStrategy(strategy)
		setCustomStrategyName(strategy.name)
		setCustomStrategyDescription(strategy.description)
	}

	const deleteCustomStrategy = (strategyId: string) => {
		if (confirm("Are you sure you want to delete this strategy?")) {
			const updatedStrategies = savedStrategies.filter((s) => s.id !== strategyId)
			setSavedStrategies(updatedStrategies)
			localStorage.setItem("custom-strategies", JSON.stringify(updatedStrategies))

			if (selectedCustomStrategy?.id === strategyId) {
				setSelectedCustomStrategy(null)
				setCustomStrategyName("")
				setCustomStrategyDescription("")
			}
		}
	}

	const calculateBlendedAPY = () => {
		const totalAPY = allocations.reduce((sum, alloc) => {
			const apy = parseFloat(alloc.expectedAPY) || 0
			return sum + (apy * alloc.allocation) / 100
		}, 0)
		return totalAPY.toFixed(2)
	}

	const createNewCustomStrategy = () => {
		setStrategyMode("custom")
		setSelectedCustomStrategy(null)
		setCustomStrategyName("")
		setCustomStrategyDescription("")
		setAllocations([
			{
				id: "aave",
				name: "Aave V3",
				description: "Established lending protocol with high TVL",
				allocation: 34,
				expectedAPY: "0.00",
				tvl: "0",
			},
			{
				id: "compound",
				name: "Compound V3",
				description: "Battle-tested money market protocol",
				allocation: 33,
				expectedAPY: "0.00",
				tvl: "0",
			},
			{
				id: "morpho",
				name: "Morpho",
				description: "Next-gen yield optimizer",
				allocation: 33,
				expectedAPY: "0.00",
				tvl: "0",
			},
		])
	}

	// Calculate stats
	const bestAPY = protocols.length > 0 ? Math.max(...protocols.map((p) => parseFloat(p.supplyAPY))).toFixed(2) : "0.00"
	const bestProtocol = protocols.find((p) => parseFloat(p.supplyAPY).toFixed(2) === bestAPY)?.protocol || "N/A"
	const totalTVL = protocols.reduce((sum, p) => sum + parseFloat(p.tvl || "0"), 0)

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto px-6 py-6">
				{/* Header */}
				<div className="mb-6 flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Yield Manager</h1>
						<p className="text-gray-600">Explore protocols and manage your yield strategies</p>
					</div>
					<div className="text-right bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
						{balanceLoading ? (
							<div className="animate-pulse">
								<div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
								<div className="h-8 bg-gray-200 rounded w-32"></div>
							</div>
						) : balance ? (
							<>
								<p className="text-sm text-gray-500 mb-1">Available Balance</p>
								<p className="text-2xl font-bold text-gray-900">
									${balance.formatted}
									<span className="text-sm text-gray-500 ml-2">USDC</span>
								</p>
								<p className="text-xs text-gray-400 mt-1">
									Updates every 10s • {new Date(balance.lastUpdate).toLocaleTimeString()}
								</p>
							</>
						) : (
							<>
								<p className="text-sm text-gray-500">Your Balance</p>
								<p className="text-lg text-gray-400">Connect wallet</p>
							</>
						)}
					</div>
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
					<div className="grid grid-cols-1 lg:grid-cols-[1fr,420px,400px] gap-6">
						{/* Left Column */}
						<div className="space-y-6">
							{/* Mode Selector */}
							<div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-bold text-gray-900">Strategy Type</h3>
									{savedStrategies.length > 0 && (
										<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
											{savedStrategies.length} saved
										</span>
									)}
								</div>

								<div className="flex gap-3">
									<button
										onClick={() => {
											setStrategyMode("preset")
										}}
										className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
											strategyMode === "preset"
												? "bg-green-600 text-white shadow-md"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										📋 Preset Strategies
									</button>
									<button
										onClick={createNewCustomStrategy}
										className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
											strategyMode === "custom"
												? "bg-green-600 text-white shadow-md"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										✨ Create Custom
									</button>
								</div>

								{/* Saved Strategies List */}
								{strategyMode === "custom" && savedStrategies.length > 0 && (
									<div className="mt-4 pt-4 border-t border-gray-200">
										<p className="text-sm font-semibold text-gray-700 mb-3">Your Saved Strategies</p>
										<div className="space-y-2 max-h-48 overflow-y-auto">
											{savedStrategies.map((strategy) => (
												<div
													key={strategy.id}
													className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
														selectedCustomStrategy?.id === strategy.id
															? "border-green-500 bg-green-50"
															: "border-gray-200 hover:border-gray-300 bg-white"
													}`}
													onClick={() => {
														loadCustomStrategy(strategy)
													}}
												>
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<p className="font-semibold text-sm text-gray-900">{strategy.name}</p>
															{strategy.description && (
																<p className="text-xs text-gray-600 mt-1">{strategy.description}</p>
															)}
															<div className="flex items-center gap-3 mt-2">
																<span className="text-xs text-gray-500">
																	APY: <span className="font-semibold text-green-600">{strategy.expectedAPY}%</span>
																</span>
																<span className="text-xs text-gray-400">
																	{new Date(strategy.createdAt).toLocaleDateString()}
																</span>
															</div>
														</div>
														<button
															onClick={(e) => {
																e.stopPropagation()
																deleteCustomStrategy(strategy.id)
															}}
															className="ml-2 text-red-500 hover:text-red-700 transition-colors"
															title="Delete strategy"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																/>
															</svg>
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Custom Strategy Name/Description */}
								{strategyMode === "custom" && (
									<div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Strategy Name *</label>
											<input
												type="text"
												value={customStrategyName}
												onChange={(e) => {
													setCustomStrategyName(e.target.value)
												}}
												placeholder="e.g., Conservative High-TVL Strategy"
												className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
											<textarea
												value={customStrategyDescription}
												onChange={(e) => {
													setCustomStrategyDescription(e.target.value)
												}}
												placeholder="Describe your strategy..."
												rows={2}
												className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
											/>
										</div>
										<div className="bg-green-50 border border-green-200 rounded-xl p-3">
											<p className="text-sm text-green-700">
												💡 <span className="font-semibold">Expected Blended APY:</span> {calculateBlendedAPY()}%
											</p>
										</div>
									</div>
								)}
							</div>

							{/* Package Selection - Only show for preset mode */}
							{strategyMode === "preset" && (
								<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
									<h3 className="text-lg font-bold text-gray-900 mb-6">Choose Your Risk Profile</h3>

									{isOptimizing && (
										<div className="mb-4 bg-green-50 border border-green-200 rounded-2xl p-4">
											<p className="text-green-700 text-sm flex items-center gap-2">
												<span className="animate-spin">⚙️</span> Optimizing allocation...
											</p>
										</div>
									)}

									<div className="grid grid-cols-3 gap-4 mb-6">
										{PACKAGES.map((pkg) => (
											<button
												key={pkg.id}
												onClick={() => {
													handlePackageSelect(pkg)
												}}
												className={`relative p-6 rounded-2xl text-left transition-all duration-200 ${
													selectedPackage.id === pkg.id
														? "bg-green-50 border-2 border-green-600"
														: "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
												}`}
											>
												{selectedPackage.id === pkg.id && (
													<div className="absolute -top-2 -right-2 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
														<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
															<path
																fillRule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clipRule="evenodd"
															/>
														</svg>
													</div>
												)}
												<div className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</div>
												<div className="text-sm text-gray-600 mb-3">
													Expected APY: <span className="font-semibold text-gray-900">{pkg.expectedAPY}</span>
												</div>
												<p className="text-xs text-gray-500">{pkg.description}</p>
											</button>
										))}
									</div>

									{/* Package Details */}
									<div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200">
										<div>
											<p className="text-sm font-bold text-gray-900 mb-1">{selectedPackage.name} Strategy</p>
											<p className="text-xs text-gray-600">{selectedPackage.description}</p>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Right Column: Protocol Allocation */}
						<div className="flex flex-col gap-3">
							<div className="sticky top-6">
								<h3 className="text-base font-semibold text-gray-900 mb-4">Protocol Allocation</h3>

								{/* Allocation Cards */}
								{allocations.map((strategy) => (
									<div key={strategy.id} className="bg-white border border-gray-200 rounded-3xl p-6 mb-3">
										<div className="flex items-center justify-between mb-8">
											<div className="flex items-center gap-2">
												<span className="text-base text-gray-500">{strategy.name}</span>
												<button
													onMouseEnter={() => {
														setShowTooltip(strategy.id)
													}}
													onMouseLeave={() => {
														setShowTooltip(null)
													}}
													className="relative text-gray-400 hover:text-gray-600"
												>
													<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
														<path
															fillRule="evenodd"
															d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
															clipRule="evenodd"
														/>
													</svg>
													{showTooltip === strategy.id && (
														<div className="absolute left-6 top-0 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 z-20 shadow-xl">
															{strategy.description}
															<div className="absolute -left-1 top-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
														</div>
													)}
												</button>
											</div>
										</div>

										{/* Large number input */}
										<div className="relative">
											<input
												type="number"
												min="0"
												max="100"
												value={strategy.allocation}
												onChange={(e) => {
													updateAllocation(strategy.id, e.target.value)
												}}
												className="w-full text-6xl font-normal text-gray-900 bg-transparent border-none p-0 focus:outline-none appearance-none"
												style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
											/>
											<span className="absolute right-0 top-2 text-3xl text-gray-900">%</span>
										</div>
									</div>
								))}

								{/* Total Allocation */}
								<div
									className={`bg-white border rounded-3xl p-6 mb-3 ${
										totalAllocation === 100 ? "border-green-500" : "border-red-500"
									}`}
								>
									<div className="flex items-center justify-between mb-6">
										<span className="text-base text-gray-500">Total Allocation</span>
									</div>
									<div className="flex items-center justify-between">
										<span
											className={`text-6xl font-normal ${totalAllocation === 100 ? "text-green-600" : "text-red-600"}`}
											style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
										>
											{totalAllocation}%
										</span>
									</div>
									{totalAllocation !== 100 && (
										<p className="text-xs text-red-600 mt-4">
											Must equal 100% (currently {totalAllocation > 100 ? "over" : "under"} by{" "}
											{Math.abs(100 - totalAllocation)}%)
										</p>
									)}
								</div>

								{/* Save Button */}
								<button
									onClick={handleSave}
									disabled={!isValid || (strategyMode === "custom" && !customStrategyName.trim())}
									className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
										isValid && (strategyMode === "preset" || customStrategyName.trim())
											? "bg-green-600 hover:bg-green-700"
											: "bg-gray-300 cursor-not-allowed"
									}`}
								>
									{strategyMode === "custom" ? "💾 Save Custom Strategy" : "Save Configuration"}
								</button>
								{strategyMode === "custom" && !customStrategyName.trim() && isValid && (
									<p className="text-xs text-amber-600 mt-2 text-center">
										⚠ Please enter a strategy name above to save
									</p>
								)}
							</div>
						</div>

						{/* Right Column: AI Advisory Panel */}
						<div className="lg:col-span-1">
							<div className="sticky top-6">
								<ContextualAIPanel
									allocations={allocations}
									strategyMode={strategyMode}
									strategyName={strategyMode === "custom" ? customStrategyName : selectedPackage.name}
									isVisible={true}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
