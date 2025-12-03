export function PortfoliosSection() {
	const portfolios = [
		{
			title: "Capital Preservation",
			icon: "🛡️",
			features: [
				"Low volatility",
				"Daily liquidity",
				"Ideal for fintechs offering savings alternative, corporate treasury, exchanges seeking stable client yield",
			],
		},
		{
			title: "Balanced Yield",
			icon: "⚖️",
			features: [
				"Optimized return vs risk",
				"Actively managed allocations",
				"Ideal for fintechs, exchanges, and business accounts, treasury seeking enhanced returns",
			],
		},
		{
			title: "Enhanced Return & Alpha",
			icon: "🎯",
			features: [
				"Alpha-seeking yield strategies",
				"Directional market exposure",
				"Ideal for performance-driven growth",
			],
		},
		{
			title: "Custom Solutions that scale with your needs",
			icon: "💼",
			isCustom: true,
		},
	]

	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-900 mb-4">One Platform, Many Portfolios</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Delivering customizable risk-adjusted yield for digital assets
					</p>
				</div>

				<div className="grid md:grid-cols-4 gap-6">
					{portfolios.map((portfolio, idx) => (
						<div
							key={idx}
							className={`${
								portfolio.isCustom ? "bg-gradient-to-br from-gray-100 to-gray-50" : "bg-gray-50"
							} rounded-3xl p-8 border border-gray-200`}
						>
							<div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-gray-200">
								<span className="text-3xl">{portfolio.icon}</span>
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-4">{portfolio.title}</h3>

							{!portfolio.isCustom && portfolio.features ? (
								<ul className="space-y-2">
									{portfolio.features.map((feature, featureIdx) => (
										<li key={featureIdx} className="text-gray-600 text-sm flex items-start">
											<span className="text-gray-400 mr-2">•</span>
											<span>{feature}</span>
										</li>
									))}
								</ul>
							) : portfolio.isCustom ? (
								<button className="mt-4 text-gray-900 px-6 py-2.5 rounded-xl hover:bg-white transition-colors font-medium border border-gray-200 bg-white">
									Contact us
								</button>
							) : null}
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
