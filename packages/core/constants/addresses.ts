/**
 * Blockchain Contract Addresses
 *
 * Centralized constants for contract addresses across all chains.
 * Import these instead of using environment variables for consistency.
 *
 * @deprecated This file is being migrated to use NETWORK_CONFIG from networks.ts
 * For token addresses, use getTokenAddress() from networks.ts instead
 */

import type { SupportedChainId } from './chain'
import { NETWORK_CONFIG, getTokenAddress, type NetworkKey } from './networks'

/**
 * Mock USDC Token Addresses (for testing)
 * @deprecated Use NETWORK_CONFIG.eth_sepolia.token.mock_usdc.address instead
 */
export const MOCK_USDC_ADDRESSES: Partial<Record<SupportedChainId, `0x${string}`>> = {
	// Sepolia Testnet - migrated from NETWORK_CONFIG
	11155111: NETWORK_CONFIG.eth_sepolia.token.mock_usdc?.address as `0x${string}`,
	// Add other chains as needed
	// 84532: '0x...', // Base Sepolia
}

/**
 * Get MOCK_USDC address for a specific chain
 * @param chainId - The chain ID to get the address for
 * @returns The MOCK_USDC contract address
 * @throws Error if chain is not supported
 * @deprecated Use getTokenAddress('eth_sepolia', 'mock_usdc') instead
 */
export function getMockUSDCAddress(chainId: SupportedChainId): `0x${string}` {
	// Map chainId to network key
	const networkKey = chainId === 11155111 ? 'eth_sepolia' : 'eth_mainnet'
	const address = getTokenAddress(networkKey as NetworkKey, 'mock_usdc')

	if (!address) {
		throw new Error(`MOCK_USDC address not configured for chain ${chainId}`)
	}
	return address as `0x${string}`
}

/**
 * Default MOCK_USDC address (Sepolia)
 * @deprecated Use NETWORK_CONFIG.eth_sepolia.token.mock_usdc.address instead
 */
export const DEFAULT_MOCK_USDC_ADDRESS = NETWORK_CONFIG.eth_sepolia.token.mock_usdc?.address as `0x${string}`

/**
 * Legacy: For backwards compatibility with existing .env usage
 * @deprecated Use getMockUSDCAddress(chainId) or NETWORK_CONFIG instead
 */
export const MOCK_USDC_ADDRESS = DEFAULT_MOCK_USDC_ADDRESS
