import {
	motion,
	useInView,
	useScroll,
	useTransform,
	useMotionValue,
	animate,
} from "framer-motion"
import { useRef, useEffect, useState } from "react"

const milestones = [
	{ id: 1, label: "Idle Capital" },
	{ id: 2, label: "Connect Quirk" },
	{ id: 3, label: "Earn Yield" },
	{ id: 4, label: "Revenue" },
]

export function HowItWorksSection() {
	const ref = useRef(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const isInView = useInView(ref, { once: true, amount: 0.2 })
	const [activeStep, setActiveStep] = useState(0)

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start center", "end center"],
	})

	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (value) => {
			const step = Math.min(Math.floor(value * milestones.length), milestones.length - 1)
			setActiveStep(step)
		})
		return unsubscribe
	}, [scrollYProgress])

	const AnimatedNumber = ({
		value,
		suffix = "",
		prefix = "",
		delay = 0,
		decimals = 0,
		isVisible = true,
	}: {
		value: number
		suffix?: string
		prefix?: string
		delay?: number
		decimals?: number
		isVisible?: boolean
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
			if (isInView && isVisible) {
				const timeout = setTimeout(() => {
					const controls = animate(count, value, {
						duration: 2,
						ease: [0.22, 1, 0.36, 1],
					})
					return () => controls.stop()
				}, delay * 1000)
				return () => clearTimeout(timeout)
			}
		}, [isInView, isVisible, value, delay, count])

		return (
			<>
				{prefix}
				<motion.span>{rounded}</motion.span>
				{suffix}
			</>
		)
	}

	// Calculate line progress based on active step
	const lineProgress = useTransform(scrollYProgress, [0, 1], [0, 100])

	return (
		<section ref={containerRef} className="py-24 lg:py-32 bg-white overflow-hidden">
			<motion.div
				ref={ref}
				initial={{ opacity: 0 }}
				animate={isInView ? { opacity: 1 } : { opacity: 0 }}
				transition={{ duration: 0.6 }}
				className="px-4 lg:px-8"
				style={{ maxWidth: "90vw", margin: "0 auto" }}
			>
				{/* Header */}
				<motion.div
					className="text-center mb-16 lg:mb-24"
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
						How Quirk Works
					</h2>
				</motion.div>

				{/* Main Layout: Steps + Cards */}
				<div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
					<div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
						{/* Left: Milestone Steps with Vertical Line */}
						<div className="lg:w-48 flex-shrink-0">
							<div className="relative">
								{/* Vertical Line Background */}
								<div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />

								{/* Vertical Line Progress */}
								<motion.div
									className="absolute left-5 top-5 w-0.5 bg-gray-900 origin-top"
									style={{
										height: `${Math.min((activeStep / (milestones.length - 1)) * 100, 100)}%`,
									}}
								/>

								<div className="space-y-8 relative">
									{milestones.map((milestone, index) => (
										<motion.div
											key={milestone.id}
											className="flex items-center gap-4"
											initial={{ opacity: 0, x: -20 }}
											animate={isInView ? { opacity: 1, x: 0 } : {}}
											transition={{ delay: 0.2 + index * 0.1 }}
										>
											<div
												className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${
													index <= activeStep
														? "border-gray-900 bg-gray-900"
														: "border-gray-300 bg-white"
												}`}
											>
												{index <= activeStep && (
													<motion.div
														className="w-2 h-2 bg-white rounded-full"
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
													/>
												)}
											</div>
											<span
												className={`text-sm font-medium transition-colors duration-300 ${
													index <= activeStep ? "text-gray-900" : "text-gray-400"
												}`}
											>
												{milestone.label}
											</span>
										</motion.div>
									))}
								</div>
							</div>
						</div>

						{/* Right: Comparison Cards */}
						<div className="flex-1 grid lg:grid-cols-2 gap-6 lg:gap-8">
							{/* QUIRKLESS Card */}
							<motion.div
								className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-200"
								initial={{ opacity: 0, y: 20 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ delay: 0.4 }}
							>
								<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-8">
									Without Quirk
								</p>

								{/* Row 1: Idle Capital - $50M (shows at step 0) */}
								<motion.div
									className="mb-10"
									initial={{ opacity: 0, y: 15 }}
									animate={activeStep >= 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
									transition={{ duration: 0.5 }}
								>
									<p className="text-sm text-gray-500 mb-2">Idle Capital</p>
									<p className="text-5xl lg:text-6xl font-bold text-gray-900">
										$50M
									</p>
								</motion.div>

								{/* Row 2: Earn Yield - 0% APY (shows at step 2) */}
								<motion.div
									className="text-center"
									initial={{ opacity: 0, y: 15 }}
									animate={activeStep >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
									transition={{ duration: 0.5 }}
								>
									<p className="text-sm text-gray-500 mb-2">Annual Yield</p>
									<p className="text-6xl lg:text-7xl font-bold text-gray-300">
										0%
									</p>
									<p className="text-lg text-gray-400 mt-2">APY</p>
								</motion.div>
							</motion.div>

							{/* QUIRK Card */}
							<motion.div
								className="bg-gray-900 rounded-2xl p-8 lg:p-10 text-white"
								initial={{ opacity: 0, y: 20 }}
								animate={isInView ? { opacity: 1, y: 0 } : {}}
								transition={{ delay: 0.5 }}
							>
								<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-8">
									With Quirk
								</p>

								{/* Row 1: Idle Capital - $50M (shows at step 0) */}
								<motion.div
									className="mb-8"
									initial={{ opacity: 0, y: 15 }}
									animate={activeStep >= 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
									transition={{ duration: 0.5 }}
								>
									<p className="text-sm text-gray-400 mb-2">Idle Capital</p>
									<p className="text-5xl lg:text-6xl font-bold text-white">
										$50M
									</p>
								</motion.div>

								{/* Row 2: Earn Yield - 5% APY (shows at step 2) */}
								<motion.div
									className="mb-8"
									initial={{ opacity: 0, y: 15 }}
									animate={activeStep >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
									transition={{ duration: 0.5 }}
								>
									<p className="text-sm text-gray-400 mb-2">Annual Yield</p>
									<p className="text-5xl lg:text-6xl font-bold text-green-400">
										<AnimatedNumber value={5} delay={0.3} isVisible={activeStep >= 2} />%
									</p>
									<p className="text-sm text-gray-400">APY</p>
								</motion.div>

								{/* Row 3: Revenue - $2.5M (shows at step 3) */}
								<motion.div
									className="pt-8 border-t border-gray-700"
									initial={{ opacity: 0, y: 15 }}
									animate={activeStep >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
									transition={{ duration: 0.5 }}
								>
									<p className="text-sm text-gray-400 mb-2">Your Revenue</p>
									<p className="text-6xl lg:text-7xl font-bold text-white">
										$<AnimatedNumber value={2.5} suffix="M" delay={0.3} decimals={1} isVisible={activeStep >= 3} />
									</p>
									<p className="text-sm text-gray-500 mt-2">
										per year (90% share)
									</p>
								</motion.div>
							</motion.div>
						</div>
					</div>
				</div>
			</motion.div>
		</section>
	)
}
