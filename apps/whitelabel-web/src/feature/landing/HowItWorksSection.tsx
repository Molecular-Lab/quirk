import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef, useEffect } from "react"
import { ArrowDown, TrendingUp, DollarSign, Clock } from "lucide-react"

export function HowItWorksSection() {
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

	const titleVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const cardVariants = {
		hidden: { opacity: 0, y: 50, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1]
			}
		}
	}

	const FlowStep = ({
		icon: Icon,
		text,
		delay = 0,
		highlight = false
	}: {
		icon: React.ElementType
		text: string
		delay?: number
		highlight?: boolean
	}) => {
		const stepVariants = {
			hidden: { opacity: 0, y: 20, scale: 0.9 },
			visible: {
				opacity: 1,
				y: 0,
				scale: 1,
				transition: {
					duration: 0.5,
					delay,
					ease: [0.22, 1, 0.36, 1]
				}
			}
		}

		return (
			<motion.div
				variants={stepVariants}
				className="flex flex-col items-center gap-3"
			>
				<motion.div
					whileHover={{ scale: 1.1, rotate: 5 }}
					transition={{ type: "spring", stiffness: 300 }}
					className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
						highlight
							? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
							: "bg-white border-2 border-gray-200 text-gray-700"
					}`}
				>
					<Icon className="w-8 h-8" />
				</motion.div>
				<p className={`text-lg font-medium text-center ${highlight ? "text-gray-950 font-semibold" : "text-gray-700"}`}>
					{text}
				</p>
			</motion.div>
		)
	}

	const AnimatedArrow = ({ delay = 0, highlight = false }: { delay?: number; highlight?: boolean }) => (
		<motion.div
			className="flex justify-center"
			initial={{ opacity: 0, y: -10 }}
			animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
			transition={{ delay: delay + 0.3, duration: 0.4 }}
		>
			<motion.div
				animate={{ y: [0, 4, 0] }}
				transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
			>
				<ArrowDown className={`w-6 h-6 ${highlight ? "text-purple-500" : "text-gray-400"}`} />
			</motion.div>
		</motion.div>
	)

	const AnimatedNumber = ({
		value,
		suffix = "",
		prefix = "",
		delay = 0,
		decimals = 0
	}: {
		value: number
		suffix?: string
		prefix?: string
		delay?: number
		decimals?: number
	}) => {
		const count = useMotionValue(0)
		const rounded = useTransform(count, (latest) => {
			if (decimals === 0) {
				return Math.round(latest).toLocaleString()
			}
			return latest.toLocaleString(undefined, {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals
			})
		})

		useEffect(() => {
			if (isInView) {
				const timeout = setTimeout(() => {
					const controls = animate(count, value, {
						duration: 2,
						ease: [0.22, 1, 0.36, 1]
					})
					return () => controls.stop()
				}, delay * 1000)
				return () => clearTimeout(timeout)
			}
		}, [isInView, value, delay, count])

		return (
			<motion.span
				initial={{ opacity: 0, scale: 0.5 }}
				animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
				transition={{ delay, duration: 0.5 }}
			>
				{prefix}
				<motion.span>{rounded}</motion.span>
				{suffix}
			</motion.span>
		)
	}

	return (
		<section className="py-24 bg-gradient-to-b from-white to-blue-50/20 overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6"
			>
				<motion.div className="text-center mb-16" variants={titleVariants}>
					<motion.h2
						className="text-6xl font-bold text-gray-950 mb-4"
						variants={titleVariants}
					>
						How It Works
					</motion.h2>
					<motion.p
						className="text-xl text-gray-700 max-w-3xl mx-auto"
						variants={titleVariants}
					>
						Transform idle funds into revenue-generating assets with Quirk's automated yield infrastructure
					</motion.p>
				</motion.div>

				<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Before Section */}
					<motion.div
						variants={cardVariants}
						whileHover={{ y: -5, transition: { duration: 0.3 } }}
						className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border-2 border-gray-200 shadow-lg"
					>
						<div className="text-center mb-8">
							<motion.h3
								className="text-4xl font-bold text-gray-950 mb-2"
								initial={{ opacity: 0, x: -20 }}
								animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
								transition={{ delay: 0.3, duration: 0.5 }}
							>
								Before
							</motion.h3>
							<motion.div
								className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto"
								initial={{ scaleX: 0 }}
								animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
								transition={{ delay: 0.4, duration: 0.6 }}
							/>
						</div>

						<div className="space-y-6">
							<FlowStep icon={DollarSign} text="Operational Float: $50M" delay={0.1} />
							<AnimatedArrow delay={0.2} />
							<FlowStep icon={Clock} text="14 days idle" delay={0.2} />
							<AnimatedArrow delay={0.3} />
							<FlowStep icon={DollarSign} text="User Payout" delay={0.3} />
						</div>

						<motion.div
							className="mt-10 pt-8 border-t-2 border-gray-200"
							initial={{ opacity: 0 }}
							animate={isInView ? { opacity: 1 } : { opacity: 0 }}
							transition={{ delay: 0.6, duration: 0.5 }}
						>
							<div className="text-center">
								<p className="text-sm text-gray-500 mb-2">Platform Revenue</p>
								<p className="text-5xl font-bold text-gray-400">
									<AnimatedNumber value={0} suffix="/year" delay={0.8} />
								</p>
							</div>
						</motion.div>
					</motion.div>

					{/* After Section */}
					<motion.div
						variants={cardVariants}
						whileHover={{ y: -5, transition: { duration: 0.3 } }}
						className="bg-gradient-to-br from-purple-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border-2 border-purple-200 shadow-xl relative overflow-hidden"
					>
						{/* Decorative gradient overlay */}
						<motion.div
							className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400"
							initial={{ scaleX: 0 }}
							animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
							transition={{ delay: 0.5, duration: 0.8 }}
						/>

						{/* Shimmer effect */}
						<motion.div
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
							animate={{ x: ["-100%", "100%"] }}
							transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
						/>

						<div className="text-center mb-8 relative z-10">
							<motion.h3
								className="text-4xl font-bold text-gray-950 mb-2"
								initial={{ opacity: 0, x: 20 }}
								animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
								transition={{ delay: 0.3, duration: 0.5 }}
							>
								After
							</motion.h3>
							<motion.div
								className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"
								initial={{ scaleX: 0 }}
								animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
								transition={{ delay: 0.4, duration: 0.6 }}
							/>
						</div>

						<div className="space-y-6 relative z-10">
							<FlowStep icon={DollarSign} text="Operational Float: $50M" delay={0.5} />
							<AnimatedArrow delay={0.6} highlight />
							<FlowStep icon={TrendingUp} text="Quirk Stablecoin Yield (5%)" delay={0.6} highlight />
							<AnimatedArrow delay={0.7} highlight />
							<FlowStep icon={Clock} text="Auto Withdraw on demand" delay={0.7} />
							<AnimatedArrow delay={0.8} highlight />
							<FlowStep icon={DollarSign} text="User Payout" delay={0.8} />
						</div>

						<motion.div
							className="mt-10 pt-8 border-t-2 border-purple-200/50 relative z-10"
							initial={{ opacity: 0 }}
							animate={isInView ? { opacity: 1 } : { opacity: 0 }}
							transition={{ delay: 0.9, duration: 0.5 }}
						>
							<div className="space-y-4">
								<div className="text-center">
									<p className="text-sm text-gray-600 mb-1">Gross Revenue</p>
									<p className="text-4xl font-bold text-gray-950">
										$<AnimatedNumber value={2.5} suffix="M/year" delay={1} decimals={1} />
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200/30">
									<div className="text-center">
										<p className="text-xs text-gray-600 mb-1">Platform</p>
										<p className="text-2xl font-bold text-purple-600">
											$<AnimatedNumber value={2.25} suffix="M" delay={1.1} decimals={2} />
										</p>
										<p className="text-xs text-gray-500 mt-1">(90%)</p>
									</div>
									<div className="text-center">
										<p className="text-xs text-gray-600 mb-1">Quirk</p>
										<p className="text-2xl font-bold text-blue-600">
											$<AnimatedNumber value={250} suffix="k" delay={1.2} />
										</p>
										<p className="text-xs text-gray-500 mt-1">(10%)</p>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>
		</section>
	)
}
