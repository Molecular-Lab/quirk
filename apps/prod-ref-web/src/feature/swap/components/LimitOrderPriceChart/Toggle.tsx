import { CandlestickChart } from "lucide-react"

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useLimitStore } from "@/feature/swap/limit/store/limitStore"

import { LimitOrderPriceChart } from "./LimitOrderPriceChart"

export const LimitOrderPriceChartToggle: React.FC<{ hidden?: boolean }> = ({ hidden }) => {
	const {
		side,
		priceCondition,
		computed: { amountIn, amountOut },
	} = useLimitStore()

	return (
		<Drawer>
			<DrawerTrigger className={cn(hidden && "hidden")}>
				<CandlestickChart className="size-4" />
			</DrawerTrigger>
			<DrawerContent className={cn("pb-6 md:pb-10", hidden && "hidden")}>
				<DrawerHeader className="gap-0 p-0">
					<DrawerTitle />
					<DrawerDescription />
				</DrawerHeader>
				<LimitOrderPriceChart
					tokenIn={amountIn?.token}
					tokenOut={amountOut?.token}
					priceCondition={priceCondition}
					side={side}
				/>
			</DrawerContent>
		</Drawer>
	)
}
