import { BigNumber } from "@ethersproject/bignumber"
import { BigNumber as BigNumJs } from "bignumber.js"
import JSBI from "jsbi"
import { type Address, getAddress, isAddressEqual } from "viem"

import { FeeAmount, formatFeeDisplay } from "@/constants/dex"
import { Pool } from "@/types/pool"
import { SqrtPriceMath } from "@/types/position/sqrtPriceMath"
import { Price } from "@/types/price"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { formatDisplayNumber } from "@/utils/number"

import { tickToPrice } from "./price"
import { TickMath } from "./tickMath"

export type PositionState = "removed" | "outOfRange" | "inRange"
export type RangeBy = "sorted" | "unsorted"

export interface PositionDetailInterface {
	nonce: BigNumber
	chainId: number
	tokenId: BigNumber
	ownerAddress: Address | undefined
	operator: string
	token0: Address
	token1: Address
	fee: FeeAmount
	tickLower: number
	tickUpper: number
	liquidity: bigint
	feeGrowthInside0LastX128: BigNumber
	feeGrowthInside1LastX128: BigNumber
	tokensOwed0: BigNumber
	tokensOwed1: BigNumber
}

interface PositionInterface<TBase extends EvmToken = EvmToken, TQuote extends EvmToken = EvmToken> {
	pool: Pool<TBase, TQuote>
	position: PositionDetailInterface
}

export class Position<TBase extends EvmToken = EvmToken, TQuote extends EvmToken = EvmToken> {
	readonly pool: Pool<TBase, TQuote>
	readonly position: Omit<PositionDetailInterface, "token0" | "token1"> & {
		token0: TQuote
		token1: TBase
	}

	// cached resuts for the getters
	private _token0Amount: TokenAmount<TQuote> | null = null
	private _token1Amount: TokenAmount<TBase> | null = null

	constructor({ pool, position }: PositionInterface<TBase, TQuote>) {
		this.pool = pool
		this.position = {
			...position,
			tickLower: position.tickLower < pool.usableMinTick ? pool.usableMinTick : position.tickLower,
			tickUpper: position.tickUpper > pool.usableMaxTick ? pool.usableMaxTick : position.tickUpper,
			token0: pool.token0,
			token1: pool.token1,
		}
	}

	get positionState(): PositionState {
		const removed = this.position.liquidity === 0n
		if (removed) {
			return "removed"
		}
		if (this.pool.tickCurrent < this.position.tickLower || this.pool.tickCurrent >= this.position.tickUpper) {
			return "outOfRange"
		}
		return "inRange"
	}

	/**
	 * @returns [quote, base]
	 */
	private get quoteBasePair(): [EvmToken, EvmToken] {
		return [this.position.token0, this.position.token1]
	}

	get quote(): EvmToken {
		return this.quoteBasePair[0]
	}

	get base(): EvmToken {
		return this.quoteBasePair[1]
	}

	get feeDisplay(): string {
		return formatFeeDisplay(this.position.fee)
	}

	private tickPairPrice(base: EvmToken | undefined): [Price, Price] {
		const tickLowerPrice = tickToPrice(this.pool.token0, this.pool.token1, this.position.tickLower)
		const tickUpperPrice = tickToPrice(this.pool.token0, this.pool.token1, this.position.tickUpper)
		const inverted = !base?.equals(this.pool.token0)
		if (
			tickLowerPrice.value !== undefined &&
			tickUpperPrice.value !== undefined &&
			tickLowerPrice.value.gt(tickUpperPrice.value)
		) {
			return inverted ? [tickLowerPrice.invert(), tickUpperPrice.invert()] : [tickUpperPrice, tickLowerPrice]
		}
		return inverted ? [tickUpperPrice.invert(), tickLowerPrice.invert()] : [tickLowerPrice, tickUpperPrice]
	}

	tickLowerPrice(base: EvmToken | undefined): Price {
		return this.tickPairPrice(base)[0]
	}

	tickUpperPrice(base: EvmToken | undefined): Price {
		return this.tickPairPrice(base)[1]
	}

	tickCurrentPrice(base: EvmToken | undefined): Price {
		return this.pool.priceOf(base)
	}

	private _tickLowerPriceDisplay(base: EvmToken | undefined, precision = 5): string {
		const price = this.tickLowerPrice(base)
		if (base?.equals(price.baseCurrency)) {
			return formatDisplayNumber(price.value, { precision: precision })
		}
		return formatDisplayNumber(price.invert().value, { precision: precision })
	}

	private _tickUpperPriceDisplay(base: EvmToken | undefined, precision = 5): string {
		const price = this.tickUpperPrice(base)
		if (base?.equals(price.baseCurrency)) {
			return formatDisplayNumber(price.value, { precision: precision })
		}
		return formatDisplayNumber(price.invert().value, { precision: precision })
	}

	tickPairPriceDisplay(base: EvmToken | undefined, precision = 5): [string, string] {
		const isSorted = this.pool.token0.equals(base)
		const lb = this.position.tickLower === this.pool.usableMinTick
		const ub = this.position.tickUpper === this.pool.usableMaxTick
		const [lowerBound, upperBound] = isSorted ? [lb, ub] : [ub, lb]
		const lowerDp = this._tickLowerPriceDisplay(base, precision)
		const upperDp = this._tickUpperPriceDisplay(base, precision)
		return [lowerBound ? "0" : lowerDp, upperBound ? "∞" : upperDp]
	}

	tickLowerPriceDisplay(base: EvmToken | undefined, precision = 5): string {
		return this.tickPairPriceDisplay(base, precision)[0]
	}

	tickUpperPriceDisplay(base: EvmToken | undefined, precision = 5): string {
		return this.tickPairPriceDisplay(base, precision)[1]
	}

