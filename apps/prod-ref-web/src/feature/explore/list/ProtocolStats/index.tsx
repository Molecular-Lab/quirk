import { useMemo } from "react"

import dayjs from "dayjs"

import { cn } from "@rabbitswap/ui/utils"

import { TheGraphLogo } from "@/components/Logo/the-graph"
import { useAllPools } from "@/feature/explore/list/PoolTable/usePoolData"
import { ProtocolStatCard } from "@/feature/explore/list/ProtocolStats/ProtocolStatCard"
import { useVolumeChartData } from "@/feature/explore/list/VolumeChartSection/useVolumeChartData"

export const ProtocolStats: React.FC = () => {
	// TVL
	const { data: poolsStats, isLoading: isTvlLoading } = useAllPools("totalValueLockedUsd", "desc")
	const currentTvlUsd = useMemo(
		() => poolsStats?.reduce((acc, curr) => acc + curr.totalValueLockedUsd, 0),
		[poolsStats],
	)

	// Volume
	const { data: volumeData, isLoading: isVolumeLoading } = useVolumeChartData("M")
	const cumulativeVolumeUsd = useMemo(() => volumeData?.reduce((acc, curr) => acc + curr.data, 0), [volumeData])

	const formattedDate = dayjs().format("MMM DD, YYYY")

	return (
		<div className="flex size-full flex-col md:max-w-[340px]">
			<h1 className={cn("pb-3 md:pb-5", "flex items-center gap-x-3 gap-y-0.5 md:flex-col md:items-start lg:gap-y-1")}>
				<div className="whitespace-nowrap text-xl font-medium md:text-2xl lg:text-3xl">RabbitSwap Stats</div>{" "}
				<div className="flex items-center gap-0.5 whitespace-nowrap text-[8px]/[10px] text-gray-700 md:text-2xs lg:text-xs">
					Powered by <span className="hidden sm:inline">The Graph</span>
					<TheGraphLogo className="size-2.5 md:size-3 lg:size-4" />
				</div>
			</h1>
			<div className="grid h-full grid-cols-2 items-center gap-3 md:grid-cols-1 md:gap-4">
				<ProtocolStatCard
					type="TVL"
					title={
						<>
							<span className="hidden lg:block">Total Value Locked</span>
							<span className="lg:hidden">TVL</span>
						</>
					}
					subtitle={formattedDate}
					value={currentTvlUsd}
					link="https://defillama.com/protocol/proxify-swap#tvl-charts"
					isLoading={isTvlLoading}
				/>
				<ProtocolStatCard
					type="VOL"
					title="Cumulative Volume"
					subtitle="All time"
					value={cumulativeVolumeUsd}
					isLoading={isVolumeLoading}
				/>
			</div>
		</div>
	)
}
