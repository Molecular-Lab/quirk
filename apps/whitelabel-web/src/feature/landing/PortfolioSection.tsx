import { Shield, Scale, Target } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function PortfolioSection() {
	return (
		<section id="solutions" className="py-24 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold text-gray-900 mb-4">
						One Platform, Many Portfolios
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Delivering customizable risk-adjusted yield for digital assets
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Capital Preservation */}
					<div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
						<div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
							<Shield className="w-7 h-7 text-blue-600" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-3">
							Capital<br />Preservation
						</h3>
						<ul className="space-y-2 text-gray-700 text-sm">
							<li>• Low volatility</li>
							<li>• Daily liquidity</li>
							<li>• Ideal for fintechs offering savings alternative, corporate treasury, exchanges seeking stable client yield</li>
						</ul>
					</div>

					{/* Balanced Yield */}
					<div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
						<div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
							<Scale className="w-7 h-7 text-purple-600" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-3">
							Balanced<br />Yield
						</h3>
						<ul className="space-y-2 text-gray-700 text-sm">
							<li>• Optimized return vs risk</li>
							<li>• Actively managed allocations</li>
							<li>• Ideal for fintechs, exchanges and business accounts, treasury seeking enhanced returns</li>
						</ul>
					</div>

					{/* Enhanced Return & Alpha */}
					<div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
						<div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
							<Target className="w-7 h-7 text-green-600" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-3">
							Enhanced Return<br />& Alpha
						</h3>
						<ul className="space-y-2 text-gray-700 text-sm">
							<li>• Alpha-seeking yield strategies</li>
							<li>• Directional market exposure</li>
							<li>• Ideal for performance-driven growth</li>
						</ul>
					</div>

					{/* Custom Solutions */}
					<div className="bg-gradient-to-br from-navy-950 to-blue-950 rounded-2xl p-8 border border-navy-800 hover:shadow-lg transition-shadow relative overflow-hidden">
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
						<div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

						<div className="relative z-10">
							<h3 className="text-xl font-bold text-white mb-3">
								Custom Solutions<br />that scale with<br />your needs
							</h3>
							<p className="text-gray-300 text-sm mb-6">
								Tailored yield strategies designed for your specific requirements
							</p>
							<Link
								to="/register"
								className="inline-block bg-white text-navy-950 px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-medium"
							>
								Contact us
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
