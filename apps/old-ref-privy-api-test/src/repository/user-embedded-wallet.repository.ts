import type { IUserEmbeddedWalletDataGateway, UserEmbeddedWallet } from "@proxify/core"
import dayjs from "dayjs"

/**
 * Mock User Embedded Wallet Repository
 *
 * TODO: Replace this with a real PostgreSQL implementation using SQLC or Drizzle
 *
 * This is a temporary in-memory implementation for testing purposes.
 * In production, you should:
 * 1. Create PostgreSQL table (see @proxify/core/EMBEDDED_WALLET_ARCHITECTURE.md)
 * 2. Generate queries with SQLC
 * 3. Implement this interface with real database operations
 */
export class MockUserEmbeddedWalletRepository implements IUserEmbeddedWalletDataGateway {
	// In-memory storage (replace with PostgreSQL)
	private wallets: Map<string, UserEmbeddedWallet> = new Map()

	async create(params: {
		id: string // Internal UUID (same as in Privy's custom_user_id: productId:userId:uuid)
		productId: string
		userId: string
		privyUserId: string
		embeddedWalletAddress: string
		linkedWalletAddress?: string
		chainType: string
	}): Promise<UserEmbeddedWallet> {
		const wallet: UserEmbeddedWallet = {
			id: params.id, // Use provided UUID (same as in Privy)
			productId: params.productId,
			userId: params.userId,
			privyUserId: params.privyUserId,
			embeddedWalletAddress: params.embeddedWalletAddress,
			linkedWalletAddress: params.linkedWalletAddress || null,
			chainType: params.chainType,
			createdAt: dayjs().toISOString(),
			updatedAt: dayjs().toISOString(),
		}

		const key = `${params.productId}:${params.userId}`
		this.wallets.set(key, wallet)

		console.log(`[MockRepo] Created wallet mapping: ${key} with UUID: ${params.id}`)
		return wallet
	}

	async getByUserId(productId: string, userId: string): Promise<UserEmbeddedWallet | null> {
		const key = `${productId}:${userId}`
		const wallet = this.wallets.get(key) || null
		console.log(`[MockRepo] Get by userId: ${key} -> ${wallet ? "found" : "not found"}`)
		return wallet
	}

	async getByEmbeddedWalletAddress(productId: string, walletAddress: string): Promise<UserEmbeddedWallet | null> {
		const wallet = Array.from(this.wallets.values()).find(
			(w) => w.productId === productId && w.embeddedWalletAddress === walletAddress,
		)
		console.log(
			`[MockRepo] Get by embedded address: ${productId}:${walletAddress} -> ${wallet ? "found" : "not found"}`,
		)
		return wallet || null
	}

	async getByLinkedWalletAddress(productId: string, walletAddress: string): Promise<UserEmbeddedWallet | null> {
		const wallet = Array.from(this.wallets.values()).find(
			(w) => w.productId === productId && w.linkedWalletAddress === walletAddress,
		)
		console.log(`[MockRepo] Get by linked address: ${productId}:${walletAddress} -> ${wallet ? "found" : "not found"}`)
		return wallet || null
	}

	async getByAnyWalletAddress(productId: string, walletAddress: string): Promise<UserEmbeddedWallet | null> {
		// Try embedded first, then linked
		const byEmbedded = await this.getByEmbeddedWalletAddress(productId, walletAddress)
		if (byEmbedded) return byEmbedded

		return this.getByLinkedWalletAddress(productId, walletAddress)
	}

	async updateLinkedWalletAddress(
		productId: string,
		userId: string,
		linkedWalletAddress: string,
	): Promise<UserEmbeddedWallet> {
		const key = `${productId}:${userId}`
		const wallet = this.wallets.get(key)

		if (!wallet) {
			throw new Error(`Wallet not found: ${key}`)
		}

		wallet.linkedWalletAddress = linkedWalletAddress
		wallet.updatedAt = dayjs().toISOString()

		this.wallets.set(key, wallet)
		console.log(`[MockRepo] Updated linked wallet: ${key}`)

		return wallet
	}

	async listByProduct(
		productId: string,
		options?: {
			limit?: number
			offset?: number
		},
	): Promise<{
		wallets: UserEmbeddedWallet[]
		total: number
	}> {
		const allWallets = Array.from(this.wallets.values()).filter((w) => w.productId === productId)

		const limit = options?.limit || 50
		const offset = options?.offset || 0

		const wallets = allWallets.slice(offset, offset + limit)

		console.log(`[MockRepo] List by product: ${productId} -> ${wallets.length}/${allWallets.length}`)

		return {
			wallets,
			total: allWallets.length,
		}
	}

	async delete(productId: string, userId: string): Promise<void> {
		const key = `${productId}:${userId}`
		this.wallets.delete(key)
		console.log(`[MockRepo] Deleted wallet: ${key}`)
	}
}
