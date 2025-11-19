import { ArrowRight } from "lucide-react"

import { TokenIcon } from "@/components/TokenIcon"
import { useSwapProcessStore } from "@/feature/swap/swap/store/swapProcessStore"

export const BaseProcess: React.FC = () => {
	const { amounts } = useSwapProcessStore()
	const [amountIn, amountOut] = amounts ?? []

	return (
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
	)
}
