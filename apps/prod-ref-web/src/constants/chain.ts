import { getChainIcon, solana } from "@particle-network/auth-core"
import { type Chain } from "viem"
import { viction as _viction, mainnet } from "viem/chains"

import { VICTION_MULTICALL3_ADDRESS } from "@rabbitswap/core/constants"

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

const ethereum: Chain = {
	...mainnet,
	rpcUrls: {
		default: {
			http: ["https://ethereum.publicnode.com"],
		},
	},
}

export const SWAP_CHAINS: [Chain, ...Chain[]] = [viction]
export const BRIDGE_CHAINS: [Chain, ...Chain[]] = [viction, ethereum]

export const SUPPORTED_CHAINS: [Chain, ...Chain[]] = [...SWAP_CHAINS, ...BRIDGE_CHAINS]

export const DEFAULT_CHAIN = viction

/**
 * mapping from chainId to chain
 */
export const VIEM_CHAINS: Record<number, Chain> = {
	[viction.id]: viction,
	[ethereum.id]: ethereum,
}
export const SUPPORTED_BRIDGE_CHAINS: Record<number, Chain> = {
	...VIEM_CHAINS,
	[solana.id]: solana,
}
interface ChainIcon {
	name: string
	iconURL: string
}

export const CHAINS_ICON: Record<number, ChainIcon> = {
	[viction.id]: {
		name: "Viction",
		iconURL: "/logo/viction-bg-yellow.png",
	},
	[ethereum.id]: {
		name: "Ethereum",
		iconURL: "https://cdn.worldvectorlogo.com/logos/ethereum-eth.svg",
	},
	[solana.id]: {
		name: "Solana",
		iconURL: getChainIcon(solana),
	},
}
