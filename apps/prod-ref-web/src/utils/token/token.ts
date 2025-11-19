import { solana } from "@particle-network/connectkit/chains"
import BigNumber from "bignumber.js"
import { type Address, getAddress } from "viem"
import { mainnet, viction } from "viem/chains"

import { ETH_MAINNET, MAIN_TOKENS, SOL, VIC, WETH_MAINNET, WSOL, WVIC } from "@/constants/token"
import { tokenPairSorter } from "@/feature/liquidity/tokenPairSorter"
import { EVM_NATIVE_TOKEN_ADDRESS, EvmToken, Token, TokenAmount } from "@/types/tokens"
import { SolanaToken } from "@/types/tokens/solana"

export const getWrapped = <T extends Token | undefined>(token: T) => {
	if (!token) return token
	if (token.isNative) {
		switch (token.chainId) {
			case viction.id: {
				return WVIC
			}
			case mainnet.id: {
				return WETH_MAINNET
			}
			default: {
				throw new Error(`[getWrapped] Unsupported chain ${token.chainId}`)
			}
		}
	}
	return token
}

export const getUnwrapped = <T extends Token | undefined>(token: T) => {
	if (!token) return token

	if (token.isWrappedNative) {
		switch (token.chainId) {
			case viction.id: {
				return VIC
			}
			case mainnet.id: {
				return ETH_MAINNET
			}
			default: {
				throw new Error(`[getUnwrapped] Unsupported chain ${token.chainId}`)
			}
		}
	}
	return token
}

type ChainToken<T> = T extends true
	? { native: SolanaToken; wrapped: SolanaToken }
	: { native: EvmToken; wrapped: EvmToken }

export function getChainToken<T extends boolean>(chainId: number | undefined, isSolana?: T): ChainToken<T> {
	if (isSolana) {
		return getChainSolanaToken(chainId) as ChainToken<T>
	}
	return getChainEvmToken(chainId) as ChainToken<T>
}

export const getChainEvmToken = (chainId: number | undefined): { native: EvmToken; wrapped: EvmToken } => {
	switch (chainId) {
		case undefined: {
			// default fallback
			return { eth: VIC, weth: WVIC }
		}
		case viction.id: {
			return { eth: VIC, weth: WVIC }
		}
		case mainnet.id: {
			return { eth: ETH_MAINNET, weth: WETH_MAINNET }
		}

		default: {
			throw new Error(`[getChainToken] Unsupported chain ${chainId}`)
		}
	}
}

/**
 * @param sqrtPriceX96
 * @returns price
 */
export const parseSqrtPriceX96 = (sqrtPriceX96: bigint): BigNumber => {
	const sqrtPrice = new BigNumber(sqrtPriceX96.toString())
	const Q96 = new BigNumber(2).pow(96)
	const price = sqrtPrice.pow(2).div(Q96).div(Q96)
	return price
}

type IdentifyNativeAmountReturnType =
	| { native: TokenAmount; other: TokenAmount; haveNative: true }
	| { native: undefined; other: undefined; haveNative: false }

export const identifyNativeAmount = (amount0: TokenAmount, amount1: TokenAmount): IdentifyNativeAmountReturnType => {
	if (amount0.token.isNative) {
		return { native: amount0, other: amount1, haveNative: true } as const
	}
	if (amount1.token.isNative) {
		return { native: amount1, other: amount0, haveNative: true } as const
	}

	return { native: undefined, other: undefined, haveNative: false }
}

export const nativeToAddress = (input: string | null): Address | undefined => {
	if (input === "nativeToken") {
		return EVM_NATIVE_TOKEN_ADDRESS
	}
	if (input === null) {
		return undefined
	}
	try {
		const addr = getAddress(input)
		return addr
	} catch {
		return undefined
	}
}

/**
 * Sort tokens by display order
 * 1. Stable coin should be base token
 * 2. Else, main token should be base token
 * 3. Else, default sort
 *
 * @returns [left, right]
 */
export const sortDisplayTokens = <T extends EvmToken | undefined>(
	tokens: [T, T],
): T extends EvmToken ? [EvmToken, EvmToken] : [EvmToken, EvmToken] | [undefined, undefined] => {
	const [token0, token1] = tokens
	if (!token0 || !token1) {
		return [undefined, undefined] as T extends EvmToken ? never : [undefined, undefined]
	}

	// stable coin check
	if (token0.isStable || token1.isStable) {
		return token0.isStable ? [token1, token0] : [token0, token1]
	}

	// native token check
	if (token0.isNative || token1.isNative) {
		return token0.isNative ? [token1, token0] : [token0, token1]
	}
	if (token0.isWrappedNative || token1.isWrappedNative) {
		return token0.isWrappedNative ? [token1, token0] : [token0, token1]
	}

	// main token check
	if (token0.isMainToken && token1.isMainToken) {
		const pos0 = MAIN_TOKENS[token0.chainId]?.findIndex((token) => token.equals(token0))
		const pos1 = MAIN_TOKENS[token1.chainId]?.findIndex((token) => token.equals(token1))
		if (pos0 !== undefined && pos1 !== undefined) {
			if (pos0 < pos1) {
				return [token1, token0]
			}
			return [token0, token1]
		}
		// unreachable
		return [token0, token1]
	}
	if (token0.isMainToken) {
		return [token1, token0]
	}
	if (token1.isMainToken) {
		return [token0, token1]
	}

	return tokenPairSorter(token0, token1)
}

export const sortDisplayAmount = <T extends TokenAmount | undefined>(
	amounts: [T, T],
): T extends TokenAmount ? [TokenAmount, TokenAmount] : [TokenAmount, TokenAmount] | [undefined, undefined] => {
	const [amount0, amount1] = amounts
	if (!amount0 || !amount1) {
		return [undefined, undefined] as T extends TokenAmount ? never : [undefined, undefined]
	}

	const [token0] = sortDisplayTokens([amount0.token, amount1.token])
	return token0.equals(amount0.token) ? [amount0, amount1] : [amount1, amount0]
}
