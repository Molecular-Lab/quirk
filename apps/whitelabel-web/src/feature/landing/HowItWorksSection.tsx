export function HowItWorksSection() {
	return (
		<section className="min-h-[90vh] py-20 bg-white flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-4">Simple Integration</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						Go live in days, not months. Our SDK handles the complexity.
					</p>
				</div>

				{/* Steps */}
				<div className="grid lg:grid-cols-3 gap-8 mb-16">
					{/* Step 1 */}
					<div className="relative">
						<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
									<span className="text-2xl font-bold text-accent">1</span>
								</div>
								<h3 className="text-xl font-semibold text-gray-950">Register & Configure</h3>
							</div>
							<p className="text-gray-700 mb-4">
								Sign up on Quirk Dashboard. We create your MPC custodial wallet (Privy-powered). Choose your AI yield
								strategy.
							</p>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
								<code className="text-xs text-gray-700 font-mono">quirk.init(&#123; apiKey, strategy &#125;)</code>
							</div>
						</div>
						{/* Connector Line */}
						<div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200" />
					</div>

					{/* Step 2 */}
					<div className="relative">
						<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
									<span className="text-2xl font-bold text-accent">2</span>
								</div>
								<h3 className="text-xl font-semibold text-gray-950">Embed SDK</h3>
							</div>
							<p className="text-gray-700 mb-4">
								Integrate our React SDK in minutes. Enable "Earn" button in your app. We handle custody, DeFi
								deployment, and compliance.
							</p>
							<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
								<code className="text-xs text-gray-700 font-mono">&lt;QuirkEarnButton /&gt;</code>
							</div>
						</div>
						{/* Connector Line */}
						<div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200" />
					</div>

					{/* Step 3 */}
					<div className="relative">
						<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8">
							<div className="flex items-center gap-4 mb-6">
								<div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
									<span className="text-2xl font-bold text-accent">3</span>
								</div>
								<h3 className="text-xl font-semibold text-gray-950">Earn & Monitor</h3>
							</div>
							<p className="text-gray-700 mb-4">
								Users deposit funds. AI allocates across DeFi protocols. Monitor yields, withdrawals, and analytics from
								your dashboard.
							</p>
							<div className="flex items-center gap-2 text-sm">
								<div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2">
									<span className="text-gray-500">APY:</span> <span className="font-semibold text-gray-950">4.2%</span>
								</div>
								<div className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2">
									<span className="text-gray-500">TVL:</span> <span className="font-semibold text-gray-950">$1.2M</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Tech Stack Callout */}
				<div className="bg-white/90 backdrop-blur-md border border-gray-150 rounded-xl p-8">
					<div className="text-center mb-6">
						<h3 className="text-lg font-semibold text-gray-950 mb-2">Powered by Industry Leaders</h3>
						<p className="text-gray-700">Institutional-grade infrastructure you can trust</p>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-8">
						<div className="text-center">
							<div className="text-sm font-medium text-gray-500 mb-1">Custody</div>
							<div className="text-base font-semibold text-gray-950">Privy MPC</div>
						</div>
						<div className="w-px h-8 bg-gray-200" />
						<div className="text-center">
							<div className="text-sm font-medium text-gray-500 mb-1">DeFi Protocols</div>
							<div className="text-base font-semibold text-gray-950">AAVE • Compound • Morpho</div>
						</div>
						<div className="w-px h-8 bg-gray-200" />
						<div className="text-center">
							<div className="text-sm font-medium text-gray-500 mb-1">On/Off Ramp</div>
							<div className="text-base font-semibold text-gray-950">TransFi • Bridge</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
