import { BigNumber } from "bignumber.js"
import { Address } from "viem"

const Q96 = BigNumber(2).pow(96)

export const parseSqrtPrice = (sqrtPrice: string) => {
	return BigNumber(sqrtPrice).div(Q96).pow(2).toNumber()
}

/**
 * Sort the token pair in ascending order by token address
 */
export const sortTokenPair = (tokenPair: [Address, Address]): [Address, Address] => {
	const lowerA = tokenPair[0].toLowerCase() as Address
	const lowerB = tokenPair[1].toLowerCase() as Address
	const sorted: [Address, Address] = lowerA < lowerB ? [lowerA, lowerB] : [lowerB, lowerA]
	return sorted
}
