/**
 * MockUSDC Client
 * Provides read and write operations for MockUSDC (USDQ) token contract
 */

import { type Address, type Hex, parseUnits, formatUnits } from 'viem'
import { type MockTokenChainId } from './chain.config'
import { ViemClientManager } from './viem-client'
import { MOCK_USDC_ABI } from './mock-usdc.abi'

export interface MockTokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
  owner: Address
  contractAddress: Address
  chainId: MockTokenChainId
}

export interface MockTokenBalanceInfo {
  raw: bigint
  formatted: string
  decimals: number
}

export interface MockTokenMintResult {
  success: boolean
  txHash?: Hex
  blockNumber?: bigint
  amountMinted?: string
  error?: string
}

/**
 * Read-only operations for MockUSDC token
 */
export class MockUSDCReadClient {
  constructor(
    private readonly chainId: MockTokenChainId,
    private readonly contractAddress: Address,
  ) {}

  private readContract<Result>(functionName: string, args?: unknown[]): Promise<Result> {
    const publicClient = ViemClientManager.getPublicClient(this.chainId)
    return publicClient.readContract({
      address: this.contractAddress,
      abi: MOCK_USDC_ABI,
      functionName: functionName as any,
      args: args as any,
    }) as Promise<Result>
  }

  async name(): Promise<string> {
    return this.readContract<string>('name')
  }

  async symbol(): Promise<string> {
    return this.readContract<string>('symbol')
  }

  async decimals(): Promise<number> {
    return this.readContract<number>('decimals')
  }

  async totalSupply(): Promise<bigint> {
    return this.readContract<bigint>('totalSupply')
  }

  async owner(): Promise<Address> {
    return this.readContract<Address>('owner')
  }

  async balanceOf(account: Address): Promise<bigint> {
    return this.readContract<bigint>('balanceOf', [account])
  }

  /**
   * Get all token info at once
   */
  async getTokenInfo(): Promise<MockTokenInfo> {
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
  async getBalanceFormatted(account: Address): Promise<MockTokenBalanceInfo> {
    const [balance, decimals] = await Promise.all([this.balanceOf(account), this.decimals()])

    return {
      raw: balance,
      formatted: formatUnits(balance, decimals),
      decimals,
    }
  }
}

/**
 * Write operations for MockUSDC token
 */
export class MockUSDCWriteClient {
  constructor(
    private readonly chainId: MockTokenChainId,
    private readonly contractAddress: Address,
  ) {}

  /**
   * Mint tokens to an address
   * Only callable by contract owner
   */
  async mint(to: Address, amount: string): Promise<MockTokenMintResult> {
    try {
      const { publicClient, walletClient } = ViemClientManager.getClients(this.chainId)

      // Parse amount to base units (6 decimals for USDC)
      const amountInBaseUnits = parseUnits(amount, 6)

      console.log('🔨 Minting MockUSDC:', {
        to,
        amount,
        amountInBaseUnits: amountInBaseUnits.toString(),
        chainId: this.chainId,
        contract: this.contractAddress,
      })

      // Execute mint transaction
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: MOCK_USDC_ABI,
        functionName: 'mint',
        args: [to, amountInBaseUnits],
      } as any)

      console.log('⏳ Waiting for transaction:', hash)

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log('✅ Mint successful:', {
        txHash: hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
      })

      return {
        success: true,
        txHash: hash,
        blockNumber: receipt.blockNumber,
        amountMinted: amount,
      }
    } catch (error) {
      console.error('❌ Mint failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Alias for mint() with more descriptive naming for custodial wallets
   */
  async mintToCustodial(custodialWallet: Address, amount: string): Promise<MockTokenMintResult> {
    return this.mint(custodialWallet, amount)
  }

  /**
   * Burn tokens from the caller
   */
  async burn(amount: string): Promise<MockTokenMintResult> {
    try {
      const { publicClient, walletClient } = ViemClientManager.getClients(this.chainId)

      // Parse amount to base units (6 decimals for USDC)
      const amountInBaseUnits = parseUnits(amount, 6)

      console.log('🔥 Burning MockUSDC:', {
        amount,
        amountInBaseUnits: amountInBaseUnits.toString(),
        chainId: this.chainId,
        contract: this.contractAddress,
      })

      // Execute burn transaction
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: MOCK_USDC_ABI,
        functionName: 'burn',
        args: [amountInBaseUnits],
      } as any)

      console.log('⏳ Waiting for transaction:', hash)

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log('✅ Burn successful:', {
        txHash: hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
      })

      return {
        success: true,
        txHash: hash,
        blockNumber: receipt.blockNumber,
        amountMinted: amount, // Keep same interface
      }
    } catch (error) {
      console.error('❌ Burn failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

/**
 * Combined MockUSDC Client
 * Provides both read and write functionality
 */
export class MockUSDCClient {
  public readonly read: MockUSDCReadClient
  public readonly write: MockUSDCWriteClient

  constructor(chainId: MockTokenChainId, contractAddress: Address) {
    this.read = new MockUSDCReadClient(chainId, contractAddress)
    this.write = new MockUSDCWriteClient(chainId, contractAddress)
  }
}
