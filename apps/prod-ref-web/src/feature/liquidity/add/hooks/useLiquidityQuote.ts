import { useEffect } from "react"

import { Pool } from "@/types/pool"
import { Position } from "@/types/position"
import { formatQuoteResult } from "@/utils/number"

import { useAddLiquidityStore } from "../store/useAddLiquidityStore"

import { useNewPosition } from "./useNewPosition"

export const useLiquidityQuote = (_position?: Position, _pool?: Pool | null, tickCurrent?: number) => {
	const { token0Amount, token1Amount, inputSide, setToken0Amount, setToken1Amount } = useAddLiquidityStore()
	const position = useNewPosition(_pool, _position, tickCurrent)

	// sync token1 from token0 amount (quote)
	useEffect(() => {
		if (position === undefined || inputSide === "token1") return

		setToken1Amount((amt) => {
			const amount = formatQuoteResult(
				amt?.newAmount(token0Amount?.amount === undefined ? undefined : position.amount1.amount),
			)

			return amt?.equal(amount) ? amt : amount
		})
	}, [inputSide, position, setToken0Amount, setToken1Amount, token0Amount])

	// sync token0 from token1 amount (quote)
	useEffect(() => {
		if (position === undefined || inputSide === "token0") return

		setToken0Amount((amt) => {
			const amount = formatQuoteResult(
				amt?.newAmount(token1Amount?.amount === undefined ? undefined : position.amount0.amount),
			)

			return amt?.equal(amount) ? amt : amount
		})
	}, [inputSide, position, setToken0Amount, setToken1Amount, token1Amount])
}
