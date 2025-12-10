import { useEffect, useState } from "react"

import { getEffectiveProductStrategies } from "@/api/b2bClientHelpers"

type StrategyTemplate = "conservative" | "moderate" | "morpho" | "custom"

// New format: Record<category, Record<protocol, percentage>>
// Categories: defi, cefi, lp (liquidity providers)
export type StrategyConfig = Record<string, Record<string, number>>

const STRATEGY_TEMPLATES: Record<Exclude<StrategyTemplate, "custom">, StrategyConfig> = {
	conservative: {
		defi: {
			aave: 50,
			compound: 20,
			morpho: 10,
		},
		cefi: {
			circle: 15,
		},
		lp: {
			uniswap: 5,
		},
	},
	moderate: {
		defi: {
			aave: 40,
			compound: 25,
			morpho: 15,
		},
		cefi: {
			circle: 10,
		},
		lp: {
			uniswap: 5,
			sushiswap: 5,
		},
	},
	morpho: {
		defi: {
			aave: 15,
			compound: 10,
			morpho: 50,
		},
		cefi: {
			circle: 15,
		},
		lp: {
			uniswap: 5,
			sushiswap: 5,
		},
	},
}

interface ProductStrategyConfigProps {
	productId: string
	// Expose state to parent for unified save
	onStrategyChange?: (strategies: StrategyConfig, applyToAll: boolean) => void
}

export function ProductStrategyConfig({ productId, onStrategyChange }: ProductStrategyConfigProps) {
	const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate>("conservative")
	const [applyToAll, setApplyToAll] = useState(false)
	const [customStrategies, setCustomStrategies] = useState<StrategyConfig>(STRATEGY_TEMPLATES.conservative)

	// Load existing strategies on mount
	useEffect(() => {
		const loadStrategies = async () => {
			try {
				const { strategies } = await getEffectiveProductStrategies(productId)
				if (strategies && Object.keys(strategies).length > 0) {
					setCustomStrategies(strategies)
					// Detect which template matches (if any)
					const matchingTemplate = Object.entries(STRATEGY_TEMPLATES).find(
						([_, template]) => JSON.stringify(template) === JSON.stringify(strategies),
					)
					if (matchingTemplate) {
						setSelectedTemplate(matchingTemplate[0] as StrategyTemplate)
					} else {
						setSelectedTemplate("custom")
					}
				}
			} catch (error) {
				console.error("Failed to load strategies:", error)
				// Use default conservative template
			}
		}

		loadStrategies()
	}, [productId])

	const getCurrentStrategies = (): StrategyConfig => {
		return selectedTemplate === "custom" ? customStrategies : STRATEGY_TEMPLATES[selectedTemplate]
	}

	// Notify parent when strategy changes
	useEffect(() => {
		if (onStrategyChange) {
			const strategies = getCurrentStrategies()
			onStrategyChange(strategies, applyToAll)
		}
	}, [selectedTemplate, customStrategies, applyToAll])

	// Calculate total allocation percentage
	const getTotalAllocation = (strategies: StrategyConfig): number => {
		let total = 0
		Object.values(strategies).forEach((category) => {
			Object.values(category).forEach((percentage) => {
				total += percentage
			})
		})
		return total
	}

	return (
		<div className="space-y-6">
			{/* Template Selection */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{(["conservative", "moderate", "morpho", "custom"] as const).map((template) => (
					<button
						key={template}
						onClick={() => {
							setSelectedTemplate(template)
						}}
						className={`p-4 rounded-xl border-2 transition-all ${
							selectedTemplate === template
								? "border-accent bg-white shadow-md"
								: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
						}`}
					>
						<div className="font-semibold capitalize text-gray-950">{template}</div>
						{template !== "custom" && (
							<div className="text-xs text-gray-600 mt-1 space-y-0.5">
								{Object.entries(STRATEGY_TEMPLATES[template]).map(([category, protocols]) => (
									<div key={category}>
										<span className="uppercase font-medium">{category}:</span>{" "}
										{Object.values(protocols).reduce((sum, v) => sum + v, 0)}%
									</div>
								))}
							</div>
						)}
					</button>
				))}
			</div>

			{/* Strategy Breakdown */}
			<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
				<h3 className="font-semibold text-lg text-gray-900 mb-4">Strategy Breakdown</h3>
				<div className="space-y-4">
					{Object.entries(getCurrentStrategies()).map(([category, protocols]) => (
						<div key={category} className="space-y-3">
							<h4 className="text-sm font-semibold uppercase text-gray-500 tracking-wide">{category}</h4>
							{Object.entries(protocols).map(([protocol, percentage]) => (
								<div key={`${category}-${protocol}`}>
									<div className="flex justify-between text-sm mb-2">
										<span className="capitalize font-medium text-gray-700">{protocol}</span>
										<span className="font-semibold text-gray-950">{percentage}%</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-3">
										<div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${percentage}%` }} />
									</div>
								</div>
							))}
						</div>
					))}
				</div>

				<div className="mt-4 pt-4 border-t border-gray-200">
					<div className="flex justify-between text-sm font-medium">
						<span className="text-gray-700">Total Allocation</span>
						<span className={getTotalAllocation(getCurrentStrategies()) === 100 ? "text-green-600" : "text-red-600"}>
							{getTotalAllocation(getCurrentStrategies())}%
						</span>
					</div>
				</div>
			</div>

			{/* AI Recommendation Note (Future) */}
			<div className="text-center text-sm text-gray-500 mt-4">
				<p className="italic">💡 AI-powered strategy recommendations coming soon based on market analysis</p>
			</div>
		</div>
	)
}
