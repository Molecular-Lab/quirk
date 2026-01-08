import { useEffect, useRef, useState } from "react"

import { motion, useInView } from "framer-motion"
import { ChevronLeft, ChevronRight, TrendingUp, Users } from "lucide-react"

interface Benefit {
	id: number
	title: string
	description: string
	comparisonBefore?: string
	comparisonAfter?: string
	beforeLabel?: string
	afterLabel?: string
	icon?: "trending" | "retention"
}

const benefits: Benefit[] = [
	{
		id: 1,
		title: "Turn Dormant Balances into Revenue",
		description:
			"With Quirk, settlement capital transforms into active revenue streams. Idle balances that would otherwise generate zero return now earn up to 5% APY.",
		comparisonBefore: "0%",
		comparisonAfter: "~5%",
		beforeLabel: "Without Quirk",
		afterLabel: "Annual Yield",
		icon: "trending",
	},
	{
		id: 2,
		title: "Inflation Hedge & Wealth Modernization",
		description:
			"In regions with 5-15% inflation, USD-denominated stablecoin yields protect user purchasing power when local currencies crash. Your platform becomes their financial safe haven for wealth modernization.",
		comparisonBefore: "5-15%",
		comparisonAfter: "Protected",
		beforeLabel: "Fiat Inflation",
		afterLabel: "Wealth Maintained",
		icon: "trending",
	},
	{
		id: 3,
		title: "Create User Retention & In-App Engagement",
		description:
			"Capital earning yield in-wallet keeps users engaged in your ecosystem. Stop losing users to external savings accounts—keep them in your app where their money works for them.",
		icon: "retention",
	},
	{
		id: 4,
		title: "Win-Win-Win Revenue Model",
		description:
			"You keep 90% of generated yield with full control to configure end-user distribution for maximum retention. Seamless saving experiences right inside your app help millions maintain their wealth and avoid inflation.",
		comparisonBefore: "90%",
		comparisonAfter: "10%",
		beforeLabel: "Your Revenue",
		afterLabel: "Platform Fee",
		icon: "trending",
	},
]

