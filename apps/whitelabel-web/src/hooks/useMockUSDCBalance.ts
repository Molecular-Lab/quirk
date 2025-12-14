/**
 * React Query hook for fetching Mock USDC balance from blockchain
 */

import { useQuery } from "@tanstack/react-query"
import { createPublicClient, formatUnits, http } from "viem"
import { baseSepolia } from "viem/chains"

// Mock USDC Contract Address (Base Sepolia)
// TODO: Replace with your actual Mock USDC contract address
const MOCK_USDC_ADDRESS = import.meta.env.VITE_MOCK_USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

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

// RPC URL
const RPC_URL = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"

/**
 * Fetch Mock USDC balance for a given wallet address
 */
export function useMockUSDCBalance(walletAddress: string | undefined) {
	return useQuery({
		queryKey: ["mockUSDC", "balance", walletAddress],
		queryFn: async () => {
			if (!walletAddress) {
				throw new Error("Wallet address is required")
			}

			// Create viem public client
			const client = createPublicClient({
				chain: baseSepolia,
				transport: http(RPC_URL),
			})

			// Read balance from contract
			const balance = (await client.readContract({
				address: MOCK_USDC_ADDRESS as `0x${string}`,
				abi: ERC20_ABI,
				functionName: "balanceOf",
				args: [walletAddress as `0x${string}`],
			})) as bigint

			// Format balance (6 decimals for USDC)
			const formatted = formatUnits(balance, 6)

			return {
				raw: balance.toString(),
				formatted, // String like "1000.50"
				formattedWithSymbol: `${parseFloat(formatted).toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})} Mock USDC`,
				lastUpdate: new Date(),
			}
		},
		enabled: !!walletAddress, // Only fetch if wallet address exists
		refetchInterval: 10000, // 10 seconds
		staleTime: 5000, // 5 seconds
	})
}

/**
 * Hook for fetching custodial wallet balance
 * This should be used for displaying Product Owner's total managed funds
 */
export function useCustodialBalance(custodialWalletAddress: string | undefined) {
	return useMockUSDCBalance(custodialWalletAddress)
}
