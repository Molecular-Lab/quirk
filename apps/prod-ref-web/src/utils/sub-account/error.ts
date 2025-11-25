import { Address } from "viem"

import { getEvmBalance } from "@/hooks/token/useBalance"
import { getChainToken } from "@/utils/token"

export class RabbitSwapNoEthError extends Error {
	name = "RabbitSwapNoEthError"

	constructor() {
		super()
		this.name = "RabbitSwapNoEthError"
	}
}

export function isNoEthError(error: unknown): boolean {
	return error instanceof Error && error.name === "RabbitSwapNoEthError"
}

export async function checkNoEthError(walletAddress: Address, chainId: number): Promise<boolean> {
	const { native } = getChainToken(chainId)
	const balance = await getEvmBalance(walletAddress, native)
	return balance.bigNumber.lte(0)
}
