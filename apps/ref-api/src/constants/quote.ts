import dayjs from "dayjs"
import { Address } from "viem"

import { VICTION_DEV_CONTRACT, VICTION_PROD_CONTRACT, quoterAbi } from "@rabbitswap/core/constants"

import { ENV } from "../env"

export const FEE_RATE = [100, 200, 300, 400, 500, 3000, 10000] as const

export const VICTION_CONTRACT = ENV.ENVIRONMENT === "production" ? VICTION_PROD_CONTRACT : VICTION_DEV_CONTRACT

/**
 * use to get routing for quote
 */
export const INTERMEDIATE_TOKENS: Address[] = [
	"0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce", // WVIC
	"0x69B946132B4a6C74cd29Ba3ff614cEEA1eF9fF2B", // Tether USD (USDT)
	"0x0fd0288aaae91eaf935e2ec14b23486f86516c8c", // C98
	"0x2C664910222BE7b7e203753C59A9667cBe282828", // RABBIT
	"0xb786d9c8120d311b948cf1e5aa48d8fbacf477e2", // SAROS
	"0xBA73E59F11597c1c13B0D9114688Efb6A6D430F6", // WUSD
]

export const QUOTE_FUNCTION = {
	EXACT_INPUT: {
		address: VICTION_CONTRACT.quoter,
		abi: quoterAbi,
		functionName: "quoteExactInput",
	},
	EXACT_OUTPUT: {
		address: VICTION_CONTRACT.quoter,
		abi: quoterAbi,
		functionName: "quoteExactOutput",
	},
} as const

export const factoryDeployedDate = dayjs.unix(1731473516)
