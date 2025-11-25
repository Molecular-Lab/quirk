import { useMemo } from "react"

import { AnimatePresence } from "framer-motion"

import { RabbitSwap, Thunder } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateHeight } from "@/components/Animate/AnimateHeight"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"
import { InfoItem } from "@/feature/swap/components/Info/InfoItem"
import { QuoteRate } from "@/feature/swap/components/Info/QuoteRate"
import { QuoteRoute } from "@/feature/swap/components/Info/QuoteRoute"
import { usePriceImpact } from "@/feature/swap/hooks/usePriceImpact"
import { useSwapQuote } from "@/feature/swap/swap/hooks/useSwapQuote"
import { useSwapStore } from "@/feature/swap/swap/store/swapStore"
import { getPriceImpactColor } from "@/feature/swap/utils/priceImpact"
import { useSumUsdPrice } from "@/hooks/token/useUsdPrice"
import { formatDisplayNumber } from "@/utils/number"

export type QuoteInfoType =
	| "RATE"
	| "SLIPPAGE"
	| "FEE"
	| "ROUTING"
	| "PRICE_IMPACT"
	| "USD_PRICE_IMPACT"
	| "POOL_PRICE_IMPACT"

export const SwapQuoteInfo: React.FC<{ types: QuoteInfoType[] }> = ({ types }) => {
	return (
		<div className="flex w-full flex-col">
			<AnimatePresence initial={false}>
				{types.map((type) => (
					<AnimateHeight key={type}>
						<SwapInfoItem infoType={type} />
					</AnimateHeight>
				))}
			</AnimatePresence>
		</div>
	)
}

const SwapInfoItem: React.FC<{ infoType: QuoteInfoType }> = ({ infoType }) => {
	const { data: quote, isLoading: quoteLoading } = useSwapQuote()
	const {
		internalState: { autoSlippage },
		computed: { slippage },
	} = useTxSetting()
	const {
		routeName,
		type,
		amountIn,
		amountOut,
		computed: { minAmountOut, maxAmountIn },
	} = useSwapStore()

	const poolFeeUsd = useSumUsdPrice(quote?.poolFeeAmounts ?? [])

	const poolFee = useMemo(() => {
		if (!quote) return undefined
		if (poolFeeUsd.error) return "Can't estimate fee"
		return Number(poolFeeUsd.data) < 0.001
			? "<$0.001"
			: `~$${formatDisplayNumber(poolFeeUsd.data, { toFixed: true, precision: 3 })}`
	}, [poolFeeUsd, quote])

	const priceImpact = usePriceImpact({
		amountIn: quote?.amountIn,
		amountOut: quote?.amountOut,
	})

	switch (infoType) {
		case "RATE": {
			return (
				<InfoItem title="Rate">
					<QuoteRate
						amountIn={quote?.amountIn ?? amountIn}
						amountOut={quote?.amountOut ?? amountOut}
						hasQuoteResp={!!quote}
					/>
				</InfoItem>
			)
		}

		case "USD_PRICE_IMPACT": {
			return (
				<InfoItem
					title="USD Price Impact"
					isLoading={priceImpact.isLoading}
					className={getPriceImpactColor(priceImpact.data.usdPriceImpact)}
					tooltip="The impact your trade has on the output amount."
				>
					{priceImpact.data.usdPriceImpact ? `${priceImpact.data.usdPriceImpact.toFormat(2)}%` : "-"}
				</InfoItem>
			)
		}

		case "POOL_PRICE_IMPACT": {
			return (
				<InfoItem
					title="Pool Price Impact"
					isLoading={priceImpact.isLoading}
					className={getPriceImpactColor(priceImpact.data.poolPriceImpact)}
					tooltip="The impact your trade has on the market price of this pool."
				>
					{priceImpact.data.poolPriceImpact ? `${priceImpact.data.poolPriceImpact.toFormat(2)}%` : "-"}
				</InfoItem>
			)
		}

		case "PRICE_IMPACT": {
			if (routeName === "arken") {
				return <></>
			}
			return (
				<InfoItem
					title="Price Impact"
					isLoading={priceImpact.isLoading}
					className={getPriceImpactColor(priceImpact.data.priceImpact)}
					tooltip="The impact your trade has on the market price of this pool."
				>
					{priceImpact.data.priceImpact ? `${priceImpact.data.priceImpact.toFormat(2)}%` : "-"}
				</InfoItem>
			)
		}

		case "SLIPPAGE": {
			return (
				<>
					<InfoItem
						title="Max. slippage"
						className="flex items-center gap-2"
						tooltip="The maximum price movement before your transaction will revert."
					>
						{autoSlippage && (
							<div className="rounded-full bg-gray-50 px-2 py-px text-xs text-gray-400 dark:bg-gray-900">Auto</div>
						)}
						{slippage}%
					</InfoItem>
					{type === "EXACT_INPUT" && (
						<InfoItem
							title="Receive at least"
							tooltip="If the price moves so that you will receive less than this amount, the transaction will revert."
							isLoading={quoteLoading}
						>
							{minAmountOut?.toFormat({ decimalPlaces: 6, withUnit: true })}
						</InfoItem>
					)}
					{type === "EXACT_OUTPUT" && (
						<InfoItem
							title="Pay at most"
							tooltip="If the price moves so that you will pay more than this amount, the transaction will revert."
							isLoading={quoteLoading}
						>
							{maxAmountIn?.toFormat({ decimalPlaces: 6, withUnit: true })}
						</InfoItem>
					)}
				</>
			)
		}

		case "FEE": {
			if (routeName === "arken") {
				return <></>
			}
			return (
				<>
					<InfoItem
						title="Fee"
						tooltip="This fee is applied to selected token pairs to enhance the trading experience on Rabbit Swap. This fee is already included in the quoted amount provided."
					>
						{poolFee}
					</InfoItem>

					<InfoItem
						title="Network Cost"
						tooltip="The network fee for this transaction is sponsored by the protocol, so no additional cost will be incurred on your end."
					>
						<div className="flex items-center gap-0.5">
							<Thunder className="size-4" />
							Gas Sponsored
						</div>
					</InfoItem>
				</>
			)
		}

		case "ROUTING": {
			return (
				<InfoItem
					title="Order Routing"
					className={cn(routeName === "arken" && "cursor-default")}
					tooltipContentClassName={cn(routeName === "rabbitswap" ? "max-w-[min(400px,95vw)]" : "hidden")}
					tooltip={
						<div className="flex flex-col gap-2">
							<QuoteRoute
								amountIn={quote?.amountIn}
								amountOut={quote?.amountOut}
								route={quote?.route}
								chainId={quote?.chainId}
							/>
							This route optimizes your total output by considering split routes, multiple hops, and the gas cost of
							each step.
						</div>
					}
				>
					<div className="flex items-center gap-1.5">
						{routeName === "rabbitswap" ? (
							<>
								<RabbitSwap className="size-4" />
								RabbitSwap API
							</>
						) : (
							<>Arken API</>
						)}
					</div>
				</InfoItem>
			)
		}

		default: {
			return null
		}
	}
}
