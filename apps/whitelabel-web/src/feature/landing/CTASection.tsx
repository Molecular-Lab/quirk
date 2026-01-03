import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import quirkLogo from "@/assets/quirk-logo.svg"

export function CTASection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.3 })

	return (
		<section className="py-24 bg-white overflow-hidden">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid md:grid-cols-2 gap-8">
					{/* Left side - Image/Illustration placeholder */}
					<motion.div
						ref={ref}
						initial={{ opacity: 0, x: -50 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
						transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
						className="bg-gradient-to-br from-purple-100 to-orange-50 rounded-3xl p-12 relative overflow-hidden min-h-[400px] flex items-center justify-center"
					>
						{/* Decorative elements */}
						<motion.div
							className="absolute top-8 left-8 w-20 h-20 bg-purple-200 rounded-full opacity-60"
							animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
							transition={{ duration: 4, repeat: Infinity }}
						/>
						<motion.div
							className="absolute bottom-12 right-12 w-16 h-16 bg-orange-200 rounded-2xl opacity-50"
							animate={{ rotate: [0, 10, 0], y: [0, -5, 0] }}
							transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
						/>
						<motion.div
							className="absolute top-1/3 right-1/4 w-10 h-10 bg-purple-300 rounded-lg opacity-40"
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
						/>

						{/* Central illustration */}
						<motion.div
							className="relative z-10 text-center"
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 300 }}
						>
							<motion.div
								className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6"
								animate={{ y: [0, -8, 0] }}
								transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
							>
								<img src={quirkLogo} alt="Quirk" className="w-20 h-20" />
							</motion.div>
							<motion.div
								className="flex gap-4 justify-center"
								initial={{ opacity: 0 }}
								animate={isInView ? { opacity: 1 } : { opacity: 0 }}
								transition={{ delay: 0.4 }}
							>
								<motion.div
									className="bg-white rounded-xl px-4 py-2 shadow-md"
									animate={{ y: [0, -4, 0] }}
									transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
								>
									<span className="text-sm text-gray-500">APY</span>
									<p className="text-lg font-bold text-purple-600">5%+</p>
								</motion.div>
								<motion.div
									className="bg-white rounded-xl px-4 py-2 shadow-md"
									animate={{ y: [0, -4, 0] }}
									transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
								>
									<span className="text-sm text-gray-500">Custody</span>
									<p className="text-lg font-bold text-orange-600">MPC</p>
								</motion.div>
							</motion.div>
						</motion.div>
					</motion.div>

					{/* Right side - CTA Card */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
						transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
						className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-12 relative overflow-hidden flex flex-col justify-center"
					>
						{/* Background decoration */}
						<motion.div
							className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full"
							animate={{ scale: [1, 1.1, 1] }}
							transition={{ duration: 6, repeat: Infinity }}
						/>
						<motion.div
							className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full"
							animate={{ scale: [1, 1.15, 1] }}
							transition={{ duration: 5, repeat: Infinity, delay: 1 }}
						/>

						{/* Logo */}
						<motion.div
							className="mb-8"
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ delay: 0.4 }}
						>
							<div className="flex items-center gap-3">
								<div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
									<img src={quirkLogo} alt="Quirk" className="w-12 h-12" />
								</div>
								<span className="text-3xl font-bold text-white">QUIRK</span>
							</div>
						</motion.div>

						{/* Content */}
						<motion.h2
							className="text-4xl md:text-5xl font-bold text-white mb-4"
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ delay: 0.5 }}
						>
							Get Started Today
						</motion.h2>
						<motion.p
							className="text-white/80 text-lg mb-8 max-w-md"
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ delay: 0.6 }}
						>
							Join the platforms already earning yield on their idle balances
						</motion.p>

						{/* CTA Button */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ delay: 0.7 }}
						>
							<motion.a
								href="https://tally.so/r/VLGvyj"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-3 bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
								whileHover={{ scale: 1.02, x: 5 }}
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
					</motion.div>
				</div>
			</div>
		</section>
	)
}
