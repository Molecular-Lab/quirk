export function OpportunitySection() {
	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-green-50/40 via-white to-purple-50/20 flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-4">$300B+ Idle Cash Waiting to Earn</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						Across e-commerce, creators, gig workers, and payroll—massive idle cash earns 0%. Quirk unlocks
						institutional-grade yield.
					</p>
				</div>

				{/* Opportunity Cards Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
					{/* Card 1: StableCoin Growth */}
					<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8 hover:shadow-md hover:border-gray-200 transition-all">
						<div className="text-4xl mb-4">📈</div>
						<h3 className="text-xl font-semibold text-gray-950 mb-3">StableCoin Acceleration</h3>
						<p className="text-gray-700 leading-relaxed">
							StableCoins are rapidly integrating into traditional finance systems. Institutional adoption is
							accelerating.
						</p>
					</div>

					{/* Card 2: DeFi Market Validation */}
					<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8 hover:shadow-md hover:border-gray-200 transition-all">
						<div className="text-4xl mb-4">💎</div>
						<h3 className="text-xl font-semibold text-gray-950 mb-3">Proven DeFi Market</h3>
						<p className="text-gray-700 leading-relaxed">
							DeFi protocols deliver <strong className="text-gray-950">3-5% APY</strong> on stablecoins. Billions in
							TVL, millions of active wallets.
						</p>
					</div>

					{/* Card 3: Trapped Users */}
					<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8 hover:shadow-md hover:border-gray-200 transition-all">
						<div className="text-4xl mb-4">🔒</div>
						<h3 className="text-xl font-semibold text-gray-950 mb-3">Users Trapped in Silos</h3>
						<p className="text-gray-700 leading-relaxed">
							Savings options only exist in banking apps. Users want yield where they actually earn income.
						</p>
					</div>
				</div>

				{/* Proven Model Callout */}
				<div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
					<div className="flex items-start gap-4">
						<div className="text-3xl">✅</div>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-950 mb-2">Proven Enterprise Model</h3>
							<p className="text-gray-700 mb-3">
								<strong className="text-gray-950">Shopify</strong> partners with multiple financial institutions (Yield,
								Stripe, Fifth Third Bank, Celtic Bank) to enable financial products while focusing on core business.
							</p>
							<a
								href="https://help.shopify.com/en/manual/finance/shopify-balance/rewards/apy-rewards"
								target="_blank"
								rel="noopener noreferrer"
								className="text-accent text-sm font-medium hover:underline inline-flex items-center gap-1"
							>
								Learn about Shopify Balance APY →
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
