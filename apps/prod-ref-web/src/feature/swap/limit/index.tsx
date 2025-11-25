import { cn } from "@rabbitswap/ui/utils"

import { LimitOrderPriceChart } from "@/feature/swap/components/LimitOrderPriceChart"
import { LimitOrders } from "@/feature/swap/limit/components/LimitOrders"
import { LimitForm } from "@/feature/swap/limit/form"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"

export const LimitPage: React.FC = () => {
	const {
		side,
		priceCondition,
		computed: { amountIn, amountOut },
	} = useLimitStore()

	return (
		<div className={cn("w-full", "flex flex-col gap-9")}>
			<div className="flex flex-col items-stretch gap-x-4 lg:flex-row-reverse xl:gap-x-9">
				<LimitForm />
				<LimitOrderPriceChart
					className="hidden lg:flex"
					tokenIn={amountIn?.token}
					tokenOut={amountOut?.token}
					priceCondition={priceCondition}
					side={side}
				/>
			</div>
			<div className="lg:col-span-2">
				<LimitOrders />
			</div>
		</div>
	)
}
