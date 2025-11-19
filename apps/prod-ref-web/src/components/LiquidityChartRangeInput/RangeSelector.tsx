import { useCallback, useEffect, useMemo, useState } from "react"
import { NumericFormat } from "react-number-format"

import { RadioButtonGroup } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useChartContext } from "@/components/LiquidityChartRangeInput/contexts/ChartContext"
import { priceToClosestTick } from "@/types/position/price"
import { Price } from "@/types/price"

const RANGE_OPTIONS = [
	{ label: "± 1%", value: 1 },
	{ label: "± 5%", value: 5 },
	{ label: "± 10%", value: 10 },
]

// prevent bug when typing custom range
const RANGE_BOUND = 1

interface RangeSelectorProps {
	priceLower: Price | undefined
	priceUpper: Price | undefined
	priceCurrent: Price
	onLeftRangeInput: (typedValue: string) => void
	onRightRangeInput: (typedValue: string) => void
	tickSpacing: number
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
	priceCurrent,
	onLeftRangeInput,
	onRightRangeInput,
	tickSpacing,
	priceLower,
	priceUpper,
}) => {
	const [customRange, setCustomRange] = useState<number | null>(null)
	const chartContext = useChartContext()

	// return price and tick for a given range percentage
	const getRange = useCallback(
		(value: number) => {
			const priceLower = priceCurrent.multipliedBy(1 - value / 100)
			const priceUpper = priceCurrent.multipliedBy(1 + value / 100)

			const tickUpper = priceToClosestTick(priceUpper, tickSpacing)
			const tickLower = priceToClosestTick(priceLower, tickSpacing)

			return {
				priceLower,
				priceUpper,
				tickLower,
				tickUpper,
			}
		},
		[priceCurrent, tickSpacing],
	)

	// check if the current range is equal to the given range
	const isRangeEqual = useCallback(
		(value: number) => {
			if (!priceLower?.value || !priceUpper?.value) return false
			const { tickLower, tickUpper } = getRange(value)
			return (
				tickLower === priceToClosestTick(priceLower, tickSpacing) &&
				tickUpper === priceToClosestTick(priceUpper, tickSpacing)
			)
		},
		[getRange, priceLower, priceUpper, tickSpacing],
	)

	// return the current range option
	const currentValue = useMemo(() => {
		if (!priceLower?.value || !priceUpper?.value || customRange) return undefined
		return RANGE_OPTIONS.find((option) => isRangeEqual(option.value))
	}, [isRangeEqual, priceLower?.value, priceUpper?.value, customRange])

	// reset the custom range when the current range changes
	useEffect(() => {
		if (customRange && !isRangeEqual(customRange)) {
			setCustomRange(null)
		}
	}, [customRange, isRangeEqual])

	// handle the value change
	const handleValueChange = (value: number) => {
		if (!priceCurrent.value) return

		const { priceLower, priceUpper } = getRange(value)
		onLeftRangeInput(priceLower.value!.toString())
		onRightRangeInput(priceUpper.value!.toString())
		chartContext?.zoomFn.zoomTo(0.5 / value)
	}

	return (
		<div className="grid grid-cols-4 gap-1 md:gap-2">
			<RadioButtonGroup
				size="sm"
				buttonColor="gray"
				groupingStyle="gap"
				className="col-span-3 w-full"
				defaultValue={undefined}
				options={RANGE_OPTIONS}
				value={currentValue?.value.toString() ?? ""}
				onValueChange={(value) => {
					setCustomRange(null)
					handleValueChange(Number(value))
				}}
			/>
			<NumericFormat
				prefix="± "
				suffix="%"
				placeholder="custom"
				className={cn(
					"size-full rounded-full bg-gray-50 px-2 text-center text-xs transition-colors placeholder:text-gray-600 focus:outline-none focus:ring-0 dark:bg-gray-900 dark:placeholder:text-white lg:text-sm",
					customRange && "bg-gray-100 text-gray-950 dark:bg-gray-700 dark:text-white",
				)}
				value={customRange ?? ""}
				decimalScale={0}
				onValueChange={({ floatValue }) => {
					if (!floatValue) {
						setCustomRange(null)
						return
					}
					handleValueChange(floatValue)
					setCustomRange(floatValue)
				}}
				allowNegative={false}
				isAllowed={({ floatValue }) => {
					if (!floatValue) return true
					return floatValue <= 100 - RANGE_BOUND && floatValue >= RANGE_BOUND
				}}
			/>
		</div>
	)
}
