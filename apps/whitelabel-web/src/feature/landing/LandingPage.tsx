import { useRef } from "react"

import { Link } from "@tanstack/react-router"
import { motion, useInView } from "framer-motion"

import { BenefitsSection } from "./BenefitsSection"
import { BusinessTypesSection } from "./BusinessTypesSection"
import { FAQSection } from "./FAQSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { Navbar } from "./Navbar"
import { NewHeroSection } from "./NewHeroSection"
import { CoreServicesSection } from "./ServicesShowcaseSection"

export function LandingPage() {
	return (
		<div className="min-h-screen bg-claude-bg-50">
			{/* Header - Pure glass blur (no background color) */}
			<Navbar />

			{/* 1. Hero */}
			<NewHeroSection />

			{/* 2. Solution Overview - Header + 4 solution cards */}
			<CoreServicesSection />

			{/* 3. Benefits - Stats + Platform showcase */}
			<BenefitsSection />
			{/* <PlatformShowcaseSection /> */}

			{/* 4. How It Works */}
			<HowItWorksSection />

			{/* 5. Business Types - Platform showcase */}
			<BusinessTypesSection />

			{/* 6. FAQ */}
			<FAQSection />

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
				delayChildren: 0.1,
			},
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	}

	const linkVariants = {
		hidden: { opacity: 0, x: -10 },
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.4,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	}

	return (
		<motion.footer
			ref={footerRef}
			className="bg-gradient-to-b from-claude-bg-50 to-white border-t border-gray-150 py-12 overflow-hidden"
			variants={containerVariants}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
		>
			<div className="max-w-7xl mx-auto px-6">
				<motion.div className="grid md:grid-cols-3 gap-12 mb-12" variants={containerVariants}>
					<motion.div variants={itemVariants}>
						<h4 className="font-medium text-claude-gray-900 mb-4 text-2xl">Quirk</h4>
						<p className="text-base text-claude-gray-700 leading-relaxed">
							White-label DeFi yield infrastructure for apps
						</p>
					</motion.div>
					<motion.div variants={itemVariants}>
						<h4 className="font-medium text-claude-gray-900 mb-4 text-lg">Navigation</h4>
						<ul className="space-y-3 text-base text-claude-gray-700">
							<motion.li variants={linkVariants}>
								<Link to="/contact">
									<motion.span className="hover:text-claude-gray-900 transition-colors cursor-pointer inline-block" whileHover={{ x: 3 }}>
										Get in Touch
									</motion.span>
								</Link>
							</motion.li>
							<motion.li variants={linkVariants}>
								<Link to="/login">
									<motion.span className="hover:text-claude-gray-900 transition-colors cursor-pointer inline-block" whileHover={{ x: 3 }}>
										Log In
									</motion.span>
								</Link>
							</motion.li>
						</ul>
					</motion.div>
					<motion.div variants={itemVariants}>
						<h4 className="font-medium text-claude-gray-900 mb-4 text-lg">Legal</h4>
						<ul className="space-y-3 text-base text-claude-gray-700">
							<motion.li variants={linkVariants}>
								<motion.a href="#" className="hover:text-claude-gray-900 transition-colors" whileHover={{ x: 3 }}>
									Privacy Policy
								</motion.a>
							</motion.li>
							<motion.li variants={linkVariants}>
								<motion.a href="#" className="hover:text-claude-gray-900 transition-colors" whileHover={{ x: 3 }}>
									Terms of Service
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
