import { useMemo, useState } from "react"

import { ArrowLeftRight } from "lucide-react"
import { type Address } from "viem"

import { Button, ShapeSkeleton, Skeleton } from "@rabbitswap/ui/basic"
import { shortenText } from "@rabbitswap/ui/utils"

import { CopyableAddress } from "@/components/CopyableAddress"
import { PoolTitle } from "@/components/PoolTitle"
import { PoolTransactionTable } from "@/feature/explore/pool/PoolTransactionTable"
import { usePoolByAddress } from "@/hooks/liquidity/usePool"

import { PoolChart } from "../Chart"

import { PoolDetailBreadcrumb } from "./Breadcrumb"
import { MainButtonsSection, TitleButtonsSection } from "./Buttons"
import { LinkSection } from "./Links"
import { StatsSection } from "./Stats"

interface PoolDetailProps {
	chainId: number
	poolAddress: Address
}

export const PoolDetail: React.FC<PoolDetailProps> = ({ chainId, poolAddress }) => {
	const { data: _pool, isLoading } = usePoolByAddress(poolAddress, chainId)
	const [switchSide, setSwitchSide] = useState(false)

	const pool = useMemo(() => _pool?.unwrapped, [_pool])
	const [token0, token1] = useMemo(
		() => (switchSide ? [pool?.display1, pool?.display0] : [pool?.display0, pool?.display1]),
		[pool, switchSide],
	)

	const inverted = useMemo(() => pool?.displayInverted !== switchSide, [pool, switchSide])

	return (
		<div className="flex w-full flex-col gap-9 lg:flex-row">
			<div className="flex flex-1 flex-col gap-5">
				<PoolDetailBreadcrumb
					title={
						<Skeleton width={150} isLoading={isLoading || !token0 || !token1}>
							<div className="flex gap-2">
								<span>{`${token0?.symbol} / ${token1?.symbol}`}</span>
								<CopyableAddress address={pool?.address}>
									<span className="text-gray-500">{shortenText({ text: pool?.address })}</span>
								</CopyableAddress>
							</div>
						</Skeleton>
					}
				/>
				<div className="flex flex-col gap-9">
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between gap-2">
							{pool ? (
								<div className="flex items-center gap-3">
									<PoolTitle
										currencyQuote={token0}
										currencyBase={token1}
										iconClassName="size-10"
										titleClassName="md:text-lg md:mb-0.5"
										feeRate={pool.fee}
									/>
									<Button
										type="button"
										buttonColor="gray"
										buttonType="text"
										className="p-2"
										onClick={() => {
											setSwitchSide((val) => !val)
										}}
									>
										<ArrowLeftRight className="size-3.5" />
									</Button>
								</div>
							) : (
								<ShapeSkeleton className="h-7 w-full rounded-xl" />
							)}
							<TitleButtonsSection />
						</div>
						<PoolChart pool={pool} inverted={inverted} />
					</div>
					<PoolTransactionTable pool={pool} inverted={inverted} />
				</div>
			</div>
			<div className="flex flex-col gap-9 lg:min-w-[390px] lg:max-w-[390px]">
				<MainButtonsSection pool={pool} />
				<StatsSection pool={pool} />
				<LinkSection isLoading={isLoading} poolAddress={poolAddress} pool={pool} />
			</div>
		</div>
	)
}
