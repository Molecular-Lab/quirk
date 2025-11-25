import { useMemo } from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"

import { viction } from "viem/chains"

import { Container } from "@rabbitswap/ui/basic"
import { ClipboardCopy } from "@rabbitswap/ui/components"
import { cn, shortenText } from "@rabbitswap/ui/utils"

import { Layout } from "@/components/layout"
import { PoolTitle } from "@/components/PoolTitle"
import { TokenIcon } from "@/components/TokenIcon"
import { getExplorerLink } from "@/constants/explorer"
import { DevModeAuthGuard } from "@/feature/dev/DevModeAuthGuard"
import { PoolStats, useAllPools } from "@/feature/explore/list/PoolTable/usePoolData"
import { usePoolClaimableFee } from "@/hooks/liquidity/usePoolsClaimableFee"
import { useUsdPrice } from "@/hooks/token/useUsdPrice"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"
import { sortDisplayTokens } from "@/utils/token"

const PAGE_TITLE = "Rabbit Swap | Fee Watcher"
const PAGE_DESCRIPTION = ""

const FeeWatcherListItem: React.FC<{ pool: PoolStats; rowIndex: number }> = ({ pool, rowIndex }) => {
	const { data: poolClaimableFee, error } = usePoolClaimableFee(pool)

	const [token0, token1] = sortDisplayTokens([pool.token0, pool.token1])

	const token0Amount = pool.token0 ? TokenAmount.fromWei(pool.token0, poolClaimableFee?.protocolFees.token0) : undefined
	const token1Amount = pool.token1 ? TokenAmount.fromWei(pool.token1, poolClaimableFee?.protocolFees.token1) : undefined

	const token0UsdPrice = useUsdPrice(token0Amount)
	const token1UsdPrice = useUsdPrice(token1Amount)

	const sumUsdPrice = useMemo(() => {
		return token0UsdPrice?.plus(token1UsdPrice ?? 0)
	}, [token0UsdPrice, token1UsdPrice])

	return (
		<div className="flex items-center gap-4 px-4 py-3">
			<div className="w-6 text-right text-sm tabular-nums">{rowIndex}</div>
			<div className="flex w-32 items-center gap-2">
				<Link
					to={getExplorerLink(viction.id, pool.address, "address")}
					target="_blank"
					className="leading-none hover:underline"
				>
					{shortenText({ text: pool.address })}
				</Link>
				<ClipboardCopy text={pool.address} className="size-4" />
			</div>
			<div className="w-56">
				<PoolTitle
					currencyQuote={token0}
					currencyBase={token1}
					feeRate={pool.feeRate}
					titleClassName="text-base"
					iconClassName="size-7 lg:size-8"
				/>
			</div>
			<div className="w-full flex-1 grow">
				{error ? (
					<div>{error.message}</div>
				) : (
					<div className="flex items-center gap-4">
						{/* sum */}
						<div className={cn("w-20 text-right font-mono", sumUsdPrice?.lt(1) && "text-gray-300")}>
							{formatFiatValue(sumUsdPrice)}
						</div>
						{/* by token */}
						<div className="flex w-64 flex-1 flex-col gap-1 text-sm">
							<div className="flex items-center justify-between gap-1">
								<div className="flex items-center gap-1">
									<div className="w-32 text-right">{token0Amount?.toFixed(6)}</div>
									<TokenIcon token={pool.token0} className="size-4" />
									{pool.token0?.symbol}
								</div>
								<div className={cn("", token0UsdPrice?.lt(1) && "text-gray-300")}>
									{formatFiatValue(token0UsdPrice)}
								</div>
							</div>
							<div className="flex items-center justify-between gap-1">
								<div className="flex items-center gap-1">
									<div className="w-32 text-right">{token1Amount?.toFixed(6)}</div>
									<TokenIcon token={pool.token1} className="size-4" />
									{pool.token1?.symbol}
								</div>
								<div className={cn("", token1UsdPrice?.lt(1) && "text-gray-300")}>
									{formatFiatValue(token1UsdPrice)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

const Index: React.FC = () => {
	const { data: allPools, isLoading } = useAllPools("totalValueLockedUsd", "desc")

	return (
		<>
			<Helmet
				title={PAGE_TITLE}
				meta={[
					{
						name: "description",
						content: PAGE_DESCRIPTION,
					},
				]}
			/>
			<Layout>
				<DevModeAuthGuard>
					<Container className="lg:max-w-[auto]">
						<h1 className="mb-6 text-xl font-semibold lg:text-2xl">Fee Watcher</h1>
						{isLoading ? (
							<div className="p-16">Loading...</div>
						) : (
							<div className="flex flex-col divide-y divide-gray-200 border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
								{allPools?.map((pool, index) => {
									return <FeeWatcherListItem pool={pool} key={pool.address} rowIndex={index + 1} />
								})}
							</div>
						)}
					</Container>
				</DevModeAuthGuard>
			</Layout>
		</>
	)
}

export default Index
