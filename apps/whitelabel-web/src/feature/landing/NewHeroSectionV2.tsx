import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FloatingElement } from "@/components/animations"

export function NewHeroSectionV2() {
	const containerRef = useRef<HTMLElement>(null)
	const sectionRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(sectionRef, { once: true, margin: "-50px" })

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"]
	})

	const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
	const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

	// Animation variants
	const headlineVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: (custom: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				delay: 0.3 + custom * 0.15,
				ease: [0.22, 1, 0.36, 1] as const
			}
		})
	}

	const subtitleVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: (custom: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				delay: 1.2 + custom * 0.1,
				ease: [0.22, 1, 0.36, 1] as const
			}
		})
	}

	const phoneContainerVariants = {
		hidden: { opacity: 0, x: 50 },
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.7,
				delay: 1.8,
				ease: [0.22, 1, 0.36, 1] as const
			}
		}
	}

	const balanceCardVariants = {
		hidden: { scale: 0.95, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				delay: 2.0,
				duration: 0.4
			}
		}
	}

	return (
		<section
			ref={containerRef}
			className="relative min-h-screen flex items-center overflow-hidden"
		>
			{/* Animated GIF background with parallax */}
			<motion.div
				className="absolute inset-0 opacity-10"
				style={{ y: backgroundY }}
			>
				<img
					src="/Loop Background GIF by Trakto.gif"
					className="w-full h-full object-cover"
					alt=""
				/>
			</motion.div>

			{/* Overlay to soften with gray tones */}
			<div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white" />

			{/* Animated decorative gradients */}
			<FloatingElement
				className="absolute top-20 -right-20 w-[700px] h-[700px] bg-gradient-to-br from-gray-200/25 via-gray-200/20 to-gray-100/15 rounded-full blur-[120px]"
				duration={8}
				distance={30}
				delay={0}
			/>
			<FloatingElement
				className="absolute bottom-0 -left-20 w-[700px] h-[700px] bg-gradient-to-tr from-gray-200/20 via-gray-200/15 to-transparent rounded-full blur-[120px]"
				duration={10}
				distance={25}
				delay={2}
			/>
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-white/20 to-white/90" />

			{/* Animated floating shapes */}
			<FloatingElement
				className="absolute top-1/4 left-[10%] w-4 h-4 rounded-full bg-gray-400/40"
				duration={5}
				distance={15}
				delay={0.5}
			/>
			<FloatingElement
				className="absolute top-1/3 right-[15%] w-3 h-3 rounded-full bg-gray-300/40"
				duration={4}
				distance={12}
				delay={1}
			/>
			<FloatingElement
				className="absolute bottom-1/3 left-[20%] w-2 h-2 rounded-full bg-gray-300/50"
				duration={6}
				distance={18}
				delay={1.5}
			/>
			<FloatingElement
				className="absolute top-1/2 right-[25%] w-5 h-5 rounded-full bg-gray-300/30"
				duration={7}
				distance={20}
				delay={0.8}
			/>

			{/* Two-column grid layout */}
			<motion.div
				ref={sectionRef}
				className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20"
				style={{ y: textY, opacity }}
			>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

					{/* LEFT COLUMN: Text Content */}
					<div className="flex flex-col items-center text-center">
						{/* Headlines */}
						<motion.h1
							className="text-5xl lg:text-6xl font-normal text-gray-900 mb-2"
							custom={0}
							variants={headlineVariants}
							initial="hidden"
							animate={isInView ? "visible" : "hidden"}
						>
							Quirk is an financial service provider
						</motion.h1>
						<motion.h1
							className="text-5xl lg:text-6xl font-normal text-gray-900 mb-2"
							custom={1}
							variants={headlineVariants}
							initial="hidden"
							animate={isInView ? "visible" : "hidden"}
						>
							we helps you unlock
						</motion.h1>
						<motion.h1
							className="text-5xl lg:text-6xl font-normal text-gray-900 mb-8"
							custom={2}
							variants={headlineVariants}
							initial="hidden"
							animate={isInView ? "visible" : "hidden"}
						>
							the instant revenue streams
						</motion.h1>

						{/* Subtitles */}
						<motion.p
							className="text-lg text-gray-500 max-w-2xl"
							custom={0}
							variants={subtitleVariants}
							initial="hidden"
							animate={isInView ? "visible" : "hidden"}
						>
							New Seamless Saving Experiences
						</motion.p>
						<motion.p
							className="text-3xl text-gray-800 mt-3 max-w-2xl"
							custom={1}
							variants={subtitleVariants}
							initial="hidden"
							animate={isInView ? "visible" : "hidden"}
						>
							Start Right Inside Your Apps and Help Millions of Users
						</motion.p>
					</div>

					{/* RIGHT COLUMN: Phone Mockup */}
					<motion.div
						className="relative flex justify-center lg:justify-end"
						variants={phoneContainerVariants}
						initial="hidden"
						animate={isInView ? "visible" : "hidden"}
					>
						{/* Phone Frame - Taller */}
						<div className="relative z-10 w-[300px] lg:w-[360px]">
							<motion.div
								className="bg-gray-900 rounded-[3rem] p-3 relative"
							>
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

									{/* Balance Card */}
									<div className="p-8 pt-6 pb-6">
										<motion.div
											className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white mb-6"
											variants={balanceCardVariants}
											initial="hidden"
											animate={isInView ? "visible" : "hidden"}
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

										{/* Transaction List */}
										<div className="space-y-3">
											{[
												{ type: "Yield Earned", amount: "+$12.50", time: "Today", color: "text-green-600", bg: "bg-white" },
												{ type: "Transfer to Savings", amount: "-$500.00", time: "Yesterday", color: "text-gray-900", bg: "bg-white" },
												{ type: "Yield Earned", amount: "+$11.80", time: "2 days ago", color: "text-green-600", bg: "bg-white" },
												{ type: "Deposit", amount: "+$1,000.00", time: "3 days ago", color: "text-gray-900", bg: "bg-white" },
											].map((transaction, i) => (
												<motion.div
													key={i}
													className={`${transaction.bg} rounded-xl p-4 flex items-center justify-between`}
													initial={{ opacity: 0, y: 10 }}
													animate={
														isInView
															? { opacity: 1, y: 0 }
															: { opacity: 0, y: 10 }
													}
													transition={{ delay: 2.2 + i * 0.1 }}
												>
													<div className="flex items-center gap-3">
														<div className="w-2 h-2 bg-gray-900 rounded-full" />
														<div>
															<p className="text-sm font-medium text-gray-900">
																{transaction.type}
															</p>
															<p className="text-xs text-gray-500">
																{transaction.time}
															</p>
														</div>
													</div>
													<span className={`text-sm font-semibold ${transaction.color}`}>
														{transaction.amount}
													</span>
												</motion.div>
											))}

											{/* Join Waitlist Button */}
											<motion.a
												href="https://tally.so/r/VLGvyj"
												target="_blank"
												rel="noopener noreferrer"
												className="block bg-gray-900 text-white text-center py-3 px-4 rounded-xl font-medium text-sm shadow-lg hover:bg-gray-800 transition-colors mt-3"
												initial={{ opacity: 0, y: 10 }}
												animate={
													isInView
														? { opacity: 1, y: 0 }
														: { opacity: 0, y: 10 }
												}
												transition={{ delay: 2.7 }}
											>
												Join Our Waitlist
											</motion.a>
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</motion.div>
		</section>
	)
}
