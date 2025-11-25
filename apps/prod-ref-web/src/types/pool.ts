import JSBI from "jsbi"
import { type Address } from "viem"

import { FeeAmount, TICK_SPACINGS } from "@/constants/dex"
import { TickMath } from "@/types/position/tickMath"
import { nearestUsableTick } from "@/types/position/utils"
import { Price } from "@/types/price"
import { EvmToken } from "@/types/tokens"
import { getUnwrapped, sortDisplayTokens } from "@/utils/token"

interface PoolInterface<TBase extends EvmToken = EvmToken, TQuote extends EvmToken = EvmToken> {
	chainId: number
	address?: Address
	tokenPair: [TQuote, TBase]
	fee: FeeAmount
	sqrtRatioX96: bigint
	liquidity: bigint
	tickCurrent: number
}

export class Pool<TBase extends EvmToken = EvmToken, TQuote extends EvmToken = EvmToken> {
	readonly chainId: number
	readonly address: Address | undefined
	readonly token0: TQuote
	readonly token1: TBase
	readonly fee: FeeAmount
	readonly sqrtRatioX96: bigint
	readonly totalLiquidity: bigint
	readonly tickCurrent: number

	private _token0Price?: Price<TQuote, TBase>
	private _token1Price?: Price<TBase, TQuote>

	constructor({
		chainId,
		address,
		tokenPair,
		fee,
		sqrtRatioX96,
		liquidity,
		tickCurrent,
	}: PoolInterface<TBase, TQuote>) {
		this.chainId = chainId
		this.address = address
		this.token0 = tokenPair[0]
		this.token1 = tokenPair[1]
		this.fee = fee
		this.sqrtRatioX96 = sqrtRatioX96
		this.totalLiquidity = liquidity
		this.tickCurrent = tickCurrent
	}

	/**
	 * Returns the current mid price of the pool in terms of token0, i.e. the ratio of token1 over token0
	 */
	get token0Price(): Price<TQuote, TBase> {
		return (
			this._token0Price ??
			(this._token0Price = Price.fromSqrtRatio({
				base: this.token0,
				quote: this.token1,
				sqrtRatioX96: JSBI.BigInt(this.sqrtRatioX96.toString()),
			}))
		)
	}

	/**
	 * Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1
	 */
	get token1Price(): Price<TBase, TQuote> {
		return this._token1Price ?? (this._token1Price = this.token0Price.invert())
	}

	/**
	 * Return the price of the given token in terms of the other token in the pool.
	 * @param token The token to return price of
	 * @returns The price of the given token, in terms of the other.
	 */
	priceOf(token: EvmToken | undefined): Price {
		if (token?.equals(this.token1)) {
			return this.token1Price
		}
		return this.token0Price
	}

	get tickSpacing(): number {
		return TICK_SPACINGS[this.fee]
	}

	get usableMinTick(): number {
		return nearestUsableTick(TickMath.MIN_TICK, this.tickSpacing)
	}

	get usableMaxTick(): number {
		return nearestUsableTick(TickMath.MAX_TICK, this.tickSpacing)
	}

	get unwrapped(): Pool {
		return new Pool({
			chainId: this.chainId,
			address: this.address,
			tokenPair: [getUnwrapped(this.token0), getUnwrapped(this.token1)],
			fee: this.fee,
			sqrtRatioX96: this.sqrtRatioX96,
			liquidity: this.totalLiquidity,
			tickCurrent: this.tickCurrent,
		})
	}

	get display0(): EvmToken {
		return sortDisplayTokens([this.token0, this.token1 as EvmToken])[0]
	}

	get display1(): EvmToken {
		return sortDisplayTokens([this.token0, this.token1 as EvmToken])[1]
	}

	get displayInverted(): boolean {
		return !this.display0.equals(this.token0)
	}
}
