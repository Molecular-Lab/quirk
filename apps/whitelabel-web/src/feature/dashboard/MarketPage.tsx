import { useEnvironmentStore } from "@/store/environmentStore"
import { useUserStore } from "@/store/userStore"

import { CategorySection } from "../../components/market/CategorySection"
import { ProtocolCard } from "../../components/market/ProtocolCard"
import { useAllDeFiProtocols } from "../../hooks/useDeFiProtocols"
import { useUserBalance } from "../../hooks/useUserBalance"

// Mock data for non-DeFi categories (will be replaced with real data later)
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

export function MarketPage() {
	// Fetch real DeFi protocol data (Base chain)
	const { protocols, isLoading, errors } = useAllDeFiProtocols("USDC", 8453)

	const privyWalletAddress = useUserStore((state) => state.privyWalletAddress)
	const apiEnvironment = useEnvironmentStore((state) => state.apiEnvironment)

	// Fetch user's USDC balance
	const { data: balance, isLoading: balanceLoading } = useUserBalance({
		walletAddress: privyWalletAddress,
		environment: apiEnvironment,
		token: "usdc",
	})

	// 🐛 DEBUG: Log data to console (remove after Phase 1 testing)
	console.log("=== MARKET DASHBOARD DEBUG ===")
	console.log("Loading:", isLoading)
	console.log("Protocols:", protocols)
	console.log("Errors:", errors)
	console.log("Balance:", balance)
	console.log("==============================")

	// Calculate best APY
	const bestAPY = protocols.length > 0 ? Math.max(...protocols.map((p) => parseFloat(p.supplyAPY))).toFixed(2) : "0.00"

	const bestProtocol = protocols.find((p) => parseFloat(p.supplyAPY).toFixed(2) === bestAPY)?.protocol || "N/A"

	// Calculate total TVL from real protocols
	const totalTVL = protocols.reduce((sum, p) => sum + parseFloat(p.tvl || "0"), 0)

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<div className="max-w-[1600px] mx-auto px-6 py-8">
				{/* Header with Balance */}
				<div className="mb-8 flex justify-between items-start">
					<div>
						<h1 className="text-[32px] font-bold text-gray-900 mb-2">Market Intelligence</h1>
						<p className="text-gray-600">Real-time DeFi analytics powered by Quirk Yield Engine</p>
					</div>
					<div className="text-right bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
						{balanceLoading ? (
							<div className="animate-pulse">
								<div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
								<div className="h-8 bg-gray-200 rounded w-32"></div>
							</div>
						) : balance ? (
							<>
								<p className="text-sm text-gray-500 mb-1">Custodial Balance</p>
								<p className="text-2xl font-bold text-gray-900">
									${balance.formatted}
									<span className="text-sm text-gray-500 ml-2">Mock USDC</span>
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

				<div className="space-y-6">
					{/* Market Categories */}
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

						{/* DeFi Category - Real Data */}
						<CategorySection
							id="defi"
							title="DeFi Lending"
							description="Decentralized protocols with real-time data from Yield Engine"
							defaultExpanded={true}
						>
							{isLoading ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{[1, 2, 3].map((i) => (
										<div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-pulse">
											<div className="h-10 bg-gray-200 rounded-full mb-3"></div>
											<div className="h-8 bg-gray-200 rounded mb-2"></div>
											<div className="h-6 bg-gray-200 rounded"></div>
										</div>
									))}
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{protocols.map((protocol) => (
										<ProtocolCard key={protocol.protocol} data={protocol} />
									))}
								</div>
							)}
						</CategorySection>

						{/* CeFi Category - Mock Data */}
						<CategorySection
							id="cefi"
							title="CeFi Yield"
							description="Centralized institutional lending partners"
							defaultExpanded={false}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

						{/* LP Category - Mock Data */}
						<CategorySection
							id="lp"
							title="Place LP"
							description="Liquidity provision and market making strategies"
							defaultExpanded={false}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
				</div>
			</div>
		</div>
	)
}
