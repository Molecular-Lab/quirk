import BigNumber from "bignumber.js"

import { cn } from "@rabbitswap/ui/utils"

export const PRICE_IMPACT_THRESHOLDS = {
	positive: 0,
	veryHigh: -5,
	high: -1,
}

export const getPriceImpactTier = (priceImpact?: BigNumber) => {
	if (priceImpact === undefined) return "neutral"
	if (priceImpact.gt(PRICE_IMPACT_THRESHOLDS.positive)) return "positive"
	if (priceImpact.lt(PRICE_IMPACT_THRESHOLDS.veryHigh)) return "very-high"
	if (priceImpact.lt(PRICE_IMPACT_THRESHOLDS.high)) return "high"
	return "neutral"
}

export type PriceImpactTier = ReturnType<typeof getPriceImpactTier>

export const getPriceImpactColor = (priceImpact?: BigNumber) => {
	if (priceImpact === undefined) return cn("")

	switch (getPriceImpactTier(priceImpact)) {
		case "positive": {
			return cn("text-success")
		}
		case "very-high": {
			return cn("text-error")
		}
		case "high": {
			return cn("text-warning-darken")
		}
		default: {
			return cn("text-gray-200")
		}
	}
}
