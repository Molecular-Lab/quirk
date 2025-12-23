/**
 * Step 5: Your Money's Journey
 * Show the client's configured strategy and how funds will be allocated
 */

import { useEffect, useState } from "react"

import { Loader2, Route } from "lucide-react"

import { getEffectiveProductStrategies } from "@/api/b2bClientHelpers"

// Protocol colors for consistent branding
const PROTOCOL_COLORS: Record<string, { bg: string; stroke: string }> = {
	aave: { bg: "bg-[#B6509E]", stroke: "stroke-[#B6509E]" },
	compound: { bg: "bg-[#00D395]", stroke: "stroke-[#00D395]" },
	morpho: { bg: "bg-[#2470FF]", stroke: "stroke-[#2470FF]" },
}

function getProtocolColors(protocol: string): { bg: string; stroke: string } {
	return PROTOCOL_COLORS[protocol.toLowerCase()] || { bg: "bg-gray-500", stroke: "stroke-gray-500" }
}

interface Allocation {
	protocol: string
	percentage: number
	bg: string
	stroke: string
}

interface MoneyJourneyStepProps {
	productId?: string
}

const steps = [
	{ step: 1, text: "You deposit USD to your account" },
	{ step: 2, text: "We convert to stablecoins automatically" },
	{ step: 3, text: "Funds are allocated across protocols" },
	{ step: 4, text: "Watch your balance grow 24/7" },
]

export function MoneyJourneyStep({ productId }: MoneyJourneyStepProps) {
	const [allocations, setAllocations] = useState<Allocation[]>([
		{ protocol: "Aave", percentage: 50, ...getProtocolColors("aave") },
		{ protocol: "Morpho", percentage: 30, ...getProtocolColors("morpho") },
		{ protocol: "Compound", percentage: 20, ...getProtocolColors("compound") },
	])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!productId) return

		async function fetchStrategies() {
			setLoading(true)
			try {
				const result = await getEffectiveProductStrategies(productId!)
				console.log("[MoneyJourneyStep] Fetched strategies:", result)

				if (result?.strategies?.lending) {
					const lendingStrategies = result.strategies.lending
					const transformed = Object.entries(lendingStrategies)
						.filter(([_, value]) => value > 0)
						.map(([protocol, percentage]) => ({
							protocol: protocol.charAt(0).toUpperCase() + protocol.slice(1),
							percentage: percentage,
							...getProtocolColors(protocol),
						}))
						.sort((a, b) => b.percentage - a.percentage)

					if (transformed.length > 0) {
						setAllocations(transformed)
					}
				}
			} catch (error) {
				console.error("[MoneyJourneyStep] Failed to fetch strategies:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchStrategies()
	}, [productId])

	// Calculate pie chart values
	const circumference = 2 * Math.PI * 40
	let offset = 0

	return (
		<div className="flex flex-col items-center text-center animate-fade-up">
			<div className="w-20 h-20 rounded-3xl bg-violet-200 flex items-center justify-center mb-6">
				<Route className="w-10 h-10 text-gray-800" />
			</div>

			<h1 className="text-2xl font-bold text-foreground mb-3">Your Money's Journey</h1>

			<p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-xs">
				Here's where your funds will go to earn yield
			</p>

			{loading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
				</div>
			) : (
				<>
					{/* Pie Chart */}
					<div className="relative w-36 h-36 mb-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
						<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
							{allocations.map((allocation) => {
								const dashArray = (allocation.percentage / 100) * circumference
								const currentOffset = -offset
								offset += dashArray

								return (
									<circle
										key={allocation.protocol}
										cx="50"
										cy="50"
										r="40"
										fill="none"
										className={allocation.stroke}
										strokeWidth="16"
										strokeDasharray={`${dashArray} ${circumference}`}
										strokeDashoffset={currentOffset}
									/>
								)
							})}
						</svg>
					</div>

					{/* Protocol Legend */}
					<div className="w-full flex justify-center gap-4 mb-6">
						{allocations.map((allocation) => (
							<div key={allocation.protocol} className="flex items-center gap-2">
								<div className={`w-3 h-3 rounded-full ${allocation.bg}`} />
								<span className="text-xs text-muted-foreground">
									{allocation.protocol} {allocation.percentage}%
								</span>
							</div>
						))}
					</div>
				</>
			)}

			{/* How It Works */}
			<div className="w-full glass-card rounded-2xl p-4">
				<h3 className="font-semibold text-foreground text-left mb-4 text-sm">How It Works</h3>
				<div className="space-y-3">
					{steps.map((item, index) => (
						<div
							key={item.step}
							className="flex items-center gap-3 animate-fade-up"
							style={{ animationDelay: `${0.15 + index * 0.05}s` }}
						>
							<div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
								<span className="text-xs font-semibold text-violet-600">{item.step}</span>
							</div>
							<p className="text-sm text-foreground text-left">{item.text}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
