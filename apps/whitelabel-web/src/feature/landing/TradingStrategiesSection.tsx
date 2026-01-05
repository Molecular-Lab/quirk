import { useState, useRef } from "react"
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { Doughnut } from "react-chartjs-2"

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"

import type { ChartOptions } from "chart.js"
import "./TradingStrategies.css"

ChartJS.register(ArcElement, Tooltip, Legend)

export function TradingStrategiesSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.2 })

	const [allocations, setAllocations] = useState({
		lending: 20,
		staking: 20,
		arbitrage: 20,
		cefi: 20,
		liquidityProvider: 20,
	})

	const handleAllocationChange = (strategy: keyof typeof allocations, value: number) => {
		const currentValue = allocations[strategy]
		const diff = value - currentValue

		if (diff === 0) return

		const otherStrategies = Object.keys(allocations).filter(
			(key) => key !== strategy,
		) as (keyof typeof allocations)[]

		// Calculate how much we need to take from/give to other sliders
		const otherTotal = otherStrategies.reduce((sum, key) => sum + allocations[key], 0)

		if (otherTotal === 0 && diff > 0) return // Can't increase if others are at 0

		const newAllocations = { ...allocations, [strategy]: value }

		// Distribute the difference proportionally among other strategies
		otherStrategies.forEach((key) => {
			if (otherTotal > 0) {
				const proportion = allocations[key] / otherTotal
				const adjustment = Math.round(diff * proportion)
				newAllocations[key] = Math.max(0, Math.min(100, allocations[key] - adjustment))
			} else {
				// If other totals are 0, distribute equally
				newAllocations[key] = Math.round((100 - value) / otherStrategies.length)
			}
		})

		// Ensure total is exactly 100
		const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0)
		if (total !== 100) {
			const adjustment = total - 100
			// Adjust the first non-changed strategy that can absorb the difference
			for (const key of otherStrategies) {
				const newVal = newAllocations[key] - adjustment
				if (newVal >= 0 && newVal <= 100) {
					newAllocations[key] = newVal
					break
				}
			}
		}

		setAllocations(newAllocations)
	}

	const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0)

	const chartData = {
		labels: ["Lending", "Staking", "Arbitrage", "CeFi", "Liquidity Provider"],
		datasets: [
			{
				data: [allocations.lending, allocations.staking, allocations.arbitrage, allocations.cefi, allocations.liquidityProvider],
				backgroundColor: [
					"#6B7280", // Gray-500 for Lending
					"#60A5FA", // Softer blue for Staking
					"#FBBF24", // Softer amber for Arbitrage
					"#34D399", // Softer emerald for CeFi
					"#F472B6", // Softer pink for Liquidity Provider
				],
				borderColor: "#ffffff",
				borderWidth: 4,
			},
		],
	}

	const chartOptions: ChartOptions<"doughnut"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				padding: 12,
				cornerRadius: 8,
				titleFont: {
					size: 14,
					weight: "bold",
				},
				bodyFont: {
					size: 13,
				},
				callbacks: {
					label: function (context) {
						return context.label + ": " + context.parsed + "%"
					},
				},
			},
		},
		cutout: "70%",
	}

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
				ease: [0.22, 1, 0.36, 1] as const
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
				ease: [0.22, 1, 0.36, 1] as const
			}
		}
	}

	const sliderVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: (index: number) => ({
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.4,
				delay: 0.3 + index * 0.1,
				ease: [0.22, 1, 0.36, 1] as const
			}
		})
	}

	const chartVariants = {
		hidden: { opacity: 0, scale: 0.8, rotate: -180 },
		visible: {
			opacity: 1,
			scale: 1,
			rotate: 0,
			transition: {
				duration: 0.8,
				ease: [0.22, 1, 0.36, 1] as const
			}
		}
	}

	// Animated percentage in center
	const AnimatedPercentage = () => {
		const count = useMotionValue(0)
		const rounded = useTransform(count, (latest) => Math.round(latest))

		if (isInView) {
			animate(count, totalAllocation, {
				duration: 1,
				ease: [0.22, 1, 0.36, 1] as const
			})
		}

		return <motion.span>{rounded}</motion.span>
	}

	const strategies = [
		{ key: "lending" as const, label: "Lending", color: "#A78BFA" },
		{ key: "staking" as const, label: "Staking", color: "#60A5FA" },
		{ key: "arbitrage" as const, label: "Arbitrage", color: "#FBBF24" },
		{ key: "cefi" as const, label: "CeFi", color: "#34D399" },
		{ key: "liquidityProvider" as const, label: "Liquidity Provider", color: "#F472B6" }
	]

	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-gray-50 to-white flex items-center overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-7xl mx-auto px-6 w-full"
			>
				<motion.div className="text-center mb-16" variants={titleVariants}>
					<motion.h2
						className="text-6xl font-bold text-gray-950"
						variants={titleVariants}
					>
						Institutional Earn Strategies
					</motion.h2>
				</motion.div>

				<motion.div
					variants={cardVariants}
					whileHover={{
						y: -5,
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
						transition: { duration: 0.3 }
					}}
					className="relative bg-white/90 backdrop-blur-md rounded-xl p-12 shadow-sm border border-gray-150 overflow-hidden"
				>
					{/* Subtle gradient accent */}
					<motion.div
						className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-200/40 to-transparent"
						initial={{ scaleX: 0 }}
						animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
						transition={{ delay: 0.5, duration: 0.8 }}
					/>

					{/* Shimmer effect */}
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
						animate={{ x: ["-100%", "100%"] }}
						transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
					/>

					<div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
						{/* Chart Section */}
						<motion.div className="relative" variants={chartVariants}>
							<div className="relative h-[400px] flex items-center justify-center">
								<motion.div
									className="relative w-full h-full max-w-[380px]"
									whileHover={{ scale: 1.02 }}
									transition={{ type: "spring" as const, stiffness: 300 }}
								>
									<Doughnut data={chartData} options={chartOptions} />
									<motion.div
										className="absolute inset-0 flex items-center justify-center pointer-events-none"
										initial={{ opacity: 0, scale: 0.5 }}
										animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
										transition={{ delay: 0.5, duration: 0.5 }}
									>
										<div className="text-center">
											<motion.div
												className="text-6xl font-bold text-gray-950"
												key={totalAllocation}
												initial={{ scale: 1.2 }}
												animate={{ scale: 1 }}
												transition={{ type: "spring" as const, stiffness: 300 }}
											>
												<AnimatedPercentage />%
											</motion.div>
											<div className="text-base text-gray-500 mt-2 font-medium">Allocated</div>
										</div>
									</motion.div>
								</motion.div>
							</div>
						</motion.div>

						{/* Controls Section */}
						<div className="space-y-6">
							<motion.div variants={titleVariants}>
								<h3 className="text-3xl font-bold text-gray-950 mb-3">Portfolio Distribution</h3>
								<p className="text-lg text-gray-700">Allocation optimized based on market condition by agent</p>
							</motion.div>
							<div className="space-y-5">
								{strategies.map((strategy, index) => (
									<motion.div
										key={strategy.key}
										className="space-y-2"
										custom={index}
										variants={sliderVariants}
									>
										<div className="flex items-center justify-between">
											<label className="text-gray-950 font-semibold text-lg">{strategy.label}</label>
											<motion.div
												className="flex items-center gap-1"
												key={allocations[strategy.key]}
												initial={{ scale: 1.1 }}
												animate={{ scale: 1 }}
												transition={{ type: "spring" as const, stiffness: 400 }}
											>
												<span className="text-2xl font-bold text-gray-950">{allocations[strategy.key]}</span>
												<span className="text-gray-500 text-lg">%</span>
											</motion.div>
										</div>
										<motion.input
											type="range"
											value={allocations[strategy.key]}
											onChange={(e) => handleAllocationChange(strategy.key, Number(e.target.value))}
											className="w-full h-2 rounded-lg appearance-none cursor-pointer"
											min="0"
											max="100"
											style={{
												background: `linear-gradient(to right, ${strategy.color} 0%, ${strategy.color} ${allocations[strategy.key]}%, #E5E7EB ${allocations[strategy.key]}%, #E5E7EB 100%)`,
											}}
											whileHover={{ scale: 1.01 }}
											whileTap={{ scale: 0.99 }}
										/>
									</motion.div>
								))}
							</div>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</section>
	)
}
