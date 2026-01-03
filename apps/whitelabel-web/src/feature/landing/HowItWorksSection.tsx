import {
	motion,
	useInView,
	useMotionValue,
	useTransform,
	animate,
	useScroll,
} from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ArrowRight, TrendingUp, DollarSign, Clock, Zap } from "lucide-react"

const steps = [
	{
		number: "01",
		title: "Connect Your Platform",
		description: "Integrate Quirk SDK in minutes with our simple API",
		icon: Zap,
	},
	{
		number: "02",
		title: "Deposit Idle Funds",
		description: "Operational float automatically flows into yield strategies",
		icon: DollarSign,
	},
	{
		number: "03",
		title: "Earn Yield",
		description: "Smart agents optimize returns across DeFi protocols",
		icon: TrendingUp,
	},
	{
		number: "04",
		title: "Withdraw Anytime",
		description: "Instant liquidity when your users need their funds",
		icon: Clock,
	},
]

export function HowItWorksSection() {
	const ref = useRef(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(ref, { once: true, amount: 0.15 })
	const [activeStep, setActiveStep] = useState(0)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start center", "end center"],
	})

	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (value) => {
			const stepIndex = Math.min(
				Math.floor(value * steps.length),
				steps.length - 1
			)
			setActiveStep(stepIndex)
		})
		return unsubscribe
	}, [scrollYProgress])

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

	const titleVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	}

	const AnimatedNumber = ({
		value,
		suffix = "",
		prefix = "",
		delay = 0,
		decimals = 0,
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
				maximumFractionDigits: decimals,
			})
		})

		useEffect(() => {
			if (isInView) {
				const timeout = setTimeout(() => {
					const controls = animate(count, value, {
						duration: 2,
						ease: [0.22, 1, 0.36, 1],
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
		<section className="py-24 lg:py-32 bg-white overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6"
			>
				{/* Header */}
				<motion.div className="text-center mb-20" variants={titleVariants}>
					<h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
						How Quirk Works
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Transform idle funds into revenue-generating assets with Quirk's
						automated yield infrastructure
					</p>
				</motion.div>

				{/* Steps */}
				<div ref={containerRef} className="mb-20">
					<div className="grid md:grid-cols-4 gap-6">
						{steps.map((step, index) => {
							const Icon = step.icon
							const isActive = index <= activeStep

							return (
								<motion.div
									key={step.number}
									className={`relative bg-gray-50 rounded-2xl p-6 border-2 transition-all duration-500 ${
										isActive
											? "border-gray-900 bg-white shadow-lg"
											: "border-gray-100"
									}`}
									initial={{ opacity: 0, y: 30 }}
									animate={
										isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
									}
									transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
									whileHover={{ y: -4 }}
								>
									{/* Step Number */}
									<span
										className={`text-sm font-bold transition-colors duration-300 ${
											isActive ? "text-gray-900" : "text-gray-300"
										}`}
									>
										{step.number}
									</span>

									{/* Icon */}
									<div
										className={`w-12 h-12 rounded-xl flex items-center justify-center mt-4 mb-4 transition-all duration-300 ${
											isActive ? "bg-gray-900" : "bg-gray-200"
										}`}
									>
										<Icon
											className={`w-6 h-6 transition-colors duration-300 ${
												isActive ? "text-white" : "text-gray-500"
											}`}
										/>
									</div>

									{/* Content */}
									<h3
										className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
											isActive ? "text-gray-900" : "text-gray-500"
										}`}
									>
										{step.title}
									</h3>
									<p
										className={`text-sm transition-colors duration-300 ${
											isActive ? "text-gray-600" : "text-gray-400"
										}`}
									>
										{step.description}
									</p>

									{/* Connector Arrow */}
									{index < steps.length - 1 && (
										<div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
											<ArrowRight
												className={`w-6 h-6 transition-colors duration-300 ${
													isActive ? "text-gray-900" : "text-gray-300"
												}`}
											/>
										</div>
									)}
								</motion.div>
							)
						})}
					</div>
				</div>

				{/* Before/After Comparison */}
				<div className="grid lg:grid-cols-2 gap-8">
					{/* Before */}
					<motion.div
						className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
						initial={{ opacity: 0, x: -30 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						<div className="text-center mb-8">
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								Without Quirk
							</span>
							<h3 className="text-2xl font-bold text-gray-900 mt-2">Before</h3>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between py-3 border-b border-gray-200">
								<span className="text-gray-600">Operational Float</span>
								<span className="font-semibold text-gray-900">$50M</span>
							</div>
							<div className="flex items-center justify-between py-3 border-b border-gray-200">
								<span className="text-gray-600">Idle Period</span>
								<span className="font-semibold text-gray-900">14 days</span>
							</div>
							<div className="flex items-center justify-between py-3 border-b border-gray-200">
								<span className="text-gray-600">Annual Yield</span>
								<span className="font-semibold text-gray-400">0%</span>
							</div>
						</div>

						<div className="mt-8 pt-6 border-t border-gray-200 text-center">
							<p className="text-sm text-gray-500 mb-2">Platform Revenue</p>
							<p className="text-4xl font-bold text-gray-400">
								$<AnimatedNumber value={0} suffix="/year" delay={0.8} />
							</p>
						</div>
					</motion.div>

					{/* After */}
					<motion.div
						className="bg-white rounded-2xl p-8 border-2 border-gray-900 shadow-xl"
						initial={{ opacity: 0, x: 30 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
						transition={{ delay: 0.6, duration: 0.6 }}
					>
						<div className="text-center mb-8">
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
								With Quirk
							</span>
							<h3 className="text-2xl font-bold text-gray-900 mt-2">After</h3>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between py-3 border-b border-gray-200">
								<span className="text-gray-600">Operational Float</span>
								<span className="font-semibold text-gray-900">$50M</span>
							</div>
							<div className="flex items-center justify-between py-3 border-b border-gray-200">
								<span className="text-gray-600">Yield Strategy</span>
								<span className="font-semibold text-gray-900">
									Auto-optimized
								</span>
							</div>
							<div className="flex items-center justify-between py-3 border-b border-gray-200">
								<span className="text-gray-600">Annual Yield</span>
								<span className="font-semibold text-gray-900">~5% APY</span>
							</div>
						</div>

						<div className="mt-8 pt-6 border-t border-gray-200">
							<div className="text-center mb-4">
								<p className="text-sm text-gray-500 mb-2">Gross Revenue</p>
								<p className="text-4xl font-bold text-gray-900">
									$<AnimatedNumber value={2.5} suffix="M/year" delay={1} decimals={1} />
								</p>
							</div>
							<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
								<div className="text-center">
									<p className="text-xs text-gray-500 mb-1">Your Platform</p>
									<p className="text-xl font-bold text-gray-900">
										$<AnimatedNumber value={2.25} suffix="M" delay={1.1} decimals={2} />
									</p>
									<p className="text-xs text-gray-400">(90%)</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-gray-500 mb-1">Quirk Fee</p>
									<p className="text-xl font-bold text-gray-500">
										$<AnimatedNumber value={250} suffix="k" delay={1.2} />
									</p>
									<p className="text-xs text-gray-400">(10%)</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</motion.div>
		</section>
	)
}
