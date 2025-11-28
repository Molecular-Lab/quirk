/**
 * Chain configuration for supported networks
 * Supports Sepolia and Base Sepolia testnets
 */

import { type Chain, sepolia, baseSepolia } from 'viem/chains'

export type MockTokenChainId = '11155111' | '84532' // Sepolia | Base Sepolia

export interface MockTokenChainConfig {
  chain: Chain
  rpcUrl?: string
}

/**
 * Get chain configuration for a given chain ID
 */
export function getMockTokenChainConfig(chainId: MockTokenChainId): MockTokenChainConfig {
  switch (chainId) {
    case '11155111': // Sepolia
      return {
        chain: sepolia,
        rpcUrl: process.env.SEPOLIA_RPC_URL,
      }
    case '84532': // Base Sepolia
      return {
        chain: baseSepolia,
        rpcUrl: process.env.BASE_SEPOLIA_RPC_URL,
      }
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}
