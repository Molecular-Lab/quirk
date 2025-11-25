import BigNumber from "bignumber.js"
import JSBI from "jsbi"

import { Q192, ZERO } from "@/constants/jsbi"
import { TickMath } from "@/types/position/tickMath"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { formatDisplayNumber, stripZero } from "@/utils/number"
import { getUnwrapped, getWrapped } from "@/utils/token"

interface PriceInterface<TQuote, TBase> {
	quote: TQuote
	base: TBase
	value?: BigNumber
}

export class Price<TBase extends EvmToken = EvmToken, TQuote extends EvmToken = EvmToken> {
	readonly baseCurrency: TBase
	readonly quoteCurrency: TQuote
	value?: BigNumber

	constructor({ quote, base, value }: PriceInterface<TQuote, TBase>) {
		this.baseCurrency = base
		this.quoteCurrency = quote
		this.value = value
	}

	public invert(): Price<TQuote, TBase> {
		const newValue =
			this.value === undefined ? undefined : this.value.eq(0) ? BigNumber(1e32) : BigNumber(1).dividedBy(this.value)
		return new Price({
			quote: this.baseCurrency,
			base: this.quoteCurrency,
			value: newValue,
		})
	}

	get isSorted(): boolean {
		return this.baseCurrency.compare(this.quoteCurrency) < 0
	}

	get sortedTokenPair(): [EvmToken, EvmToken] {
		if (this.isSorted) {
			return [this.baseCurrency, this.quoteCurrency]
		}
		return [this.quoteCurrency, this.baseCurrency]
	}

	get unit(): string {
		return `${this.quoteCurrency.symbol} per ${this.baseCurrency.symbol}`
	}

	/**
	 * reverted from Price.fromSqrtRatio
	 */
	get sqrtRatioX96(): JSBI {
		if (!this.isSorted) {
			return this.invert().sqrtRatioX96
		}
		if (this.value === undefined) {
			return ZERO
		}
		const ratioX192 = this.value
			.shiftedBy(this.quoteCurrency.decimals - this.baseCurrency.decimals)
			.multipliedBy(BigNumber(Q192.toString()))
		const sqrtRatioX96 = JSBI.BigInt(ratioX192.sqrt().toFixed(0, BigNumber.ROUND_DOWN))

		// bound
		if (JSBI.greaterThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
			return TickMath.MAX_SQRT_RATIO
		}
		if (JSBI.lessThan(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
			return TickMath.MIN_SQRT_RATIO
		}

		return sqrtRatioX96
	}

	get wrapped(): Price {
		return new Price({
			quote: getWrapped(this.quoteCurrency),
			base: getWrapped(this.baseCurrency),
			value: this.value,
		})
	}

	get unwrapped(): Price {
		return new Price({
			quote: getUnwrapped(this.quoteCurrency),
			base: getUnwrapped(this.baseCurrency),
			value: this.value,
		})
	}

	toString(decimals = 2): string {
		if (this.value === undefined) return ""
		return this.value.toFixed(decimals)
	}

	toFixed(decimals = 2): string {
		if (this.value === undefined) return ""
		return this.value.toFixed(decimals)
	}

	toPrecision(precisions = 6): string {
		if (this.value === undefined) return ""
		return this.value.toPrecision(precisions)
	}

	toStringWithUnit(precisions = 8): string {
		if (this.value === undefined) return `- ${this.unit}`
		return `${stripZero(this.value.toPrecision(precisions))} ${this.unit}`
	}

	toLongFormat(precisions = 8): string {
		return `1 ${this.baseCurrency.symbol} = ${this.value === undefined ? "-" : formatDisplayNumber(this.value, { precision: precisions, stripZero: true })} ${this.quoteCurrency.symbol}`
	}

	clone(): Price<TBase, TQuote> {
		return new Price({
			quote: this.quoteCurrency,
			base: this.baseCurrency,
			value: this.value,
		})
	}

	comparedTo(other: Price<TBase, TQuote>): number | undefined {
		if (!other.value) {
			return undefined
		}
		return this.value?.comparedTo(other.value) ?? undefined
	}

	tokenPairEquals(other: Price<TBase, TQuote>): boolean {
		const sorted = this.sortedTokenPair
		const otherSorted = other.sortedTokenPair
		return sorted[0].equals(otherSorted[0]) && sorted[1].equals(otherSorted[1])
	}

	greaterThan(other: Price<TBase, TQuote>): boolean {
		const cmp = this.comparedTo(other)
		if (cmp === undefined) {
			return false
		}
		return cmp > 0
	}

	lessThan(other: Price<TBase, TQuote>): boolean {
		const cmp = this.comparedTo(other)
		if (cmp === undefined) {
			return false
		}
		return cmp < 0
	}

	// ================== Builder Methods =====================
	static fromSqrtRatio<TQuote extends EvmToken, TBase extends EvmToken>({
		quote,
		base,
		sqrtRatioX96: _sqrtRatioX96,
	}: {
		quote: TQuote
		base: TBase
		sqrtRatioX96: JSBI | bigint
	}) {
		const sqrtRatioX96 = typeof _sqrtRatioX96 === "bigint" ? JSBI.BigInt(_sqrtRatioX96.toString()) : _sqrtRatioX96
		const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)
		return new Price({
			base: base,
			quote: quote,
			value: BigNumber(ratioX192.toString())
				.dividedBy(BigNumber(Q192.toString()))
				.shiftedBy(base.decimals - quote.decimals),
		})
	}

	static fromTokenAmounts<TBase extends EvmToken, TQuote extends EvmToken>(
		token0: TokenAmount<TQuote>,
		token1: TokenAmount<TBase>,
	): Price<TBase, TQuote> {
		return new Price({
			base: token1.token,
			quote: token0.token,
			value: token1.bigNumber.isZero() ? BigNumber(0) : token0.bigNumber.dividedBy(token1.bigNumber),
		})
	}

	// ========== Math Methods ==========
	multipliedBy(multiplier: number): Price<TBase, TQuote> {
		return new Price({
			base: this.baseCurrency,
			quote: this.quoteCurrency,
			value: this.value?.multipliedBy(multiplier),
		})
	}
}
