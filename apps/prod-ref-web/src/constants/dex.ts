import BigNumber from "bignumber.js"
import { type Address } from "viem"
import { viction } from "viem/chains"

import { VICTION_DEV_CONTRACT, VICTION_MULTICALL_ADDRESS, VICTION_PROD_CONTRACT } from "@rabbitswap/core/constants"

import { APP_ENV } from "@/config/env"

export const VICTION_CONTRACT = APP_ENV === "production" ? VICTION_PROD_CONTRACT : VICTION_DEV_CONTRACT

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: Record<number, Address> = {
	[viction.id]: VICTION_CONTRACT.nftPositionManager,
}

export const V3_CORE_FACTORY_ADDRESSES: Record<number, Address> = {
	[viction.id]: VICTION_CONTRACT.v3Factory,
}

export const SWAP_ROUTER_ADDRESSES: Record<number, Address> = {
	[viction.id]: VICTION_CONTRACT.swapRouter,
}

export const MULTICALL_ADDRESSES: Record<number, Address> = {
	[viction.id]: VICTION_MULTICALL_ADDRESS,
}

export const POOL_BYTECODE_HASHES: Record<number, string> = {
	[viction.id]: VICTION_CONTRACT.initCodeHash,
}

export type FeeAmount = 100 | 500 | 3000 | 10000

export function isFeeAmount(x: number): x is FeeAmount {
	return x === 100 || x === 500 || x === 3000 || x === 10000
}

export function formatFee(fee: FeeAmount): BigNumber {
	return BigNumber(fee).shiftedBy(-6)
}

export function formatFeeDisplay(fee: FeeAmount): string {
	const parsedFee = formatFee(fee)
	return `${parsedFee.shiftedBy(2).toFormat(2)}%`
}

export const TICK_SPACINGS: Record<FeeAmount, number> = {
	[100]: 1,
	[500]: 10,
	[3000]: 60,
	[10000]: 200,
}
