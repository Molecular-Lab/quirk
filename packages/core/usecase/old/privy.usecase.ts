import dayjs from "dayjs"
import VError from "verror"

import { IPrivyUserDataGateway } from "../../datagateway/privy-user.datagateway"
import { IPrivyWalletDataGateway } from "../../datagateway/privy-wallet.datagateway"
import { PrivyUser } from "../../entity/old/privy-user.entity"
import { PrivyEmbeddedWallet, privyEmbeddedWalletSchema } from "../../entity/old/privy-wallet.entity"
import { safeParse } from "../../utils/safe-parse"

/**
 * Privy Usecase
 * Contains business logic for Privy operations
 * Following Clean Architecture pattern from Proxify
 */
export class PrivyUsecase {
	constructor(
		private readonly privyWalletRepository: IPrivyWalletDataGateway,
		private readonly privyUserRepository: IPrivyUserDataGateway,
	) {}

	/**
	 * Get embedded wallet by wallet provider user ID (Privy DID)
	 * @param walletProviderUserId Privy user DID
	 * @returns Embedded wallet
	 */
	public async getEmbeddedWalletByWalletProviderUserId(walletProviderUserId: string): Promise<PrivyEmbeddedWallet> {
		const user = await this.privyWalletRepository.getUserByWalletProviderUserId(walletProviderUserId)
		const wallet = this.filterEmbeddedWallet(user)
		return wallet
	}

	/**
	 * Get embedded wallet by wallet address
	 * @param walletAddress Wallet address
	 * @returns Embedded wallet
	 */
	public async getEmbeddedWalletByAddress(walletAddress: string): Promise<PrivyEmbeddedWallet> {
		const user = await this.privyWalletRepository.getUserByAddress(walletAddress)
		const wallet = this.filterEmbeddedWallet(user)
		return wallet
	}

	/**
	 * Create embedded wallet for product/client
	 * Main entry point for ProductOwner requests
	 * @param productId Product/Client ID (e.g., "ProductA")
	 * @param userId User ID (can be generated or provided by caller)
	 * @param chainType Chain type (e.g., "ethereum", "solana")
	 * @param metadata Optional metadata
	 * @returns Created user and embedded wallet
	 */
	public async createEmbeddedWalletForProduct(params: {
		productId: string
		userId: string
		chainType: string
		email?: string
		phone?: string
		metadata?: Record<string, any>
	}): Promise<{ user: PrivyUser; wallet: PrivyEmbeddedWallet }> {
		const { productId, userId, chainType, email, phone, metadata = {} } = params

		// Prepare linked accounts
		const linkedAccounts: { type: string; address?: string; email?: string; phoneNumber?: string }[] = []
		if (email) {
			linkedAccounts.push({ type: "email", email })
		}
		if (phone) {
			linkedAccounts.push({ type: "phone", phoneNumber: phone })
		}

		// Add productId and userId to custom metadata
		const customMetadata = {
			...metadata,
			productId,
			userId,
			createdAt: dayjs().toISOString(),
		}

		// Create user with wallet via Privy
		const user = await this.privyUserRepository.createUser({
			linkedAccounts,
			wallets: [{ chainType }],
			customMetadata,
		})

		// Extract embedded wallet
		const wallet = this.filterEmbeddedWallet(user)

		return { user, wallet }
	}

	/**
	 * Create a user with an embedded wallet (legacy method)
	 * @deprecated Use createEmbeddedWalletForProduct instead
	 */
	public async createUserWithEmbeddedWallet(params: {
		chainType: string
		email?: string
		phone?: string
		customMetadata?: Record<string, any>
	}): Promise<{ user: PrivyUser; wallet: PrivyEmbeddedWallet }> {
		const { chainType, email, phone, customMetadata } = params

		// Prepare linked accounts
		const linkedAccounts: { type: string; address?: string; email?: string; phoneNumber?: string }[] = []
		if (email) {
			linkedAccounts.push({ type: "email", email })
		}
		if (phone) {
			linkedAccounts.push({ type: "phone", phoneNumber: phone })
		}

		// Create user with wallet
		const user = await this.privyUserRepository.createUser({
			linkedAccounts,
			wallets: [{ chainType }],
			customMetadata,
		})

		// Extract embedded wallet
		const wallet = this.filterEmbeddedWallet(user)

		return { user, wallet }
	}

	/**
	 * Get user by ID
	 * @param userId Privy user DID
	 * @returns User information
	 */
	public async getUserById(userId: string): Promise<PrivyUser> {
		const user = await this.privyUserRepository.getUserById(userId)

		if (!user) {
			throw new VError(
				{
					info: {
						event: "user_not_found",
						userId,
					},
				},
				"[Privy] User not found",
			)
		}

		return user
	}

	/**
	 * Create a wallet for an existing user
	 * @param userId Privy user DID
	 * @param chainType Chain type
	 * @returns Created wallet
	 */
	public async createWalletForUser(userId: string, chainType: string) {
		return await this.privyWalletRepository.createWallet(userId, chainType)
	}

	/**
	 * Get all wallets for a user
	 * @param userId Privy user DID
	 * @returns Array of wallets
	 */
	public async getWalletsByUserId(userId: string) {
		return await this.privyWalletRepository.getWalletsByUserId(userId)
	}

	/**
	 * Extracts and validates the delegated embedded wallet from a Privy user's linked accounts
	 * @param user Privy user
	 * @returns Embedded wallet
	 * @private
	 */
	private filterEmbeddedWallet(user: PrivyUser): PrivyEmbeddedWallet {
		const wallet = user.linkedAccounts.find((account) => {
			return (
				account.type === "wallet" &&
				account.walletClientType === "privy" &&
				account.connectorType === "embedded" &&
				account.delegated === true
			)
		})

		if (wallet?.type !== "wallet") {
			throw new VError(
				{
					info: {
						user: user.id,
						event: "get_embedded_wallet_error",
					},
				},
				"[Privy] Embedded wallet not found or invalid",
			)
		}

		const parsedPrivyWallet = safeParse(privyEmbeddedWalletSchema, wallet)
		if (!parsedPrivyWallet.success) {
			throw parsedPrivyWallet.error
		}

		return parsedPrivyWallet.result
	}
}
