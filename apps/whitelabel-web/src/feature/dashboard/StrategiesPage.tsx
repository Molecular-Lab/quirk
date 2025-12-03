import { useState } from "react"

interface DeFiStrategy {
	id: string
	name: string
	description: string
	allocation: number
}

interface RevenuePackage {
	id: number
	name: string
	pureAPY: number
	clientTakes: number
	endUserGets: number
	strategies: {
		arbitrage: number
		defiStaking: number
		placingLP: number
	}
}

const PACKAGES: RevenuePackage[] = [
	{
		id: 1,
		name: "Mercury",
		pureAPY: 4.5,
		clientTakes: 1.5,
		endUserGets: 3.0,
		strategies: { arbitrage: 10, defiStaking: 45, placingLP: 45 },
	},
	{
		id: 2,
		name: "Molecular",
		pureAPY: 5.0,
		clientTakes: 2.0,
		endUserGets: 3.0,
		strategies: { arbitrage: 20, defiStaking: 40, placingLP: 40 },
	},
	{
		id: 3,
		name: "Neutron",
		pureAPY: 5.5,
		clientTakes: 2.5,
		endUserGets: 3.0,
		strategies: { arbitrage: 30, defiStaking: 35, placingLP: 35 },
	},
]

export function StrategiesPage() {
	const [selectedPackage, setSelectedPackage] = useState<RevenuePackage>(PACKAGES[0])
	const [showTooltip, setShowTooltip] = useState<string | null>(null)
	const [strategies, setStrategies] = useState<DeFiStrategy[]>([
		{
			id: "arbitrage",
			name: "Arbitrage",
			description: "Profit from price differences across exchanges",
			allocation: 10,
		},
		{
			id: "defiStaking",
			name: "Lending/Borrowing DeFi Staking",
			description: "Lend assets to borrowers via DeFi protocols (AAVE, Compound)",
			allocation: 45,
		},
		{
			id: "placingLP",
			name: "Placing LP",
			description: "Provide liquidity to DEX pools and earn trading fees",
			allocation: 45,
		},
	])

	const [chatMessages] = useState([
		{
			role: "assistant",
			content: "Hi! I'm your AI advisor.",
			timestamp: "10:30 AM",
		},
		{
			role: "assistant",
			content:
				"I've analyzed different revenue packages for you. Mercury is recommended for balanced growth with conservative risk.",
			timestamp: "10:30 AM",
		},
	])

	const handlePackageSelect = (pkg: RevenuePackage) => {
		setSelectedPackage(pkg)
		setStrategies([
			{
				id: "arbitrage",
				name: "Arbitrage",
				description: "Profit from price differences across exchanges",
				allocation: pkg.strategies.arbitrage,
			},
			{
				id: "defiStaking",
				name: "Lending/Borrowing DeFi Staking",
				description: "Lend assets to borrowers via DeFi protocols (AAVE, Compound)",
				allocation: pkg.strategies.defiStaking,
			},
			{
				id: "placingLP",
				name: "Placing LP",
				description: "Provide liquidity to DEX pools and earn trading fees",
				allocation: pkg.strategies.placingLP,
			},
		])
	}

	const updateAllocation = (id: string, value: string) => {
		const numValue = parseInt(value) || 0
		const constrainedValue = Math.min(Math.max(0, numValue), 100)

		setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, allocation: constrainedValue } : s)))
	}

	const totalAllocation = strategies.reduce((sum, s) => sum + s.allocation, 0)
	const isValid = totalAllocation === 100

	const handleSave = () => {
		// TODO: Save to backend
		console.log("Saving strategy allocation:", strategies)
		console.log("Selected package:", selectedPackage)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-[1600px] mx-auto px-8 py-6">
				{/* Two Column Layout - Fixed Height */}
				<div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-6 h-[calc(100vh-48px)]">
					{/* Left Column: Chat Top, Packages Bottom */}
					<div className="flex flex-col gap-6 overflow-hidden">
						{/* Chat Section - Top */}
						<div className="bg-white rounded-3xl p-8 border border-gray-200">
							<div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
								<div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
									<span className="text-white text-sm font-bold">AI</span>
								</div>
								<div>
									<h2 className="text-lg font-semibold text-gray-900">Strategy Advisor</h2>
									<p className="text-xs text-gray-500">Powered by Claude AI</p>
								</div>
							</div>

							{/* Chat Messages */}
							<div className="space-y-4">
								{chatMessages.map((msg, idx) => (
									<div key={idx} className="flex items-start gap-3">
										<div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
											<span className="text-white text-xs font-bold">AI</span>
										</div>
										<div className="flex-1 bg-gray-50 rounded-2xl px-5 py-3 border border-gray-200">
											<p className="text-sm text-gray-800 leading-relaxed">{msg.content}</p>
											<span className="text-xs text-gray-400 mt-2 block">{msg.timestamp}</span>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Package Selection - Bottom */}
						<div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
							<h3 className="text-lg font-bold text-gray-900 mb-6">Choose Your Strategy Package</h3>

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
											Pure APY: <span className="font-semibold text-gray-900">{pkg.pureAPY}%</span>
										</div>
										<div className="flex items-center gap-2">
											<span
												className={`px-3 py-1 rounded-full text-xs font-medium ${
													pkg.id === 1
														? "bg-gray-100 text-gray-700"
														: pkg.id === 2
															? "bg-gray-200 text-gray-800"
															: "bg-gray-300 text-gray-900"
												}`}
											>
												{pkg.id === 1 ? "Low Risk" : pkg.id === 2 ? "Medium Risk" : "High Risk"}
											</span>
										</div>
									</button>
								))}
							</div>

							{/* Package Details */}
							<div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-bold text-gray-900 mb-1">{selectedPackage.name} Package</p>
										<p className="text-xs text-gray-600">
											Pure APY: {selectedPackage.pureAPY}% • Your Revenue: {selectedPackage.clientTakes}% • End-User
											Gets: {selectedPackage.endUserGets}%
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column: Portion Selection - Fit in 100vh */}
					<div className="flex flex-col gap-3 overflow-y-auto pr-2">
						<div className="sticky top-0 bg-white py-2 z-10">
							<h3 className="text-base font-semibold text-gray-900">Select Portion</h3>
						</div>

						{/* Strategy Input Cards - Clean Minimal Style */}
						{strategies.map((strategy) => (
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
