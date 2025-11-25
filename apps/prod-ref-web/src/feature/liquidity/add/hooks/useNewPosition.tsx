import { useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import JSBI from "jsbi"
import { getAddress } from "viem"

import { MAX_UINT128 } from "@/constants/ethersBigNum"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { Pool } from "@/types/pool"
import { Position, PositionDetailInterface } from "@/types/position"
import { TickMath } from "@/types/position/tickMath"
import { maxLiquidityForAmounts } from "@/types/position/utils"
import { TokenAmount } from "@/types/tokens"
import { computePoolAddress } from "@/utils/pool"

import { useAddLiquidityStore } from "../store/useAddLiquidityStore"

export const useNewPosition = (
	_pool: Pool | null | undefined,
	_position: Position | undefined,
	tickCurrent: number | undefined,
): Position | undefined => {
	const {
		selectedTier: feeAmount,
		tickLower,
		tickUpper,
		token0Amount: _token0Amount,
		token1Amount: _token1Amount,
		inputSide,
	} = useAddLiquidityStore()

	const chainId = useSwapChainId()
	const { address } = useAccount()

	const sqrtRatioPoolX96 = useMemo<JSBI | undefined>(() => {
		if (_pool !== undefined && _pool !== null) {
			return JSBI.BigInt(_pool.sqrtRatioX96.toString())
		}
		if (tickCurrent !== undefined) {
			return TickMath.getSqrtRatioAtTick(tickCurrent)
		}
		return undefined
	}, [_pool, tickCurrent])

	const {
		isSorted: isSorted,
		tokens: [wrappedT0Amount, wrappedT1Amount],
	} = useMemo<{
		isSorted: boolean
		tokens: [TokenAmount | undefined, TokenAmount | undefined]
	}>(() => {
		const w0 = _token0Amount?.wrapped
		const w1 = _token1Amount?.wrapped
		const _isSorted = (w0?.tokenCompare(w1) ?? 0) < 0
		if (_isSorted) {
			return {
				isSorted: _isSorted,
				tokens: [w0, w1],
			}
		}
		return {
			isSorted: _isSorted,
			tokens: [w1, w0],
		}
	}, [_token0Amount, _token1Amount])

	/**
	 * amount of liquidity is reflected from last input of token amount
	 */
	const liquidity = useMemo<bigint | undefined>(() => {
		if (
			tickLower === undefined ||
			tickUpper === undefined ||
			wrappedT0Amount === undefined ||
			wrappedT1Amount === undefined ||
			sqrtRatioPoolX96 === undefined
		) {
			return undefined
		}

		const invalidRange = tickLower >= tickUpper
		if (invalidRange) {
			return undefined
		}

		const sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower)
		const sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper)

		const activeSide0 = (isSorted && inputSide === "token0") || (!isSorted && inputSide === "token1")
		const activeSide1 = (isSorted && inputSide === "token1") || (!isSorted && inputSide === "token0")

		return BigInt(
			maxLiquidityForAmounts(
				sqrtRatioPoolX96,
				sqrtRatioAX96,
				sqrtRatioBX96,
				JSBI.BigInt(activeSide0 ? wrappedT0Amount.bigint.toString() : JSBI.BigInt(MAX_UINT128)),
				JSBI.BigInt(activeSide1 ? wrappedT1Amount.bigint.toString() : JSBI.BigInt(MAX_UINT128)),
			).toString(),
		)
	}, [inputSide, isSorted, sqrtRatioPoolX96, tickLower, tickUpper, wrappedT0Amount, wrappedT1Amount])

	const pool = useMemo<Pool | undefined>(() => {
		if (_position) {
			return _position.pool
		}
		if (_pool) {
			return _pool
		}

		if (
			wrappedT0Amount === undefined ||
			wrappedT1Amount === undefined ||
			feeAmount === undefined ||
			tickLower === undefined ||
			tickUpper === undefined ||
			liquidity === undefined ||
			sqrtRatioPoolX96 === undefined ||
			tickCurrent === undefined
		) {
			return undefined
		}

		const token0 = wrappedT0Amount.token
		const token1 = wrappedT1Amount.token

		const newPool: Pool = new Pool({
			chainId: chainId,
			address: computePoolAddress(chainId, [getAddress(token0.address), getAddress(token1.address)], feeAmount),
			tokenPair: [token0, token1],
			fee: feeAmount,
			sqrtRatioX96: BigInt(sqrtRatioPoolX96.toString()),
			liquidity: liquidity,
			tickCurrent: tickCurrent,
		})
		return newPool
	}, [
		_pool,
		_position,
		chainId,
		feeAmount,
		liquidity,
		sqrtRatioPoolX96,
		tickCurrent,
		tickLower,
		tickUpper,
		wrappedT0Amount,
		wrappedT1Amount,
	])

	const position = useMemo<Position | undefined>(() => {
		if (pool === undefined) {
			return undefined
		}

		if (tickLower === undefined || tickUpper === undefined || liquidity === undefined) {
			return undefined
		}

		// build value
		const positionDetail: PositionDetailInterface = {
			nonce: BigNumber.from(0),
			chainId: chainId,
			tokenId: _position?.position.tokenId ?? BigNumber.from(0),
			ownerAddress: address,
			operator: "",
			token0: getAddress(pool.token0.address),
			token1: getAddress(pool.token1.address),
			fee: pool.fee,
			tickLower: tickLower,
			tickUpper: tickUpper,
			liquidity: liquidity,
			feeGrowthInside0LastX128: BigNumber.from(0),
			feeGrowthInside1LastX128: BigNumber.from(0),
			tokensOwed0: BigNumber.from(0),
			tokensOwed1: BigNumber.from(0),
		}

		return new Position({ pool: pool, position: positionDetail })
	}, [_position, address, chainId, liquidity, pool, tickLower, tickUpper])

	return position
}
