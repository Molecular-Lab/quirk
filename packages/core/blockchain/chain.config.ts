/**
 * Chain configuration for supported networks
 * Supports both testnets (Sepolia, Base Sepolia) and mainnets (Ethereum, Base)
 */

import { type Chain, sepolia, baseSepolia, mainnet, base } from 'viem/chains'

export type MockTokenChainId = '11155111' | '84532' // Sepolia | Base Sepolia (testnets)
export type MainnetChainId = '1' | '8453' // Ethereum Mainnet | Base Mainnet
export type QuirkChainId = MockTokenChainId | MainnetChainId

export interface QuirkChainConfig {
  chain: Chain
  rpcUrl?: string
}

/**
 * Get chain configuration for testnet chains (mock token minting)
 */
export function getMockTokenChainConfig(chainId: MockTokenChainId): QuirkChainConfig {
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
      throw new Error(`Unsupported testnet chain ID: ${chainId}`)
  }
}

/**
 * Get chain configuration for mainnet chains (DeFi protocol queries)
 */
export function getMainnetChainConfig(chainId: MainnetChainId): QuirkChainConfig {
  switch (chainId) {
    case '1': // Ethereum Mainnet
      return {
        chain: mainnet,
        rpcUrl: process.env.ETHEREUM_RPC_URL || process.env.MAINNET_RPC_URL,
      }
    case '8453': // Base Mainnet
      return {
        chain: base,
        rpcUrl: process.env.BASE_RPC_URL || process.env.BASE_MAINNET_RPC_URL,
      }
    default:
      throw new Error(`Unsupported mainnet chain ID: ${chainId}`)
  }
}

/**
 * Get chain configuration for any supported chain
 */
export function getChainConfig(chainId: QuirkChainId): QuirkChainConfig {
  // Try mainnet first
  if (chainId === '1' || chainId === '8453') {
    return getMainnetChainConfig(chainId as MainnetChainId)
  }
  // Fall back to testnet
  return getMockTokenChainConfig(chainId as MockTokenChainId)
}
