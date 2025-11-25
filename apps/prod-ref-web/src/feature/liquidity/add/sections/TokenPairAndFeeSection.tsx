import { useEffect } from "react"

import { cn } from "@rabbitswap/ui/utils"

import { TokenSelector } from "@/components/TokenSelector"
import { FeeAmount } from "@/constants/dex"
import { FeeSelector } from "@/feature/liquidity/components"
import { TxSettingButton } from "@/feature/settings/TransactionSetting"
import { useLiquidityDistribution } from "@/hooks/liquidity/useLiquidityDistribution"
import { EvmToken } from "@/types/tokens"

import { useAddLiquidityStore } from "../store/useAddLiquidityStore"

interface TokenPairAndFeeSectionProps {
	tokenA: EvmToken | undefined
	tokenB: EvmToken | undefined
	isTokenLoading: boolean
	handleSetTokenA: (token: EvmToken) => void
	handleSetTokenB: (token: EvmToken) => void
	handleSetSelectedTier: (feeAmount: FeeAmount | undefined) => void
	enabledFeeSelector: boolean
}

export const TokenPairAndFeeSection: React.FC<TokenPairAndFeeSectionProps> = ({
	tokenA,
	tokenB,
	isTokenLoading,
	handleSetTokenA,
	handleSetTokenB,
	handleSetSelectedTier,
	enabledFeeSelector,
}) => {
	const { selectedTier } = useAddLiquidityStore()
	const { data: distribution, isLoading } = useLiquidityDistribution([tokenA, tokenB])

	// auto select highest tvl tier if no tier is selected
	useEffect(() => {
		if (!distribution) return
		if (selectedTier === undefined && !!distribution.highestTvl) {
			handleSetSelectedTier(distribution.highestTvl)
			return
		}
		if (selectedTier !== distribution.highestTvl) {
			handleSetSelectedTier(selectedTier)
			return
		}
	}, [distribution, handleSetSelectedTier, selectedTier])

	return (
		<div className="flex w-full flex-col items-center gap-3 md:flex-row">
			<div className="flex w-full items-center gap-2 md:w-fit">
				{/* token pair */}
				<TokenSelector
					token={tokenA}
					onSelect={handleSetTokenA}
					className={cn(
						"h-10",
						"hover:bg-gray-50 dark:bg-background-dark dark:hover:bg-gray-950",
						"text-gray-600 hover:text-gray-800",
						"dark:text-rabbit-white dark:hover:text-rabbit-white",
						tokenA ? "border-0 p-0 !px-1" : "border border-current",
					)}
					buttonType="outline"
					buttonColor="gray"
					emptyStateLabel="Select Base token"
				/>
				<TokenSelector
					token={tokenB}
					onSelect={handleSetTokenB}
					className={cn(
						"h-10",
						"hover:bg-gray-50 dark:bg-background-dark dark:hover:bg-gray-950",
						"text-gray-600 hover:text-gray-800",
						"dark:text-rabbit-white dark:hover:text-rabbit-white",
						tokenB ? "border-0 p-0 !px-1" : "border border-current",
					)}
					buttonType="outline"
					buttonColor="gray"
					emptyStateLabel="Select Quote token"
				/>

				<TxSettingButton shorten className="ml-auto md:hidden" />
			</div>

			{/* fee tier */}
			<FeeSelector
				tierDistribution={distribution?.feeDistribution}
				tierUSDTVL={distribution?.liquidityTVL}
				highestTvl={distribution?.highestTvl}
				selectedTier={selectedTier}
				setSelectedTier={handleSetSelectedTier}
				enabledFeeSelector={enabledFeeSelector}
				isLoading={isLoading || isTokenLoading}
				className="w-full md:w-fit"
			/>

			<TxSettingButton shorten className="ml-auto hidden md:block" />
		</div>
	)
}
