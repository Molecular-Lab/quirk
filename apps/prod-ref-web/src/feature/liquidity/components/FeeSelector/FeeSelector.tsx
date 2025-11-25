import BigNumber from "bignumber.js"

import { Badge, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { FeeAmount, formatFeeDisplay } from "@/constants/dex"

import { FeeSelectorBadge } from "./FeeSelectorBadge"

interface FeeSelectorProps extends PropsWithClassName {
	tierDistribution: Record<FeeAmount, number | null> | undefined
	tierUSDTVL: Record<FeeAmount, string | null> | undefined
	highestTvl: FeeAmount | undefined
	selectedTier: FeeAmount | undefined
	setSelectedTier: (f: FeeAmount) => void
	showTierOption?: boolean
	setShowTierOption?: (v: boolean) => void
	enabledFeeSelector?: boolean
	isLoading: boolean
}

export const FeeSelector: React.FC<FeeSelectorProps> = ({
	tierDistribution,
	tierUSDTVL,
	highestTvl,
	selectedTier,
	setSelectedTier,
	setShowTierOption: _setShowTierOption,
	enabledFeeSelector,
	isLoading,
	className,
}) => {
	return (
		<Select
			defaultValue={highestTvl?.toString() ?? selectedTier?.toString()}
			value={selectedTier?.toString()}
			onValueChange={(v) => {
				setSelectedTier(Number(v) as FeeAmount)
			}}
			disabled={!enabledFeeSelector}
		>
			<SelectTrigger
				className={cn(
					"w-fit gap-2 px-3",
					"border-gray-100 hover:border-gray-200 focus:border-gray-200 dark:border-gray-800/50 dark:hover:border-gray-800/60 dark:focus:border-gray-800/60",
					"hover:bg-gray-50/60 dark:bg-gray-925/60 dark:hover:bg-gray-925",
					"transition-colors",
					className,
				)}
			>
				<div className="flex w-full items-center justify-between gap-1 text-xs font-normal lg:text-sm">
					{selectedTier ? (
						<>
							<div className="mr-1">
								{formatFeeDisplay(selectedTier)}
								<span className="hidden md:inline"> Fee Tier</span>
							</div>
							<div className="flex items-center gap-1">
								<Badge variant="gray" className="px-2 py-1 !text-xs text-gray-600 dark:text-gray-200">
									{tierDistribution?.[selectedTier] === null || tierDistribution?.[selectedTier] === undefined
										? "Not created"
										: `${BigNumber(tierDistribution[selectedTier]).shiftedBy(2).toFixed(2)}% Select`}
								</Badge>
								{highestTvl === selectedTier ? (
									<Badge size="small" className="px-2 py-1 !text-xs text-gray-600 dark:text-gray-200">
										Highest
									</Badge>
								) : undefined}
							</div>
						</>
					) : (
						<>Select Fee tier</>
					)}
				</div>
			</SelectTrigger>
			<SelectContent className={cn("mt-2 rounded-xl border lg:w-full", "border-gray-100/80", "dark:border-gray-900")}>
				<SelectGroup className="flex flex-col gap-2">
					{Object.entries(tierUSDTVL ?? {}).map(([k, v]) => {
						const feeTier = Number(k) as FeeAmount
						const tierDistributionPct =
							tierDistribution && tierDistribution[feeTier] !== null
								? BigNumber(tierDistribution[feeTier]).shiftedBy(2)
								: undefined
						return (
							<SelectItem key={k} value={k} className="flex items-center rounded-xl">
								<FeeSelectorBadge
									feeTier={feeTier}
									tierDistributionPct={tierDistributionPct}
									highestTvl={highestTvl}
									tierUSDTVL={v}
									isLoading={isLoading}
								/>
							</SelectItem>
						)
					})}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
}
