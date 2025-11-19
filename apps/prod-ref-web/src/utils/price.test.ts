import BigNumber from "bignumber.js"
import { expect, it } from "vitest"

import { C98_VICTION, RABBIT_VICTION, VIC } from "@/constants/token"
import { Price } from "@/types/price"
import { priceArrayConvert, priceMultiply } from "@/utils/price"

it("price multiply (1)", () => {
	const p1 = new Price({
		base: VIC,
		quote: VIC,
		value: BigNumber(1),
	})
	const p2 = new Price({
		base: VIC,
		quote: C98_VICTION,
		value: BigNumber(2),
	})
	const p3 = priceMultiply(p1, p2)
	expect(p3.baseCurrency).toBe(VIC)
	expect(p3.quoteCurrency).toBe(C98_VICTION)
	expect(p3.value?.toString()).toBe(BigNumber(2).toString())
})

it("price multiply (2)", () => {
	const p1 = new Price({
		base: VIC,
		quote: VIC,
		value: BigNumber(1),
	})
	const p2 = new Price({
		base: C98_VICTION,
		quote: VIC,
		value: BigNumber(0.5),
	})
	const p3 = priceMultiply(p1, p2)
	expect(p3.baseCurrency).toBe(VIC)
	expect(p3.quoteCurrency).toBe(C98_VICTION)
	expect(p3.value?.toString()).toBe(BigNumber(2).toString())
})

it("chain price multiply (1)", () => {
	const p1 = new Price({
		base: VIC,
		quote: VIC,
		value: BigNumber(1),
	})
	const p2 = new Price({
		base: C98_VICTION,
		quote: VIC,
		value: BigNumber(0.5),
	})
	const p3 = new Price({
		base: RABBIT_VICTION,
		quote: C98_VICTION,
		value: BigNumber(0.25),
	})
	const res = priceArrayConvert([p1, p2, p3], VIC)
	expect(res.baseCurrency).toBe(VIC)
	expect(res.quoteCurrency).toBe(RABBIT_VICTION)
	expect(res.value?.toString()).toBe(BigNumber(8).toString())
})

it("chain price multiply (2)", () => {
	const p1 = new Price({
		base: VIC,
		quote: VIC,
		value: BigNumber(1),
	})
	const p2 = new Price({
		base: VIC,
		quote: C98_VICTION,
		value: BigNumber(0.5),
	})
	const p3 = new Price({
		base: C98_VICTION,
		quote: RABBIT_VICTION,
		value: BigNumber(0.25),
	})
	const res = priceArrayConvert([p1, p2, p3], VIC)
	expect(res.baseCurrency).toBe(VIC)
	expect(res.quoteCurrency).toBe(RABBIT_VICTION)
	expect(res.value?.toString()).toBe(BigNumber(0.125).toString())
})
