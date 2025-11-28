import {
  type Account,
  createPublicClient,
  createWalletClient,
  type Hex,
  http,
  type PublicClient,
  type WalletClient,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getChainConfig, type SupportedChainId } from './chain'

export class MockTokenViemClient {
  private static readonly publicClients: Map<SupportedChainId, PublicClient> = new Map()
  private static readonly walletClients: Map<SupportedChainId, WalletClient> = new Map()
  private static minterSigner: Account

  /**
   * Initialize the client with the minter private key
   * @param privateKey - Private key of the contract owner (minter)
   */
  public static init(privateKey: Hex) {
    MockTokenViemClient.minterSigner = privateKeyToAccount(privateKey)
  }

  /**
   * Get public client for reading blockchain data
   */
  public static getPublicClient(chainId: SupportedChainId): PublicClient {
    if (!MockTokenViemClient.publicClients.has(chainId)) {
      const chainConfig = getChainConfig(chainId)
      const client = createPublicClient({
        chain: chainConfig.chain,
        transport: http(chainConfig.rpcUrl),
      })
      MockTokenViemClient.publicClients.set(chainId, client)
    }

    return MockTokenViemClient.publicClients.get(chainId)!
  }

  /**
   * Get wallet client for writing transactions
   */
  public static getWalletClient(chainId: SupportedChainId): WalletClient {
    if (!MockTokenViemClient.minterSigner) {
      throw new Error('MockTokenViemClient not initialized. Call init() first.')
    }

    if (!MockTokenViemClient.walletClients.has(chainId)) {
      const chainConfig = getChainConfig(chainId)
      const client = createWalletClient({
        account: MockTokenViemClient.minterSigner,
        chain: chainConfig.chain,
        transport: http(chainConfig.rpcUrl),
      })
      MockTokenViemClient.walletClients.set(chainId, client)
    }

    return MockTokenViemClient.walletClients.get(chainId)!
  }

  /**
   * Get both clients together
   */
  public static getClients(chainId: SupportedChainId) {
    return {
      publicClient: MockTokenViemClient.getPublicClient(chainId),
      walletClient: MockTokenViemClient.getWalletClient(chainId),
    }
  }

  /**
   * Get the minter account address
   */
  public static getMinterAddress(): string {
    if (!MockTokenViemClient.minterSigner) {
      throw new Error('MockTokenViemClient not initialized. Call init() first.')
    }
    return MockTokenViemClient.minterSigner.address
  }
}
