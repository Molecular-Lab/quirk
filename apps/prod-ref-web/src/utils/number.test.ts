import BigNumber from "bignumber.js"
import { expect, test } from "vitest"

import { WVIC } from "@/constants/token"
import { TokenAmount } from "@/types/tokens"

import { formatDisplayNumber, formatFiatValue, formatQuoteResult, stripZero } from "./number"

test.each([
	{ number: 1234567, precisions: 3, expected: "1.23M" },
	{ number: 1234567, precisions: 2, expected: "1.2M" },
	{ number: 12345, precisions: 3, expected: "12.3K" },
	{ number: 10, precisions: 3, expected: "10.0" },
	{ number: 1, precisions: 3, expected: "1.00" },
	{ number: 0.1234, precisions: 3, expected: "0.123" },
	{ number: 0.000000123, precisions: 3, expected: "0.0₆123" },
	{ number: 0.00000054321111, precisions: 3, expected: "0.0₆543" },
])("formatDisplayNumber %o", ({ number, precisions, expected }) => {
	expect(
		formatDisplayNumber(number, {
			precision: precisions,
		}),
	).toBe(expected)
})

test.each([
	{ number: 1234567, precisions: 3, expected: "1.235M" },
	{ number: 1234567, precisions: 2, expected: "1.23M" },
	{ number: 12345, precisions: 3, expected: "12.345K" },
	{ number: 12345, precisions: 1, expected: "12.3K" },
	{ number: 10, precisions: 3, expected: "10.000" },
	{ number: 1, precisions: 3, expected: "1.000" },
	{ number: 0.1234, precisions: 3, expected: "0.123" },
	{ number: 0.000000123, precisions: 3, expected: "0.0₆123" },
	{ number: 0.00000054321111, precisions: 3, expected: "0.0₆543" },
])("formatDisplayNumberFixed %o", ({ number, precisions, expected }) => {
	expect(
		formatDisplayNumber(number, {
			precision: precisions,
			toFixed: true,
		}),
	).toBe(expected)
})

test.each([
	{ number: 499999, precisions: 4, expected: "499.9K" },
	{ number: 499999, precisions: 3, expected: "499K" },
])("formatDisplayNumberRoundDownTcs %o", ({ number, precisions, expected }) => {
	expect(
		formatDisplayNumber(number, {
			precision: precisions,
			rounding: BigNumber.ROUND_DOWN,
		}),
	).toBe(expected)
})

test.each([
	{ number: 1234567, precisions: 3, expected: "$1.235M" },
	{ number: 1234567, precisions: 2, expected: "$1.23M" },
	{ number: 12345, precisions: 3, expected: "$12.345K" },
	{ number: 12345, precisions: 1, expected: "$12.3K" },
	{ number: 10, precisions: 3, expected: "$10.000" },
	{ number: 1, precisions: 3, expected: "$1.000" },
	{ number: 0.1234, precisions: 3, expected: "$0.123" },
	{ number: 0.000000123, precisions: 3, expected: "<$0.001" },
	{ number: 0.000000123, precisions: 2, expected: "<$0.01" },
	{ number: 0.00000054321111, precisions: 3, expected: "<$0.001" },
])("formatFiatDisplay %o", ({ number, precisions, expected }) => {
	expect(formatFiatValue(number, { minPrecision: precisions })).toBe(expected)
})

test.each([
	{ number: 1234567, precisions: 3, expected: "$1,234,567.000" },
	{ number: 1234567, precisions: 2, expected: "$1,234,567.00" },
	{ number: 12345, precisions: 3, expected: "$12,345.000" },
	{ number: 12345, precisions: 1, expected: "$12,345.0" },
	{ number: 10, precisions: 3, expected: "$10.000" },
	{ number: 1, precisions: 3, expected: "$1.000" },
	{ number: 0.1234, precisions: 3, expected: "$0.123" },
	{ number: 0.000000123, precisions: 3, expected: "<$0.001" },
	{ number: 0.000000123, precisions: 2, expected: "<$0.01" },
	{ number: 0.00000054321111, precisions: 3, expected: "<$0.001" },
])("formatFiatDisplayFull %o", ({ number, precisions, expected }) => {
	expect(formatFiatValue(number, { minPrecision: precisions, showFullValue: true })).toBe(expected)
})

test.each([
	{ number: 1234567, precisions: 3, expected: "$1.235M" },
	{ number: 1234567, precisions: 2, expected: "$1.23M" },
	{ number: 12345, precisions: 3, expected: "$12.345K" },
	{ number: 12345, precisions: 1, expected: "$12.3K" },
	{ number: 10, precisions: 3, expected: "$10.000" },
	{ number: 1, precisions: 3, expected: "$1.000" },
	{ number: 0.1234, precisions: 3, expected: "$0.123" },
	{ number: 0.000000123, precisions: 3, expected: "$0.0₆123" },
	{ number: 0.00000054321111, precisions: 3, expected: "$0.0₆543" },
])("formatFiatDisplayHideLessThanSymbol %o", ({ number, precisions, expected }) => {
	expect(formatFiatValue(number, { minPrecision: precisions, showLessThanSymbol: false })).toBe(expected)
})

const testFormatQuoteResult = (amountString: string | undefined) => {
	const amount = new TokenAmount({ token: WVIC }).newAmountString(amountString)
	return formatQuoteResult(amount, BigNumber.ROUND_DOWN)?.bigNumber.toString()
}

test.each([
	{ number: undefined, expected: "0" },
	{ number: "50000", expected: "50000" },
	{ number: "1234561234.7", expected: "1234561234" },
	{ number: "123456.7", expected: "123456" },
	{ number: "12345.67", expected: "12345.6" },
	{ number: "1234.567", expected: "1234.56" },
	{ number: "1.234567", expected: "1.23456" },
	{ number: "0.0000012", expected: "0.0000012" },
])("formatQuoteResult %o", ({ number, expected }) => {
	expect(testFormatQuoteResult(number)).toBe(expected)
})

test.each([
	{ input: "123.000", expected: "123" },
	{ input: "123.4560", expected: "123.456" },
	{ input: "123.456K", expected: "123.456K" },
	{ input: "123.400K", expected: "123.4K" },
	{ input: "0.0₃123", expected: "0.0₃123" },
	{ input: "0.0₃12300", expected: "0.0₃123" },
])("stripZero %o", ({ input, expected }) => {
	expect(stripZero(input)).toBe(expected)
})
