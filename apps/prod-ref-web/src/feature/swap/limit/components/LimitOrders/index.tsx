import { useState } from "react"

import { Checkbox, Label, Tabs, TabsContent, TabsList, TabsTrigger } from "@rabbitswap/ui/basic"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { CancelOrderModal } from "@/feature/swap/limit/components/CancelOrderModal/CancelOrderModal"
import { LimitOrderTableContext } from "@/feature/swap/limit/components/LimitOrders/context"

import { CurrentOrderTable } from "./CurrentOrderTable/CurrentOrderTable"
import { HistoryOrderTable } from "./HistoryOrderTable/HistoryOrderTable"

export const LimitOrders: React.FC = () => {
	const [checked, setChecked] = useState(true)
	return (
		<>
			<LimitOrderTableContext.Provider value={{ showOnlyThisPair: checked, setShowOnlyThisPair: setChecked }}>
				<Tabs defaultValue="limit" className="shrink">
					<div className="flex items-center justify-between">
						<TabsList className="gap-4 lg:gap-5">
							<TabsTrigger value="limit" className="text-base">
								Limit Orders
							</TabsTrigger>
							<TabsTrigger value="history" className="text-base">
								Limit History
							</TabsTrigger>
						</TabsList>
						<Label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 lg:text-sm">
							<Checkbox
								className="m-0 size-4"
								checked={checked}
								onCheckedChange={(c) => {
									setChecked(typeof c === "boolean" ? c : false)
								}}
							/>
							<div className="hidden lg:block">Show only this pair</div>
							<div className="lg:hidden">Only this pair</div>
						</Label>
					</div>
					<AnimateChangeInHeight className="-mt-2 pt-2">
						<TabsContent value="limit">
							<CurrentOrderTable />
						</TabsContent>
						<TabsContent value="history">
							<HistoryOrderTable />
						</TabsContent>
					</AnimateChangeInHeight>
				</Tabs>
			</LimitOrderTableContext.Provider>
			<CancelOrderModal />
		</>
	)
}
