import { useMemo } from "react"

import { ArrowRight } from "lucide-react"

import { Skeleton } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { StatusBadge } from "@/feature/swap/limit/components/LimitOrders/StatusBadge"
import { LimitOrderItem } from "@/feature/swap/limit/types"

export const LimitOrderTabItem: React.FC<{
	order: LimitOrderItem | undefined
}> = ({ order }) => {
	const displayPrice = useMemo(() => {
		if (!order) return undefined
		return order.price.baseCurrency.equals(order.fromTokenAmount.token) ? order.price : order.price.invert()
	}, [order])

	if (!order) {
		return <></>
	}

	return (
		<div className={cn("rounded-xl border border-gray-100 p-3 dark:border-gray-800")}>
			<div className="flex items-center justify-between">
				<div className="flex w-full flex-col items-start gap-2">
					<div className="flex items-center gap-1.5 text-xs font-medium md:text-sm">
						<div className="flex items-center gap-1">
							<TokenIcon token={order.fromTokenAmount.token} className="size-4" />
							{order.fromTokenAmount.toFormat({ decimalPlaces: 3, withUnit: true })}
						</div>
						<ArrowRight className="size-3" />
						<div className="flex items-center gap-1">
							<TokenIcon token={order.toTokenAmount.token} className="size-4" />
							{order.toTokenAmount.toFormat({ decimalPlaces: 3, withUnit: true })}
						</div>
					</div>
					<div className="flex items-center gap-1 text-xs">
						<div className="text-gray-400 dark:text-gray-600">when</div>
						<Skeleton width="100%" isLoading={!displayPrice}>
							{displayPrice?.toStringWithUnit()}
						</Skeleton>
					</div>
					<div className="flex items-center gap-1 text-xs">
						<div className="text-gray-400 dark:text-gray-600">Expires</div>
						<Skeleton width="100%" isLoading={!order}>
							{order.expiredAt.format("MMMM D, YYYY h:mm A Z")}
						</Skeleton>
					</div>
				</div>
				<StatusBadge status={order.status} size="small" className="py-1 !text-xs" />
			</div>
		</div>
	)
}
