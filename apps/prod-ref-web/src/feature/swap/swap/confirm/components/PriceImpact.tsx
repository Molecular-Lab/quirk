import { TriangleAlert } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"

import { usePriceImpact } from "@/feature/swap/hooks/usePriceImpact"
import { useSwapQuote } from "@/feature/swap/swap/hooks/useSwapQuote"
import { getPriceImpactColor } from "@/feature/swap/utils/priceImpact"

export const PriceImpact: React.FC<{
	onConfirm: () => void
	onCancel: () => void
}> = ({ onConfirm, onCancel }) => {
	const { data: quote } = useSwapQuote()
	const { data: impact } = usePriceImpact({
		amountIn: quote?.amountIn,
		amountOut: quote?.amountOut,
	})

	return (
		<div className="flex flex-col items-center gap-3 pt-4">
			<div className="flex size-12 items-center justify-center rounded-xl bg-error/20">
				<TriangleAlert className="text-error" />
			</div>
			<div className="text-2xl font-medium"> Warning</div>
			<div className="text-center leading-6 text-gray-600">
				This transaction will result in a{" "}
				<span className={getPriceImpactColor(impact.priceImpact)}>{impact.priceImpact?.toFormat(2)}%</span> price impact
				on the market price of this pool. Do you wish to continue?
			</div>
			<div className="flex w-full gap-4 pt-4">
				<Button className="grow" buttonColor="gray" onClick={onCancel}>
					Cancel
				</Button>
				<Button className="grow" buttonColor="danger" onClick={onConfirm}>
					Continue
				</Button>
			</div>
		</div>
	)
}
