import { useCallback, useMemo } from "react"

import { Button } from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"
import { cn } from "@rabbitswap/ui/utils"

import { useChartContext } from "@/components/LiquidityChartRangeInput/contexts/ChartContext"
import { useToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { useParams } from "@/router"
import { priceToClosestTick, tickToPrice } from "@/types/position/price"
import { Price } from "@/types/price"
import { getWrapped } from "@/utils/token"

const OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Conservative", value: "conservative" },
	{ label: "Full Range", value: "full" },
	{ label: "Quote Only", value: "left" },
	{ label: "Base Only", value: "right" },
] as const

const RELATIVE_RANGE_CONFIG = {
	active: 15,
	conservative: 50,
}

type OptionKey = (typeof OPTIONS)[number]["value"]

export const LiquidityTemplateSelector: React.FC<{
	noLiquidity: boolean // pool init
	priceCurrent: Price | undefined
	onLeftRangeInput: (typedValue: Price | undefined) => void
	onRightRangeInput: (typedValue: Price | undefined) => void
	tickSpacing: number
	setFullRange: () => void
}> = ({ noLiquidity, priceCurrent, tickSpacing, onLeftRangeInput, onRightRangeInput, setFullRange }) => {
	const { theme } = useTheme()

	const chartContext = useChartContext()

	const chainId = useSwapChainId()
	const { currencyIdA } = useParams("/add/:currencyIdA")
	const { data: tokenA } = useToken(chainId, currencyIdA)

	const options = useMemo(() => {
		return OPTIONS.map((option) => {
			let label = option.label
			if (tokenA) {
				switch (option.value) {
					// left is selecting quote ccy of current price
					case "left": {
						if (getWrapped(tokenA).equals(priceCurrent?.wrapped.baseCurrency)) {
							label = "Quote Only"
						} else {
							label = "Base Only"
						}
						break
					}
					// right is selecting base ccy of current price
					case "right": {
						if (getWrapped(tokenA).equals(priceCurrent?.wrapped.baseCurrency)) {
							label = "Base Only"
						} else {
							label = "Quote Only"
						}
						break
					}
				}
			}

			return {
				...option,
				label: label,
				imgSrc: `/pool-range-selector/${theme}-${option.value}.svg`,
			}
		})
	}, [priceCurrent?.wrapped.baseCurrency, theme, tokenA])

	// return price and tick for a given range percentage
	const getRange = useCallback(
		(priceCurrent: Price, value: number) => {
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
		[tickSpacing],
	)

	// handle the value change
	const handleValueChange = useCallback(
		(value: OptionKey) => {
			if (!priceCurrent?.value) return

			switch (value) {
				case "active": {
					const pct = RELATIVE_RANGE_CONFIG.active
					const { priceLower, priceUpper } = getRange(priceCurrent, pct)
					onLeftRangeInput(priceLower)
					onRightRangeInput(priceUpper)
					chartContext?.zoomFn.zoomTo(10 / pct)
					break
				}
				case "conservative": {
					const pct = RELATIVE_RANGE_CONFIG.conservative
					const { priceLower, priceUpper } = getRange(priceCurrent, pct)
					onLeftRangeInput(priceLower)
					onRightRangeInput(priceUpper)
					chartContext?.zoomFn.zoomTo(10 / pct)
					break
				}
				case "full": {
					const pct = 100
					setFullRange()
					chartContext?.zoomFn.zoomTo(10 / pct)
					break
				}
				case "left": {
					const pct = RELATIVE_RANGE_CONFIG.active
					const { priceLower } = getRange(priceCurrent, pct)
					const tickCurrent = priceToClosestTick(priceCurrent, tickSpacing)
					let newPrice = tickToPrice(priceCurrent.baseCurrency, priceCurrent.quoteCurrency, tickCurrent)
					if (newPrice.greaterThan(priceCurrent)) {
						newPrice = tickToPrice(
							priceCurrent.baseCurrency,
							priceCurrent.quoteCurrency,
							tickCurrent + tickSpacing * (priceCurrent.wrapped.isSorted ? -1 : 1),
						)
					}
					onLeftRangeInput(priceLower)
					onRightRangeInput(newPrice)
					chartContext?.zoomFn.zoomTo(10 / pct)
					break
				}
				case "right": {
					const pct = RELATIVE_RANGE_CONFIG.active
					const { priceUpper } = getRange(priceCurrent, pct)
					const tickCurrent = priceToClosestTick(priceCurrent, tickSpacing)
					let newPrice = tickToPrice(priceCurrent.baseCurrency, priceCurrent.quoteCurrency, tickCurrent)
					if (newPrice.lessThan(priceCurrent)) {
						newPrice = tickToPrice(
							priceCurrent.baseCurrency,
							priceCurrent.quoteCurrency,
							tickCurrent - tickSpacing * (priceCurrent.wrapped.isSorted ? -1 : 1),
						)
					}
					onLeftRangeInput(newPrice)
					onRightRangeInput(priceUpper)
					chartContext?.zoomFn.zoomTo(10 / pct)
					break
				}
			}
		},
		[chartContext?.zoomFn, getRange, onLeftRangeInput, onRightRangeInput, priceCurrent, setFullRange, tickSpacing],
	)

	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-center gap-1.5 lg:grid",
				noLiquidity ? "lg:grid-cols-5" : "lg:grid-rows-5",
			)}
		>
			{options.map((option) => (
				<Button
					key={option.value}
					onClick={() => {
						handleValueChange(option.value)
					}}
					buttonColor="gray"
					className={cn(
						"size-full max-h-[48px] max-w-24 lg:max-w-[98px]",
						"flex flex-col items-center justify-center gap-1.5 rounded-lg p-2",
						"bg-gray-50 hover:bg-gray-100/80 dark:bg-gray-925/80 dark:hover:bg-gray-900",
					)}
				>
					<img src={option.imgSrc} alt={option.label} className="pointer-events-none h-[18px] w-[45px] select-none" />
					<div className="text-xs text-gray-800 dark:text-rabbit-white">{option.label}</div>
				</Button>
			))}
		</div>
	)
}
