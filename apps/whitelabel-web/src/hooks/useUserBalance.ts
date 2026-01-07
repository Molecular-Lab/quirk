/**
 * Enhanced React Query hook for fetching user token balance
 * Supports multiple tokens, multiple networks, and environment switching
 */

import { useQuery } from "@tanstack/react-query"
import { createPublicClient, formatUnits, http } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { NETWORK_CONFIG, type NetworkKey, type TokenKey } from "@quirk/core/constants"
import { useEnvironmentStore, type ApiEnvironment } from "@/store/environmentStore"

// ERC20 ABI for balanceOf
const ERC20_ABI = [
	{
		constant: true,
		inputs: [{ name: "_owner", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", type: "uint256" }],
		type: "function",
	},
] as const

export interface UseUserBalanceOptions {
	walletAddress: string | undefined | null
	environment?: ApiEnvironment // "sandbox" | "production"
	token?: TokenKey // "usdc" | "usdt" | "weth" | "eth"
	enabled?: boolean // Override query enabled state
}

export interface TokenBalance {
	raw: string // Raw balance as string (bigint)
	formatted: string // Formatted balance as string (e.g., "1000.50")
	formattedWithSymbol: string // Formatted with symbol (e.g., "1,000.50 USDC")
	symbol: string // Token symbol
	decimals: number // Token decimals
	lastUpdate: Date
}

/**
 * Enhanced balance hook supporting multiple tokens and networks
 *
 * @example
 * ```typescript
 * // Basic usage (defaults to sandbox USDC)
 * const { data: balance } = useUserBalance({ walletAddress })
 *
 * // With environment parameter
 * const { data: balance } = useUserBalance({
 *   walletAddress,
 *   environment: "production"
 * })
 *
 * // Different token
 * const { data: balance } = useUserBalance({
 *   walletAddress,
 *   environment: "sandbox",
 *   token: "usdt"
 * })
 * ```
 */
export function useUserBalance({ walletAddress, environment, token = "usdc", enabled = true }: UseUserBalanceOptions) {
	// Get environment from store if not provided
	const storeEnvironment = useEnvironmentStore((state) => state.apiEnvironment)
	const activeEnvironment = environment ?? storeEnvironment

	return useQuery<TokenBalance>({
		queryKey: ["userBalance", walletAddress, activeEnvironment, token],
		queryFn: async () => {
			if (!walletAddress) {
				throw new Error("Wallet address is required")
			}

			// Determine network based on environment
			const networkKey: NetworkKey = activeEnvironment === "production" ? "eth_mainnet" : "eth_sepolia"
			const networkConfig = NETWORK_CONFIG[networkKey]
			const tokenConfig = networkConfig.token[token]

			if (!tokenConfig) {
				throw new Error(`Token ${token} not available on ${networkKey}`)
			}

			// Create viem public client for the appropriate network
			const client = createPublicClient({
				chain: activeEnvironment === "production" ? mainnet : sepolia,
				transport: http(networkConfig.rpcUrl),
			})

			let balance: bigint

			// Handle native token (ETH) vs ERC20 tokens
			if (tokenConfig.isNative) {
				// For ETH, use getBalance
				balance = await client.getBalance({
					address: walletAddress as `0x${string}`,
				})
			} else {
				// For ERC20 tokens, use balanceOf
				balance = (await client.readContract({
					address: tokenConfig.address as `0x${string}`,
					abi: ERC20_ABI,
					functionName: "balanceOf",
					args: [walletAddress as `0x${string}`],
				})) as bigint
			}

			// Format balance
			const formatted = formatUnits(balance, tokenConfig.decimals)

			return {
				raw: balance.toString(),
				formatted,
				formattedWithSymbol: `${parseFloat(formatted).toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: tokenConfig.decimals,
				})} ${tokenConfig.symbol}`,
				symbol: tokenConfig.symbol,
				decimals: tokenConfig.decimals,
				lastUpdate: new Date(),
			}
		},
		enabled: enabled && !!walletAddress, // Only fetch if wallet address exists and enabled
		refetchInterval: 10000, // Refetch every 10 seconds
		staleTime: 5000, // Consider data stale after 5 seconds
	})
}

/**
 * Legacy compatibility hook - wraps useUserBalance with USDC defaults
 * @deprecated Use useUserBalance instead for better flexibility
 */
export function useMockUSDCBalance(walletAddress: string | undefined | null) {
	return useUserBalance({
		walletAddress,
		environment: "sandbox", // Always sandbox for Mock USDC
		token: "usdc",
	})
}

/**
 * Hook for fetching custodial wallet balance
 * This should be used for displaying Product Owner's total managed funds
 */
export function useCustodialBalance(
	custodialWalletAddress: string | undefined | null,
	environment: ApiEnvironment = "sandbox",
	token: TokenKey = "usdc",
) {
	return useUserBalance({
		walletAddress: custodialWalletAddress,
		environment,
		token,
	})
}
