import { type PublicClient, createPublicClient, http } from "viem"

import { VIEM_CHAINS } from "@/constants/chain"

// get debug mode by localstorage
const debugMode = localStorage.getItem("rabbitswap-debug")
const isDebugMode = debugMode === "true"

const PUBLIC_CLIENT = new Map<number, PublicClient>()

export const getPublicClient = (_chainId: number): PublicClient => {
	// case chainId is solana default return viction
	const chainId = _chainId === 101 ? 88 : _chainId
	if (!PUBLIC_CLIENT.has(chainId)) {
		const viemChain = VIEM_CHAINS[chainId]
		if (!viemChain) {
			throw new Error(`[getPublicClient] VIEM_CHAINS not found for chain id ${chainId}`)
		}

		PUBLIC_CLIENT.set(
			chainId,
			createPublicClient({
				chain: viemChain,
				transport: http(undefined, {
					onFetchRequest: (request) => {
						const requestTime = Date.now()
						if (isDebugMode) {
							// eslint-disable-next-line no-console
							console.log("[rabbitswap-debug]", "RPC request", {
								rpcUrl: request.url,
								requestTime: requestTime,
							})
						}
					},
					onFetchResponse: (response) => {
						const responseTime = Date.now()
						if (isDebugMode) {
							// eslint-disable-next-line no-console
							console.log("[rabbitswap-debug]", "RPC response", {
								rpcUrl: response.url,
								responseTime: responseTime,
							})
						}
					},
				}),
				batch: {
					multicall: true,
				},
			}),
		)
	}
	return PUBLIC_CLIENT.get(chainId)!
}
