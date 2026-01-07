import { useEffect, useRef, useState } from "react"

import { motion, useScroll } from "framer-motion"

// Platform stage data structure
interface PlatformStage {
	id: number
	name: string
	backgroundText: string // Large text displayed behind phone
	cardColor: string
	bgColor: string
	balance: string
	balanceLabel: string
	transactions: {
		type: string
		amount: string
		time: string
		color: string
	}[]
}

const platformStages: PlatformStage[] = [
	{
		id: 0,
		name: "E-commerce Platform",
		backgroundText: "E-COMMERCE",
		cardColor: "bg-gradient-to-br from-gray-900 to-gray-700",
		bgColor: "bg-gray-50",
		balance: "$850.00",
		balanceLabel: "Worker Payout Balance",
		transactions: [
			{ type: "Weekly Payout", amount: "+$850.00", time: "Today", color: "text-gray-900" },
			{ type: "Order Fulfillment", amount: "+$340.00", time: "2 days ago", color: "text-gray-900" },
			{ type: "Customer Support", amount: "+$180.00", time: "3 days ago", color: "text-gray-900" },
		],
	},
	{
		id: 1,
		name: "Gig Workers",
		backgroundText: "GIG WORKERS",
		cardColor: "bg-gradient-to-br from-green-900 to-green-700",
		bgColor: "bg-green-50",
		balance: "$1,250.00",
		balanceLabel: "Worker Payout Balance",
		transactions: [
			{ type: "Food Delivery", amount: "+$450.00", time: "Today", color: "text-green-900" },
			{ type: "Ride Earnings", amount: "+$380.00", time: "Yesterday", color: "text-green-900" },
			{ type: "Task Completion", amount: "+$420.00", time: "2 days ago", color: "text-green-900" },
		],
	},
	{
		id: 2,
		name: "Freelancers",
		backgroundText: "FREELANCERS",
		cardColor: "bg-gradient-to-br from-blue-900 to-blue-700",
		bgColor: "bg-blue-50",
		balance: "$5,600.00",
		balanceLabel: "Worker Payout Balance",
		transactions: [
			{ type: "Project Payment", amount: "+$3,200.00", time: "Today", color: "text-blue-900" },
			{ type: "Milestone Release", amount: "+$1,800.00", time: "Yesterday", color: "text-blue-900" },
			{ type: "Bonus Payment", amount: "+$600.00", time: "2 days ago", color: "text-blue-900" },
		],
	},
	{
		id: 3,
		name: "Creators",
		backgroundText: "CREATORS",
		cardColor: "bg-gradient-to-br from-red-900 to-red-700",
		bgColor: "bg-red-50",
		balance: "$3,840.00",
		balanceLabel: "Worker Payout Balance",
		transactions: [
			{ type: "Content Revenue", amount: "+$2,100.00", time: "Today", color: "text-red-900" },
			{ type: "Sponsorship", amount: "+$1,200.00", time: "2 days ago", color: "text-red-900" },
			{ type: "Membership", amount: "+$540.00", time: "3 days ago", color: "text-red-900" },
		],
	},
]

