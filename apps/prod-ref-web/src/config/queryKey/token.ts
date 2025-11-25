export const TokenQueryKeys = {
	allTokens: (chainId: number) => ["all-tokens", chainId],
	token: (currencyId: string | undefined) => ["token", currencyId],
	tokenStats: (currencyId: string | undefined) => ["token-stats", currencyId],
	tokensStats: (chainId: number) => ["tokens-stats", chainId],
} as const

export const TokenBalanceQueryKeys = {
	token: (walletAddress: string | undefined, currencyId: string | undefined) => ["balance", walletAddress, currencyId],
} as const
