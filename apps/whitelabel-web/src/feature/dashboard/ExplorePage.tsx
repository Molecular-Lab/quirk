// Featured portfolios matching Glider.fi's Explore page
const featuredPortfolios = [
	{
		id: 1,
		name: "The Big Five",
		description: "An equal weighted portfolio of BTC, ETH, SOL, XRP and DOGE.",
		icons: ["₿", "Ξ", "◎", "X", "Ð"],
		users: "1,034",
		totalDeposits: "$7,360.51",
		allTimeReturn: "+1.70%",
		returnPositive: true,
	},
	{
		id: 2,
		name: "50/50 BTC and ETH",
		description: "Holds 50% BTC and 50% Ethereum.",
		icons: ["₿", "Ξ"],
		users: "569",
		totalDeposits: "$22,974.13",
		allTimeReturn: "+31.20%",
		returnPositive: true,
	},
	{
		id: 3,
		name: "DeFi Token Mix",
		description: "The biggest DeFi protocol tokens on Base equally weighted.",
		icons: ["🔷", "🔵", "⭐"],
		users: "866",
		totalDeposits: "$12,617.30",
		allTimeReturn: "-15.92%",
		returnPositive: false,
	},
]

const categories = [
	{ name: "DeFi", portfolios: 3, totalDeposits: "$21,908.68" },
	{ name: "Trending Tokens", portfolios: 12, totalDeposits: "$1,771,665.06" },
	{ name: "Most Users", portfolios: 8, totalDeposits: "$943,218.45" },
]

export function ExplorePage() {
	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header */}
				<div className="mb-10">
					<h1 className="text-[32px] font-bold text-gray-900 mb-2">Explore</h1>
					<p className="text-gray-600">Discover and invest in pre-built portfolios created by the community</p>
				</div>

				{/* Featured Portfolios */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
					{featuredPortfolios.map((portfolio) => (
						<div
							key={portfolio.id}
							className="bg-gray-50 rounded-3xl p-6 hover:shadow-lg transition-all cursor-pointer group"
						>
							{/* Icons */}
							<div className="flex items-center gap-2 mb-4">
								{portfolio.icons.map((icon, idx) => (
									<div
										key={idx}
										className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold"
									>
										{icon}
									</div>
								))}
							</div>

							{/* Title & Description */}
							<h3 className="text-lg font-bold text-gray-900 mb-2">{portfolio.name}</h3>
							<p className="text-sm text-gray-600 mb-6 leading-relaxed">{portfolio.description}</p>

							{/* Stats */}
							<div className="grid grid-cols-3 gap-4">
								<div>
									<div className="text-xs text-gray-500 mb-1">Users</div>
									<div className="text-sm font-semibold text-gray-900">{portfolio.users}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500 mb-1">Total Deposits</div>
									<div className="text-sm font-semibold text-gray-900">{portfolio.totalDeposits}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500 mb-1">All Time Return</div>
									<div
										className={`text-sm font-semibold ${
											portfolio.returnPositive ? "text-primary-500" : "text-red-500"
										}`}
									>
										{portfolio.allTimeReturn}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Categories */}
				<div>
					<h2 className="text-[28px] font-bold text-gray-900 mb-6">Browse by Category</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{categories.map((category) => (
							<div
								key={category.name}
								className="bg-gray-50 rounded-3xl p-6 hover:shadow-lg transition-all cursor-pointer group"
							>
								<div className="flex items-start justify-between mb-4">
									<h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
									<svg
										className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Portfolios</span>
										<span className="text-sm font-semibold text-gray-900">{category.portfolios}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Total Deposits</span>
										<span className="text-sm font-semibold text-gray-900">{category.totalDeposits}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
