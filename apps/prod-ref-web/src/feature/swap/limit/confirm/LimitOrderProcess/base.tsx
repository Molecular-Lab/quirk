import { ArrowRight } from "lucide-react"

import { TokenIcon } from "@/components/TokenIcon"
import { useLimitProcessStore } from "@/feature/swap/limit/store/limitProcessStore"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"

export const BaseProcess: React.FC = () => {
	const { expiresAt } = useLimitStore()
	const { amounts } = useLimitProcessStore()
	const [amountIn, amountOut] = amounts ?? []

	return (
		<div className="flex flex-col items-center gap-3">
			<div className="flex items-center gap-4 font-medium">
				<div className="flex items-center gap-1">
					<TokenIcon token={amountIn?.token} className="size-4" />
					{amountIn?.toFormat({ decimalPlaces: 3, withUnit: true })}
				</div>
				<ArrowRight className="size-3" />
				<div className="flex items-center gap-1">
					<TokenIcon token={amountOut?.token} className="size-4" />
					{amountOut?.toFormat({ decimalPlaces: 3, withUnit: true })}
				</div>
			</div>
			<div className="flex items-center gap-1 text-xs">
				<div className="text-gray-400 dark:text-gray-600">Expires</div>
				<div>{expiresAt.format("MMMM D, YYYY h:mm A Z")}</div>
			</div>
		</div>
	)
}
