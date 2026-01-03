import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Zap, Shield, TrendingUp, Clock, Wallet, PieChart } from "lucide-react"

export function FeaturesGridSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.15 })

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2
			}
		}
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 30, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: [0.22, 1, 0.36, 1] as const
			}
		}
	}

	return (
		<section className="py-24 bg-gradient-to-b from-white to-purple-50/30 overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6"
			>
				{/* Section Header */}
				<motion.div className="text-center mb-16" variants={itemVariants}>
					<motion.span
						className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6"
						whileHover={{ scale: 1.05 }}
					>
						<Zap className="w-4 h-4" />
						Key Features
					</motion.span>
					<h2 className="text-5xl font-bold text-gray-950 mb-4">
						Explore Our
					</h2>
					<h2 className="text-5xl font-bold text-purple-600">
						Standout Features
					</h2>
				</motion.div>

				{/* Bento Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Large Feature Card - Spans 2 columns */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="lg:col-span-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl p-8 relative overflow-hidden min-h-[320px]"
					>
						{/* Decorative illustration */}
						<div className="absolute right-0 top-0 w-1/2 h-full">
							<motion.div
								className="absolute top-8 right-8 w-32 h-32 bg-purple-200 rounded-3xl opacity-60"
								animate={{ rotate: [0, 5, 0], y: [0, -5, 0] }}
								transition={{ duration: 4, repeat: Infinity }}
							/>
							<motion.div
								className="absolute top-20 right-24 w-20 h-20 bg-purple-300 rounded-2xl opacity-50"
								animate={{ rotate: [0, -5, 0], y: [0, 5, 0] }}
								transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
							/>
							<motion.div
								className="absolute bottom-16 right-16 w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center"
								animate={{ y: [0, -8, 0] }}
								transition={{ duration: 2.5, repeat: Infinity }}
							>
								<TrendingUp className="w-10 h-10 text-purple-600" />
							</motion.div>
							<motion.div
								className="absolute top-1/2 right-40 w-16 h-16 bg-purple-400 rounded-full opacity-40"
								animate={{ scale: [1, 1.1, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
						</div>

						<div className="relative z-10 max-w-md">
							<motion.div
								className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-6"
								whileHover={{ scale: 1.1, rotate: 5 }}
							>
								<TrendingUp className="w-7 h-7 text-white" />
							</motion.div>
							<h3 className="text-2xl font-bold text-gray-950 mb-3">
								Automated Yield Generation
							</h3>
							<p className="text-gray-600 text-lg leading-relaxed">
								Turn idle balances into active revenue streams automatically. Our AI-powered strategies optimize returns while you focus on your core business.
							</p>
						</div>
					</motion.div>

					{/* Small Card with Stats */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="bg-white rounded-3xl p-8 border border-gray-100 relative overflow-hidden"
					>
						<motion.div
							className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6"
							whileHover={{ scale: 1.1 }}
						>
							<Shield className="w-6 h-6 text-orange-600" />
						</motion.div>
						<h3 className="text-xl font-bold text-gray-950 mb-2">
							Institutional Security
						</h3>
						<p className="text-gray-600 mb-6">
							MPC custody keeps funds protected at all times.
						</p>

						{/* Mini stat card */}
						<motion.div
							className="bg-orange-50 rounded-2xl p-4 flex items-center gap-4"
							whileHover={{ scale: 1.02 }}
						>
							<div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
								<Shield className="w-6 h-6 text-orange-500" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Security Level</p>
								<p className="text-xl font-bold text-orange-600">Enterprise</p>
							</div>
						</motion.div>
					</motion.div>

					{/* Card with percentage highlight */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="bg-white rounded-3xl p-8 border border-gray-100"
					>
						<motion.div
							className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6"
							whileHover={{ scale: 1.1 }}
						>
							<PieChart className="w-6 h-6 text-blue-600" />
						</motion.div>
						<h3 className="text-xl font-bold text-gray-950 mb-2">
							Revenue Share
						</h3>
						<p className="text-gray-600 mb-6">
							Keep the majority of generated yield for your platform.
						</p>

						<div className="flex items-end gap-2">
							<motion.span
								className="text-5xl font-bold text-purple-600"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={isInView ? { opacity: 1, scale: 1 } : {}}
								transition={{ delay: 0.5, type: "spring" as const }}
							>
								90%
							</motion.span>
							<span className="text-gray-500 mb-2">for you</span>
						</div>
					</motion.div>

					{/* Card with time indicator */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-8 relative overflow-hidden"
					>
						<motion.div
							className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-200 rounded-full opacity-50"
							animate={{ scale: [1, 1.1, 1] }}
							transition={{ duration: 3, repeat: Infinity }}
						/>
						<motion.div
							className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6"
							whileHover={{ scale: 1.1 }}
						>
							<Clock className="w-6 h-6 text-white" />
						</motion.div>
						<h3 className="text-xl font-bold text-gray-950 mb-2">
							Quick Integration
						</h3>
						<p className="text-gray-600 mb-4">
							Get up and running in minutes, not months.
						</p>
						<div className="flex items-center gap-2 text-orange-600 font-semibold">
							<span className="text-3xl">~5</span>
							<span>minutes to integrate</span>
						</div>
					</motion.div>

					{/* Wide card at bottom */}
					<motion.div
						variants={itemVariants}
						whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
						className="lg:col-span-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 relative overflow-hidden"
					>
						<div className="flex flex-col md:flex-row items-center justify-between gap-8">
							<div className="flex-1">
								<motion.div
									className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6"
									whileHover={{ scale: 1.1 }}
								>
									<Wallet className="w-6 h-6 text-white" />
								</motion.div>
								<h3 className="text-2xl font-bold text-white mb-3">
									White-Label Ready
								</h3>
								<p className="text-gray-400 text-lg max-w-xl">
									Fully customizable branding. Your users see your brand, powered by Quirk's infrastructure behind the scenes.
								</p>
							</div>

							{/* Stats */}
							<div className="flex gap-8">
								<motion.div
									className="text-center"
									whileHover={{ scale: 1.05 }}
								>
									<motion.p
										className="text-4xl font-bold text-white"
										initial={{ opacity: 0 }}
										animate={isInView ? { opacity: 1 } : {}}
										transition={{ delay: 0.6 }}
									>
										$50M+
									</motion.p>
									<p className="text-gray-400 text-sm">Assets Managed</p>
								</motion.div>
								<motion.div
									className="text-center"
									whileHover={{ scale: 1.05 }}
								>
									<motion.p
										className="text-4xl font-bold text-white"
										initial={{ opacity: 0 }}
										animate={isInView ? { opacity: 1 } : {}}
										transition={{ delay: 0.7 }}
									>
										5%+
									</motion.p>
									<p className="text-gray-400 text-sm">APY Average</p>
								</motion.div>
								<motion.div
									className="text-center"
									whileHover={{ scale: 1.05 }}
								>
									<motion.p
										className="text-4xl font-bold text-white"
										initial={{ opacity: 0 }}
										animate={isInView ? { opacity: 1 } : {}}
										transition={{ delay: 0.8 }}
									>
										24/7
									</motion.p>
									<p className="text-gray-400 text-sm">Monitoring</p>
								</motion.div>
							</div>
						</div>

						{/* Decorative elements */}
						<motion.div
							className="absolute top-4 right-4 w-20 h-20 border border-white/10 rounded-full"
							animate={{ rotate: 360 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
						/>
						<motion.div
							className="absolute bottom-4 right-20 w-12 h-12 border border-white/10 rounded-full"
							animate={{ rotate: -360 }}
							transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
						/>
					</motion.div>
				</div>
			</motion.div>
		</section>
	)
}
