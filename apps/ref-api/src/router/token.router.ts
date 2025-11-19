import { initServer } from "@ts-rest/fastify"
import { Address, ethAddress, isAddress, isAddressEqual } from "viem"

import { tokenContract } from "@rabbitswap/api-core/contracts/token"
import { TokenStats } from "@rabbitswap/api-core/dto"
import Logger from "@rabbitswap/logger"

import { TokenService } from "@/service"
import { withLock } from "@/utils/cacheLock"

export function createTokenRouter(s: ReturnType<typeof initServer>, { tokenService }: { tokenService: TokenService }) {
	return s.router(tokenContract, {
		getAllTokens: async () => {
			const tokens = await tokenService.getConfigTokens()
			return {
				status: 200,
				body: {
					tokens,
				},
			}
		},
		getTokenByAddress: async ({ params: { address } }) => {
			const tokenId = address.toLowerCase()
			if (!tokenId) {
				return {
					status: 400,
					body: {
						errorCode: "BAD_REQUEST",
						message: "Token ID is required",
					},
				}
			}

			const isTokenAddress = isAddress(tokenId)
			if (!isTokenAddress) {
				return {
					status: 400,
					body: {
						errorCode: "BAD_REQUEST",
						message: "Invalid token ID",
					},
				}
			}

			if (isAddressEqual(tokenId, ethAddress)) {
				return {
					status: 200,
					body: {
						token: {
							chain: "viction",
							chainId: 88,
							address: ethAddress,
							symbol: "VIC",
							name: "VICTION",
							decimals: 18,
							iconURL: "https://tokenlist.dojoswap.xyz/images/0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce.png",
							isStable: false,
							contractCreatedAt: 0,
							createdAt: "",
						},
					},
				}
			}

			try {
				const tokens = await tokenService.getConfigTokens()
				const token = tokens.find((token) => isAddressEqual(token.address, tokenId))
				if (token !== undefined) {
					return {
						status: 200,
						body: {
							token,
						},
					}
				}

				try {
					const tokenFromChain = await tokenService.getTokenFromChain(88, tokenId)
					return {
						status: 200,
						body: {
							token: tokenFromChain,
						},
					}
				} catch {
					return {
						status: 404,
						body: {
							errorCode: "NOT_FOUND",
							message: "Token not found",
						},
					}
				}
			} catch (error) {
				Logger.error("Failed to get token stats", {
					event: "get_token_by_address",
					err: error,
					address: address,
				})
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_SERVER_ERROR",
						message: `Failed to get token by address error: ${error}`,
					},
				}
			}
		},
		getTokensStats: async () => {
			try {
				const cacheKey = "tokenStats"
				const tokenStats = await withLock(cacheKey, async () => {
					return tokenService.getTokenStats(88)
				})
				const result = tokenStats.reduce<Record<Address, TokenStats>>((acc, tokenStat) => {
					const newStat = {
						...acc,
						[tokenStat.address.toLocaleLowerCase()]: tokenStat,
					}
					return newStat
				}, {})

				return {
					status: 200,
					body: {
						tokenStats: result,
					},
				}
			} catch (error) {
				Logger.error("Failed to get token stats", {
					event: "get_token_stats",
					err: error,
				})
				return {
					status: 500,
					body: {
						errorCode: "INTERNAL_SERVER_ERROR",
						message: `Failed to get token stats error: ${error}`,
					},
				}
			}
		},
	})
}
