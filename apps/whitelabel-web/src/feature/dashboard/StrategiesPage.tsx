import { useState, useEffect, useMemo } from "react"
import { useAPYCache } from "../../hooks/useAPYCache"
import { useAPYCacheStore, type Allocation } from "@/store/apyCacheStore"

interface ProtocolAllocation {
	id: "aave" | "compound" | "morpho"
	name: string
	description: string
	allocation: number
}

interface RiskPackage {
	id: number
	name: string
	riskLevel: "conservative" | "moderate" | "aggressive" | "custom"
	expectedAPY: string
	description: string
}

interface RiskPackageWithCustom extends RiskPackage {
	isCustom?: boolean
}

// Predefined strategy allocations - used for instant client-side calculation
const STRATEGY_ALLOCATIONS: Record<string, { aave: number; compound: number; morpho: number }> = {
	conservative: { aave: 60, compound: 30, morpho: 10 },
	moderate: { aave: 40, compound: 35, morpho: 25 },
	aggressive: { aave: 20, compound: 25, morpho: 55 },
}

const PACKAGES: RiskPackageWithCustom[] = [
	{
		id: 1,
		name: "Conservative",
		riskLevel: "conservative",
		expectedAPY: "3-4%",
		description: "Low risk, stable returns with established protocols",
	},
	{
		id: 2,
		name: "Moderate",
		riskLevel: "moderate",
		expectedAPY: "4-5%",
		description: "Balanced risk-reward with diversified allocation",
	},
	{
		id: 3,
		name: "Aggressive",
		riskLevel: "aggressive",
		expectedAPY: "5-6%",
		description: "Higher risk, maximum yield potential",
	},
	{
		id: 4,
		name: "Custom",
		riskLevel: "custom",
		expectedAPY: "You decide",
		description: "Build your own allocation strategy",
		isCustom: true,
	},
]

const PROTOCOL_INFO = {
	aave: { name: "Aave V3", description: "Established lending protocol with high TVL" },
	compound: { name: "Compound V3", description: "Battle-tested money market protocol" },
	morpho: { name: "Morpho", description: "Next-gen yield optimizer" },
}

