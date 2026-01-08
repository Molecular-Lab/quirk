import { useRef } from "react"

import { Link } from "@tanstack/react-router"
import { motion, useInView } from "framer-motion"

import { useResponsive } from "@/hooks"

export function NewHeroSection() {
	const sectionRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(sectionRef, { once: true, margin: "-50px" })

	const {} = useResponsive()
	return (
		<section className="relative min-h-screen overflow-hidden h-[120vh] rounded-t-none">
			{/* Animated gradient background - Grayscale base for Claude orange overlay */}
			<div className="absolute inset-0 grayscale rounded-t-none">
				<img src="/Loop Background GIF by Trakto.gif" className="w-full h-full object-cover" alt="" />
			</div>

			{/* Claude brand gradient overlay - warm orange to cream */}
			<div className="absolute inset-0 bg-gradient-to-b from-claude-orange-200/85 via-claude-orange-100/70 to-claude-bg-50" />

			{/* Claude-inspired soft decorative gradients - official brand palette */}
			<div className="absolute top-20 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-claude-orange-200/30 via-claude-orange-100/25 to-claude-orange-50/15 rounded-full blur-[120px]" />
			<div className="absolute bottom-0 -left-20 w-[700px] h-[700px] bg-gradient-to-tr from-claude-orange-100/25 via-claude-bg-200/20 to-transparent rounded-full blur-[120px]" />
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-claude-bg-50/0 via-claude-bg-50/20 to-claude-bg-50/90" />

			<div className="relative z-0 w-full" ref={sectionRef}>
				{/* Header - Centered vertically in viewport */}
				<div className="min-h-screen flex items-center justify-center z-20">
					<div className="max-w-7xl mx-auto px-6 text-center">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							<h2 className="text-lg sm:text-3xl md:text-5xl lg:text-7xl font-normal text-claude-gray-900 mb-2">
								Plug-and-Play Stablecoin Yield Infrastructure
							</h2>
							<p className="text-xs md:text-xl text-claude-gray-900 mt-4 max-w-3xl mx-auto">
								Quirk turn idle capital into active revenue streams with institutional-grade custody
							</p>

							{/* Get Demo Button */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								transition={{ duration: 0.6, delay: 0.5 }}
								className="mt-8"
							>
								<Link to="/contact">
									<motion.button
										className="bg-claude-gray-900 text-white px-4 md:px-8 py-2 text-xs md:text-lg rounded-xl hover:bg-claude-gray-800 transition-all font-medium shadow-md cursor-pointer"
										whileHover={{
											scale: 1.02,
										}}
										whileTap={{ scale: 0.95 }}
									>
										Get Demo
									</motion.button>
								</Link>
							</motion.div>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Bottom gradient fade to hide globe edge - Claude cream background */}
			<div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-claude-bg-50 via-claude-bg-50/90 to-transparent pointer-events-none z-30" />
		</section>
	)
}
