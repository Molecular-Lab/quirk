export { MOCK_USDC_ABI } from './abi'
export { MockUSDCReadClient } from './mock-usdc-read.client'
export { MockUSDCWriteClient, type MintResult } from './mock-usdc-write.client'

import type { Address } from 'viem'
import type { SupportedChainId } from '../config/chain'
import { MockUSDCReadClient } from './mock-usdc-read.client'
import { MockUSDCWriteClient } from './mock-usdc-write.client'

/**
 * Combined MockUSDC Client
 * Provides both read and write functionality
 */
export class MockUSDCClient {
  public readonly read: MockUSDCReadClient
  public readonly write: MockUSDCWriteClient

  constructor(chainId: SupportedChainId, contractAddress: Address) {
    this.read = new MockUSDCReadClient(chainId, contractAddress)
    this.write = new MockUSDCWriteClient(chainId, contractAddress)
  }
}
