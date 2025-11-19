import qs from "qs"

import { Tabs, TabsList, TabsTrigger } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { TxSettingButton } from "@/feature/settings/TransactionSetting"
import { LimitOrderPriceChartToggle } from "@/feature/swap/components/LimitOrderPriceChart/Toggle"
import { SwapSearchParams } from "@/feature/swap/hooks/useSwapSearchParams"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { QuoteRefetch } from "@/feature/swap/swap/components/QuoteRefetch"
import { useSwapStore } from "@/feature/swap/swap/store/swapStore"
import { TradingMode } from "@/feature/swap/types"
import { useNavigate } from "@/router"

export const SwapTitle: React.FC<PropsWithClassName<{ mode: TradingMode }>> = ({ mode, className }) => {
	const navigate = useNavigate()
	const { isXsUp, isLgUp } = useBreakpoints()
	const { amountIn: swapAmountIn, amountOut: swapAmountOut } = useSwapStore()
	const {
		computed: { amountIn: limitAmountIn, amountOut: limitAmountOut },
	} = useLimitStore()

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Tabs value={mode}>
				<TabsList className="gap-4 lg:gap-6">
					<TabsTrigger
						className={cn("text-lg lg:text-2xl")}
						value="swap"
						onClick={() => {
							const searchObj: SwapSearchParams = {
								tokenIn: limitAmountIn?.token.address,
								tokenOut: limitAmountOut?.token.address,
							}
							void navigate({
								pathname: "/swap",
								search: qs.stringify(searchObj),
							})
						}}
					>
						Swap
					</TabsTrigger>
					<TabsTrigger
						className={cn("text-lg lg:text-2xl")}
						value="limit"
						onClick={() => {
							const searchObj: SwapSearchParams = {
								tokenIn: swapAmountIn?.token.address,
								tokenOut: swapAmountOut?.token.address,
							}
							void navigate({
								pathname: "/limit",
								search: qs.stringify(searchObj),
							})
						}}
					>
						Limit
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<div className="grow" />
			{mode === "swap" && <QuoteRefetch />}
			{mode === "limit" && <LimitOrderPriceChartToggle hidden={isLgUp} />}
			<TxSettingButton shorten={!isXsUp} />
		</div>
	)
}
