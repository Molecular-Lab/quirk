import type { Address, Hex } from 'viem'
import { parseUnits, formatUnits } from 'viem'
import type { SupportedChainId } from '../config/chain'
import { MockTokenViemClient } from '../config/viem-client'
import { MOCK_USDC_ABI } from './abi'

export interface MintResult {
  success: boolean
  txHash?: Hex
  blockNumber?: bigint
  amountMinted?: string
  error?: string
}

/**
 * MockUSDC Write Client
 * For minting and burning tokens
 */
export class MockUSDCWriteClient {
  constructor(
    private readonly chainId: SupportedChainId,
    private readonly contractAddress: Address,
  ) {}

  /**
   * Mint tokens to an address
   * @param to - Recipient address
   * @param amount - Amount in USDC (e.g., "1000" for 1000 USDC)
   * @returns Mint result with transaction details
   */
  async mint(to: Address, amount: string): Promise<MintResult> {
    try {
      const { publicClient, walletClient } = MockTokenViemClient.getClients(this.chainId)

      // Convert amount to base units (6 decimals)
      const amountInBaseUnits = parseUnits(amount, 6)

      console.log('🏦 Minting MockUSDC')
      console.log('  To:', to)
      console.log('  Amount:', amount, 'USDC')
      console.log('  From:', walletClient.account.address)

      // Get balance before
      const balanceBefore = (await publicClient.readContract({
        address: this.contractAddress,
        abi: MOCK_USDC_ABI,
        functionName: 'balanceOf',
        args: [to],
      })) as bigint

      console.log('  Balance before:', formatUnits(balanceBefore, 6), 'USDC')

      // Mint tokens
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: MOCK_USDC_ABI,
        functionName: 'mint',
        args: [to, amountInBaseUnits],
      })

      console.log('  Transaction hash:', hash)
      console.log('  Waiting for confirmation...')

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status !== 'success') {
        return {
          success: false,
          error: 'Transaction failed',
        }
      }

      // Get balance after
      const balanceAfter = (await publicClient.readContract({
        address: this.contractAddress,
        abi: MOCK_USDC_ABI,
        functionName: 'balanceOf',
        args: [to],
      })) as bigint

      const minted = balanceAfter - balanceBefore

      console.log('  ✅ Minted:', formatUnits(minted, 6), 'USDC')
      console.log('  Balance after:', formatUnits(balanceAfter, 6), 'USDC')
      console.log('  Block number:', receipt.blockNumber)

      return {
        success: true,
        txHash: hash,
        blockNumber: receipt.blockNumber,
        amountMinted: formatUnits(minted, 6),
      }
    } catch (error) {
      console.error('[MockUSDCWriteClient] Mint error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Mint tokens to custodial wallet (alias for mint)
   */
  async mintToCustodial(custodialWallet: Address, amount: string): Promise<MintResult> {
    return this.mint(custodialWallet, amount)
  }

  /**
   * Burn tokens from the caller
   * @param amount - Amount in USDC to burn
   */
  async burn(amount: string): Promise<MintResult> {
    try {
      const { publicClient, walletClient } = MockTokenViemClient.getClients(this.chainId)

      const amountInBaseUnits = parseUnits(amount, 6)

      console.log('🔥 Burning MockUSDC')
      console.log('  Amount:', amount, 'USDC')
      console.log('  From:', walletClient.account.address)

      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: MOCK_USDC_ABI,
        functionName: 'burn',
        args: [amountInBaseUnits],
      })

      console.log('  Transaction hash:', hash)
      console.log('  Waiting for confirmation...')

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status !== 'success') {
        return {
          success: false,
          error: 'Transaction failed',
        }
      }

      console.log('  ✅ Burned:', amount, 'USDC')
      console.log('  Block number:', receipt.blockNumber)

      return {
        success: true,
        txHash: hash,
        blockNumber: receipt.blockNumber,
        amountMinted: amount,
      }
    } catch (error) {
      console.error('[MockUSDCWriteClient] Burn error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
