import { useState } from "react"
import { Doughnut } from "react-chartjs-2"

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"

import type { ChartOptions } from "chart.js"
import "./TradingStrategies.css"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

ChartJS.register(ArcElement, Tooltip, Legend)

export function TradingStrategiesSection() {
	const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
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
					"#A78BFA", // Softer purple for Lending
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

	return (
		<section className="min-h-[90vh] py-20 bg-gradient-to-b from-purple-50/40 to-white flex items-center">
			<div
				ref={ref as React.RefObject<HTMLDivElement>}
				className={`max-w-7xl mx-auto px-6 w-full transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					}`}
			>
				<div className="text-center mb-16">
					<h2 className="text-6xl font-bold text-gray-950">Institutional Earn Strategies</h2>
				</div>

				<div className="relative bg-white/90 backdrop-blur-md rounded-xl p-12 shadow-sm border border-gray-150 overflow-hidden">
					{/* Subtle gradient accent */}
					<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-200/40 to-transparent" />
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						{/* Chart Section */}
						<div className="relative">
							<div className="relative h-[400px] flex items-center justify-center">
								<div className="relative w-full h-full max-w-[380px]">
									<Doughnut data={chartData} options={chartOptions} />
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<div className="text-center">
											<div className="text-6xl font-bold text-gray-950">{totalAllocation}%</div>
											<div className="text-base text-gray-500 mt-2 font-medium">Allocated</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Controls Section */}
						<div className="space-y-6">
							<div>
								<h3 className="text-3xl font-bold text-gray-950 mb-3">Portfolio Distribution</h3>
								<p className="text-lg text-gray-700">Allocation optimized based on market condition by agent</p>
							</div>
							<div className="space-y-5">
								{/* Lending */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label className="text-gray-950 font-semibold text-lg">Lending</label>
										<div className="flex items-center gap-1">
											<span className="text-2xl font-bold text-gray-950">{allocations.lending}</span>
											<span className="text-gray-500 text-lg">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.lending}
										onChange={(e) => handleAllocationChange("lending", Number(e.target.value))}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #A78BFA 0%, #A78BFA ${allocations.lending}%, #E5E7EB ${allocations.lending}%, #E5E7EB 100%)`,
										}}
									/>
								</div>

								{/* Staking */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label className="text-gray-950 font-semibold text-lg">Staking</label>
										<div className="flex items-center gap-1">
											<span className="text-2xl font-bold text-gray-950">{allocations.staking}</span>
											<span className="text-gray-500 text-lg">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.staking}
										onChange={(e) => handleAllocationChange("staking", Number(e.target.value))}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #60A5FA 0%, #60A5FA ${allocations.staking}%, #E5E7EB ${allocations.staking}%, #E5E7EB 100%)`,
										}}
									/>
								</div>

								{/* Arbitrage */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label className="text-gray-950 font-semibold text-lg">Arbitrage</label>
										<div className="flex items-center gap-1">
											<span className="text-2xl font-bold text-gray-950">{allocations.arbitrage}</span>
											<span className="text-gray-500 text-lg">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.arbitrage}
										onChange={(e) => handleAllocationChange("arbitrage", Number(e.target.value))}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #FBBF24 0%, #FBBF24 ${allocations.arbitrage}%, #E5E7EB ${allocations.arbitrage}%, #E5E7EB 100%)`,
										}}
									/>
								</div>

								{/* CeFi */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label className="text-gray-950 font-semibold text-lg">CeFi</label>
										<div className="flex items-center gap-1">
											<span className="text-2xl font-bold text-gray-950">{allocations.cefi}</span>
											<span className="text-gray-500 text-lg">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.cefi}
										onChange={(e) => handleAllocationChange("cefi", Number(e.target.value))}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #34D399 0%, #34D399 ${allocations.cefi}%, #E5E7EB ${allocations.cefi}%, #E5E7EB 100%)`,
										}}
									/>
								</div>

								{/* Liquidity Provider */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<label className="text-gray-950 font-semibold text-lg">Liquidity Provider</label>
										<div className="flex items-center gap-1">
											<span className="text-2xl font-bold text-gray-950">{allocations.liquidityProvider}</span>
											<span className="text-gray-500 text-lg">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.liquidityProvider}
										onChange={(e) => handleAllocationChange("liquidityProvider", Number(e.target.value))}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #F472B6 0%, #F472B6 ${allocations.liquidityProvider}%, #E5E7EB ${allocations.liquidityProvider}%, #E5E7EB 100%)`,
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
