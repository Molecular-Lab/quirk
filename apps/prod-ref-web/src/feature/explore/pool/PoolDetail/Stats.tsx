import { useMemo } from "react"

import { ShapeSkeleton, Skeleton } from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"

import { PercentChange } from "@/components/PercentChange"
import { TokenIcon } from "@/components/TokenIcon"
import { usePoolStats } from "@/hooks/liquidity/usePoolStats"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { Pool } from "@/types/pool"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"
import { sortDisplayAmount, useTokenColor } from "@/utils/token"

export const StatsSection: React.FC<{ pool: Pool | undefined }> = ({ pool }) => {
	const { theme } = useTheme()

	const { data: stats } = usePoolStats(pool)

	const tvlToken0 = pool ? TokenAmount.fromWei(pool.token0, stats?.totalValueLockedToken0) : undefined
	const tvlToken1 = pool ? TokenAmount.fromWei(pool.token1, stats?.totalValueLockedToken1) : undefined

	const [tvlDisplay0, tvlDisplay1] = useMemo(() => sortDisplayAmount([tvlToken0, tvlToken1]), [tvlToken0, tvlToken1])

	const token0Usd = useUsdPrice(tvlDisplay0)
	const token1Usd = useUsdPrice(tvlDisplay1)

	// 0-100
	const token0Pct = useMemo<number>(() => {
		if (token0Usd === undefined || token1Usd === undefined) {
			return 50
		}
		const totalUsd = token0Usd.plus(token1Usd)
		if (totalUsd.isZero()) {
			return 50
		}
		return token0Usd.div(totalUsd).shiftedBy(2).toNumber()
	}, [token0Usd, token1Usd])

	const { themeColor: token0Color } = useTokenColor(pool?.display0, theme)
	const { themeColor: token1Color } = useTokenColor(pool?.display1, theme)

	return (
		<div className="flex flex-col gap-5 lg:min-h-[442px] lg:gap-6 lg:rounded-2xl lg:bg-gray-50 lg:px-6 lg:py-5 lg:dark:bg-gray-900">
			<div className="text-xl font-medium lg:text-2xl">Stats</div>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2 lg:gap-3">
					<div className="text-sm text-gray-500">Pool balances</div>
					<div className="flex w-full flex-col gap-1">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1">
								<Skeleton isLoading={!stats} width={50}>
									{tvlDisplay0?.toFormat({ decimalPlaces: 3 })}
								</Skeleton>
								<TokenIcon token={pool?.display0} className="size-4" />
								<Skeleton isLoading={!pool} width={40}>
									{pool?.display0.symbol}
								</Skeleton>
							</div>
							<div className="flex items-center gap-1">
								<Skeleton isLoading={!stats} width={50}>
									{tvlDisplay1?.toFormat({ decimalPlaces: 3 })}
								</Skeleton>
								<TokenIcon token={pool?.display1} className="size-4" />
								<Skeleton isLoading={!pool} width={40}>
									{pool?.display1.symbol}
								</Skeleton>
							</div>
						</div>
						<ShapeSkeleton className="flex h-2 gap-1 overflow-hidden rounded-full" isLoading={!stats}>
							<div style={{ width: `${token0Pct}%`, background: token0Color }} />
							<div style={{ width: `${100 - token0Pct}%`, background: token1Color }} />
						</ShapeSkeleton>
					</div>
				</div>
				<div className="flex w-full justify-between gap-3 lg:flex-col lg:gap-5">
					<SubSection
						title="TVL"
						value={stats?.totalValueLockedUsd}
						change={stats?.tvlChangePercent}
						loading={!stats}
					/>
					<SubSection
						title="24H volume"
						value={stats?.volume24HUsd}
						change={stats?.volumeChangePercent}
						loading={!stats}
					/>
					<SubSection title="24H fees" value={stats?.fee24HUsd} change={undefined} loading={!stats} />
				</div>
			</div>
		</div>
	)
}

const SubSection: React.FC<{
	title: string
	value: string | undefined | number
	/**
	 * percentage in 100
	 */
	change: number | undefined
	loading?: boolean
}> = ({ title, value, change, loading }) => {
	return (
		<div className="flex w-full flex-col gap-2 lg:gap-3">
			<span className="text-gray-500">{title}</span>
			<div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
				<Skeleton width={100} isLoading={loading} className="text-2xl font-medium lg:text-[32px]">
					{formatFiatValue(value)}
				</Skeleton>

				{!!change && <PercentChange value={change} />}
			</div>
		</div>
	)
}
