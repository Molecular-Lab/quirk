/**
 * Blockchain Contract Addresses
 *
 * Centralized constants for contract addresses across all chains.
 * Import these instead of using environment variables for consistency.
 */

import type { SupportedChainId } from './chain'

/**
 * Mock USDC Token Addresses (for testing)
 */
export const MOCK_USDC_ADDRESSES: Partial<Record<SupportedChainId, `0x${string}`>> = {
	// Sepolia Testnet
	11155111: '0x1d02848c34ed2155613dd5cd26ce20a601b9a489',
	// Add other chains as needed
	// 84532: '0x...', // Base Sepolia
}

/**
 * Get MOCK_USDC address for a specific chain
 * @param chainId - The chain ID to get the address for
 * @returns The MOCK_USDC contract address
 * @throws Error if chain is not supported
 */
export function getMockUSDCAddress(chainId: SupportedChainId): `0x${string}` {
	const address = MOCK_USDC_ADDRESSES[chainId]
	if (!address) {
		throw new Error(`MOCK_USDC address not configured for chain ${chainId}`)
	}
	return address
}

/**
 * Default MOCK_USDC address (Sepolia)
 */
export const DEFAULT_MOCK_USDC_ADDRESS = MOCK_USDC_ADDRESSES[11155111]!

/**
 * Legacy: For backwards compatibility with existing .env usage
 * @deprecated Use getMockUSDCAddress(chainId) instead
 */
export const MOCK_USDC_ADDRESS = DEFAULT_MOCK_USDC_ADDRESS
