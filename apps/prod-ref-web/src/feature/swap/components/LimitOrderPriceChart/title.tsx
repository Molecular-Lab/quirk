import React, { useMemo } from "react"
import { Link } from "react-router-dom"

import BigNumber from "bignumber.js"
import { ExternalLink } from "lucide-react"
import { viction } from "viem/chains"

import { Button, ShapeSkeleton, Skeleton } from "@rabbitswap/ui/basic"

import { PoolTitle } from "@/components/PoolTitle"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { Pool } from "@/types/pool"
import { TokenAmount } from "@/types/tokens"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"

export const PoolPriceChartTitle: React.FC<{
	pool: Pool | null | undefined
	inverted?: boolean
	price: BigNumber | undefined
	isLoading: boolean
}> = ({ inverted, price, pool, isLoading }) => {
	const [token0, token1] = useMemo(
		() => (inverted ? [pool?.token1, pool?.token0] : [pool?.token0, pool?.token1]),
		[pool, inverted],
	)
	const token0UsdPrice = useUsdPrice(token0 ? TokenAmount.fromString(token0, "1") : undefined)

	const token0PriceDisplay = formatDisplayNumber(price, {
		precision: 3,
	})
	const token0UsdPriceDisplay = formatFiatValue(token0UsdPrice, {
		minPrecision: 2,
		showLessThanSymbol: false,
	})

	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<PoolTitle currencyQuote={pool?.display0} currencyBase={pool?.display1} feeRate={pool?.fee} />
				<div className="flex items-center gap-1 text-xl lg:text-[32px]">
					<ShapeSkeleton className="h-7 w-[200px] lg:h-8 lg:w-[312px]" />
				</div>
			</div>
		)
	}

	if (!pool) {
		return (
			<div className="flex h-[78px] w-full flex-col gap-3 lg:h-[84px]">
				<div className="flex h-[38px] w-full items-center justify-between gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 lg:h-10 " />
				<div className="flex items-center gap-1 text-xl lg:text-[32px]">
					<div className="h-7 w-[200px] rounded-lg bg-gray-100 dark:bg-gray-900 lg:h-8 lg:w-[312px]" />
				</div>
			</div>
		)
	}

	return (
		<div className="flex w-full flex-col gap-3">
			<div className="flex w-full items-center justify-between gap-1">
				<PoolTitle currencyQuote={pool.display0} currencyBase={pool.display1} feeRate={pool.fee} />
				{pool.chainId === viction.id && (
					<Link
						to={`https://www.geckoterminal.com/tomochain/pools/${pool.address}`}
						target="_blank"
						rel="noreferrer"
						className="mr-2 lg:mr-4"
					>
						<Button
							buttonColor="gray"
							buttonType="outline"
							size="sm"
							className="p-2 !text-xs text-gray-950 dark:text-white"
						>
							<img
								src="https://s.geckoterminal.com/_next/static/media/logo_symbol.d6e8a303.svg"
								alt="GeckoTerminal"
								className="size-5"
							/>
							Trading View
							<ExternalLink className="mb-0.5 size-3" />
						</Button>
					</Link>
				)}
			</div>
			{token0 && token1 && (
				<div className="flex items-center gap-1 text-xl lg:text-[32px]">
					<span className="font-medium">{`1 ${token0.symbol} = ${token0PriceDisplay} ${token1.symbol}`}</span>
					<Skeleton isLoading={token0UsdPrice === undefined} width={100}>
						<span className="text-lg text-gray-500 lg:text-xl">({token0UsdPriceDisplay})</span>
					</Skeleton>
				</div>
			)}
		</div>
	)
}