export function BenefitsSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.2 })
	const [activeIndex, setActiveIndex] = useState(0)
	const [autoSlide, setAutoSlide] = useState(true)

	// Auto-slide every 8 seconds (slower)
	useEffect(() => {
		if (!autoSlide) return

		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev === benefits.length - 1 ? 0 : prev + 1))
		}, 8000)

		return () => {
			clearInterval(interval)
		}
	}, [autoSlide])

	// Reset auto-slide timer when manually clicking
	const handlePrevious = () => {
		setActiveIndex((prev) => (prev === 0 ? benefits.length - 1 : prev - 1))
		setAutoSlide(false)
		setTimeout(() => {
			setAutoSlide(true)
		}, 100) // Resume after brief pause
	}

	const handleNext = () => {
		setActiveIndex((prev) => (prev === benefits.length - 1 ? 0 : prev + 1))
		setAutoSlide(false)
		setTimeout(() => {
			setAutoSlide(true)
		}, 100) // Resume after brief pause
	}

	const handleDotClick = (index: number) => {
		setActiveIndex(index)
		setAutoSlide(false)
		setTimeout(() => {
			setAutoSlide(true)
		}, 100) // Resume after brief pause
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: 0.1,
			},
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	}

	return (
		<section className="py-24 bg-claude-bg-50 ">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-4xl mx-auto px-6"
			>
				{/* Header */}
				<motion.div className="text-center mb-16" variants={itemVariants}>
					<motion.div
						className="inline-flex items-center gap-2 mb-4 px-4 py-1 rounded-full bg-claude-orange-100/80 border border-white/20 text-claude-orange-500 text-xs font-medium cursor-pointer hover:scale-[1.04] transition-all"
						whileHover={{ scale: 1.05 }}
					>
						BENEFITS
					</motion.div>
					<h2 className="text-2xl lg:text-4xl font-normal text-claude-gray-900 mb-4">Unlock Real Value</h2>
					<p className="text-base text-claude-gray-800 max-w-2xl mx-auto">
						Turn dormant treasury into active revenue with transparent, predictable returns
					</p>
				</motion.div>

				{/* Carousel Container */}
				<motion.div variants={itemVariants} className="relative">
					{/* Main Card */}
					<div className="bg-claude-bg-200/40 rounded-3xl border border-gray-200 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
						{/* Content - Grid Layout */}
						<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
							{/* Left Side - Text (Centered) */}
							<div className="flex flex-col justify-center items-center text-center">
								<motion.h3
									key={`title-${activeIndex}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
									className="text-base md:text-lg lg:text-xl font-normal text-claude-gray-900 mb-2"
								>
									{benefits[activeIndex].title}
								</motion.h3>
								<motion.p
									key={`desc-${activeIndex}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: 0.1 }}
									className="text-xs md:text-sm text-claude-gray-800 leading-relaxed"
								>
									{benefits[activeIndex].description}
								</motion.p>
							</div>

							{/* Right Side - Comparison or Icon */}
							{benefits[activeIndex].icon === "retention" ? (
								<motion.div
									key={`icon-${activeIndex}`}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.2 }}
									className="flex justify-center"
								>
									<div className="bg-gradient-to-br from-claude-orange-100 to-orange-50 rounded-3xl p-8 md:p-12 flex items-center justify-center shadow-sm">
										<Users className="size-5 md:size-15 text-claude-orange-500" />
									</div>
								</motion.div>
							) : benefits[activeIndex].comparisonBefore && benefits[activeIndex].comparisonAfter ? (
								<motion.div
									key={`comparison-${activeIndex}`}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.2 }}
									className="flex items-center justify-center gap-3 md:gap-4"
								>
									{/* Before Stat */}
									<div className="bg-gradient-to-br from-gray-100 to-white rounded-2xl px-3 py-3 md:px-6 md:py-5 text-center min-w-[90px] md:min-w-[120px] shadow-sm">
										<p className="text-md md:text-lg lg:text-2xl font-medium text-gray-600 mb-1">
											{benefits[activeIndex].comparisonBefore}
										</p>
										<p className="text-[10px] md:text-xs text-gray-800">{benefits[activeIndex].beforeLabel}</p>
									</div>

									{/* Arrow Icon */}
									{benefits[activeIndex].icon === "trending" && (
										<TrendingUp className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-claude-orange-500 flex-shrink-0" />
									)}

									{/* After Stat */}
									<div className="bg-gradient-to-br from-claude-orange-100 to-orange-50 rounded-2xl px-3 py-3 md:px-6 md:py-5 text-center min-w-[90px] md:min-w-[120px]">
										<p className="text-md md:text-lg lg:text-2xl font-medium text-claude-orange-500 mb-1">
											{benefits[activeIndex].comparisonAfter}
										</p>
										<p className="text-[10px] md:text-xs text-claude-gray-900">{benefits[activeIndex].afterLabel}</p>
									</div>
								</motion.div>
							) : null}
						</div>

						{/* Navigation Controls */}
						<div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
							{/* Progress Indicators */}
							<div className="flex gap-2">
								{benefits.map((_, index) => (
									<button
										key={index}
										onClick={() => {
											handleDotClick(index)
										}}
										className={`h-1.5 rounded-full transition-all duration-300 ${
											index === activeIndex ? "w-8 bg-claude-orange-500" : "w-1.5 bg-gray-300 hover:bg-gray-400"
										}`}
										aria-label={`Go to benefit ${index + 1}`}
									/>
								))}
							</div>

							{/* Arrow Buttons */}
							<div className="flex gap-2">
								<motion.button
									onClick={handlePrevious}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
									aria-label="Previous benefit"
								>
									<ChevronLeft className="w-5 h-5 text-gray-600" />
								</motion.button>
								<motion.button
									onClick={handleNext}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors"
									aria-label="Next benefit"
								>
									<ChevronRight className="w-5 h-5 text-gray-600" />
								</motion.button>
							</div>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</section>
	)
}
