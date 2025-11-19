import { solana } from "@particle-network/auth-core"
import { mainnet, viction } from "viem/chains"

/**
 * https://docs.layerzero.network/v1/developers/evm/technical-reference/deployed-contracts
 */
export const MappingLzChainId: Record<number, number> = {
	[mainnet.id]: 101,
	[viction.id]: 196,
	// [solana.id]:
}

export const GasAmountMapper: Record<number, number> = {
	[mainnet.id]: 200000,
	[viction.id]: 200000,
}

export const NativeForDstMapper: Record<number, string> = {
	[mainnet.id]: "0.001",
	[viction.id]: "0.001",
}

export interface IToken {
	name: string
	symbol: string
	decimals: number
	oftAddress: string
	tokenAddress: string
	imageUrl: string
	chainId: number
	to: number[]
}

// The rest of the token can be found in arken repo "packages/core/src/constant/bridge/tokens.ts"
export const BridgeTokenList: Record<number, IToken[]> = {
	[mainnet.id]: [
		{
			name: "USDT",
			symbol: "USDT",
			decimals: 6,
			oftAddress: "0x29D5e0d984596Bf287500F952B84Fcd4D8345034",
			tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
			imageUrl: "https://tether.to/images/logoCircle.png",
			chainId: mainnet.id,
			to: [viction.id],
		},
	],
	[viction.id]: [
		{
			name: "Tether USD",
			symbol: "USDT",
			decimals: 6,
			oftAddress: "0x77dBf0dc2D6c5B79bc0eD0F00bEa2eA31b8E0208",
			tokenAddress: "0x69B946132B4a6C74cd29Ba3ff614cEEA1eF9fF2B",
			imageUrl: "https://tether.to/images/logoCircle.png",
			chainId: viction.id,
			to: [mainnet.id],
		},
	],
	[solana.id]: [
		{
			name: "Tether USD",
			symbol: "USDT",
			decimals: 6,
			oftAddress: "0x77dBf0dc2D6c5B79bc0eD0F00bEa2eA31b8E0208",
			tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
			imageUrl: "https://tether.to/images/logoCircle.png",
			chainId: solana.id,
			to: [viction.id],
		},
	],
}
