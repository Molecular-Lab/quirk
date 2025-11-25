import BigNumber from "bignumber.js"

import { Badge, Skeleton } from "@rabbitswap/ui/basic"

import { FeeAmount, formatFeeDisplay } from "@/constants/dex"
import { formatFiatValue } from "@/utils/number"

const feeTooltip: Record<FeeAmount, string> = {
	100: "Best for very stable pairs.",
	500: "Best for stable pairs.",
	3000: "Best for most pairs.",
	10000: "Best for exotic pairs.",
}

export const FeeSelectorBadge: React.FC<{
	feeTier: FeeAmount
	tierDistributionPct: BigNumber | undefined // 0-100
	highestTvl: FeeAmount | undefined
	tierUSDTVL: string | null
	isLoading: boolean
}> = ({ tierDistributionPct, highestTvl, tierUSDTVL, feeTier, isLoading }) => {
	const formatedPoolPortion = tierDistributionPct?.toFormat(2)

	const formatedTVL = tierUSDTVL
		? formatFiatValue(tierUSDTVL, { showFullValue: false, showLessThanSymbol: false })
		: null

	return (
		<div className="flex size-full min-h-[60px] w-full items-center justify-between gap-2 px-1 lg:min-w-[260px]">
			<div className="flex flex-col justify-start gap-2">
				<div className="flex items-center justify-between gap-2 text-base font-light">
					{formatFeeDisplay(feeTier)}
					<Skeleton isLoading={isLoading} width="100%">
						{highestTvl === feeTier && (
							<Badge variant="gray" className="h-[18px] rounded-lg px-2 py-1 text-gray-600 dark:text-gray-200">
								<div className="text-xs text-gray-600 dark:text-gray-200">Highest TVL</div>
							</Badge>
						)}
					</Skeleton>
				</div>
				<div className="text-xs text-gray-500">{feeTooltip[feeTier]}</div>
			</div>
			<div className="flex flex-col items-end justify-between gap-2.5 text-xs text-gray-500">
				<Skeleton isLoading={isLoading} width={60} className="text-sm text-rabbit-black dark:text-gray-50">
					{formatedTVL ?? "-"} TVL
				</Skeleton>
				<Skeleton isLoading={isLoading} width={60} className="flex items-center justify-end">
					{formatedPoolPortion === undefined ? "Not created" : `${formatedPoolPortion}% Select`}
				</Skeleton>
			</div>
		</div>
	)
}
