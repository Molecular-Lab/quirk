import { useMemo } from "react"

import BigNumber from "bignumber.js"
import { Coins, Landmark } from "lucide-react"
import { Address } from "viem"

import { Skeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { useMyTokens } from "@/hooks/token/useMyTokens"
import { useSumUsdPrice } from "@/hooks/token/useUsdPrice"
import { useSwapChainId } from "@/hooks/useChainId"
import { TokenAmount } from "@/types/tokenAmount"
import { formatFiatValue } from "@/utils/number"
// don't move this import
// eslint-disable-next-line import/order
import { useAddressPositions } from "@/hooks/liquidity/usePosition"

/**
 * display sum of every token balance in USD
 */
export const MyTokenBalance: React.FC<
	PropsWithClassName<{
		address: Address | undefined
	}>
> = ({ address, className }) => {
	const {
		data,
		isLoading: isLoadingTokenBalance,
		isLoadingUsdBalance,
	} = useMyTokens({
		balanceWallet: address,
	})

	const isLoadingMyTokenUsd = useMemo(
		() => isLoadingTokenBalance || isLoadingUsdBalance,
		[isLoadingTokenBalance, isLoadingUsdBalance],
	)

	return (
		<div className={cn("flex flex-col", className)}>
			<Skeleton isLoading={isLoadingMyTokenUsd} width={160} className="text-3xl font-medium lg:text-4xl/[44px]">
				{formatFiatValue(data.myUsdBalance, { showFullValue: true })}
			</Skeleton>
			<div className="text-sm text-gray-400 dark:text-gray-600 lg:text-base">Available Balance</div>
		</div>
	)
}

/**
 * display sum of every token balance and every liquidity value in USD
 */
export const MyNetWorth: React.FC<
	PropsWithClassName<{
		address: Address | undefined
	}>
> = ({ address, className }) => {
	const chainId = useSwapChainId()
	const {
		data,
		isLoading: isLoadingTokenBalance,
		isLoadingUsdBalance,
	} = useMyTokens({
		chainId: chainId,
		balanceWallet: address,
	})

	const { data: positions, isLoading: isLoadingPositions } = useAddressPositions(address, chainId)

	const tokenAmounts = useMemo<TokenAmount[]>(() => {
		if (!positions) return []
		const tokenAmts = positions.flatMap((position) => [position.amount0, position.amount1])
		return tokenAmts
	}, [positions])

	const { data: positionValue, isLoading: isLoadingPositionValue } = useSumUsdPrice(tokenAmounts)

	const isLoadingMyTokenUsd = useMemo(
		() => isLoadingTokenBalance || isLoadingUsdBalance,
		[isLoadingTokenBalance, isLoadingUsdBalance],
	)
	const isLoadingPositionUsd = useMemo(
		() => isLoadingPositionValue || isLoadingPositions,
		[isLoadingPositionValue, isLoadingPositions],
	)

	const netWorth = useMemo<BigNumber>(() => {
		return data.myUsdBalance.plus(positionValue)
	}, [data.myUsdBalance, positionValue])

	return (
		<div className={cn("flex flex-col gap-x-4 gap-y-3", className)}>
			<div className="flex flex-col gap-1">
				<div className="text-sm text-gray-400 dark:text-gray-600 lg:text-base">Net Worth</div>
				<Skeleton
					isLoading={isLoadingMyTokenUsd || isLoadingPositionUsd}
					width={160}
					className="text-3xl font-medium lg:text-4xl/[44px]"
				>
					{formatFiatValue(netWorth, { showFullValue: true })}
				</Skeleton>
			</div>
			<div className="flex w-full gap-x-2 gap-y-1">
				<div className="flex w-full flex-col justify-between gap-2">
					<div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-600">
						<Coins className="size-3 shrink-0 md:size-3.5" />
						<div className="text-xs md:text-sm">Token Balance</div>
					</div>
					<Skeleton className="text-xs md:text-sm" width={80} isLoading={isLoadingMyTokenUsd}>
						{formatFiatValue(data.myUsdBalance, { showFullValue: true })}
					</Skeleton>
				</div>
				<div className="flex w-full flex-col justify-between gap-2">
					<div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-600">
						<Landmark className="size-3 shrink-0 md:size-3.5" />
						<div className="text-xs md:text-sm">Liquidity</div>
					</div>
					<Skeleton className="text-xs md:text-sm" width={80} isLoading={isLoadingPositionUsd}>
						{formatFiatValue(positionValue, { showFullValue: true })}
					</Skeleton>
				</div>
			</div>
		</div>
	)
}
