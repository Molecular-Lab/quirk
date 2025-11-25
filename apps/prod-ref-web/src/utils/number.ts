import BigNumber from "bignumber.js"
import numeral from "numeral"

import { TokenAmount } from "@/types/tokens"

export function stripZero(n: string): string {
	try {
		const match = /^(.*?)(\d+\.\d+|\d+)(\D*)$/.exec(n)
		if (!match) return n
		const [, prefix, number, suffix] = match

		// if the dot is in the prefix, make the number decimal before formatting
		if (prefix?.includes(".")) return `${prefix}${parseFloat(`0.${number}`).toString().slice(2)}${suffix}`

		return `${prefix}${parseFloat(number!).toString()}${suffix}`
	} catch {
		return n
	}
}

const subscriptMap: readonly string[] = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"]

export const getSubscriptNumber = (number: number): string => {
	if (number >= 0 && number <= 9) {
		return subscriptMap[number]!
	}

	const subscriptDigits = Array.from(String(number), (digit) => subscriptMap[Number(digit)] ?? "").join("")
	return subscriptDigits
}

/**
 * @returns for large number, return number with prefix e.g. 87K, 235M
 * @returns for too small number, return zero with subscript indicates the repeated zeros
 * @returns else return normally formatted number
 */
export const formatDisplayNumber = (
	_number: number | string | BigNumber | undefined,
	options?: {
		precision?: number
		stripZero?: boolean
		toFixed?: boolean
		rounding?: BigNumber.RoundingMode
	},
): string => {
	const precision: number = options?.precision ?? 2
	const stripZero: boolean = options?.stripZero ?? false
	const toFixed: boolean = options?.toFixed ?? false

	const bn = BigNumber(_number ?? 0).abs()
	const dp = bn.dp()

	// rounding first
	const number = toFixed
		? BigNumber(bn.toFixed(dp && dp > precision ? dp : precision, options?.rounding))
		: BigNumber(bn.toPrecision(precision, options?.rounding))

	try {
		if (number.gte(1000)) {
			const result = numeral(number).format("0a")
			const length = result.length - 1
			const digitsAfterDot = toFixed ? precision : precision - length

			return numeral(number)
				.format(digitsAfterDot > 0 ? `0.${"0".repeat(digitsAfterDot)}a` : "0a")
				.toUpperCase()
		}
		if (number.gte(100)) {
			if (toFixed) return number.toFixed(precision)
			if (precision > 3) return number.toPrecision(precision)
			return number.toFixed(0)
		}
		if (number.gte(10)) {
			if (toFixed) return number.toFixed(precision)
			if (precision > 2) return number.toPrecision(precision)
			return number.toFixed(0)
		}
		if (number.gte(0.01)) {
			return toFixed ? number.toFixed(precision) : number.toPrecision(precision)
		}
		if (number.isZero()) {
			if (stripZero) return "0"
			return number.toFixed(precision)
		}

		const zeroCount = Math.abs(Math.floor(Math.log10(number.toNumber())) + 1)
		const subscriptNumber = getSubscriptNumber(zeroCount)
		const value = number.toExponential().toString().split("e")[0]?.slice(0, 6) ?? "0.0"
		const fmtValue = value.replace(".", "")
		const paddedValue = (stripZero ? fmtValue : fmtValue.padEnd(precision, "0")).substring(0, precision)

		return `0.0${subscriptNumber}${paddedValue}`
	} catch {
		return "error"
	}
}

export const formatQuoteResult = (
	amount: TokenAmount | undefined,
	rounding: BigNumber.RoundingMode = BigNumber.ROUND_UP,
	precision = 6,
) => {
	if (amount?.amount === undefined) {
		return amount
	}

	if (amount.bigNumber.isLessThan(1e6)) {
		return amount.newAmountString(amount.bigNumber.toPrecision(precision, rounding))
	}

	return amount.newAmountString(amount.bigNumber.toFixed(0, rounding))
}

export function formatFiatValue(
	value: BigNumber.Value | undefined,
	options?: {
		showLessThanSymbol?: boolean
		minPrecision?: number
		symbol?: string
		showFullValue?: boolean
		rounding?: BigNumber.RoundingMode
	},
): string {
	const minPrecision = options?.minPrecision ?? 2
	const symbol = options?.symbol ?? "$"
	const showLessThanSymbol = options?.showLessThanSymbol ?? true
	const showFullValue = options?.showFullValue ?? false

	if (value === undefined) {
		return "-"
	}

	const fiatValue = BigNumber(value)
	if (fiatValue.eq(0) || fiatValue.isNaN()) {
		return "-"
	}

	const minValue = BigNumber(1).shiftedBy(-minPrecision)
	if (fiatValue.lt(minValue)) {
		return showLessThanSymbol
			? `<${symbol}${minValue}`
			: `${symbol}${formatDisplayNumber(fiatValue, {
					precision: minPrecision,
					rounding: options?.rounding,
				})}`
	}

	if (showFullValue) {
		return `${symbol}${fiatValue.toFormat(minPrecision)}`
	}

	return `${symbol}${formatDisplayNumber(fiatValue, {
		toFixed: true,
		precision: minPrecision,
		rounding: options?.rounding,
	})}`
}
