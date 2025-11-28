import { sepolia, baseSepolia, type Chain } from 'viem/chains'

export type SupportedChainId = '11155111' | '84532' // Sepolia | Base Sepolia

export interface ChainConfig {
  chain: Chain
  rpcUrl?: string
}

export function getChainConfig(chainId: SupportedChainId): ChainConfig {
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
