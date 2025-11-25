import { useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import BigNumJs from "bignumber.js"

import { cn } from "@rabbitswap/ui/utils"

import { AccountDrawerTabSkeleton } from "@/components/AccountDrawer/AccountDrawerTabSkeleton"
import { PoolTitle } from "@/components/PoolTitle"
import { RangeBadge } from "@/components/RangeBadge"
import { usePosition } from "@/hooks/liquidity/usePosition"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { useAccountDrawer } from "@/hooks/useAccountDrawer"
import { useSwapChainId } from "@/hooks/useChainId"
import { Link } from "@/router"
import { formatFiatValue } from "@/utils/number"
import { getUnwrapped } from "@/utils/token"

export const PoolTabItem: React.FC<{
	tokenId: BigNumber
}> = ({ tokenId }) => {
	const { handleOpenDrawer } = useAccountDrawer()
	const chainId = useSwapChainId()

	const { data: position, isLoading } = usePosition(tokenId, chainId)

	const quoteAmount = position?.amountQuote
	const baseAmount = position?.amountBase
	const liqQuotePriceUsd = useUsdPrice(quoteAmount)
	const liqBasePriceUsd = useUsdPrice(baseAmount)

	const fiatValueOfLiquidity: BigNumJs | undefined = useMemo(() => {
		if (!liqQuotePriceUsd || !liqBasePriceUsd) {
			return undefined
		}
		return liqQuotePriceUsd.plus(liqBasePriceUsd)
	}, [liqBasePriceUsd, liqQuotePriceUsd])

	if (isLoading) {
		return <AccountDrawerTabSkeleton />
	}

	if (!position) {
		return <div />
	}

	const token0 = getUnwrapped(position.display0)
	const token1 = getUnwrapped(position.display1)

	return (
		<Link
			to="/pools/:tokenId"
			params={{ tokenId: tokenId.toString() }}
			onClick={handleOpenDrawer}
			className="flex cursor-pointer justify-between p-3 hover:bg-gray-50 hover:dark:bg-gray-900 md:px-6"
		>
			<div className="flex flex-1 items-center gap-3">
				<PoolTitle
					currencyQuote={token0}
					currencyBase={token1}
					feeRate={position.pool.fee}
					iconClassName={cn("size-8")}
					titleClassName={cn("!mb-0 leading-none")}
					subtitleClassName={cn("!text-xs leading-none")}
				/>
			</div>
			<div className="flex h-full shrink flex-col items-end justify-center gap-2">
				<div className="truncate text-end text-base font-medium">{formatFiatValue(fiatValueOfLiquidity)}</div>
				<RangeBadge size="small" className="mt-auto !text-xs !font-light" positionState={position.positionState} />
			</div>
		</Link>
	)
}
