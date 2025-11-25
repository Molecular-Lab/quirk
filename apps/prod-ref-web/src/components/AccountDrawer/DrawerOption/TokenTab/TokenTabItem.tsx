import { useMemo } from "react"

import BigNumber from "bignumber.js"
import qs from "qs"

import { ClipboardCopy } from "@rabbitswap/ui/components"
import { cn } from "@rabbitswap/ui/utils"

import { PercentChange } from "@/components/PercentChange"
import { TokenIcon } from "@/components/TokenIcon"
import { SwapSearchParams } from "@/feature/swap/hooks/useSwapSearchParams"
import { useBalance } from "@/hooks/token/useBalance"
import { useTokenStats } from "@/hooks/token/useTokenStats"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { Link } from "@/router"
import { EvmToken } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

interface TokenItemProps {
	token: EvmToken
}
export const TokenTabItem: React.FC<TokenItemProps> = ({ token }) => {
	const { data: balance } = useBalance({ token })
	const usdPrice = useUsdPrice(balance)
	const { data: stats } = useTokenStats(token)

	const diff = stats?.change24h

	const swapSearchParam = useMemo<SwapSearchParams>(() => {
		return {
			tokenOut: token.address,
		}
	}, [token])

	return (
		<Link
			className={cn("flex cursor-pointer justify-between", "p-3 md:px-6", "hover:bg-gray-50 hover:dark:bg-gray-900")}
			to={{
				pathname: `/swap`,
				search: qs.stringify(swapSearchParam),
			}}
		>
			<div className="flex items-center gap-3">
				<TokenIcon token={token} className="size-9" />
				<div className="flex flex-col gap-0.5">
					<div className="flex items-center gap-1">
						<div className="font-medium">{token.name}</div>
						<ClipboardCopy text={token.address} className="size-3" />
					</div>
					<div className="flex gap-1">
						<p className="text-sm leading-[18px] text-gray-400">
							{balance && balance.bigint > 0n && balance.toFormat({ decimalPlaces: 3, rounding: BigNumber.ROUND_DOWN })}
						</p>
						<p className="text-sm leading-[18px] text-gray-400">{token.symbol}</p>
					</div>
				</div>
			</div>
			<div className="flex flex-col items-end gap-0.5">
				<div className="text-end font-medium">{formatFiatValue(usdPrice, { rounding: BigNumber.ROUND_DOWN })}</div>
				{!!diff && <PercentChange value={diff * 100} labelClassName={cn("text-sm leading-[18px] text-gray-400")} />}
			</div>
		</Link>
	)
}
