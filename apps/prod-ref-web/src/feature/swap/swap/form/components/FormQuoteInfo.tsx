import { useMemo, useState } from "react"

import { AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateHeight } from "@/components/Animate/AnimateHeight"
import { QuoteRate } from "@/feature/swap/components/Info/QuoteRate"
import { usePriceImpact } from "@/feature/swap/hooks/usePriceImpact"
import { SwapQuoteInfo } from "@/feature/swap/swap/components/QuoteInfo"
import { PriceImpact } from "@/feature/swap/swap/components/QuoteInfo/PriceImpact"
import { getPriceImpactTier } from "@/feature/swap/utils/priceImpact"

import { useSwapQuote } from "../../hooks/useSwapQuote"
import { useSwapStore } from "../../store/swapStore"

export const FormQuoteInfo: React.FC = () => {
	const { error: quoteError, data: quote } = useSwapQuote()
	const {
		routeName,
		amountIn,
		amountOut,
		computed: { swapFn },
	} = useSwapStore()

	const { isMdUp } = useBreakpoints()

	const [expand, setExpand] = useState(false)

	const { data: priceImpact } = usePriceImpact({
		amountIn: quote?.amountIn,
		amountOut: quote?.amountOut,
	})
	const priceImpactTier = useMemo(() => getPriceImpactTier(priceImpact.priceImpact), [priceImpact.priceImpact])
	const highPriceImpact = useMemo(
		() => priceImpactTier === "very-high" || priceImpactTier === "high",
		[priceImpactTier],
	)

	// when type is not swap, token is not select, amount is zero, or quote error, return null
	if (
		quoteError ||
		swapFn !== "swap" ||
		amountIn === undefined ||
		amountOut === undefined ||
		amountIn.bigNumber.isZero() ||
		amountOut.bigNumber.isZero()
	) {
		return null
	}

	return (
		<div>
			<div
				onClick={() => {
					setExpand((v) => !v)
				}}
				className="flex cursor-pointer items-center gap-1 py-2"
			>
				{highPriceImpact ? (
					<PriceImpact priceImpactTier={priceImpactTier} priceImpact={priceImpact.priceImpact} />
				) : (
					<QuoteRate amountIn={quote?.amountIn} amountOut={quote?.amountOut} hasQuoteResp={!!quote} />
				)}
				<div className="grow" />

				{routeName === "rabbitswap" && (
					<Tooltip>
						<TooltipTrigger>
							<div
								className={cn(
									"select-none text-xs text-gray-600 transition-all lg:text-sm",
									expand && "text-background dark:text-background-dark",
								)}
							>
								Gas Sponsored
							</div>
						</TooltipTrigger>
						<TooltipContent
							className={cn("max-w-[min(250px,95vw)] p-3", expand && "hidden")}
							side={isMdUp ? "left" : "top"}
						>
							The network fee for this transaction is sponsored by the protocol, so no additional cost will be incurred
							on your end.
						</TooltipContent>
					</Tooltip>
				)}

				<ChevronDown className={cn("text-gray-400 transition-all", expand ? "rotate-180" : "")} />
			</div>

			<AnimatePresence>
				{expand && (
					<AnimateHeight>
						<SwapQuoteInfo
							types={
								highPriceImpact
									? ["RATE", "PRICE_IMPACT", "SLIPPAGE", "FEE", "ROUTING"]
									: ["PRICE_IMPACT", "SLIPPAGE", "FEE", "ROUTING"]
							}
						/>
					</AnimateHeight>
				)}
			</AnimatePresence>
		</div>
	)
}
