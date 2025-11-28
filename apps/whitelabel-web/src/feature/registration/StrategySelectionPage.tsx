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
		name: "Package 1",
		pureAPY: 4.5,
		clientTakes: 1.5,
		endUserGets: 3.0,
		strategies: { arbitrage: 10, defiStaking: 45, placingLP: 45 },
	},
	{
		id: 2,
		name: "Package 2",
		pureAPY: 5.0,
		clientTakes: 2.0,
		endUserGets: 3.0,
		strategies: { arbitrage: 20, defiStaking: 40, placingLP: 40 },
	},
	{
		id: 3,
		name: "Package 3",
		pureAPY: 5.5,
		clientTakes: 2.5,
		endUserGets: 3.0,
		strategies: { arbitrage: 30, defiStaking: 35, placingLP: 35 },
	},
]

export default function StrategySelectionPage() {
	const [selectedPackage, setSelectedPackage] = useState<RevenuePackage>(PACKAGES[0])
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
			content:
				"Hi! I'm your AI advisor. I've analyzed different revenue packages for you. Package 1 is recommended for balanced growth with conservative risk.",
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

	// TODO: Use totalAllocation for validation when form submission is implemented
	// const totalAllocation = strategies.reduce((sum, s) => sum + s.allocation, 0)

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* AI Chat + Package Selection Header */}
				<div className="bg-gray-50 rounded-3xl p-6 mb-6">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
							<span className="text-white text-sm font-bold">AI</span>
						</div>
						<h2 className="text-[20px] font-bold text-gray-900">Interactive Chat Analyzer</h2>
					</div>

					<p className="text-gray-700 mb-4">{chatMessages[0].content}</p>

					{/* Package Selection Buttons */}
					<div className="flex gap-3">
						{PACKAGES.map((pkg) => (
							<button
								key={pkg.id}
								onClick={() => {
									handlePackageSelect(pkg)
								}}
								className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${
									selectedPackage.id === pkg.id
										? "bg-primary-500 text-white shadow-lg"
										: "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
								}`}
							>
								{pkg.name}
							</button>
						))}
					</div>
				</div>

				{/* Header */}
				<div className="mb-6">
					<h1 className="text-[24px] font-bold text-gray-900 mb-2">Strategy Allocation Preview</h1>
					<p className="text-gray-600 text-sm">
						Selected: {selectedPackage.name} • Pure APY: {selectedPackage.pureAPY}% • You Get:{" "}
						{selectedPackage.clientTakes}% • End-User Gets: {selectedPackage.endUserGets}%
					</p>
				</div>

				{/* Strategy Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					{strategies.map((strategy) => (
						<div
							key={strategy.id}
							className="bg-gray-50 rounded-3xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]"
						>
							<h3 className="text-[20px] font-bold text-gray-900 mb-2">{strategy.name}</h3>
							<div className="text-[48px] font-bold text-primary-500 mb-2">{strategy.allocation}%</div>
							<p className="text-gray-600 text-sm">{strategy.description}</p>
						</div>
					))}
				</div>

				{/* Continue Button */}
				<button className="w-full py-4 rounded-full font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all">
					Complete Registration
				</button>
			</div>
		</div>
	)
}
