import { Link } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import { NewHeroSection } from './NewHeroSection'
import { PortfoliosSection } from './PortfoliosSection'
import { TradingStrategiesSection } from './TradingStrategiesSection'
import { SupportedAssetsSection } from './SupportedAssetsSection'
import { CustomizeEarnSection } from './CustomizeEarnSection'
import { CustodySection } from './CustodySection'
import { IntegrationSection } from './IntegrationSection'

export function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="text-2xl font-bold text-gray-900">Quirk</div>
					</div>
					<nav className="hidden md:flex items-center gap-4">
						<Link to="/demo" className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2">
							Demo
						</Link>
						<Link
							to="/dashboard/operations"
							className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 flex items-center gap-2"
						>
							<Building2 className="w-4 h-4" />
							<span>Operations</span>
						</Link>
						<Link
							to="/login"
							className="text-gray-900 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-200"
						>
							Sign In
						</Link>
						<Link
							to="/register"
							className="text-gray-900 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-200"
						>
							Get Started
						</Link>
					</nav>
				</div>
			</header>

			{/* Hero */}
			<NewHeroSection />

			{/* One Platform, Many Portfolios */}
			<PortfoliosSection />

			{/* Trading Strategies */}
			<TradingStrategiesSection />

			{/* Supported Assets */}
			<SupportedAssetsSection />

			{/* Customize Earn Solution */}
			<CustomizeEarnSection />

			{/* Custody with Privy */}
			<CustodySection />

			{/* Integration */}
			<IntegrationSection />

			{/* Footer */}
			<footer className="bg-gray-50 border-t border-gray-100 py-12">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div>
							<h4 className="font-bold text-gray-900 mb-4">Quirk</h4>
							<p className="text-sm text-gray-600">
								White-label DeFi yield infrastructure for apps
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-4">Product</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li>
									<a href="#" className="hover:text-gray-900">
										Solutions
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-900">
										Strategies
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-900">
										Pricing
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-4">Company</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li>
									<a href="#" className="hover:text-gray-900">
										About
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-900">
										Careers
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-900">
										Contact
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
							<ul className="space-y-2 text-sm text-gray-600">
								<li>
									<a href="#" className="hover:text-gray-900">
										Privacy
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-900">
										Terms
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-900">
										Security
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
						© 2025 Quirk. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	)
}
