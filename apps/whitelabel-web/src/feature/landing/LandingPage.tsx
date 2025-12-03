import { Link } from "@tanstack/react-router"
import { Building2 } from "lucide-react"

import { CustodySection } from "./CustodySection"
import { CustomizeEarnSection } from "./CustomizeEarnSection"
import { IntegrationSection } from "./IntegrationSection"
import { NewHeroSection } from "./NewHeroSection"
import { PortfoliosSection } from "./PortfoliosSection"
import { SupportedAssetsSection } from "./SupportedAssetsSection"
import { TradingStrategiesSection } from "./TradingStrategiesSection"

export function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 via-30% to-gray-50">
			{/* Header */}
			<header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="text-2xl font-bold text-black">Quirk</div>
					</div>
					<nav className="hidden md:flex items-center gap-6">
						<Link to="/demo" className="text-gray-600 hover:text-black transition-colors font-medium">
							Demo
						</Link>
						<Link
							to="/dashboard/operations"
							className="text-gray-600 hover:text-black transition-colors flex items-center gap-2 font-medium"
						>
							<Building2 className="w-4 h-4" />
							<span>Operations</span>
						</Link>
						<Link to="/login" className="text-gray-700 hover:text-black transition-colors font-medium">
							Sign In
						</Link>
						<Link
							to="/get-started"
							className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all font-medium"
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
							<p className="text-sm text-gray-600">White-label DeFi yield infrastructure for apps</p>
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
