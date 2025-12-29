/**
 * Privy Wallet Service
 * 
 * Manages Privy server wallets for production DeFi execution.
 * Sandbox environment continues to use ViemClientManager.
 */

import { PrivyClient } from "@privy-io/node"
import type { Logger } from "winston"

export interface PrivyWalletConfig {
	appId: string
	appSecret: string
	authorizationKeyId?: string // For backend-owned wallets
}

export interface PrivySendTransactionParams {
	walletId: string
	chainId: number
	to: string
	data: string
	value?: string
}

export interface PrivyTransactionResult {
	hash: string
	walletId: string
}

export class PrivyWalletService {
	private client: PrivyClient
	private authKeyId?: string
	private logger: Logger

	constructor(config: PrivyWalletConfig, logger: Logger) {
		this.client = new PrivyClient({
			appId: config.appId,
			appSecret: config.appSecret,
		})
		this.authKeyId = config.authorizationKeyId
		this.logger = logger
	}

	/**
	 * Create a server wallet owned by the backend (not a user)
	 * Used for custodial DeFi operations
	 */
	async createServerWallet(): Promise<{ walletId: string; address: string }> {
		try {
			// Create wallet - owner configuration depends on Privy setup
			// For app-level wallets, no owner is needed
			const wallet = await this.client.wallets().create({
				chain_type: "ethereum",
			})

			this.logger.info("[PrivyWallet] Created server wallet", {
				walletId: wallet.id,
				address: wallet.address,
			})

			return {
				walletId: wallet.id,
				address: wallet.address,
			}
		} catch (error) {
			this.logger.error("[PrivyWallet] Failed to create wallet", { error })
			throw error
		}
	}

	/**
	 * Send a transaction from a Privy wallet
	 * Used for DeFi deposits/withdrawals in production
	 */
	async sendTransaction(params: PrivySendTransactionParams): Promise<PrivyTransactionResult> {
		const { walletId, chainId, to, data, value = "0x0" } = params

		try {
			// CAIP-2 format: eip155:<chainId>
			const caip2 = `eip155:${chainId}`

			const response = await this.client.wallets().ethereum().sendTransaction(walletId, {
				caip2,
				params: {
					transaction: {
						to,
						data,
						value,
						chain_id: chainId,
					},
				},
			})

			this.logger.info("[PrivyWallet] Transaction sent", {
				walletId,
				chainId,
				hash: response.hash,
			})

			return {
				hash: response.hash,
				walletId,
			}
		} catch (error) {
			this.logger.error("[PrivyWallet] Transaction failed", {
				walletId,
				chainId,
				error,
			})
			throw error
		}
	}

	/**
	 * Get wallet details by ID
	 */
	async getWallet(walletId: string): Promise<{ address: string; chainType: string }> {
		try {
			const wallet = await this.client.wallets().get(walletId)
			return {
				address: wallet.address,
				chainType: wallet.chain_type,
			}
		} catch (error) {
			this.logger.error("[PrivyWallet] Failed to get wallet", { walletId, error })
			throw error
		}
	}
}
