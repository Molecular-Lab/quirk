/**
 * Viem Client Manager
 * Static singleton for managing viem public and wallet clients across chains
 */

import {
	type Account,
	type Hex,
	type PublicClient,
	type WalletClient,
	createPublicClient,
	createWalletClient,
	http,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { type MockTokenChainId, getMockTokenChainConfig } from "./chain.config"

export class ViemClientManager {
	private static readonly publicClients = new Map<MockTokenChainId, PublicClient>()
	private static readonly walletClients = new Map<MockTokenChainId, WalletClient>()
	private static minterSigner: Account

	/**
	 * Initialize the viem client manager with a private key
	 * Must be called before using getWalletClient
	 */
	public static init(privateKey: Hex) {
		ViemClientManager.minterSigner = privateKeyToAccount(privateKey)
	}

	/**
	 * Get a public client for reading blockchain data
	 */
	public static getPublicClient(chainId: MockTokenChainId): PublicClient {
		if (!ViemClientManager.publicClients.has(chainId)) {
			const chainConfig = getMockTokenChainConfig(chainId)
			const client = createPublicClient({
				chain: chainConfig.chain,
				transport: http(chainConfig.rpcUrl),
			})
			ViemClientManager.publicClients.set(chainId, client)
		}
		return ViemClientManager.publicClients.get(chainId)!
	}

	/**
	 * Get a wallet client for writing transactions
	 * Requires init() to be called first
	 */
	public static getWalletClient(chainId: MockTokenChainId): WalletClient {
		if (!ViemClientManager.minterSigner) {
			throw new Error("ViemClientManager not initialized. Call init() first.")
		}

		if (!ViemClientManager.walletClients.has(chainId)) {
			const chainConfig = getMockTokenChainConfig(chainId)
			const client = createWalletClient({
				account: ViemClientManager.minterSigner,
				chain: chainConfig.chain,
				transport: http(chainConfig.rpcUrl),
			})
			ViemClientManager.walletClients.set(chainId, client)
		}
		return ViemClientManager.walletClients.get(chainId)!
	}

	/**
	 * Get both public and wallet clients
	 */
	public static getClients(chainId: MockTokenChainId) {
		return {
			publicClient: ViemClientManager.getPublicClient(chainId),
			walletClient: ViemClientManager.getWalletClient(chainId),
		}
	}
}
