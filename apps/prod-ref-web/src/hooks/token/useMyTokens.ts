import { useMemo } from "react"

import BigNumber from "bignumber.js"
import { Address } from "viem"

import { useAllTokens } from "@/hooks/token/useAllTokens"
import { useBalances } from "@/hooks/token/useBalance"
import { useAllTokensStats } from "@/hooks/token/useTokenStats"
import { useSumUsdPrice } from "@/hooks/token/useUsdPrice"
import { useSwapChainId } from "@/hooks/useChainId"
import { EvmToken, TokenAmount } from "@/types/tokens"

interface UseMyTokensOptions {
	chainId?: number
	balanceWallet?: Address
}

interface MyTokensData {
	myTokens: EvmToken[]
	myBalances: TokenAmount[]
	myUsdBalance: BigNumber
}

interface MyTokensResult {
	data: MyTokensData
	isLoading: boolean
	isLoadingUsdBalance: boolean
}

export const useMyTokens = (options?: UseMyTokensOptions): MyTokensResult => {
	const defaultChainId = useSwapChainId()
	const chainId = options?.chainId ?? defaultChainId
	const { data: tokens, isLoading: allTokensLoading } = useAllTokens(chainId)
	const { data: balances, isLoading: balancesLoading } = useBalances({
		tokens: tokens ?? [],
		walletAddress: options?.balanceWallet,
	})
	useAllTokensStats(chainId)

	const myTokens = useMemo<EvmToken[]>(() => {
		if (!tokens) return []
		// Filter tokens with balance > 0
		return tokens.filter((token) => balances.some((b) => b.token.equals(token) && b.bigint > 0n))
	}, [tokens, balances])

	const myBalances = useMemo<TokenAmount[]>(() => {
		return myTokens.map((token) => {
			const balance = balances.find((b) => b.token.equals(token))
			return balance ?? TokenAmount.fromString(token, "0")
		})
	}, [myTokens, balances])

	const { data: myUsdBalance, isLoading: isLoadingUsdBalance } = useSumUsdPrice(myBalances)

	return {
		data: { myTokens, myBalances, myUsdBalance },
		isLoading: allTokensLoading || balancesLoading,
		isLoadingUsdBalance: isLoadingUsdBalance,
	}
}
