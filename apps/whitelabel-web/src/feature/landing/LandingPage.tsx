import { useEffect, useState } from "react"

import { usePrivy } from "@privy-io/react-auth"
import { Link, useNavigate } from "@tanstack/react-router"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"
import quirkLogo from "@/assets/quirk-logo.svg"

import { BusinessTypesSection } from "./BusinessTypesSection"
import { CustomizeEarnSection } from "./CustomizeEarnSection"
import { IntegrationSection } from "./IntegrationSection"
import { NewHeroSection } from "./NewHeroSection"
import { SupportedAssetsSection } from "./SupportedAssetsSection"
import { SurveySection } from "./SurveySection"
import { TradingStrategiesSection } from "./TradingStrategiesSection"

export function LandingPage() {
	const { authenticated, ready, user } = usePrivy()
	const navigate = useNavigate()
	const [isScrolled, setIsScrolled] = useState(false)

	// Scroll event listener for navbar backdrop blur (Luma-style)
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}

		window.addEventListener("scroll", handleScroll)
		return () => {
			window.removeEventListener("scroll", handleScroll)
		}
	}, [])

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
		<div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-purple-50/10 to-white">
			{/* Header - Pure glass blur (no background color) */}
			<header
				className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
					isScrolled ? "border-b border-gray-200/30 shadow-sm" : "border-b border-transparent"
				}`}
			>
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-3 group">
						<div className="relative p-2 -m-2 rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">
							<img src={quirkLogo} alt="Quirk Logo" className="size-16 cursor-pointer" />
						</div>
						<span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
							QUIRK
						</span>
					</Link>
					<nav className="hidden md:flex items-center gap-6">
						<Link to="/demo" className="text-lg text-gray-700 hover:text-gray-950 transition-colors font-medium">
							Demo
						</Link>
						<button onClick={handleSignIn} className="text-lg text-gray-700 hover:text-gray-950 transition-colors font-medium">
							Sign In
						</button>
						<button
							onClick={handleGetStarted}
							className="bg-gray-900 text-white px-8 py-3.5 text-lg rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow-md"
						>
							Get Started
						</button>
					</nav>
				</div>
			</header>

			{/* Hero */}
			<NewHeroSection />

			{/* Customize Earn Solution */}
			<CustomizeEarnSection />

			{/* Integration */}
			<IntegrationSection />

			{/* Trading Strategies */}
			<TradingStrategiesSection />

			{/* Business Types - Stripe-style showcase */}
			<BusinessTypesSection />

			{/* Supported Assets */}
			<SupportedAssetsSection />

			{/* Survey */}
			<SurveySection />

			{/* Footer */}
			<footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-150 py-12">
				<div className="max-w-7xl mx-auto px-6">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div>
							<h4 className="font-bold text-gray-950 mb-4 text-2xl">Quirk</h4>
							<p className="text-lg text-gray-700">White-label DeFi yield infrastructure for apps</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-950 mb-4 text-xl">Product</h4>
							<ul className="space-y-2 text-base text-gray-700">
								<li>
									<a href="#" className="hover:text-gray-950">
										Solutions
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-950">
										Strategies
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-950">
										Pricing
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-gray-950 mb-4 text-xl">Company</h4>
							<ul className="space-y-2 text-base text-gray-700">
								<li>
									<a href="#" className="hover:text-gray-950">
										About
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-950">
										Careers
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-950">
										Contact
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-gray-950 mb-4 text-xl">Legal</h4>
							<ul className="space-y-2 text-base text-gray-700">
								<li>
									<a href="#" className="hover:text-gray-950">
										Privacy
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-950">
										Terms
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-gray-950">
										Security
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="pt-8 border-t border-gray-200 text-center text-gray-500 text-base">
						© 2025 Quirk. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	)
}
