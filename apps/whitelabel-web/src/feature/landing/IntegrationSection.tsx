export function IntegrationSection() {
	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-900 mb-6">
						Simplify Integration,
						<br />
						Unlock New Revenue
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Help onboarding your end-users to digital assets and create a new revenue stream for your business
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8 mb-12">
					<div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Setup</h3>
						<p className="text-gray-600 leading-relaxed mb-6">
							Integrate our SDK in under 30 minutes. No blockchain expertise required—we handle all the complexity.
						</p>
						<div className="bg-white rounded-2xl p-4 border border-gray-200">
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

					<div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
						<h3 className="text-2xl font-bold text-gray-900 mb-4">New Revenue Stream</h3>
						<p className="text-gray-600 leading-relaxed mb-6">
							Earn revenue share from yield generated on your users' idle balances. Typical clients earn $2,000-$10,000
							monthly.
						</p>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-gray-600">Base SaaS Fee</span>
								<span className="font-semibold text-gray-900">$499/mo</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-gray-600">Yield Revenue Share</span>
								<span className="font-semibold text-gray-900">7%</span>
							</div>
							<div className="pt-3 border-t border-gray-200">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Est. Monthly Revenue</span>
									<span className="font-bold text-gray-900 text-lg">$2,700+</span>
								</div>
								<p className="text-xs text-gray-500 mt-1">Based on $500K AUM at 7% APY</p>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white">
					<h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
					<p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
						Join leading platforms earning passive income on idle user balances
					</p>
					<div className="flex items-center justify-center gap-4">
						<a
							href="/register"
							className="bg-white text-gray-900 px-8 py-4 rounded-2xl hover:bg-gray-100 transition-colors font-medium text-lg"
						>
							Start Building
						</a>
						<a
							href="/demo"
							className="bg-gray-800 text-white px-8 py-4 rounded-2xl hover:bg-gray-700 transition-colors font-medium text-lg border border-gray-700"
						>
							View Demo
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}
