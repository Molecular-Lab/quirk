import { useMemo } from "react"

import { RadioOption } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { LiquidityChartRangeInput, LiquidityRangeWarningBox } from "@/feature/liquidity/components"
import { tokenPairSorter } from "@/feature/liquidity/tokenPairSorter"
import { Pool } from "@/types/pool"
import { EvmToken } from "@/types/tokens"

import { PriceRangeInputs } from "../../components"
import { useAddLiquidityState } from "../../hooks/useAddLiquidityState"
import { useAddLiquidityStore } from "../../store/useAddLiquidityStore"

import { PriceRangeInputsHeader } from "./PriceRangeInputsHeader"
import { Title } from "./title"

export const StepSelectPriceRange: React.FC<{
	pool: Pool | null | undefined
	tokenA: EvmToken | undefined
	tokenB: EvmToken | undefined
	hasNative: boolean
	bothTokenSelected: boolean
	tickCurrent: number | undefined
	enabledPriceChart: boolean
	enabledPriceRange: boolean
	dimSectionClassName: string
	onFullRangeClick: () => void
	rangeByOptions: RadioOption<string>[]
	isLoading: boolean
}> = ({
	pool,
	tokenA,
	tokenB,
	hasNative,
	bothTokenSelected,
	enabledPriceChart,
	enabledPriceRange,
	dimSectionClassName,
	onFullRangeClick,
	rangeByOptions,
	isLoading,
}) => {
	const {
		rangeBy,
		setRangeBy,
		tickLower,
		tickUpper,
		computed: { invalidRange },
	} = useAddLiquidityStore()
	const { tickCurrent } = useAddLiquidityState()
	const [base, quote] = useMemo(() => tokenPairSorter(tokenA, tokenB), [tokenA, tokenB])

	const outOfRange: boolean = useMemo(() => {
		if (tickLower === undefined || tickUpper === undefined) {
			return false
		}
		const current = pool ? pool.tickCurrent : tickCurrent
		if (current === undefined) {
			return false
		}

		return current < tickLower || current >= tickUpper
	}, [tickLower, tickUpper, pool, tickCurrent])

	return (
		<div
			className={cn(
				"flex flex-col gap-4 p-4 lg:p-5",
				"h-fit w-full rounded-2xl",
				"border border-gray-100 dark:border-gray-900",
				"backdrop-blur-sm",
				!enabledPriceChart && dimSectionClassName,
			)}
		>
			<Title />
			<LiquidityChartRangeInput
				pool={pool}
				quote={quote}
				base={base}
				hasNative={hasNative}
				isLoading={isLoading}
				onFullRangeClick={onFullRangeClick}
			/>
			<div className={cn("flex flex-col gap-3", !enabledPriceRange && dimSectionClassName)}>
				<PriceRangeInputsHeader
					bothTokenSelected={bothTokenSelected}
					rangeBy={rangeBy}
					setRangeBy={setRangeBy}
					rangeByOptions={rangeByOptions}
				/>
				<PriceRangeInputs />
				<LiquidityRangeWarningBox outOfRange={outOfRange} inValidRange={invalidRange} />
			</div>
		</div>
	)
}
