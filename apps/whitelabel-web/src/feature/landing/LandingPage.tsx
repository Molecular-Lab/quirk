import { usePrivy } from "@privy-io/react-auth"
import { Link, useNavigate } from "@tanstack/react-router"
import { Sparkles } from "lucide-react"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"

import { CustomizeEarnSection } from "./CustomizeEarnSection"
import { IntegrationSection } from "./IntegrationSection"
import { NewHeroSection } from "./NewHeroSection"
import { SupportedAssetsSection } from "./SupportedAssetsSection"
import { TradingStrategiesSection } from "./TradingStrategiesSection"

export function LandingPage() {
	const { authenticated, ready, user } = usePrivy()
	const navigate = useNavigate()

	const handleGetStarted = async () => {
		// Wait for Privy to be ready
		if (!ready) {
			await navigate({ to: "/login" })
			return
		}

		// Check if user is authenticated
		if (!authenticated || !user) {
			await navigate({ to: "/login" })
			return
		}

		// User is authenticated - check if they have products
		try {
			const clients = await listOrganizationsByPrivyId(user.id)

			if (clients.length > 0) {
				// User has products → Dashboard
				await navigate({ to: "/dashboard" })
			} else {
				// User has no products → Onboarding
				await navigate({ to: "/onboarding/create-product" })
			}
		} catch (error) {
			// On error, redirect to onboarding
			await navigate({ to: "/onboarding/create-product" })
		}
	}

	const handleSignIn = async () => {
		// Wait for Privy to be ready
		if (!ready) {
			await navigate({ to: "/login" })
			return
		}

		// Check if user is already authenticated
		if (!authenticated || !user) {
			await navigate({ to: "/login" })
			return
		}

		// User is already authenticated - check if they have products
		try {
			const clients = await listOrganizationsByPrivyId(user.id)

			if (clients.length > 0) {
				// User has products → Dashboard
				await navigate({ to: "/dashboard" })
			} else {
				// User has no products → Onboarding
				await navigate({ to: "/onboarding/create-product" })
			}
		} catch (error) {
			// On error, redirect to onboarding
			await navigate({ to: "/onboarding/create-product" })
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white">
			{/* Header */}
			<header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<Sparkles className="size-6 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer" />
					</Link>
					<nav className="hidden md:flex items-center gap-6">
						<Link to="/demo" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
							Demo
						</Link>
						<button onClick={handleSignIn} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
							Sign In
						</button>
						<button
							onClick={handleGetStarted}
							className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2.5 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
						>
							Get Started
						</button>
					</nav>
				</div>
			</header>

			{/* Hero */}
			<NewHeroSection onGetStarted={handleGetStarted} />

			{/* Trading Strategies */}
			<TradingStrategiesSection />

			{/* Supported Assets */}
			<SupportedAssetsSection />

			{/* Customize Earn Solution */}
			<CustomizeEarnSection />

			{/* Integration */}
			<IntegrationSection />

			{/* Footer */}
			<footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 py-12">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div>
							<h4 className="font-bold text-gray-900 mb-4 text-lg">Quirk</h4>
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
