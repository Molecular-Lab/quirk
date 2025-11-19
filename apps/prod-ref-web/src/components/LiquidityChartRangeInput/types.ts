import BigNumber from "bignumber.js"

import { Price } from "@/types/price"

export interface ChartEntry {
	activeLiquidity: BigNumber
	price: Price
	tick: number
	amount0Locked?: number
	amount1Locked?: number
}

export interface ZoomLevels {
	initialMin: number
	initialMax: number
	min: number
	max: number
}
