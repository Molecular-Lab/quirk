export function PortfoliosSection() {
	const portfolios = [
		{
			title: "Capital Preservation",
			icon: "🛡️",
			color: "blue",
			features: [
				"Low volatility",
				"Daily liquidity",
				"Ideal for fintechs offering savings alternative, corporate treasury, exchanges seeking stable client yield",
			],
		},
		{
			title: "Balanced Yield",
			icon: "⚖️",
			color: "purple",
			features: [
				"Optimized return vs risk",
				"Actively managed allocations",
				"Ideal for fintechs, exchanges, and business accounts, treasury seeking enhanced returns",
			],
		},
		{
			title: "Enhanced Return & Alpha",
			icon: "🎯",
			color: "green",
			features: [
				"Alpha-seeking yield strategies",
				"Directional market exposure",
				"Ideal for performance-driven growth",
			],
		},
		{
			title: "Custom Solutions",
			icon: "💼",
			color: "cyan",
			isCustom: true,
			features: ["Tailored to your needs", "Scale as you grow", "White-label ready"],
		},
	]

	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-green-50/40 to-white flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-4">One Platform, Many Portfolios</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						Delivering customizable risk-adjusted yield for digital assets
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{portfolios.map((portfolio, idx) => {
						const borderColors = {
							blue: "border-blue-500",
							purple: "border-purple-500",
							green: "border-green-500",
							cyan: "border-cyan-500",
						}

						return (
							<div
								key={idx}
								className={`bg-white/90 backdrop-blur-md border-t-4 ${borderColors[portfolio.color]} border-x border-b border-gray-150 rounded-xl p-8 hover:shadow-md hover:border-gray-200 transition-all`}
							>
								<div className="text-3xl mb-6">{portfolio.icon}</div>
								<h3 className="text-xl font-bold text-gray-950 mb-4">{portfolio.title}</h3>

								<ul className="space-y-2">
									{portfolio.features.map((feature, featureIdx) => (
										<li key={featureIdx} className="text-gray-700 text-sm flex items-start">
											<span className="text-gray-500 mr-2">•</span>
											<span>{feature}</span>
										</li>
									))}
								</ul>

								{portfolio.isCustom && (
									<button className="mt-6 w-full bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow-md">
										Contact us
									</button>
								)}
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
