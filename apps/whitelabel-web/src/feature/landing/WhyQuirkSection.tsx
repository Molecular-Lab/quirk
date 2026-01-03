import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export const WhyQuirkSection = () => {
	const sectionRef = useRef(null)
	const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

	return (
		<section ref={sectionRef} className="py-24 lg:py-32 bg-white">
			<div className="max-w-7xl mx-auto px-6">
				{/* Content Card */}
				<motion.div
					className="bg-gray-50 rounded-3xl p-12 lg:p-20"
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
					transition={{ duration: 0.6 }}
				>
					{/* Header */}
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						<h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
							Earn Anywhere, Everywhere
						</h2>
						<p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
							Quirk is an embedded financial service provider for your platform
							that helps your workers and users save better.
						</p>
						<p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
							New seamless saving experiences — start right inside your apps and
							help millions of workers.
						</p>
					</motion.div>

					{/* Phone Mockup - Centered & Large */}
					<motion.div
						className="relative flex justify-center"
						initial={{ opacity: 0, y: 50 }}
						animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
						transition={{ duration: 0.7, delay: 0.3 }}
					>
						{/* EXPLORE Text Behind */}
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
							<span className="text-[200px] lg:text-[300px] font-bold text-gray-200/50 tracking-tight select-none whitespace-nowrap">
								EXPLORE
							</span>
						</div>

						{/* Phone Frame */}
						<div className="relative z-10 w-[320px] lg:w-[380px]">
							<motion.div
								className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl"
								whileHover={{ y: -8 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
							>
								<div className="bg-white rounded-[2.5rem] overflow-hidden">
									{/* Status Bar */}
									<div className="bg-gray-50 px-8 py-4 flex items-center justify-between text-sm">
										<span className="font-semibold text-gray-900">9:41</span>
										<div className="flex items-center gap-2">
											<div className="flex gap-0.5">
												<div className="w-1 h-3 bg-gray-900 rounded-full" />
												<div className="w-1 h-3 bg-gray-900 rounded-full" />
												<div className="w-1 h-2 bg-gray-400 rounded-full" />
												<div className="w-1 h-1.5 bg-gray-400 rounded-full" />
											</div>
											<div className="w-6 h-3 bg-gray-900 rounded-sm" />
										</div>
									</div>

									{/* App Header */}
									<div className="px-8 py-5 border-b border-gray-100">
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
												<span className="text-white text-sm font-bold">Q</span>
											</div>
											<span className="text-xl font-semibold text-gray-900">
												Wallet
											</span>
										</div>
									</div>

									{/* Balance Card */}
									<div className="p-8">
										<motion.div
											className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white mb-6"
											initial={{ scale: 0.95 }}
											animate={isInView ? { scale: 1 } : { scale: 0.95 }}
											transition={{ delay: 0.5, duration: 0.4 }}
										>
											<p className="text-sm text-gray-300 mb-2">
												Total Balance
											</p>
											<p className="text-4xl font-bold mb-3">$12,450.00</p>
											<div className="flex items-center gap-3">
												<span className="text-sm bg-white/20 px-3 py-1.5 rounded-full">
													+5.2% APY
												</span>
												<span className="text-sm text-gray-300">
													Earning yield
												</span>
											</div>
										</motion.div>

										{/* Quick Actions */}
										<div className="grid grid-cols-3 gap-4">
											{["Deposit", "Withdraw", "History"].map((action, i) => (
												<motion.div
													key={action}
													className="bg-gray-100 rounded-xl p-4 text-center"
													initial={{ opacity: 0, y: 10 }}
													animate={
														isInView
															? { opacity: 1, y: 0 }
															: { opacity: 0, y: 10 }
													}
													transition={{ delay: 0.6 + i * 0.1 }}
												>
													<div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-2" />
													<span className="text-sm text-gray-600">
														{action}
													</span>
												</motion.div>
											))}
										</div>
									</div>
								</div>
							</motion.div>

							{/* Phone Notch */}
							<div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-900 rounded-full" />
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}