export function PlatformShowcaseSection() {
	const containerRef = useRef<HTMLDivElement>(null)
	const [activeStage, setActiveStage] = useState(0) // Start at stage 0 (removed intro)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start center", "end start"],
	})

	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (value) => {
			// Stage 0: E-commerce (0-25%)
			if (value < 0.25) {
				setActiveStage(0)
			}
			// Stage 1: Gig Workers (25-50%)
			else if (value < 0.5) {
				setActiveStage(1)
			}
			// Stage 2: Freelancers (50-75%)
			else if (value < 0.75) {
				setActiveStage(2)
			}
			// Stage 3: Creators (75-100%)
			else {
				setActiveStage(3)
			}
		})
		return unsubscribe
	}, [scrollYProgress])

	// Get current stage data
	const currentStage = platformStages[activeStage]

	return (
		<section
			ref={containerRef}
			className={`${currentStage?.bgColor || "bg-claude-bg-100"} transition-colors duration-700`}
		>
			{/* Tall scroll container - 400vh for 4 stages */}
			<div className="relative" style={{ height: "400vh" }}>
				{/* Sticky content that stays in view */}
				<div className="sticky top-0 h-screen flex items-center justify-center">
					{/* Header Text - Above Phone */}
					<div className="absolute top-12 lg:top-16 left-0 right-0 text-center z-20 pointer-events-none pb-10">
						<motion.h2
							className="text-3xl lg:text-5xl font-medium text-gray-900"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
						>
							Any platforms, Any apps, At Scales
						</motion.h2>
					</div>
					<div className="w-full max-w-7xl mx-auto px-6">
						<div className="relative h-screen flex items-center justify-center">
							{/* Platform Showcase: Centered phone with large background text */}
							{currentStage && (
								<div className="relative flex items-center justify-center h-full">
									{/* Large Background Text - Beside/Below Phone (hidden on mobile) */}
									<div className="absolute inset-0 overflow-visible pointer-events-none">
										{/* Background text positioned below phone, centered horizontally */}
										<motion.h3
											key={`bg-text-${activeStage}`}
											className="hidden md:block absolute bottom-4 lg:bottom-12 left-1/2 -translate-x-1/2 text-[5rem] lg:text-[10rem] xl:text-[14rem] font-bold text-gray-900/[0.08] uppercase tracking-tighter leading-none whitespace-nowrap"
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
										>
											{currentStage?.backgroundText}
										</motion.h3>
									</div>

									{/* Centered Phone (z-index above background text) */}
									<motion.div
										className="relative z-10 w-[320px] lg:w-[380px]"
										initial={{ opacity: 0, y: 50 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
									>
										<div className="bg-gray-900 rounded-[3rem] p-3 relative">
											{/* Phone Notch */}
											<div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-900 rounded-full z-[100]" />

											<div className="bg-gray-50 rounded-[2.5rem] overflow-hidden relative">
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

												{/* Phone Content */}
												<div className="p-8 pt-6 pb-6 h-[500px] overflow-hidden">
													<motion.div
														key={`stage-${activeStage}`}
														initial={{ opacity: 0, x: 20 }}
														animate={{ opacity: 1, x: 0 }}
														exit={{ opacity: 0, x: -20 }}
														transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
													>
														{/* Balance Card */}
														<div
															className={`${currentStage?.cardColor} rounded-2xl p-6 text-white mb-6 transition-all duration-700`}
														>
															<p className="text-sm text-gray-300 mb-2">{currentStage?.balanceLabel}</p>
															<p className="text-4xl font-bold mb-3">{currentStage?.balance}</p>
														</div>

														{/* Transaction List */}
														{currentStage && currentStage.transactions.length > 0 && (
															<div className="space-y-3">
																{currentStage.transactions.map((transaction, i) => (
																	<motion.div
																		key={i}
																		className="bg-white rounded-xl p-4 flex items-center justify-between"
																		initial={{ opacity: 0, y: 10 }}
																		animate={{ opacity: 1, y: 0 }}
																		transition={{ delay: 0.1 + i * 0.1 }}
																	>
																		<div className="flex items-center gap-3">
																			<div className="w-2 h-2 bg-gray-900 rounded-full" />
																			<div>
																				<p className="text-sm font-medium text-gray-900">{transaction.type}</p>
																				<p className="text-xs text-gray-500">{transaction.time}</p>
																			</div>
																		</div>
																		<span className={`text-sm font-semibold ${transaction.color}`}>
																			{transaction.amount}
																		</span>
																	</motion.div>
																))}
															</div>
														)}
													</motion.div>
												</div>
											</div>
										</div>

										{/* Bottom Gradient Fade */}
										<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pointer-events-none" />
									</motion.div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
