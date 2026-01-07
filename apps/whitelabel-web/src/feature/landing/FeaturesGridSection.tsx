import { useRef } from "react"

import { motion, useInView } from "framer-motion"

import { ASCIIIcon } from "@/components/ui/ASCIIIcon"

export function FeaturesGridSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.15 })

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 30, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	}

	return (
		<section className="py-24 bg-gradient-to-b from-claude-bg-50 to-claude-bg-50 overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-5xl mx-auto px-6"
			>
				{/* Bento Grid with NEW content */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Large Feature Card - Spans 2 columns - DeFi Yield Infrastructure */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="lg:col-span-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-8 relative overflow-hidden md:min-h-[180px]"
					>
						{/* Decorative illustration - only on lg+ screens */}
						<div className="hidden lg:block absolute right-0 top-0 w-1/2 h-full">
							<motion.div
								className="absolute top-6 right-6 size-16 bg-orange-200 rounded-3xl opacity-60"
								animate={{ rotate: [0, 5, 0], y: [0, -5, 0] }}
								transition={{ duration: 4, repeat: Infinity }}
							/>
							<motion.div
								className="absolute top-16 right-24 size-12 bg-orange-300 rounded-2xl opacity-50"
								animate={{ rotate: [0, -5, 0], y: [0, 5, 0] }}
								transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
							/>
							<motion.div
								className="absolute bottom-10 right-14 size-16 bg-white rounded-2xl shadow-lg flex items-center justify-center"
								animate={{ y: [0, -8, 0] }}
								transition={{ duration: 2.5, repeat: Infinity }}
							>
								<ASCIIIcon icon="↗" size="lg" className="text-orange-700" />
							</motion.div>
							<motion.div
								className="absolute top-1/2 right-40 size-8 bg-orange-400 rounded-full opacity-40"
								animate={{ scale: [1, 1.1, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
						</div>

						{/* Rotating circles background - decoration for mobile/tablet only */}
						<motion.div
							className="lg:hidden absolute top-4 right-4 w-[200px] h-[200px] border border-orange-100 rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
						/>
						<motion.div
							className="lg:hidden absolute bottom-4 right-16 w-[200px] h-[200px] border border-orange-100 rounded-full"
							animate={{ rotate: -360 }}
							transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
						/>

						<div className="relative z-10 max-w-md">
							<h3 className="text-xl lg:text-2xl text-gray-950 mb-2">DeFi Yield Infrastructure</h3>
							<p className="text-sm lg:text-base text-gray-900 leading-relaxed">
								Providing Infrastructure to Modernize Wealth Through DeFi Protocols
							</p>
						</div>
					</motion.div>

					{/* Small Card - Instantly Integration */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="bg-green-50 rounded-3xl p-8 relative overflow-hidden md:min-h-[180px]"
					>
						{/* Rotating circles background - always visible (no space for full decorations) */}
						<motion.div
							className="absolute top-4 right-4 w-10 h-10 border border-green-100 rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
						/>
						<motion.div
							className="absolute bottom-4 right-20 w-6 h-6 border border-green-100 rounded-full"
							animate={{ rotate: -360 }}
							transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
						/>

						<div className="relative z-10">
							<h3 className="text-xl lg:text-2xl text-gray-950 mb-2">Instantly Integration</h3>
							<p className="text-sm lg:text-base text-gray-900 leading-relaxed">Simplify the integration with Embeded Earn SDK</p>
						</div>
					</motion.div>

					{/* Small Card - Institutional Grade Custody */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="bg-purple-50 rounded-3xl p-8 relative overflow-hidden md:min-h-[180px]"
					>
						{/* Rotating circles background - always visible (no space for full decorations) */}
						<motion.div
							className="absolute top-4 right-4 w-10 h-10 border border-purple-100 rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
						/>
						<motion.div
							className="absolute bottom-4 right-20 w-6 h-6 border border-purple-100 rounded-full"
							animate={{ rotate: -360 }}
							transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
						/>

						<div className="relative z-10">
							<h3 className="text-xl lg:text-2xl text-gray-950 mb-2">Institutional Grade Custody</h3>
							<p className="text-sm lg:text-base text-gray-900 leading-relaxed">
								Enterprise-level security with multi-signature wallets and cold storage
							</p>
						</div>
					</motion.div>

					{/* Medium card - On/Off Ramp Gateway */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="lg:col-span-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-8 relative overflow-hidden md:min-h-[180px]"
					>
						{/* Decorative illustration - only on lg+ screens */}
						<div className="hidden lg:block absolute right-0 top-0 w-1/2 h-full">
							<motion.div
								className="absolute top-6 right-6 size-16 bg-blue-200 rounded-3xl opacity-60"
								animate={{ rotate: [0, 5, 0], y: [0, -5, 0] }}
								transition={{ duration: 4, repeat: Infinity }}
							/>
							<motion.div
								className="absolute top-16 right-24 size-12 bg-blue-300 rounded-2xl opacity-50"
								animate={{ rotate: [0, -5, 0], y: [0, 5, 0] }}
								transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
							/>
							<motion.div
								className="absolute bottom-10 right-14 size-16 bg-white rounded-2xl shadow-lg flex items-center justify-center"
								animate={{ y: [0, -8, 0] }}
								transition={{ duration: 2.5, repeat: Infinity }}
							>
								<ASCIIIcon icon="↔" size="lg" className="text-blue-700" />
							</motion.div>
							<motion.div
								className="absolute top-1/2 right-40 size-8 bg-blue-400 rounded-full opacity-40"
								animate={{ scale: [1, 1.1, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
						</div>

						{/* Rotating circles background - decoration for mobile/tablet only */}
						<motion.div
							className="lg:hidden absolute top-4 right-4 w-[200px] h-[200px] border border-blue-100 rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
						/>
						<motion.div
							className="lg:hidden absolute bottom-4 right-16 w-[200px] h-[200px] border border-blue-100 rounded-full"
							animate={{ rotate: -360 }}
							transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
						/>

						<div className="relative z-10 max-w-sm">
							<h3 className="text-xl lg:text-2xl text-gray-950 mb-2">On/Off Ramp Gateway</h3>
							<p className="text-sm lg:text-base text-gray-900 leading-relaxed">
								Seamless fiat-to-crypto conversion with built-in regulatory compliance
							</p>
						</div>
					</motion.div>

					{/* Wide card at bottom - AI-Agent Analysis */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="md:col-span-2 lg:col-span-3 bg-claude-bg-200/55  rounded-3xl p-8 relative overflow-hidden md:min-h-[180px]"
					>
						<div className="flex flex-col md:flex-row items-center justify-between gap-8">
							<div className="flex-1">
								<h3 className="text-xl lg:text-2xl text-gray-950 mb-2">AI-Agent DeFi Market Analysis</h3>
								<p className="text-sm lg:text-base text-gray-900 max-w-xl">
									24/7 DeFi monitoring, automated rebalancing across DeFi & CeFi protocols
								</p>
							</div>

							{/* Stats */}
							<div className="flex gap-8">
								<motion.div className="text-center" whileHover={{ scale: 1.05 }}>
									<motion.p
										className="text-2xl text-gray-900"
										initial={{ opacity: 0 }}
										animate={isInView ? { opacity: 1 } : {}}
										transition={{ delay: 0.6 }}
									>
										24/7
									</motion.p>
									<p className="text-gray-900 text-sm">DeFi Monitoring</p>
								</motion.div>
								<motion.div className="text-center" whileHover={{ scale: 1.05 }}>
									<motion.p
										className="text-2xl text-gray-900"
										initial={{ opacity: 0 }}
										animate={isInView ? { opacity: 1 } : {}}
										transition={{ delay: 0.7 }}
									>
										5+
									</motion.p>
									<p className="text-gray-900 text-sm">DeFi & CeFi</p>
								</motion.div>
								<motion.div className="text-center" whileHover={{ scale: 1.05 }}>
									<motion.p
										className="text-2xl text-gray-900"
										initial={{ opacity: 0 }}
										animate={isInView ? { opacity: 1 } : {}}
										transition={{ delay: 0.8 }}
									>
										Auto
									</motion.p>
									<p className="text-gray-900 text-sm">Automated Rebalancing</p>
								</motion.div>
							</div>
						</div>

						{/* Decorative elements */}
						<motion.div
							className="absolute top-4 right-4 w-10 h-10 border border-claude-bg-300 rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
						/>
						<motion.div
							className="absolute bottom-4 right-20 w-6 h-6 border border-claude-bg-300 rounded-full"
							animate={{ rotate: -360 }}
							transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
						/>
					</motion.div>
				</div>
			</motion.div>
		</section>
	)
}