export function StrategiesPage() {
	const [selectedPackage, setSelectedPackage] = useState<RiskPackageWithCustom>(PACKAGES[1]) // Default to Moderate
	const [showTooltip, setShowTooltip] = useState<string | null>(null)

	// Fetch APY data once on mount with 5-minute cache
	const { apys, isLoading, error, cacheAgeSeconds, lastFetchTimestamp, refetch } = useAPYCache("USDC", 8453)

	// Get calculateExpectedAPY function from store
	const calculateExpectedAPY = useAPYCacheStore((state) => state.calculateExpectedAPY)

	// Check if data is loaded
	const isDataFullyLoaded = useMemo(() => {
		return !isLoading && apys !== null
	}, [isLoading, apys])

	// Data freshness countdown (5 minutes = 300 seconds until next refetch)
	const REFRESH_INTERVAL = 300 // 5 minutes
	const [countdown, setCountdown] = useState(REFRESH_INTERVAL)

	useEffect(() => {
		// Calculate remaining time until next refresh
		const remainingSeconds = REFRESH_INTERVAL - cacheAgeSeconds
		setCountdown(Math.max(0, remainingSeconds))

		// Start countdown timer
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					return REFRESH_INTERVAL // Reset when it reaches 0 (data will refetch automatically)
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(timer)
	}, [lastFetchTimestamp, cacheAgeSeconds])

	// Protocol allocations state
	const [allocations, setAllocations] = useState<ProtocolAllocation[]>([])

	// Initialize allocations with Moderate strategy once data is loaded
	useEffect(() => {
		if (isDataFullyLoaded && allocations.length === 0) {
			const moderateAllocs = STRATEGY_ALLOCATIONS.moderate
			const initialAllocations: ProtocolAllocation[] = [
				{
					id: "aave",
					name: PROTOCOL_INFO.aave.name,
					description: PROTOCOL_INFO.aave.description,
					allocation: moderateAllocs.aave,
				},
				{
					id: "compound",
					name: PROTOCOL_INFO.compound.name,
					description: PROTOCOL_INFO.compound.description,
					allocation: moderateAllocs.compound,
				},
				{
					id: "morpho",
					name: PROTOCOL_INFO.morpho.name,
					description: PROTOCOL_INFO.morpho.description,
					allocation: moderateAllocs.morpho,
				},
			]
			setAllocations(initialAllocations)
		}
	}, [isDataFullyLoaded, allocations.length])

	// Real-time Expected APY calculation from cached APYs
	const expectedBlendedAPY = useMemo(() => {
		if (!apys || allocations.length === 0) {
			return "0.00"
		}

		// Convert allocations to the format expected by calculateExpectedAPY
		const allocs: Allocation[] = allocations.map((a) => ({
			protocol: a.id,
			percentage: a.allocation,
		}))

		return calculateExpectedAPY(allocs)
	}, [allocations, apys, calculateExpectedAPY])

	// Handle package selection - INSTANT, no API call
	const handlePackageSelect = (pkg: RiskPackageWithCustom) => {
		setSelectedPackage(pkg)

		// Custom mode - don't change allocations, let user adjust sliders
		if (pkg.isCustom) {
			return
		}

		// Get predefined allocations for this risk level
		const strategyAllocs = STRATEGY_ALLOCATIONS[pkg.riskLevel]
		if (!strategyAllocs) return

		// Update allocations instantly (no API call!)
		setAllocations((prev) =>
			prev.map((a) => ({
				...a,
				allocation: strategyAllocs[a.id],
			})),
		)
	}

	const updateAllocation = (id: string, value: string) => {
		const numValue = parseInt(value) ?? 0

		setAllocations((prev) => {
			// Calculate sum of OTHER allocations (not the one being changed)
			const otherAllocationsSum = prev.filter((a) => a.id !== id).reduce((sum, a) => sum + a.allocation, 0)

			// Max allowed for this protocol = 100 - sum of others
			const maxAllowed = 100 - otherAllocationsSum

			// Constrain value between 0 and maxAllowed
			const constrainedValue = Math.min(Math.max(0, numValue), maxAllowed)

			return prev.map((s) => (s.id === id ? { ...s, allocation: constrainedValue } : s))
		})
	}

	const totalAllocation = allocations.reduce((sum, s) => sum + s.allocation, 0)
	const isValid = totalAllocation === 100

	const handleSave = () => {
		// TODO: Save to backend
		console.log("Saving strategy allocation:", allocations)
		console.log("Selected package:", selectedPackage)
		alert("Configuration saved! (Mock implementation)")
	}

	// Show full-page loading skeleton until data is loaded
	if (!isDataFullyLoaded) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-[1600px] mx-auto px-8 py-6">
					<div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 h-[calc(100vh-48px)]">
						{/* Left Column Skeleton */}
						<div className="flex flex-col gap-6 overflow-hidden">
							{/* Protocol Data Skeleton */}
							<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm animate-pulse">
								<div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
								<div className="grid grid-cols-3 gap-4">
									{[1, 2, 3].map((i) => (
										<div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
											<div className="flex items-center gap-3 mb-4">
												<div className="w-10 h-10 rounded-full bg-gray-200"></div>
												<div className="flex-1">
													<div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
													<div className="h-3 bg-gray-200 rounded w-16"></div>
												</div>
											</div>
											<div className="space-y-2">
												<div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
												<div className="h-3 bg-gray-200 rounded w-full"></div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Package Selection Skeleton */}
							<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm animate-pulse">
								<div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
								<div className="grid grid-cols-4 gap-4">
									{[1, 2, 3, 4].map((i) => (
										<div key={i} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
											<div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
											<div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
											<div className="h-3 bg-gray-200 rounded w-full"></div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Right Column Skeleton */}
						<div className="flex flex-col gap-3">
							<div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
							{[1, 2, 3].map((i) => (
								<div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 animate-pulse">
									<div className="h-4 bg-gray-200 rounded w-24 mb-8"></div>
									<div className="h-16 bg-gray-200 rounded w-32"></div>
								</div>
							))}
							<div className="bg-white border-2 border-gray-200 rounded-3xl p-6 animate-pulse">
								<div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
								<div className="h-16 bg-gray-200 rounded w-32"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
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
								<h3 className="text-lg font-bold text-gray-900">Live Protocol APYs</h3>

								{/* Data Freshness Indicator */}
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
										<span className="text-xs text-gray-600">
											Updates in{" "}
											<span className="font-semibold text-gray-900">
												{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
											</span>
										</span>
									</div>
									<div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
										<div
											className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
											style={{ width: `${(countdown / REFRESH_INTERVAL) * 100}%` }}
										/>
									</div>
								</div>
							</div>

							{error ? (
								<div className="bg-red-50 border border-red-200 rounded-2xl p-4">
									<p className="text-red-700 text-sm">Failed to load protocol data</p>
									<button onClick={refetch} className="text-red-600 underline text-sm mt-2">
										Retry
									</button>
								</div>
							) : (
								<div className="grid grid-cols-3 gap-4">
									{(["aave", "compound", "morpho"] as const).map((protocol) => {
										const info = PROTOCOL_INFO[protocol]
										const apy = apys?.[protocol] || "0"

										return (
											<div
												key={protocol}
												className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
											>
												<div className="flex items-center gap-3 mb-4">
													<div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
														{info.name[0]}
													</div>
													<div>
														<h4 className="font-bold text-gray-900">{info.name}</h4>
														<span className="text-xs text-gray-500">USDC</span>
													</div>
												</div>
												<div>
													<p className="text-xs text-gray-500">Supply APY</p>
													<p className="text-2xl font-bold text-green-600">{parseFloat(apy).toFixed(2)}%</p>
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

							<div className="grid grid-cols-4 gap-4 mb-6">
								{PACKAGES.map((pkg) => (
									<button
										key={pkg.id}
										onClick={() => {
											handlePackageSelect(pkg)
										}}
										className={`relative p-5 rounded-2xl text-left transition-all duration-200 ${
											selectedPackage.id === pkg.id
												? pkg.isCustom
													? "bg-green-50 border-2 border-green-600"
													: "bg-gray-50 border-2 border-gray-900"
												: "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
										}`}
									>
										{selectedPackage.id === pkg.id && (
											<div
												className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center ${
													pkg.isCustom ? "bg-green-600" : "bg-gray-900"
												}`}
											>
												<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
										)}
										<div className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</div>
										<div className="text-sm text-gray-600 mb-2">
											Expected:{" "}
											<span className={`font-semibold ${pkg.isCustom ? "text-green-600" : "text-gray-900"}`}>
												{pkg.expectedAPY}
											</span>
										</div>
										<p className="text-xs text-gray-500 line-clamp-2">{pkg.description}</p>
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

						{/* Expected Blended APY - Real-time calculation */}
						<div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6">
							<div className="flex items-center justify-between mb-4">
								<span className="text-base text-blue-600 font-medium">Expected Blended APY</span>
								<span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">Live</span>
							</div>
							<div className="flex items-baseline gap-1">
								<span
									className="text-5xl font-bold text-blue-700"
									style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
								>
									{expectedBlendedAPY}
								</span>
								<span className="text-2xl text-blue-600">%</span>
							</div>
							<p className="text-xs text-blue-500 mt-3">Calculated from your allocation mix</p>
						</div>

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
									Must equal 100% (currently {totalAllocation > 100 ? "over" : "under"} by {Math.abs(100 - totalAllocation)}%)
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