	tickCurrentPriceDisplay(base: EvmToken | undefined, precision = 5): string {
		const price = this.tickCurrentPrice(base)
		const minVal = new BigNumJs(1).shiftedBy(-precision)
		if (price.value?.lt(minVal)) {
			return `<${minVal}`
		}
		return price.toFixed(precision)
	}

	private getAmount0Delta(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI): JSBI {
		const liquidity = JSBI.BigInt(this.position.liquidity.toString())
		return SqrtPriceMath.getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity)
	}

	private getAmount1Delta(sqrtRatioAX96: JSBI, sqrtRatioBX96: JSBI): JSBI {
		const liquidity = JSBI.BigInt(this.position.liquidity.toString())
		return SqrtPriceMath.getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity)
	}

	public get amount0(): TokenAmount {
		if (this._token0Amount !== null) {
			return this._token0Amount
		}

		// left out of range: return token0 100%
		if (this.pool.tickCurrent < this.position.tickLower) {
			this._token0Amount = new TokenAmount({
				token: this.pool.token0,
				amount: BigInt(
					this.getAmount0Delta(
						TickMath.getSqrtRatioAtTick(this.position.tickLower),
						TickMath.getSqrtRatioAtTick(this.position.tickUpper),
					).toString(),
				),
			})
			return this._token0Amount
		}

		// right out of range: return token0 0%
		if (this.pool.tickCurrent >= this.position.tickUpper) {
			this._token0Amount = new TokenAmount({
				token: this.pool.token0,
				amount: 0n,
			})
			return this._token0Amount
		}

		this._token0Amount = new TokenAmount({
			token: this.pool.token0,
			amount: BigInt(
				this.getAmount0Delta(
					JSBI.BigInt(this.pool.sqrtRatioX96.toString()),
					TickMath.getSqrtRatioAtTick(this.position.tickUpper),
				).toString(),
			),
		})
		return this._token0Amount
	}

	public get amount1(): TokenAmount {
		if (this._token1Amount !== null) {
			return this._token1Amount
		}

		// left out of range: return token1 0%
		if (this.pool.tickCurrent < this.position.tickLower) {
			this._token1Amount = new TokenAmount({
				token: this.pool.token1,
				amount: 0n,
			})
			return this._token1Amount
		}

		// right out of range: return token1 100%
		if (this.pool.tickCurrent >= this.position.tickUpper) {
			this._token1Amount = new TokenAmount({
				token: this.pool.token1,
				amount: BigInt(
					this.getAmount1Delta(
						TickMath.getSqrtRatioAtTick(this.position.tickLower),
						TickMath.getSqrtRatioAtTick(this.position.tickUpper),
					).toString(),
				),
			})
			return this._token1Amount
		}

		this._token1Amount = new TokenAmount({
			token: this.pool.token1,
			amount: BigInt(
				this.getAmount1Delta(
					TickMath.getSqrtRatioAtTick(this.position.tickLower),
					JSBI.BigInt(this.pool.sqrtRatioX96.toString()),
				).toString(),
			),
		})
		return this._token1Amount
	}

	amountOf(token: EvmToken | undefined): TokenAmount | undefined {
		if (token === undefined) {
			return undefined
		}
		if (token.equals(this.pool.token0)) {
			return this.amount0
		}
		return this.amount1
	}

	get amountQuote(): TokenAmount {
		if (this.quote.equals(this.pool.token0)) {
			return this.amount0
		}
		return this.amount1
	}

	get amountBase(): TokenAmount {
		if (this.base.equals(this.pool.token0)) {
			return this.amount0
		}
		return this.amount1
	}

	/**
	 * turn token0/total in [0-100]
	 */
	private getRatio<A extends EvmToken, B extends EvmToken>(
		lower: Price<A, B>,
		current: Price<A, B>,
		upper: Price<A, B>,
	): number | undefined {
		if (!current.greaterThan(lower)) {
			return 100
		}
		if (!current.lessThan(upper)) {
			return 0
		}

		const a = Number.parseFloat(lower.toPrecision(15))
		const b = Number.parseFloat(upper.toPrecision(15))
		const c = Number.parseFloat(current.toPrecision(15))

		const ratio = Math.floor((1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100)

		if (ratio < 0 || ratio > 100) {
			throw Error("Out of range")
		}

		return ratio
	}

	ratioOf(token: EvmToken | undefined): number | undefined {
		const token0Ratio = this.getRatio(
			this.tickLowerPrice(this.pool.token0),
			this.tickCurrentPrice(this.pool.token0),
			this.tickUpperPrice(this.pool.token0),
		)
		if (token0Ratio === undefined) {
			return undefined
		}
		return token?.equals(this.pool.token0) ? token0Ratio : 100 - token0Ratio
	}

	get showCollectAsWeth(): boolean {
		const currencyQuote = this.position.token0
		const currencyBase = this.position.token1
		const someIsNative: boolean = currencyQuote.isNative || currencyBase.isNative
		const someIsWrapped: boolean = currencyQuote.isWrappedNative || currencyBase.isWrappedNative
		return someIsNative || someIsWrapped
	}

	isOwner(address: Address | undefined): boolean {
		if (address === undefined || this.position.ownerAddress === undefined) {
			return false
		}
		return isAddressEqual(this.position.ownerAddress, address)
	}

	get unwrapped() {
		const unwrappedPool = this.pool.unwrapped
		return new Position({
			pool: unwrappedPool,
			position: {
				...this.position,
				token0: getAddress(unwrappedPool.token0.address),
				token1: getAddress(unwrappedPool.token1.address),
			},
		})
	}

	get display0(): EvmToken {
		return this.pool.display0
	}

	get display1(): EvmToken {
		return this.pool.display1
	}
}
