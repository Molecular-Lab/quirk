export function CustomizeEarnSection() {
	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-blue-50/30 to-white flex items-center">
			<div className="max-w-7xl mx-auto px-6 w-full">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-950 mb-4">Customize Earn Solution At Scale</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						Build your own yield product with our institutional-grade infrastructure
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					<div className="bg-white/90 backdrop-blur-md rounded-xl p-8 border border-gray-150 hover:shadow-md hover:border-gray-200 transition-all">
						<div className="text-3xl mb-4">⚡</div>
						<h3 className="text-xl font-semibold text-gray-950 mb-3">Fast Integration</h3>
						<p className="text-gray-700 leading-relaxed">
							Embed our SDK in minutes. Start offering yield to your users without complex infrastructure.
						</p>
					</div>

					<div className="bg-white/90 backdrop-blur-md rounded-xl p-8 border border-gray-150 hover:shadow-md hover:border-gray-200 transition-all">
						<div className="text-3xl mb-4">🔒</div>
						<h3 className="text-xl font-semibold text-gray-950 mb-3">Secure Custody</h3>
						<p className="text-gray-700 leading-relaxed">
							Institutional-grade MPC custody powered by Privy. Your users' funds are always protected.
						</p>
					</div>

					<div className="bg-white/90 backdrop-blur-md rounded-xl p-8 border border-gray-150 hover:shadow-md hover:border-gray-200 transition-all">
						<div className="text-3xl mb-4">📊</div>
						<h3 className="text-xl font-semibold text-gray-950 mb-3">White-Label Dashboard</h3>
						<p className="text-gray-700 leading-relaxed">
							Fully branded analytics, portfolio tracking, and AI-powered market insights for your clients.
						</p>
					</div>
				</div>
			</div>
		</section>
	)
}
