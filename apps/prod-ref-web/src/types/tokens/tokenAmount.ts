import BigNumber from "bignumber.js"
import { formatUnits, parseUnits } from "viem"

import { Token } from "@/types/tokens/token"
import { formatDisplayNumber, stripZero } from "@/utils/number"
import { getUnwrapped, getWrapped } from "@/utils/token"

export interface TokenAmountInterface<T extends Token = Token> {
	token: T
	amount?: bigint
}

export class TokenAmount<T extends Token = Token> {
	readonly token: T
	amount?: bigint

	constructor({ token, amount }: TokenAmountInterface<T>) {
		this.token = token
		this.amount = amount
	}

	get bigint(): bigint {
		return this.amount ?? BigInt(0)
	}

	get bigNumber(): BigNumber {
		return BigNumber(formatUnits(this.bigint, this.token.decimals))
	}

	get string(): string {
		if (this.amount === undefined) return ""
		return this.bigNumber.toString()
	}

	toString(): string {
		return this.string
	}

	toFixed(decimalPlaces?: number, roundingMode?: BigNumber.RoundingMode): string {
		return this.bigNumber.toFixed(decimalPlaces ?? this.token.decimals, roundingMode)
	}

	toFormat(options?: {
		decimalPlaces?: number
		withUnit?: boolean
		stripZero?: boolean
		rounding?: BigNumber.RoundingMode
		toFixed?: boolean
	}): string {
		const needStripZero = options?.stripZero ?? true
		const fmtAmount = formatDisplayNumber(this.bigNumber, {
			precision: options?.decimalPlaces ?? this.token.decimals,
			stripZero: needStripZero,
			toFixed: options?.toFixed,
			rounding: options?.rounding,
		})
		const striped = needStripZero ? stripZero(fmtAmount) : fmtAmount
		if (!options?.withUnit) {
			return striped
		}
		return `${striped} ${this.token.symbol}`
	}

	setString(amount: string): void {
		this.amount = parseUnits(amount, this.token.decimals)
	}

	newAmountString(amount?: string): TokenAmount<T> {
		return TokenAmount.fromString(this.token, amount)
	}

	newAmount(amount?: bigint): TokenAmount {
		return new TokenAmount({ token: this.token, amount: amount })
	}

	newToken(token: Token): TokenAmount {
		return new TokenAmount({ token: token, amount: this.amount })
	}

	get wrapped(): TokenAmount {
		return this.newToken(getWrapped(this.token))
	}

	get unwrapped(): TokenAmount {
		return this.newToken(getUnwrapped(this.token))
	}

	// ================== Comparison Methods =====================
	equal(other: TokenAmount | undefined): boolean {
		return this.token.equals(other?.token) && this.amount === other?.amount
	}

	lt(other: TokenAmount | undefined): boolean {
		return this.bigNumber.lt(other?.bigNumber ?? 0)
	}

	lte(other: TokenAmount | undefined): boolean {
		return this.bigNumber.lte(other?.bigNumber ?? 0)
	}

	gt(other: TokenAmount | undefined): boolean {
		return this.bigNumber.gt(other?.bigNumber ?? 0)
	}

	gte(other: TokenAmount | undefined): boolean {
		return this.bigNumber.gte(other?.bigNumber ?? 0)
	}

	tokenCompare(other: TokenAmount | undefined): number {
		return this.token.compare(other?.token)
	}

	// ================== Math Methods =====================
	multiply(value: BigNumber.Value): TokenAmount<T> {
		const newValue: BigNumber = this.bigNumber.multipliedBy(value)
		return this.newAmountString(newValue.toFixed(this.token.decimals))
	}

	// ================== Builder Methods =====================
	static fromString<T extends Token>(token: T, amount?: string): TokenAmount<T> {
		return new TokenAmount({
			token: token,
			amount: amount !== undefined && amount !== "" ? parseUnits(amount, token.decimals) : undefined,
		})
	}

	static fromWei<T extends Token>(token: T, amount?: string | bigint): TokenAmount<T> {
		return new TokenAmount({
			token: token,
			amount: amount !== undefined && amount !== "" ? BigInt(amount) : undefined,
		})
	}
}
