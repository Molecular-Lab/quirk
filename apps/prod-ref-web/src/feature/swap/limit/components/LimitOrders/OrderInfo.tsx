import { ArrowRight } from "lucide-react"

import { TokenIcon } from "@/components/TokenIcon"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { formatDisplayNumber } from "@/utils/number"

export const OrderInfo: React.FC<{ order: LimitOrderItem | undefined }> = ({ order }) => {
	if (!order) {
		return <></>
	}

	return (
		<div className="flex items-center gap-1.5 text-xs font-medium md:text-sm">
			<div className="flex items-center gap-1">
				<TokenIcon token={order.fromTokenAmount.token} className="size-7" />
				<div className="flex flex-col text-xs">
					<div className="text-gray-400 dark:text-gray-600">{order.fromTokenAmount.token.symbol}</div>
					<div>
						{formatDisplayNumber(order.fromTokenAmount.bigNumber, {
							precision: 4,
							stripZero: true,
							toFixed: true,
						})}
					</div>
				</div>
			</div>
			<ArrowRight className="size-3" />
			<div className="flex items-center gap-1">
				<TokenIcon token={order.toTokenAmount.token} className="size-7" />
				<div className="flex flex-col text-xs">
					<div className="text-gray-400 dark:text-gray-600">{order.toTokenAmount.token.symbol}</div>
					<div>
						{formatDisplayNumber(order.toTokenAmount.bigNumber, {
							precision: 4,
							stripZero: true,
							toFixed: true,
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
