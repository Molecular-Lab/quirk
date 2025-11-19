import { expect, test } from "vitest"

import { C98_VICTION, CUSD_VICTION, RABBIT_VICTION, SAROS_VICTION, VIC, WVIC } from "@/constants/token"
import { EvmToken } from "@/types/tokens"

import { sortDisplayTokens } from "./token"

interface TestCase {
	description: string
	input: [EvmToken | undefined, EvmToken | undefined]
	expected: [EvmToken | undefined, EvmToken | undefined]
}

const testCases: TestCase[] = [
	{
		description: "with stable and non-stable tokens",
		input: [CUSD_VICTION, VIC],
		expected: [VIC, CUSD_VICTION],
	},
	{
		description: "with stable and non-stable tokens",
		input: [CUSD_VICTION, WVIC],
		expected: [WVIC, CUSD_VICTION],
	},
	{
		description: "with stable and non-stable tokens",
		input: [WVIC, CUSD_VICTION],
		expected: [WVIC, CUSD_VICTION],
	},
	{
		description: "with native and non-native tokens",
		input: [VIC, WVIC],
		expected: [WVIC, VIC],
	},
	{
		description: "with main tokens",
		input: [VIC, C98_VICTION],
		expected: [C98_VICTION, VIC],
	},
	{
		description: "with main tokens",
		input: [SAROS_VICTION, C98_VICTION],
		expected: [SAROS_VICTION, C98_VICTION],
	},
	{
		description: "with main tokens",
		input: [RABBIT_VICTION, C98_VICTION],
		expected: [RABBIT_VICTION, C98_VICTION],
	},
	{
		description: "with main tokens",
		input: [C98_VICTION, RABBIT_VICTION],
		expected: [RABBIT_VICTION, C98_VICTION],
	},
	{
		description: "with undefined tokens",
		input: [undefined, undefined],
		expected: [undefined, undefined],
	},
]

test.each(testCases)("sortDisplayTokens $description", ({ input, expected }) => {
	const result = sortDisplayTokens(input)
	expect(result[0]).toEqual(expected[0])
	expect(result[1]).toEqual(expected[1])
})
