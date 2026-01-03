import {
	motion,
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
	const containerRef = useRef<HTMLDivElement>(null)
	const [activeStep, setActiveStep] = useState(0)
	const [hasAnimated, setHasAnimated] = useState<Record<number, boolean>>({})

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	})

	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (value) => {
			// Slower progression - divide total scroll by number of steps
			const step = Math.min(Math.floor(value * milestones.length), milestones.length - 1)
			setActiveStep(step)

			// Track which steps have been animated
			if (!hasAnimated[step]) {
				setHasAnimated(prev => ({ ...prev, [step]: true }))
			}
		})
		return unsubscribe
	}, [scrollYProgress, hasAnimated])

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
			if (isVisible) {
				const timeout = setTimeout(() => {
					const controls = animate(count, value, {
						duration: 2,
						ease: [0.22, 1, 0.36, 1],
					})
					return () => controls.stop()
				}, delay * 1000)
				return () => clearTimeout(timeout)
			}
		}, [isVisible, value, delay, count])

		return (
			<>
				{prefix}
				<motion.span>{rounded}</motion.span>
				{suffix}
			</>
		)
	}

	return (
		<section ref={containerRef} className="bg-white">
			{/* Tall scroll container - 4 steps = 400vh for slower scroll */}
			<div className="relative" style={{ height: "400vh" }}>
				{/* Sticky content that stays in view */}
				<div className="sticky top-0 h-screen flex items-center justify-center p-4">
					{/* Full Card Container - 90vw x 90vh */}
					<div
						className="bg-gray-50 rounded-3xl p-6 lg:p-10 flex flex-col"
						style={{ width: "90vw", height: "90vh", maxWidth: "90vw", maxHeight: "90vh" }}
					>
						{/* Header inside card */}
						<div className="text-center mb-6 lg:mb-10">
							<h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
								How Quirk Works
							</h2>
						</div>

						{/* Main Layout: Steps + Cards */}
						<div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-10 min-h-0">
							{/* Left: Milestone Steps with Vertical Line */}
							<div className="lg:w-52 flex-shrink-0">
								<div className="relative h-full">
									{/* Vertical Line Background */}
									<div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />

									{/* Vertical Line Progress */}
									<motion.div
										className="absolute left-5 top-5 w-0.5 bg-gray-900 origin-top transition-all duration-500"
										style={{
											height: `calc(${Math.min((activeStep / (milestones.length - 1)) * 100, 100)}% - 20px)`,
										}}
									/>

									<div className="space-y-10 relative">
										{milestones.map((milestone, index) => (
											<motion.div
												key={milestone.id}
												className="flex items-center gap-4"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
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
							<div className="flex-1 grid lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
								{/* QUIRKLESS Card */}
								<div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 flex flex-col justify-between overflow-hidden">
									<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
										Without Quirk
									</p>

									<div className="flex-1 flex flex-col justify-center space-y-8">
										{/* Row 1: Idle Capital - $50M (shows at step 0) */}
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={activeStep >= 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
											transition={{ duration: 0.5 }}
										>
											<p className="text-sm text-gray-500 mb-1">Idle Capital</p>
											<p className="text-4xl lg:text-5xl font-bold text-gray-900">
												$50M
											</p>
										</motion.div>

										{/* Row 2: Earn Yield - 0% APY (shows at step 2) */}
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={activeStep >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
											transition={{ duration: 0.5 }}
										>
											<p className="text-sm text-gray-500 mb-1">Annual Yield</p>
											<p className="text-5xl lg:text-6xl font-bold text-gray-300">
												0%
											</p>
											<p className="text-sm text-gray-400 mt-1">APY</p>
										</motion.div>
									</div>
								</div>

								{/* QUIRK Card */}
								<div className="bg-gray-900 rounded-2xl p-6 lg:p-8 text-white flex flex-col justify-between overflow-hidden">
									<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
										With Quirk
									</p>

									<div className="flex-1 flex flex-col justify-center space-y-6">
										{/* Row 1: Idle Capital - $50M (shows at step 0) */}
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={activeStep >= 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
											transition={{ duration: 0.5 }}
										>
											<p className="text-sm text-gray-400 mb-1">Idle Capital</p>
											<p className="text-4xl lg:text-5xl font-bold text-white">
												$50M
											</p>
										</motion.div>

										{/* Row 2: Earn Yield - 5% APY (shows at step 2) */}
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={activeStep >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
											transition={{ duration: 0.5 }}
										>
											<p className="text-sm text-gray-400 mb-1">Annual Yield</p>
											<p className="text-4xl lg:text-5xl font-bold text-green-400">
												<AnimatedNumber value={5} delay={0.3} isVisible={activeStep >= 2} />%
											</p>
											<p className="text-sm text-gray-400">APY</p>
										</motion.div>

										{/* Row 3: Revenue - $2.5M (shows at step 3) */}
										<motion.div
											className="pt-4 border-t border-gray-700"
											initial={{ opacity: 0, y: 20 }}
											animate={activeStep >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
											transition={{ duration: 0.5 }}
										>
											<p className="text-sm text-gray-400 mb-1">Your Revenue</p>
											<p className="text-5xl lg:text-6xl font-bold text-white">
												$<AnimatedNumber value={2.5} suffix="M" delay={0.3} decimals={1} isVisible={activeStep >= 3} />
											</p>
											<p className="text-xs text-gray-500 mt-1">
												per year (90% share)
											</p>
										</motion.div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
