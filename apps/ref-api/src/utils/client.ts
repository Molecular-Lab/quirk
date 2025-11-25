import { Chain, PublicClient, createPublicClient, http } from "viem"
import { viction as _viction } from "viem/chains"

import { VICTION_MULTICALL3_ADDRESS } from "@rabbitswap/core"

// need to define viction chain again because the viem/chains one doesn't contains multicall3 contract
const viction: Chain = {
	..._viction,
	rpcUrls: {
		default: {
			http: [
				"https://rpc5.viction.xyz",
				"https://viction.drpc.org",
				"https://viction.blockpi.network/v1/rpc/public",
				"https://rpc.viction.xyz",
			],
		},
	},
	contracts: {
		multicall3: {
			address: VICTION_MULTICALL3_ADDRESS,
			blockCreated: 85756401,
		},
	},
}

const victionViemClient = createPublicClient({
	chain: viction,
	transport: http(),
	batch: {
		multicall: true,
	},
})

export const getViemClient = (chainId: number): PublicClient => {
	switch (chainId) {
		case viction.id: {
			return victionViemClient
		}
		default: {
			throw new Error(`Unsupported chain id ${chainId}`)
		}
	}
}
