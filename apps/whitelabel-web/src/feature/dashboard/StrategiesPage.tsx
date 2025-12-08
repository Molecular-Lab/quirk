import { useState, useEffect } from "react"
import axios from "axios"
import { useAllDeFiProtocols } from "../../hooks/useDeFiProtocols"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/api/v1"

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

export function StrategiesPage() {
	const [selectedPackage, setSelectedPackage] = useState<RiskPackage>(PACKAGES[0])
	const [showTooltip, setShowTooltip] = useState<string | null>(null)
	const [isOptimizing, setIsOptimizing] = useState(false)

	// Fetch real DeFi protocol data
	const { protocols, isLoading, errors } = useAllDeFiProtocols("USDC", 8453)

	// Data freshness countdown (60 seconds until next refetch)
	const [countdown, setCountdown] = useState(60)

	useEffect(() => {
		// Reset countdown to 60 when data is refetched
		setCountdown(60)

		// Start countdown timer
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					return 60 // Reset to 60 when it reaches 0 (data will refetch automatically)
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [protocols]) // Reset countdown when protocols data changes

	// Protocol allocations (replaces strategies)
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
			// Call backend optimize endpoint
			const response = await axios.post(`${API_BASE_URL}/defi/optimize`, {
				riskProfile: { level: pkg.riskLevel },
				token: "USDC",
				chainId: 8453,
			})

			const { allocation } = response.data

			// Map backend allocation to UI format
			const newAllocations: ProtocolAllocation[] = allocation.map((alloc: any) => ({
				id: alloc.protocol,
				name: alloc.protocol === "aave" ? "Aave V3" : alloc.protocol === "compound" ? "Compound V3" : "Morpho",
				description: alloc.rationale,
				allocation: alloc.percentage,
				expectedAPY: alloc.expectedAPY,
				tvl: alloc.tvl,
			}))

			setAllocations(newAllocations)
		} catch (error) {
			console.error("Failed to optimize allocation:", error)
			// Fallback to default allocations on error
			alert("Failed to get optimized allocation. Using default strategy.")
		} finally {
			setIsOptimizing(false)
		}
	}

	const updateAllocation = (id: string, value: string) => {
		const numValue = parseInt(value) ?? 0
		const constrainedValue = Math.min(Math.max(0, numValue), 100)

		setAllocations((prev) => prev.map((s) => (s.id === id ? { ...s, allocation: constrainedValue } : s)))
	}

	const totalAllocation = allocations.reduce((sum, s) => sum + s.allocation, 0)
	const isValid = totalAllocation === 100

	const handleSave = () => {
		// TODO: Save to backend
		console.log("Saving strategy allocation:", allocations)
		console.log("Selected package:", selectedPackage)
		alert("Configuration saved! (Mock implementation)")
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto px-8 py-6">
				{/* Two Column Layout - Fixed Height */}
				<div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 h-[calc(100vh-48px)]">
					{/* Left Column: Protocol Data, Packages Bottom */}
					<div className="flex flex-col gap-6 overflow-hidden">
						{/* Protocol Data Section */}
						<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-bold text-gray-900">Live Protocol Data</h3>

								{/* Data Freshness Indicator */}
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
										<span className="text-xs text-gray-600">
											Updates in <span className="font-semibold text-gray-900">{countdown}s</span>
										</span>
									</div>
									<div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
										<div
											className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
											style={{ width: `${(countdown / 60) * 100}%` }}
										/>
									</div>
								</div>
							</div>

							{isLoading ? (
								<div className="grid grid-cols-3 gap-4">
									{[1, 2, 3].map((i) => (
										<div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-pulse">
											<div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
											<div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
											<div className="h-4 bg-gray-200 rounded w-16"></div>
										</div>
									))}
								</div>
							) : errors.length > 0 ? (
								<div className="bg-red-50 border border-red-200 rounded-2xl p-4">
									<p className="text-red-700 text-sm">⚠ Some protocols failed to load</p>
								</div>
							) : (
								<div className="grid grid-cols-3 gap-4">
									{protocols.map((protocol) => {
										const protocolName = protocol.protocol === "aave" ? "Aave V3" : protocol.protocol === "compound" ? "Compound V3" : "Morpho"
										const tvlFormatted = `$${(parseFloat(protocol.tvl) / 1_000_000).toFixed(1)}M`

										return (
											<div key={protocol.protocol} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
												<div className="flex items-center gap-3 mb-4">
													<div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
														{protocolName[0]}
													</div>
													<div>
														<h4 className="font-bold text-gray-900">{protocolName}</h4>
														<span className="text-xs text-gray-500">{protocol.token}</span>
													</div>
												</div>
												<div className="space-y-2">
													<div>
														<p className="text-xs text-gray-500">Supply APY</p>
														<p className="text-2xl font-bold text-green-600">{parseFloat(protocol.supplyAPY).toFixed(2)}%</p>
													</div>
													<div className="flex justify-between text-xs">
														<span className="text-gray-500">TVL:</span>
														<span className="font-semibold text-gray-900">{tvlFormatted}</span>
													</div>
													<div className="flex justify-between text-xs">
														<span className="text-gray-500">Utilization:</span>
														<span className="font-semibold text-gray-900">{parseFloat(protocol.utilization).toFixed(1)}%</span>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							)}
						</div>

						{/* Package Selection - Bottom */}
						<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
							<h3 className="text-lg font-bold text-gray-900 mb-6">Choose Your Risk Profile</h3>

							{isOptimizing && (
								<div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
									<p className="text-blue-700 text-sm flex items-center gap-2">
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
												? "bg-gray-50 border-2 border-gray-900"
												: "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
										}`}
									>
										{selectedPackage.id === pkg.id && (
											<div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
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
					</div>

					{/* Right Column: Protocol Allocation - Fit in 100vh */}
					<div className="flex flex-col gap-3 overflow-y-auto pr-2">
						<div className="sticky top-0 bg-white py-2 z-10">
							<h3 className="text-base font-semibold text-gray-900">Protocol Allocation</h3>
						</div>

						{/* Protocol Allocation Cards - Clean Minimal Style */}
						{allocations.map((strategy) => (
							<div key={strategy.id} className="bg-white border border-gray-200 rounded-3xl p-6">
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

								{/* Large number input - minimal style */}
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

						{/* Total Allocation - Minimal Style */}
						<div
							className={`bg-white border rounded-3xl p-6 ${
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

						{/* Save Button - Minimal Style */}
						<button
							onClick={handleSave}
							disabled={!isValid}
							className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
								isValid ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-300 cursor-not-allowed"
							}`}
						>
							Save Configuration
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
