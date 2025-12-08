import { useState } from "react"

import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, TrendingUp } from "lucide-react"

import { type RiskTolerance, type StrategyPriority, useOnboardingStore } from "@/store/onboardingStore"

const STRATEGY_DETAILS = [
	{
		id: "defi",
		name: "DeFi Lending",
		description: "Low risk, steady yields (5-8% APY)",
		protocols: ["AAVE", "Compound", "Morpho"],
		risk: "Low",
		color: "emerald",
	},
	{
		id: "lp",
		name: "Liquidity Pools",
		description: "Medium risk, higher yields (8-15% APY)",
		protocols: ["Uniswap", "Curve", "Balancer"],
		risk: "Medium",
		color: "blue",
	},
	{
		id: "cefi",
		name: "CeFi Platforms",
		description: "Low risk, regulated (4-6% APY)",
		protocols: ["Licensed partners"],
		risk: "Low",
		color: "violet",
	},
	{
		id: "hedge",
		name: "Hedging Strategies",
		description: "Risk mitigation (3-5% APY)",
		protocols: ["Delta-neutral positions"],
		risk: "Low",
		color: "amber",
	},
	{
		id: "arbitrage",
		name: "Arbitrage",
		description: "Advanced strategies (Variable APY)",
		protocols: ["Cross-protocol opportunities"],
		risk: "Medium",
		color: "rose",
	},
]

function SortableStrategyCard({ strategy, rank }: { strategy: (typeof STRATEGY_DETAILS)[0]; rank: number }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: strategy.id,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={`
				relative flex items-start gap-4 p-5 bg-white rounded-lg border-2
				transition-all cursor-move
				${isDragging ? "border-blue-500 shadow-lg z-50 opacity-75" : "border-gray-200 hover:border-gray-300"}
			`}
		>
			{/* Drag Handle */}
			<div {...listeners} className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
				<GripVertical className="h-6 w-6" />
			</div>

			{/* Rank Badge */}
			<div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
				{rank}
			</div>

			{/* Content */}
			<div className="flex-1">
				<div className="flex items-start justify-between mb-1">
					<h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
					<span
						className={`
							px-2.5 py-0.5 text-xs font-medium rounded-full
							${
								strategy.risk === "Low"
									? "bg-green-100 text-green-800"
									: strategy.risk === "Medium"
										? "bg-yellow-100 text-yellow-800"
										: "bg-red-100 text-red-800"
							}
						`}
					>
						{strategy.risk} Risk
					</span>
				</div>
				<p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
				<div className="flex flex-wrap gap-1.5">
					{strategy.protocols.map((protocol) => (
						<span key={protocol} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
							{protocol}
						</span>
					))}
				</div>
			</div>
		</div>
	)
}

export function StrategySelector() {
	const { strategies, setStrategies, nextStep, previousStep } = useOnboardingStore()

	const [items, setItems] = useState<StrategyPriority[]>(strategies.priorities)

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (over && active.id !== over.id) {
			setItems((currentItems) => {
				const oldIndex = currentItems.findIndex((item) => item.id === active.id)
				const newIndex = currentItems.findIndex((item) => item.id === over.id)

				const newItems = arrayMove(currentItems, oldIndex, newIndex)

				// Update ranks
				const updatedItems = newItems.map((item, index) => ({
					...item,
					rank: index + 1,
				}))

				// Save to store
				setStrategies({ priorities: updatedItems })

				return updatedItems
			})
		}
	}

	const handleRiskToleranceChange = (riskTolerance: RiskTolerance) => {
		setStrategies({ riskTolerance })
	}

	const handleNext = () => {
		// Ensure priorities are saved
		setStrategies({ priorities: items })
		nextStep()
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Rank Your Investment Strategies</h2>
				<p className="text-gray-600">Drag to reorder based on your priorities (1 = highest priority)</p>
			</div>

			{/* Info Card */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex items-start gap-3">
					<TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
					<div className="flex-1">
						<h3 className="text-sm font-medium text-blue-900 mb-1">How Strategy Ranking Works</h3>
						<p className="text-sm text-blue-700">
							Your ranking helps our AI allocate funds optimally. Higher-ranked strategies get priority, but the system
							dynamically adjusts based on market conditions and yields.
						</p>
					</div>
				</div>
			</div>

			{/* Drag & Drop List */}
			<div className="space-y-3">
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
						{items.map((item) => {
							const strategyDetail = STRATEGY_DETAILS.find((s) => s.id === item.id)
							if (!strategyDetail) return null
							return <SortableStrategyCard key={item.id} strategy={strategyDetail} rank={item.rank} />
						})}
					</SortableContext>
				</DndContext>
			</div>

			{/* Risk Tolerance */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-3">Risk Tolerance</label>
				<div className="grid grid-cols-3 gap-3">
					{(["conservative", "moderate", "aggressive"] as const).map((risk) => (
						<button
							key={risk}
							type="button"
							onClick={() => {
								handleRiskToleranceChange(risk)
							}}
							className={`
								px-4 py-3 rounded-lg border-2 font-medium transition-all capitalize
								${
									strategies.riskTolerance === risk
										? "border-blue-500 bg-blue-50 text-blue-900"
										: "border-gray-200 text-gray-600 hover:border-gray-300"
								}
							`}
						>
							{risk}
						</button>
					))}
				</div>
			</div>

			{/* Navigation */}
			<div className="flex justify-between pt-4">
				<button
					type="button"
					onClick={previousStep}
					className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
				>
					← Back
				</button>
				<button
					type="button"
					onClick={handleNext}
					className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
				>
					Next: Banking Setup →
				</button>
			</div>
		</div>
	)
}
