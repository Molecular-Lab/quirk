import type { Address } from 'viem'
import type { SupportedChainId } from '../config/chain'
import { MockTokenViemClient } from '../config/viem-client'
import { MOCK_USDC_ABI } from './abi'

/**
 * MockUSDC Read Client
 * For reading token stats and balances
 */
export class MockUSDCReadClient {
  constructor(
    private readonly chainId: SupportedChainId,
    private readonly contractAddress: Address,
  ) {}

  private readContract<Result>(functionName: string, args?: unknown[]): Promise<Result> {
    const publicClient = MockTokenViemClient.getPublicClient(this.chainId)
    return publicClient.readContract({
      address: this.contractAddress,
      abi: MOCK_USDC_ABI,
      functionName: functionName as any,
      args: args as any,
    }) as Promise<Result>
  }

  /**
   * Get token name
   */
  async name(): Promise<string> {
    return this.readContract<string>('name')
  }

  /**
   * Get token symbol
   */
  async symbol(): Promise<string> {
    return this.readContract<string>('symbol')
  }

  /**
   * Get token decimals (always 6 for USDC)
   */
  async decimals(): Promise<number> {
    return this.readContract<number>('decimals')
  }

  /**
   * Get total supply
   */
  async totalSupply(): Promise<bigint> {
    return this.readContract<bigint>('totalSupply')
  }

  /**
   * Get contract owner address
   */
  async owner(): Promise<Address> {
    return this.readContract<Address>('owner')
  }

  /**
   * Get balance of an address
   */
  async balanceOf(account: Address): Promise<bigint> {
    return this.readContract<bigint>('balanceOf', [account])
  }

  /**
   * Get all token info at once
   */
  async getTokenInfo() {
    const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
      this.name(),
      this.symbol(),
      this.decimals(),
      this.totalSupply(),
      this.owner(),
    ])

    return {
      name,
      symbol,
      decimals,
      totalSupply,
      owner,
      contractAddress: this.contractAddress,
      chainId: this.chainId,
    }
  }

  /**
   * Get balance with formatted value
   */
  async getBalanceFormatted(account: Address) {
    const [balance, decimals] = await Promise.all([this.balanceOf(account), this.decimals()])

    return {
      raw: balance,
      formatted: Number(balance) / Math.pow(10, decimals),
      decimals,
    }
  }
}
