import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

import { usePrivy } from "@privy-io/react-auth"
import { Link, useNavigate } from "@tanstack/react-router"

import { listOrganizationsByPrivyId } from "@/api/b2bClientHelpers"
import quirkLogo from "@/assets/quirk-logo.svg"

import { BusinessTypesSection } from "./BusinessTypesSection"
import { CTASection } from "./CTASection"
import { CustomizeEarnSection } from "./CustomizeEarnSection"
import { FAQSection } from "./FAQSection"
import { FeaturesGridSection } from "./FeaturesGridSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { MarqueeSection } from "./MarqueeSection"
import { NewHeroSection } from "./NewHeroSection"
import { PartnersSection } from "./PartnersSection"
import { SupportedAssetsSection } from "./SupportedAssetsSection"
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
			<motion.header
				className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl ${
					isScrolled ? "border-b border-gray-200/30 shadow-sm" : "border-b border-transparent"
				}`}
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-3 group">
						<motion.div
							className="relative p-2 -m-2 rounded-lg transition-all"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<img src={quirkLogo} alt="Quirk Logo" className="size-16 cursor-pointer" />
						</motion.div>
						<span className="text-2xl font-bold text-gray-950">QUIRK</span>
					</Link>
					<nav className="hidden md:flex items-center gap-6">
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Link to="/demo" className="text-lg text-gray-700 hover:text-gray-950 transition-colors font-medium">
								Demo
							</Link>
						</motion.div>
						<motion.button
							onClick={handleSignIn}
							className="text-lg text-gray-700 hover:text-gray-950 transition-colors font-medium"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Sign In
						</motion.button>
						<motion.button
							onClick={handleGetStarted}
							className="bg-gray-900 text-white px-8 py-3.5 text-lg rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm cursor-pointer"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							whileHover={{
								scale: 1.02,
								boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)"
							}}
							whileTap={{ scale: 0.98 }}
						>
							Get Started
						</motion.button>
					</nav>
				</div>
			</motion.header>

			{/* Hero */}
			<NewHeroSection />

			{/* Features Grid - Bento style */}
			<FeaturesGridSection />

			{/* Marquee - Why Quirk */}
			<MarqueeSection />

			{/* Customize Earn Solution */}
			<CustomizeEarnSection />

			{/* Trading Strategies */}
			<TradingStrategiesSection />

			{/* How It Works */}
			<HowItWorksSection />

			{/* Business Types - Stripe-style showcase */}
			<BusinessTypesSection />

			{/* Partners & Protocols */}
			<PartnersSection />

			{/* Supported Assets */}
			<SupportedAssetsSection />

			{/* FAQ Section */}
			<FAQSection />

			{/* CTA Section */}
			<CTASection />

			{/* Footer */}
			<AnimatedFooter />
		</div>
	)
}

function AnimatedFooter() {
	const footerRef = useRef(null)
	const isInView = useInView(footerRef, { once: true, amount: 0.2 })

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.1
			}
		}
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const linkVariants = {
		hidden: { opacity: 0, x: -10 },
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.4,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	return (
		<motion.footer
			ref={footerRef}
			className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-150 py-12 overflow-hidden"
			variants={containerVariants}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
		>
			<div className="max-w-7xl mx-auto px-6">
				<motion.div
					className="grid md:grid-cols-4 gap-8 mb-12"
					variants={containerVariants}
				>
					<motion.div variants={itemVariants}>
						<h4 className="font-bold text-gray-950 mb-4 text-2xl">Quirk</h4>
						<p className="text-lg text-gray-700">White-label DeFi yield infrastructure for apps</p>
					</motion.div>
					<motion.div variants={itemVariants}>
						<h4 className="font-semibold text-gray-950 mb-4 text-xl">Product</h4>
						<ul className="space-y-2 text-base text-gray-700">
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Solutions
								</motion.a>
							</motion.li>
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Strategies
								</motion.a>
							</motion.li>
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Pricing
								</motion.a>
							</motion.li>
						</ul>
					</motion.div>
					<motion.div variants={itemVariants}>
						<h4 className="font-semibold text-gray-950 mb-4 text-xl">Company</h4>
						<ul className="space-y-2 text-base text-gray-700">
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									About
								</motion.a>
							</motion.li>
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Careers
								</motion.a>
							</motion.li>
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Contact
								</motion.a>
							</motion.li>
						</ul>
					</motion.div>
					<motion.div variants={itemVariants}>
						<h4 className="font-semibold text-gray-950 mb-4 text-xl">Legal</h4>
						<ul className="space-y-2 text-base text-gray-700">
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Privacy
								</motion.a>
							</motion.li>
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Terms
								</motion.a>
							</motion.li>
							<motion.li variants={linkVariants}>
								<motion.a
									href="#"
									className="hover:text-gray-950 transition-colors"
									whileHover={{ x: 3 }}
								>
									Security
								</motion.a>
							</motion.li>
						</ul>
					</motion.div>
				</motion.div>
				<motion.div
					className="pt-8 border-t border-gray-200 text-center text-gray-500 text-base"
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : { opacity: 0 }}
					transition={{ delay: 0.5, duration: 0.5 }}
				>
					© 2025 Quirk. All rights reserved.
				</motion.div>
			</div>
		</motion.footer>
	)
}
