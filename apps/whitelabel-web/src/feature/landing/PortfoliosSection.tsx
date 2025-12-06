export function PortfoliosSection() {
	const portfolios = [
		{
			title: "Capital Preservation",
			icon: "🛡️",
			gradient: "from-green-400 to-emerald-500",
			features: [
				"Low volatility",
				"Daily liquidity",
				"Ideal for fintechs offering savings alternative, corporate treasury, exchanges seeking stable client yield",
			],
		},
		{
			title: "Balanced Yield",
			icon: "⚖️",
			gradient: "from-blue-400 to-indigo-500",
			features: [
				"Optimized return vs risk",
				"Actively managed allocations",
				"Ideal for fintechs, exchanges, and business accounts, treasury seeking enhanced returns",
			],
		},
		{
			title: "Enhanced Return & Alpha",
			icon: "🎯",
			gradient: "from-purple-400 to-pink-500",
			features: [
				"Alpha-seeking yield strategies",
				"Directional market exposure",
				"Ideal for performance-driven growth",
			],
		},
		{
			title: "Custom Solutions",
			icon: "💼",
			gradient: "from-indigo-400 to-purple-500",
			isCustom: true,
			features: ["Tailored to your needs", "Scale as you grow", "White-label ready"],
		},
	]

	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-semibold text-gray-900 mb-4">
						One Platform,
						<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
							{" "}
							Many Portfolios
						</span>
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Delivering customizable risk-adjusted yield for digital assets
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{portfolios.map((portfolio, idx) => (
						<div
							key={idx}
							className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
						>
							<div
								className={`w-14 h-14 bg-gradient-to-r ${portfolio.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-md`}
							>
								<span className="text-3xl">{portfolio.icon}</span>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">{portfolio.title}</h3>

							<ul className="space-y-2">
								{portfolio.features.map((feature, featureIdx) => (
									<li key={featureIdx} className="text-gray-600 text-sm flex items-start">
										<span className="text-blue-500 mr-2">•</span>
										<span>{feature}</span>
									</li>
								))}
							</ul>

							{portfolio.isCustom && (
								<button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-medium">
									Contact us
								</button>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
