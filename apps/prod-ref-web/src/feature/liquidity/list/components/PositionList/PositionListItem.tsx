import { BigNumber } from "@ethersproject/bignumber"

import { Skeleton } from "@rabbitswap/ui/basic"
import { ArrowH } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { PoolTitle } from "@/components/PoolTitle"
import { RangeBadge } from "@/components/RangeBadge"
import { usePosition } from "@/hooks/liquidity/usePosition"
import { useSwapChainId } from "@/hooks/useChainId"
import { Link } from "@/router"
import { getUnwrapped } from "@/utils/token"

interface PositionListItemProps {
	tokenId: BigNumber | undefined
	isLoading?: boolean
}

export const PositionListItem: React.FC<PositionListItemProps> = ({ tokenId, isLoading: _isLoading }) => {
	const chainId = useSwapChainId()
	const { data: position, isLoading: isLoadingPosition } = usePosition(tokenId, chainId)

	const minPrice: string = position?.tickLowerPriceDisplay(position.display1) ?? ""
	const maxPrice: string = position?.tickUpperPriceDisplay(position.display1) ?? ""
	const isLoading = _isLoading ?? isLoadingPosition

	if (isLoading) {
		return <Skeleton isLoading={isLoading} className="h-[74px] rounded-2xl lg:h-[76px]" />
	}

	if (!position) {
		return <></>
	}

	const displayQuote = getUnwrapped(position.display0)
	const displayBase = getUnwrapped(position.display1)

	return (
		<Link to="/pools/:tokenId" params={{ tokenId: position.position.tokenId.toString() }}>
			<div className="flex w-full flex-row items-center justify-between gap-2 rounded-xl border border-gray-100 p-4 backdrop-blur-md hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700">
				<div className="flex flex-col items-center">
					<PoolTitle
						currencyQuote={displayQuote}
						currencyBase={displayBase}
						iconClassName="size-10"
						titleClassName="md:text-lg lg:text-xl"
						feeRate={position.pool.fee}
					/>
				</div>
				<div className="flex flex-col items-end justify-between gap-y-1">
					<RangeBadge positionState={position.positionState} />
					<div className={cn("flex w-full items-center justify-end gap-x-2", "text-xs sm:text-sm")}>
						<div className="flex flex-row gap-x-1 sm:text-base md:text-base">
							<div>{minPrice}</div>
							<ArrowH className="size-3 min-w-2 text-gray-400 sm:size-4" />
							<div>{maxPrice}</div>
						</div>
						<div className="text-gray-400">
							{displayQuote.symbol} per {displayBase.symbol}
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}
