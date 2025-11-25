import BigNumber from "bignumber.js"
import { TriangleAlert } from "lucide-react"

import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { PriceImpactTier } from "@/feature/swap/utils/priceImpact"

export const PriceImpact: React.FC<
	PropsWithClassName<{
		priceImpactTier: PriceImpactTier
		priceImpact: BigNumber | undefined
	}>
> = ({ priceImpactTier, priceImpact, className }) => {
	if (priceImpactTier === "very-high") {
		return (
			<div className={cn("flex items-center gap-1 text-sm font-medium", className)}>
				<TriangleAlert className="size-4 text-error" />
				<div className="text-error">Very high price impact ({BigNumber(priceImpact ?? 0).toFormat(2)}%)</div>
			</div>
		)
	}

	if (priceImpactTier === "high") {
		return (
			<div className={cn("flex items-center gap-1 text-sm font-medium", className)}>
				<TriangleAlert className="size-4 text-warning-darken" />
				<div className="text-warning-darken">High price impact ({BigNumber(priceImpact ?? 0).toFormat(2)}%)</div>
			</div>
		)
	}

	return null
}
