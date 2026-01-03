import {
	motion,
	useInView,
	useMotionValue,
	useTransform,
	animate,
} from "framer-motion"
import { useRef, useEffect } from "react"
import { ArrowRight, TrendingUp } from "lucide-react"

export function HowItWorksSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.15 })

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
				initial={{ opacity: 0 }}
				animate={isInView ? { opacity: 1 } : { opacity: 0 }}
				transition={{ delay, duration: 0.5 }}
			>
				{prefix}
				<motion.span>{rounded}</motion.span>
				{suffix}
			</motion.span>
		)
	}

	return (
		<section className="py-32 lg:py-40 bg-gray-50 overflow-hidden">
			<motion.div
				ref={ref}
				initial={{ opacity: 0 }}
				animate={isInView ? { opacity: 1 } : { opacity: 0 }}
				transition={{ duration: 0.6 }}
				className="max-w-7xl mx-auto px-6"
			>
				{/* Header */}
				<motion.div
					className="text-center mb-24"
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
					transition={{ duration: 0.6 }}
				>
					<h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
						How Quirk Works
					</h2>
					<p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
						Transform idle funds into revenue-generating assets with Quirk's
						automated yield infrastructure
					</p>
				</motion.div>

				{/* Big Number Display */}
				<motion.div
					className="text-center mb-24"
					initial={{ opacity: 0, scale: 0.9 }}
					animate={
						isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
					}
					transition={{ duration: 0.7, delay: 0.2 }}
				>
					<p className="text-lg text-gray-500 mb-4 uppercase tracking-wider">
						Your Operational Float
					</p>
					<div className="text-[100px] lg:text-[150px] font-bold text-gray-900 leading-none">
						$<AnimatedNumber value={50} delay={0.3} />M
					</div>
					<p className="text-xl text-gray-500 mt-4">
						sitting idle, earning nothing
					</p>
				</motion.div>

				{/* Arrow */}
				<motion.div
					className="flex justify-center mb-24"
					initial={{ opacity: 0, y: -20 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					<motion.div
						animate={{ y: [0, 10, 0] }}
						transition={{ duration: 1.5, repeat: Infinity }}
						className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center"
					>
						<ArrowRight className="w-8 h-8 text-white rotate-90" />
					</motion.div>
				</motion.div>

				{/* Result Cards */}
				<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
					{/* Without Quirk */}
					<motion.div
						className="bg-white rounded-3xl p-10 lg:p-14 border border-gray-200"
						initial={{ opacity: 0, x: -30 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
						transition={{ delay: 0.6, duration: 0.6 }}
					>
						<div className="mb-10">
							<span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
								Without Quirk
							</span>
							<h3 className="text-3xl font-bold text-gray-900 mt-2">Before</h3>
						</div>

						<div className="space-y-6 mb-10">
							<div className="flex items-center justify-between py-4 border-b border-gray-100">
								<span className="text-lg text-gray-600">
									Operational Float
								</span>
								<span className="text-xl font-semibold text-gray-900">
									$50M
								</span>
							</div>
							<div className="flex items-center justify-between py-4 border-b border-gray-100">
								<span className="text-lg text-gray-600">Idle Period</span>
								<span className="text-xl font-semibold text-gray-900">
									14 days
								</span>
							</div>
							<div className="flex items-center justify-between py-4">
								<span className="text-lg text-gray-600">Annual Yield</span>
								<span className="text-xl font-semibold text-gray-400">0%</span>
							</div>
						</div>

						<div className="pt-8 border-t border-gray-100 text-center">
							<p className="text-sm text-gray-500 mb-3 uppercase tracking-wide">
								Annual Revenue
							</p>
							<p className="text-6xl lg:text-7xl font-bold text-gray-300">
								$0
							</p>
						</div>
					</motion.div>

					{/* With Quirk */}
					<motion.div
						className="bg-gray-900 rounded-3xl p-10 lg:p-14 text-white"
						initial={{ opacity: 0, x: 30 }}
						animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
						transition={{ delay: 0.7, duration: 0.6 }}
					>
						<div className="mb-10">
							<span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
								With Quirk
							</span>
							<h3 className="text-3xl font-bold text-white mt-2 flex items-center gap-3">
								After
								<TrendingUp className="w-8 h-8 text-green-400" />
							</h3>
						</div>

						<div className="space-y-6 mb-10">
							<div className="flex items-center justify-between py-4 border-b border-gray-700">
								<span className="text-lg text-gray-300">
									Operational Float
								</span>
								<span className="text-xl font-semibold text-white">$50M</span>
							</div>
							<div className="flex items-center justify-between py-4 border-b border-gray-700">
								<span className="text-lg text-gray-300">Yield Strategy</span>
								<span className="text-xl font-semibold text-white">
									Auto-optimized
								</span>
							</div>
							<div className="flex items-center justify-between py-4">
								<span className="text-lg text-gray-300">Annual Yield</span>
								<span className="text-xl font-semibold text-green-400">
									~5% APY
								</span>
							</div>
						</div>

						<div className="pt-8 border-t border-gray-700">
							<div className="text-center mb-8">
								<p className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
									Gross Revenue
								</p>
								<p className="text-6xl lg:text-7xl font-bold text-white">
									$<AnimatedNumber value={2.5} suffix="M" delay={1} decimals={1} />
								</p>
							</div>
							<div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-700">
								<div className="text-center">
									<p className="text-sm text-gray-400 mb-2">Your Platform</p>
									<p className="text-3xl font-bold text-white">
										$<AnimatedNumber value={2.25} suffix="M" delay={1.1} decimals={2} />
									</p>
									<p className="text-sm text-gray-500 mt-1">90% share</p>
								</div>
								<div className="text-center">
									<p className="text-sm text-gray-400 mb-2">Quirk Fee</p>
									<p className="text-3xl font-bold text-gray-400">
										$<AnimatedNumber value={250} suffix="k" delay={1.2} />
									</p>
									<p className="text-sm text-gray-500 mt-1">10% share</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</motion.div>
		</section>
	)
}
