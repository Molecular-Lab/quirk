import { createContext, useContext, useMemo, useRef, useState } from "react"

import BigNumber from "bignumber.js"
import { ScaleLinear, ZoomTransform, max, scaleLinear } from "d3"
import { partition } from "lodash"

import { priceToClosestTick } from "@/types/position/price"
import { TickMath } from "@/types/position/tickMath"
import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"

import { useZoom } from "../hooks/useZoom"
import { ChartEntry, ZoomLevels } from "../types"
import { xAccessor, yAccessor } from "../utils"

interface ChartContextType {
	zoom: ZoomTransform | null
	setZoom: (zoom: ZoomTransform | null) => void
	zoomRef: React.RefObject<SVGRectElement>
	xScale: ScaleLinear<number, number>
	yScale: ScaleLinear<number, number>
	leftSeries: ChartEntry[]
	rightSeries: ChartEntry[]
	series: ChartEntry[]
	innerHeight: number
	innerWidth: number
	zoomFn: ReturnType<typeof useZoom>
	width: number
	height: number
	margins: { top: number; right: number; bottom: number; left: number }
	current: Price
	tokenA: EvmToken | undefined
	zoomLevels: ZoomLevels
}

const ChartContext = createContext<ChartContextType | null>(null)

export const useChartContext = () => {
	const context = useContext(ChartContext)
	return context
}

interface ChartProviderProps {
	children: React.ReactNode
	width: number
	height: number
	margins: { top: number; right: number; bottom: number; left: number }
	series: ChartEntry[]
	current: Price
	zoomLevels: ZoomLevels
	tokenA: EvmToken | undefined
}

export const LiquidityChartInputProvider: React.FC<ChartProviderProps> = ({
	children,
	width,
	height,
	margins,
	series: _series,
	current,
	zoomLevels,
	tokenA,
}) => {
	const zoomRef = useRef<SVGRectElement | null>(null)
	const [zoom, setZoom] = useState<ZoomTransform | null>(null)

	const [innerHeight, innerWidth] = useMemo(
		() => [height - margins.top - margins.bottom, width - margins.left - margins.right],
		[width, height, margins],
	)

	const tickCurrent = useMemo(() => {
		return priceToClosestTick(current, 0)
	}, [current])

	const series = useMemo(() => {
		return _series.map<ChartEntry>((e) => {
			const newPrice =
				e.price.baseCurrency.equals(current.baseCurrency) || e.price.quoteCurrency.equals(current.quoteCurrency)
					? e.price
					: e.price.invert()
			return { ...e, price: newPrice }
		})
	}, [_series, current.baseCurrency, current.quoteCurrency])

	const { xScale, yScale } = useMemo(() => {
		const initMin = (current.value?.toNumber() ?? 0) * zoomLevels.initialMin
		const initMax = (current.value?.toNumber() ?? 0) * zoomLevels.initialMax
		const scales = {
			xScale: scaleLinear().domain([initMin, initMax]).range([0, innerWidth]),
			yScale: scaleLinear()
				.domain([0, max(series, yAccessor) ?? 0])
				.range([innerHeight, 0]),
		}

		if (zoom) {
			const newXscale = zoom.rescaleX(scales.xScale)
			scales.xScale.domain(newXscale.domain())
		}

		return scales
	}, [current, zoomLevels.initialMin, zoomLevels.initialMax, innerWidth, series, innerHeight, zoom])

	const [leftSeries, rightSeries] = useMemo<[ChartEntry[], ChartEntry[]]>(() => {
		const isHighToLow = series[0]?.price.value?.gt(series[series.length - 1]?.price.value ?? 0) ?? false
		let [left, right] = partition(series, (d) => {
			const xVal = BigNumber(xAccessor(d, tokenA))
			const curVal = current.value ?? BigNumber(0)
			const isLeft = !isHighToLow ? xVal.lt(curVal) : xVal.gt(curVal)
			return isLeft
		})

		if (left.length > 0 && left[left.length - 1]) {
			if (!left[left.length - 1]?.price.value?.eq(current.value ?? 0)) {
				right = [
					{
						activeLiquidity: left[left.length - 1]?.activeLiquidity ?? BigNumber(0),
						price: current,
						tick: tickCurrent,
					},
					...right,
				]
			}
			left = [
				...left,
				{
					activeLiquidity: left[left.length - 1]?.activeLiquidity ?? BigNumber(0),
					price: current,
					tick: tickCurrent,
				},
			]
		}

		const minTickElem = left.find((e) => e.tick === TickMath.MIN_TICK || e.tick === TickMath.MAX_TICK)
		if (minTickElem !== undefined) {
			const maxPrice = minTickElem.price.clone()
			maxPrice.value = BigNumber("1000000000000000000")
			right = [
				...right,
				{
					...minTickElem,
					tick: minTickElem.tick === TickMath.MIN_TICK ? TickMath.MAX_TICK : TickMath.MIN_TICK,
					activeLiquidity: BigNumber(0),
					price: maxPrice,
				},
			]
		}

		return [
			left.map((e) => ({
				...e,
				price:
					e.price.baseCurrency.equals(current.baseCurrency) || e.price.quoteCurrency.equals(current.quoteCurrency)
						? e.price
						: e.price.invert(),
			})),
			right.map((e) => ({
				...e,
				price:
					e.price.baseCurrency.equals(current.baseCurrency) || e.price.quoteCurrency.equals(current.quoteCurrency)
						? e.price
						: e.price.invert(),
			})),
		]
	}, [current, series, tickCurrent, tokenA])

	const zoomFn = useZoom({
		svg: zoomRef.current,
		xScale: xScale,
		setZoom: setZoom,
		width: innerWidth,
		height: height,
		zoomLevels: zoomLevels,
	})

	const value: ChartContextType = {
		zoom,
		setZoom,
		zoomRef,
		xScale,
		yScale,
		leftSeries,
		rightSeries,
		series,
		innerHeight,
		innerWidth,
		zoomFn,
		width,
		height,
		margins,
		current,
		tokenA,
		zoomLevels,
	}

	return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
}
