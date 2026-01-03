import { motion, useInView } from "framer-motion"
import { Smartphone, Wallet, TrendingUp, Shield, Zap } from "lucide-react"
import { useRef } from "react"

const features = [
	{
		icon: Wallet,
		title: "Embedded Savings",
		description: "Let your users save directly within your platform",
	},
	{
		icon: TrendingUp,
		title: "Yield Generation",
		description: "Competitive returns powered by DeFi protocols",
	},
	{
		icon: Shield,
		title: "Institutional Security",
		description: "MPC custody keeps funds protected at all times",
	},
	{
		icon: Zap,
		title: "Instant Integration",
		description: "Go live in minutes with our simple SDK",
	},
]

export const WhyQuirkSection = () => {
	const sectionRef = useRef(null)
	const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

	return (
		<section ref={sectionRef} className="py-24 lg:py-32 bg-gray-50">
			<div className="max-w-7xl mx-auto px-6">
				{/* Header */}
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						Earn Anywhere, Everywhere
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Quirk is an embedded financial service provider for your platform
						that helps your workers and users save better.
					</p>
					<p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
						New seamless saving experiences — start right inside your apps and
						help millions of workers.
					</p>
				</motion.div>

				{/* Main Content: Phone + Features */}
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					{/* Phone Mockup */}
					<motion.div
						className="relative order-2 lg:order-1"
						initial={{ opacity: 0, x: -50 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
						transition={{ duration: 0.7, delay: 0.2 }}
					>
						{/* EXPLORE Text Behind */}
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<span className="text-[120px] lg:text-[180px] font-bold text-gray-100 tracking-tight select-none">
								EXPLORE
							</span>
						</div>

						{/* Phone Frame */}
						<div className="relative z-10 mx-auto w-[280px] lg:w-[320px]">
							<div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
								<div className="bg-white rounded-[2.5rem] overflow-hidden">
									{/* Status Bar */}
									<div className="bg-gray-50 px-6 py-3 flex items-center justify-between text-sm">
										<span className="font-medium text-gray-900">9:41</span>
										<div className="flex items-center gap-1">
											<div className="w-4 h-2 bg-gray-900 rounded-sm" />
											<div className="w-4 h-4 border-2 border-gray-900 rounded-full" />
										</div>
									</div>

									{/* App Header */}
									<div className="px-6 py-4 border-b border-gray-100">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
												<span className="text-white text-xs font-bold">Q</span>
											</div>
											<span className="font-semibold text-gray-900">
												Wallet
											</span>
										</div>
									</div>

									{/* Balance Card */}
									<div className="p-6">
										<div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-5 text-white mb-4">
											<p className="text-sm text-gray-300 mb-1">
												Total Balance
											</p>
											<p className="text-3xl font-bold">$12,450.00</p>
											<div className="flex items-center gap-2 mt-3">
												<span className="text-xs bg-white/20 px-2 py-1 rounded-full">
													+5.2% APY
												</span>
											</div>
										</div>

										{/* Quick Actions */}
										<div className="grid grid-cols-3 gap-3">
											<div className="bg-gray-50 rounded-xl p-3 text-center">
												<div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2" />
												<span className="text-xs text-gray-600">Deposit</span>
											</div>
											<div className="bg-gray-50 rounded-xl p-3 text-center">
												<div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2" />
												<span className="text-xs text-gray-600">Withdraw</span>
											</div>
											<div className="bg-gray-50 rounded-xl p-3 text-center">
												<div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2" />
												<span className="text-xs text-gray-600">History</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Phone Notch */}
							<div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full" />
						</div>
					</motion.div>

					{/* Feature Cards */}
					<motion.div
						className="order-1 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
						initial={{ opacity: 0, x: 50 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
						transition={{ duration: 0.7, delay: 0.3 }}
					>
						{features.map((feature, index) => {
							const Icon = feature.icon
							return (
								<motion.div
									key={feature.title}
									className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
									initial={{ opacity: 0, y: 20 }}
									animate={
										isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
									}
									transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
									whileHover={{ y: -4 }}
								>
									<div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
										<Icon className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
									</div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{feature.title}
									</h3>
									<p className="text-gray-600 text-sm">{feature.description}</p>
								</motion.div>
							)
						})}
					</motion.div>
				</div>

				{/* Why Quirk Badge */}
				<motion.div
					className="mt-20 text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.5, delay: 0.8 }}
				>
					<div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-100">
						<Smartphone className="w-5 h-5 text-gray-600" />
						<span className="text-gray-700 font-medium">
							Enabling Smart Savings Inside Your Platform
						</span>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
