/**
 * @proxify/mock-token-client
 *
 * MockUSDC/USDQ client for reading token stats and minting tokens
 * Follows the old-ref-contract-executor-client pattern with separate read/write clients
 *
 * Usage:
 * ```typescript
 * import { MockTokenViemClient, MockUSDCClient } from '@proxify/mock-token-client'
 *
 * // Initialize with minter private key
 * MockTokenViemClient.init('0x...')
 *
 * // Create client
 * const mockUSDC = new MockUSDCClient('11155111', '0x390518374c84c3abca46e9da0f9f0e6c5aee10e0')
 *
 * // Read token info
 * const info = await mockUSDC.read.getTokenInfo()
 * const balance = await mockUSDC.read.balanceOf('0x...')
 *
 * // Mint tokens
 * const result = await mockUSDC.write.mintToCustodial('0x...', '1000')
 * ```
 */

// Export config
export * from './config'

// Export clients
export * from './client'
