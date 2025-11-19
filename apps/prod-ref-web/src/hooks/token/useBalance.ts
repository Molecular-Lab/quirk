import { solana } from "@particle-network/auth-core"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { useQueries, useQuery } from "@tanstack/react-query"
import { Address, erc20Abi, getAddress } from "viem"

import { QueryKeys } from "@/config/queryKey"
import { useAccount } from "@/hooks/useAccount"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { EvmToken, SolanaToken, Token, TokenAmount } from "@/types/tokens"
import { getPublicClient } from "@/utils/publicClient"

export async function getEvmBalance(address: Address, token: EvmToken): Promise<TokenAmount> {
	const publicClient = getPublicClient(token.chainId)
	if (token.isNative) {
		const amount = await publicClient.getBalance({ address })
		return new TokenAmount({ token, amount })
	}

	const amount = await publicClient.readContract({
		abi: erc20Abi,
		address: getAddress(token.address),
		functionName: "balanceOf",
		args: [address],
	})

	return new TokenAmount({ token, amount })
}

export async function getSolanaBalance(connection: Connection, walletAddress: PublicKey, token: SolanaToken) {
	const { value: tokenAccounts } = await connection.getParsedTokenAccountsByOwner(walletAddress, {
		mint: new PublicKey(token.address),
	})
	if (tokenAccounts.length === 0) {
		return TokenAmount.fromString(token)
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const tokenAmount = tokenAccounts[0]!.account.data.parsed.info.tokenAmount as TokenAmount

	const amount = BigInt(tokenAmount.amount!)
	return new TokenAmount({ token, amount })
}

export const useBalance = (params: { walletAddress?: string; token: Token | undefined }) => {
	const evmAccount = useAccount()
	const solanaAccount = useWallet()
	const { connection } = useConnection()

	const evmWalletAddress: Address | undefined = params.walletAddress
		? getAddress(params.walletAddress)
		: evmAccount.address
	const solanaWalletAddress = solanaAccount.publicKey

	const token = params.token
	const isEvm = params.token instanceof EvmToken

	return useQuery<TokenAmount>({
		queryKey: QueryKeys.tokenBalance.token(
			token?.chainId === solana.id ? solanaWalletAddress?.toString() : evmWalletAddress?.toString(),
			token?.currencyId,
		),
		queryFn: async () => {
			return isEvm && token
				? getEvmBalance(evmWalletAddress!, token as EvmToken)
				: getSolanaBalance(connection, solanaWalletAddress!, token as SolanaToken)
		},
		enabled:
			!!token &&
			((token.chainId === solana.id && !!solanaWalletAddress) || (token.chainId !== solana.id && !!evmWalletAddress)),
	})
}

export const useBalances = (params: { walletAddress?: string; tokens: Token[] }) => {
	const evmAccount = useAccount()
	const solanaAccount = useWallet()
	const { connection } = useConnection()
	const { publicClient } = useViemClient()

	const evmWalletAddress: Address | undefined = params.walletAddress
		? getAddress(params.walletAddress)
		: evmAccount.address
	const solanaWalletAddress = solanaAccount.publicKey

	return useQueries({
		queries: params.tokens.map((token) => ({
			queryKey: QueryKeys.tokenBalance.token(
				token.chainId === solana.id ? solanaWalletAddress?.toString() : evmWalletAddress?.toString(),
				token.currencyId,
			),
			queryFn: async () => {
				if (token instanceof EvmToken) {
					return getEvmBalance(evmWalletAddress!, token)
				}
				if (token instanceof SolanaToken) {
					return getSolanaBalance(connection, solanaWalletAddress!, token)
				}
				throw new Error("Unsupported token type")
			},
			enabled:
				(token.chainId === solana.id && !!solanaWalletAddress) ||
				(token.chainId !== solana.id && !!evmWalletAddress && !!publicClient),
		})),
		combine: (results) => {
			return {
				data: results.map((result) => result.data).filter((data) => !!data),
				isLoading: results.some((result) => result.isLoading),
			}
		},
	})
}
