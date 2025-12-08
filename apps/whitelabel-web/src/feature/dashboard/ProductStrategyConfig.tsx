import { useEffect, useState } from "react"

import { toast } from "sonner"

import { getEffectiveProductStrategies, updateProductStrategiesCustomization } from "@/api/b2bClientHelpers"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserStore } from "@/store/userStore"

type StrategyTemplate = "conservative" | "moderate" | "morpho" | "custom"

// New format: Record<category, Record<protocol, percentage>>
// Categories: defi, cefi, lp (liquidity providers)
type StrategyConfig = Record<string, Record<string, number>>

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
}

export function ProductStrategyConfig({ productId }: ProductStrategyConfigProps) {
	const { organizations } = useUserStore()
	const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate>("conservative")
	const [applyToAll, setApplyToAll] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [customStrategies, setCustomStrategies] = useState<StrategyConfig>(STRATEGY_TEMPLATES.conservative)

	const hasMultipleProducts = organizations.length > 1

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

	const handleSave = async () => {
		try {
			setIsLoading(true)
			const strategies = getCurrentStrategies()

			// Validate sum to 100%
			const total = getTotalAllocation(strategies)
			if (total !== 100) {
				toast.error(`Strategy allocation must sum to 100%, got ${total}%`)
				return
			}

			if (applyToAll && hasMultipleProducts) {
				// Apply to all products
				let successCount = 0
				for (const org of organizations) {
					try {
						await updateProductStrategiesCustomization(org.productId, strategies)
						successCount++
					} catch (error) {
						console.error(`Failed to update product ${org.productId}:`, error)
					}
				}
				toast.success(`Strategy applied to ${successCount} of ${organizations.length} products`)
			} else {
				// Apply to single product only
				await updateProductStrategiesCustomization(productId, strategies)
				toast.success("Strategy configured successfully")
			}
		} catch (error) {
			console.error("Failed to configure strategy:", error)
			toast.error("Failed to configure strategy")
		} finally {
			setIsLoading(false)
		}
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
						disabled={isLoading}
						className={`p-4 rounded-xl border-2 transition-all ${
							selectedTemplate === template
								? "border-accent bg-white shadow-md"
								: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
						} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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

			{/* Apply to All Option */}
			{hasMultipleProducts && (
				<label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
					<Checkbox checked={applyToAll} onCheckedChange={setApplyToAll} disabled={isLoading} className="mt-0.5" />
					<div className="flex-1">
						<div className="text-sm font-medium text-gray-950">
							Apply this strategy to all {organizations.length} products
						</div>
						<div className="text-xs text-gray-600 mt-0.5">
							This will update investment strategies across all your products
						</div>
					</div>
				</label>
			)}

			{/* Save Button */}
			<button
				onClick={handleSave}
				disabled={isLoading || getTotalAllocation(getCurrentStrategies()) !== 100}
				className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
			>
				{isLoading ? "Saving..." : applyToAll ? `Apply to All ${organizations.length} Products` : "Save Configuration"}
			</button>

			{/* AI Recommendation Note (Future) */}
			<div className="text-center text-sm text-gray-500 mt-4">
				<p className="italic">💡 AI-powered strategy recommendations coming soon based on market analysis</p>
			</div>
		</div>
	)
}
