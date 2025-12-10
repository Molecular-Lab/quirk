import { useState } from "react"
import { Doughnut } from "react-chartjs-2"

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"

import type { ChartOptions } from "chart.js"
import "./TradingStrategies.css"

ChartJS.register(ArcElement, Tooltip, Legend)

export function TradingStrategiesSection() {
	const [allocations, setAllocations] = useState({
		defi: 45,
		liquidityPool: 45,
		cefi: 10,
	})

	const handleAllocationChange = (strategy: keyof typeof allocations, value: number) => {
		const newAllocations = { ...allocations, [strategy]: value }
		const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0)

		// If total exceeds 100, adjust other values proportionally
		if (total > 100) {
			const excess = total - 100
			const otherStrategies = Object.keys(newAllocations).filter(
				(key) => key !== strategy,
			) as (keyof typeof allocations)[]
			const otherTotal = otherStrategies.reduce((sum, key) => sum + newAllocations[key], 0)

			if (otherTotal > 0) {
				otherStrategies.forEach((key) => {
					newAllocations[key] = Math.max(
						0,
						Math.round(newAllocations[key] - (excess * newAllocations[key]) / otherTotal),
					)
				})
			}
		}

		setAllocations(newAllocations)
	}

	const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0)

	const chartData = {
		labels: ["DeFi", "Place LP", "CeFi"],
		datasets: [
			{
				data: [allocations.defi, allocations.liquidityPool, allocations.cefi],
				backgroundColor: [
					"#8B5CF6", // Vibrant purple for DeFi (matches background gradient)
					"#06B6D4", // Cyan/turquoise for Place LP
					"#F59E0B", // Amber for CeFi
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
			<div className="max-w-7xl mx-auto px-6 w-full">
				<div className="text-center mb-16">
					<h2 className="text-6xl font-bold text-gray-950">Customized Earn Strategies</h2>
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
						<div className="space-y-8">
							<div>
								<h3 className="text-3xl font-bold text-gray-950 mb-3">Portfolio Distribution</h3>
								<p className="text-lg text-gray-700">Adjust sliders to simulate different allocation strategies</p>
							</div>
							<div className="space-y-8">
								{/* DeFi */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<label className="text-gray-950 font-semibold text-xl">DeFi</label>
										</div>
										<div className="flex items-center gap-1">
											<span className="text-3xl font-bold text-gray-950">{allocations.defi}</span>
											<span className="text-gray-500 text-xl">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.defi}
										onChange={(e) => {
											handleAllocationChange("defi", Number(e.target.value))
										}}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${allocations.defi}%, #E3E3E3 ${allocations.defi}%, #E3E3E3 100%)`,
										}}
									/>
								</div>

								{/* Place LP */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<label className="text-gray-950 font-semibold text-xl">Liquidity Provider</label>
										</div>
										<div className="flex items-center gap-1">
											<span className="text-3xl font-bold text-gray-950">{allocations.liquidityPool}</span>
											<span className="text-gray-500 text-xl">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.liquidityPool}
										onChange={(e) => {
											handleAllocationChange("liquidityPool", Number(e.target.value))
										}}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #06B6D4 0%, #06B6D4 ${allocations.liquidityPool}%, #E3E3E3 ${allocations.liquidityPool}%, #E3E3E3 100%)`,
										}}
									/>
								</div>

								{/* CeFi */}
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<label className="text-gray-950 font-semibold text-xl">CeFi</label>
										</div>
										<div className="flex items-center gap-1">
											<span className="text-3xl font-bold text-gray-950">{allocations.cefi}</span>
											<span className="text-gray-500 text-xl">%</span>
										</div>
									</div>
									<input
										type="range"
										value={allocations.cefi}
										onChange={(e) => {
											handleAllocationChange("cefi", Number(e.target.value))
										}}
										className="w-full h-2 rounded-lg appearance-none cursor-pointer"
										min="0"
										max="100"
										style={{
											background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${allocations.cefi}%, #E3E3E3 ${allocations.cefi}%, #E3E3E3 100%)`,
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
