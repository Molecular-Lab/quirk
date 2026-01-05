import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import quirkLogo from "@/assets/quirk-logo.svg"

export function CTASection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.3 })

	return (
		<section className="py-24 lg:py-32 bg-gray-50 overflow-hidden">
			<div className="max-w-7xl mx-auto px-6">
				<motion.div
					ref={ref}
					className="bg-gray-900 rounded-3xl p-12 lg:p-16 relative overflow-hidden"
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
				>
					{/* Background decoration */}
					<motion.div
						className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full"
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 6, repeat: Infinity }}
					/>
					<motion.div
						className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full"
						animate={{ scale: [1, 1.15, 1] }}
						transition={{ duration: 5, repeat: Infinity, delay: 1 }}
					/>

					<div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
						{/* Content */}
						<div className="flex-1 text-center lg:text-left">
							<motion.div
								className="flex items-center gap-3 justify-center lg:justify-start mb-6"
								initial={{ opacity: 0, y: 20 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ delay: 0.2 }}
							>
								<div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
									<img src={quirkLogo} alt="Quirk" className="w-8 h-8" />
								</div>
								<span className="text-2xl font-medium text-white">QUIRK</span>
							</motion.div>

							<motion.h2
								className="text-3xl lg:text-4xl font-medium text-white mb-4"
								initial={{ opacity: 0, y: 20 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ delay: 0.3 }}
							>
								Ready to Start Earning?
							</motion.h2>
							<motion.p
								className="text-white/70 text-lg max-w-lg"
								initial={{ opacity: 0, y: 20 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ delay: 0.4 }}
							>
								Join the platforms already earning yield on their idle balances.
								Integration takes minutes.
							</motion.p>
						</div>

						{/* CTA Button */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ delay: 0.5 }}
						>
							<motion.a
								href="https://tally.so/r/VLGvyj"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								Join Waitlist
								<motion.div
									animate={{ x: [0, 5, 0] }}
									transition={{ duration: 1.5, repeat: Infinity }}
								>
									<ArrowRight className="w-5 h-5" />
								</motion.div>
							</motion.a>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
