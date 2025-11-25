import { useCallback, useMemo } from "react"

import BigNumber from "bignumber.js"
import { D3BrushEvent } from "d3"
import { debounce } from "lodash"
import { BarChart2, CloudOff, Inbox } from "lucide-react"

import { useBreakpoints } from "@rabbitswap/ui/hooks"

import { Pool } from "@/types/pool"
import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

import { Chart } from "./Chart"
import { ZOOM_LEVELS, chartColors } from "./constant"
import { LiquidityChartInputProvider } from "./contexts/ChartContext"
import { useDensityChartData } from "./hooks/useDensityChartData"
import { InfoBox } from "./InfoBox"
import { InfoItem } from "./InfoItem"
import { LiquidityTemplateSelector } from "./LiquidityTemplateSelector"
import { LoadingBars } from "./Loading"
import { calcLeverage } from "./utils"

export const LiquidityChartRangeInput: React.FC<{
	pool: Pool | undefined
	tokenA: EvmToken | undefined
	ticksAtLimit: {
		lower?: boolean | undefined
		upper?: boolean | undefined
	}
	priceCurrent: Price | undefined
	priceLower: Price | undefined
	priceUpper: Price | undefined
	tickUpper: number | undefined
	tickLower: number | undefined
	onLeftRangeInput: (typedValue: Price | undefined) => void
	onRightRangeInput: (typedValue: Price | undefined) => void
	onFullRangeClick: () => void
}> = ({
	pool,
	tokenA,
	ticksAtLimit,
	priceCurrent: _priceCurrent,
	priceLower,
	priceUpper,
	tickUpper,
	tickLower,
	onLeftRangeInput,
	onRightRangeInput,
	onFullRangeClick,
}) => {
	const { isLoading, error, formattedData } = useDensityChartData({ pool: pool })
	const { isLgUp } = useBreakpoints()

	const priceCurrent = useMemo(() => {
		if (_priceCurrent?.baseCurrency.equals(getWrapped(tokenA))) {
			return _priceCurrent
		}
		return _priceCurrent?.invert()
	}, [_priceCurrent, tokenA])

	const priceCurrentNumber = useMemo(() => priceCurrent?.value?.toNumber(), [priceCurrent?.value])

	const onBrushDomainChange = useCallback(
		(domain: [number, number], mode: D3BrushEvent<unknown>["mode"] | "reset" | undefined) => {
			let leftRangeValue = BigNumber(domain[0])
			const rightRangeValue = BigNumber(domain[1])

			if (leftRangeValue.lte(0)) {
				leftRangeValue = BigNumber(0.000001)
			}

			// ignore if no mode given
			if (!mode) return

			// simulate user input for auto-formatting and other validations
			if ((!ticksAtLimit.lower || mode === "handle" || mode === "reset") && leftRangeValue.gt(0)) {
				const newPrice = priceCurrent
					? new Price({
							quote: priceCurrent.quoteCurrency,
							base: priceCurrent.baseCurrency,
							value: BigNumber(leftRangeValue.toFixed(6)),
						})
					: undefined
				onLeftRangeInput(newPrice)
			}

			if (
				(!ticksAtLimit.upper || mode === "reset") &&
				rightRangeValue.gt(0) &&
				// TODO: remove this check. Upper bound for large numbers
				// sometimes fails to parse to tick.
				rightRangeValue.lt(1e35)
			) {
				const newPrice = priceCurrent
					? new Price({
							quote: priceCurrent.quoteCurrency,
							base: priceCurrent.baseCurrency,
							value: BigNumber(rightRangeValue.toFixed(6)),
						})
					: undefined
				onRightRangeInput(newPrice)
			}
		},
		[onLeftRangeInput, onRightRangeInput, priceCurrent, ticksAtLimit],
	)

	const onDebouncedBrushDomainChangeEnded = useMemo(() => {
		return debounce(
			(...args: Parameters<typeof onBrushDomainChange>) => {
				onBrushDomainChange(...args)
			},
			100,
			{ maxWait: 500 },
		)
	}, [onBrushDomainChange])

	const brushDomain: [number, number] | undefined = useMemo(() => {
		if (ticksAtLimit.lower && ticksAtLimit.upper) {
			return [0, 1_000_000_000_000_000_000_000_000_000_000]
		}
		const leftPrice = priceLower?.baseCurrency.equals(tokenA) ? priceLower : priceUpper?.invert()
		const rightPrice = priceUpper?.baseCurrency.equals(tokenA) ? priceUpper : priceLower?.invert()
		if (!leftPrice || !rightPrice || leftPrice.value === undefined || rightPrice.value === undefined) {
			return undefined
		}
		const displayLeftPrice = parseFloat(leftPrice.toFixed(6) || "0")
		const displayRightPrice = parseFloat(rightPrice.toFixed(6) || "0")
		return [displayLeftPrice, displayRightPrice]
	}, [priceLower, priceUpper, ticksAtLimit.lower, ticksAtLimit.upper, tokenA])

	const brushLabelValue = useCallback(
		(d: "w" | "e", x: number) => {
			if (!priceCurrentNumber) {
				return ""
			}

			if (d === "w" && ticksAtLimit.lower) {
				return "0"
			}
			if (d === "e" && ticksAtLimit.upper) {
				return "∞"
			}

			const percent =
				(x < priceCurrentNumber ? -1 : 1) *
				((Math.max(x, priceCurrentNumber) - Math.min(x, priceCurrentNumber)) / priceCurrentNumber) *
				100

			return priceCurrent ? `${BigNumber(percent).toFormat(2)}%` : ""
		},
		[priceCurrent, priceCurrentNumber, ticksAtLimit.lower, ticksAtLimit.upper],
	)

	const leverage = useMemo<BigNumber | undefined>(() => {
		if (!tickUpper || !tickLower || !formattedData) return undefined
		return calcLeverage({
			liquidities: formattedData,
			tickUpper: tickUpper,
			tickLower: tickLower,
		})
	}, [formattedData, tickLower, tickUpper])

	const isUninitialized = formattedData === undefined && !isLoading && !error
	if (isUninitialized) {
		return (
			<div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
				<InfoBox message="Your position will appear here." icon={<Inbox className="size-14 text-gray-400" />} />
			</div>
		)
	}

	if (isLoading || priceCurrent?.value === undefined) {
		return <LoadingBars className="min-h-[200px]" />
	}

	if (error !== null) {
		return (
			<div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
				<InfoBox message="Liquidity data not available." icon={<CloudOff className="size-14 text-gray-100" />} />
			</div>
		)
	}

	if (pool === undefined || !formattedData || formattedData.length === 0 || priceCurrentNumber === undefined) {
		return (
			<div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
				<InfoBox message="There is no liquidity data." icon={<BarChart2 className="size-14 text-gray-100" />} />
			</div>
		)
	}

	return (
		<LiquidityChartInputProvider
			width={560}
			height={isLgUp ? 320 : 200}
			margins={{
				top: 0,
				right: 2,
				bottom: 30,
				left: 0,
			}}
			series={formattedData}
			current={priceCurrent}
			zoomLevels={ZOOM_LEVELS[pool.fee]}
			tokenA={tokenA}
		>
			<div className="flex flex-col gap-5 lg:flex-row">
				<LiquidityTemplateSelector
					noLiquidity={isUninitialized}
					priceCurrent={priceCurrent}
					onLeftRangeInput={onLeftRangeInput}
					onRightRangeInput={onRightRangeInput}
					tickSpacing={pool.tickSpacing}
					setFullRange={onFullRangeClick}
				/>
				<div className="flex w-full flex-col gap-3">
					<div className="flex items-center justify-between gap-1">
						<InfoItem label="Current price" value={priceCurrent.toLongFormat()} />
						<InfoItem
							label="Leverage"
							value={leverage ? `${leverage.toFixed(2)}x` : "-"}
							className="items-end text-right"
						/>
					</div>
					<div className="relative flex max-h-[200px] items-center object-contain lg:max-h-[300px]">
						<Chart
							colors={chartColors}
							brushLabels={brushLabelValue}
							brushDomain={brushDomain}
							onBrushDomainChange={onDebouncedBrushDomainChangeEnded}
							ticksAtLimit={ticksAtLimit}
						/>
					</div>
				</div>
			</div>
		</LiquidityChartInputProvider>
	)
}
