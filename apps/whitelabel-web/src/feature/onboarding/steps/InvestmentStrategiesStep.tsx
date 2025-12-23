/**
 * Step 4: Your Earn Strategy
 * Show the configured strategy allocation with pie chart (fetched from API)
 */

import { useEffect, useState } from "react"

import { Loader2, PieChart, TrendingUp } from "lucide-react"

import { getEffectiveProductStrategies } from "@/api/b2bClientHelpers"

// Protocol colors and styling
const PROTOCOL_CONFIG: Record<string, { color: string; strokeColor: string }> = {
	aave: { color: "bg-[#B6509E]", strokeColor: "stroke-[#B6509E]" },
	compound: { color: "bg-[#00D395]", strokeColor: "stroke-[#00D395]" },
	morpho: { color: "bg-[#2470FF]", strokeColor: "stroke-[#2470FF]" },
}

function getProtocolConfig(protocol: string) {
	return PROTOCOL_CONFIG[protocol.toLowerCase()] || { color: "bg-gray-500", strokeColor: "stroke-gray-500" }
}

interface Strategy {
	name: string
	percentage: number
	color: string
	strokeColor: string
}

interface InvestmentStrategiesStepProps {
	productId?: string
}

// Default strategies as fallback
const DEFAULT_STRATEGIES: Strategy[] = [
	{ name: "Aave", percentage: 50, ...getProtocolConfig("aave") },
	{ name: "Morpho", percentage: 30, ...getProtocolConfig("morpho") },
	{ name: "Compound", percentage: 20, ...getProtocolConfig("compound") },
]

export function InvestmentStrategiesStep({ productId }: InvestmentStrategiesStepProps) {
	const [strategies, setStrategies] = useState<Strategy[]>(DEFAULT_STRATEGIES)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!productId) return

		async function fetchStrategies() {
			setLoading(true)
			try {
				const result = await getEffectiveProductStrategies(productId!)
				console.log("[InvestmentStrategiesStep] Fetched strategies:", result)

				if (result?.strategies?.lending) {
					const lendingStrategies = result.strategies.lending
					const transformed = Object.entries(lendingStrategies)
						.filter(([_, value]) => (value as number) > 0)
						.map(([protocol, percentage]) => ({
							name: protocol.charAt(0).toUpperCase() + protocol.slice(1),
							percentage: percentage as number,
							...getProtocolConfig(protocol),
						}))
						.sort((a, b) => b.percentage - a.percentage)

					if (transformed.length > 0) {
						setStrategies(transformed)
					}
				}
			} catch (error) {
				console.error("[InvestmentStrategiesStep] Failed to fetch strategies:", error)
				// Keep default strategies on error
			} finally {
				setLoading(false)
			}
		}

		fetchStrategies()
	}, [productId])

	// Calculate stroke-dasharray values for the pie chart
	const circumference = 2 * Math.PI * 40 // 251.2
	let offset = 0

	return (
		<div className="flex flex-col items-center text-center animate-fade-up">
			<div className="w-20 h-20 rounded-3xl bg-violet-200 flex items-center justify-center mb-6">
				<PieChart className="w-10 h-10 text-gray-800" />
			</div>

			<h1 className="text-2xl font-bold text-foreground mb-3">Your Earn Strategy</h1>

			<p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-xs">
				Your product owner has configured an optimized strategy allocation for maximum returns.
			</p>

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
				</div>
			) : (
				<>
					{/* Visual Pie Chart */}
					<div className="relative w-40 h-40 mb-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
						<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
							{strategies.map((strategy) => {
								const dashArray = (strategy.percentage / 100) * circumference
								const currentOffset = -offset
								offset += dashArray

								return (
									<circle
										key={strategy.name}
										cx="50"
										cy="50"
										r="40"
										fill="none"
										className={strategy.strokeColor}
										strokeWidth="20"
										strokeDasharray={`${dashArray} ${circumference}`}
										strokeDashoffset={currentOffset}
									/>
								)
							})}
						</svg>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center">
								<span className="text-2xl font-bold text-foreground">100%</span>
								<p className="text-xs text-muted-foreground">Allocated</p>
							</div>
						</div>
					</div>

					{/* Strategy breakdown */}
					<div className="w-full space-y-3">
						{strategies.map((strategy, index) => (
							<div
								key={strategy.name}
								className="glass-card rounded-2xl p-4 animate-fade-up"
								style={{ animationDelay: `${0.15 + index * 0.05}s` }}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className={`w-10 h-10 rounded-xl ${strategy.color} flex items-center justify-center`}>
											<TrendingUp className="w-5 h-5 text-white" />
										</div>
										<div className="text-left">
											<h3 className="font-semibold text-foreground text-sm">{strategy.name}</h3>
											<p className="text-muted-foreground text-xs">Active strategy</p>
										</div>
									</div>
									<span className="text-xl font-bold text-foreground">{strategy.percentage}%</span>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}
