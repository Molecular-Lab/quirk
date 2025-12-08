export function IntegrationSection() {
	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-purple-50/40 via-white to-blue-50/20 flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-6">
						Simplify Integration,
						<br />
						Unlock New Revenue
					</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						Help onboarding your end-users to digital assets and create a new revenue stream for your business
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8 mb-12">
					<div className="bg-white/90 backdrop-blur-md rounded-xl p-10 border border-gray-150 hover:shadow-md hover:border-gray-200 transition-all">
						<h3 className="text-2xl font-semibold text-gray-950 mb-4">Quick Setup</h3>
						<p className="text-gray-700 leading-relaxed mb-6">
							Integrate our SDK in under 30 minutes. No blockchain expertise required—we handle all the complexity.
						</p>
						<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
							<code className="text-sm text-gray-700">
								<span className="text-gray-500">// Install</span>
								<br />
								npm install @quirk/sdk
								<br />
								<br />
								<span className="text-gray-500">// Initialize</span>
								<br />
								quirk.init(apiKey)
							</code>
						</div>
					</div>

					<div className="bg-white/90 backdrop-blur-md rounded-xl p-10 border border-gray-150 hover:shadow-md hover:border-gray-200 transition-all">
						<h3 className="text-2xl font-semibold text-gray-950 mb-4">New Revenue Stream</h3>
						<p className="text-gray-700 leading-relaxed mb-6">
							Earn revenue share from yield generated on your users' idle balances. Typical clients earn $2,000-$10,000
							monthly.
						</p>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-gray-700">Base SaaS Fee</span>
								<span className="font-semibold text-gray-950">$499/mo</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-700">Yield Revenue Share</span>
								<span className="font-semibold text-gray-950">7%</span>
							</div>
							<div className="pt-3 border-t border-gray-200">
								<div className="flex items-center justify-between">
									<span className="text-gray-700">Est. Monthly Revenue</span>
									<span className="font-bold text-gray-950 text-lg">$2,700+</span>
								</div>
								<p className="text-xs text-gray-500 mt-1">Based on $500K AUM at 7% APY</p>
							</div>
						</div>
					</div>
				</div>

				<div className="relative bg-gray-950 rounded-xl p-12 text-center text-white overflow-hidden">
					{/* Subtle gradient decoration */}
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
					<h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
					<p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
						Join leading platforms earning passive income on idle user balances
					</p>
					<div className="flex items-center justify-center gap-4">
						<a
							href="/register"
							className="bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 shadow-sm hover:shadow-md transition-all font-medium text-lg"
						>
							Start Building
						</a>
						<a
							href="/demo"
							className="bg-white text-gray-950 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-medium text-lg border border-gray-200"
						>
							View Demo
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}
