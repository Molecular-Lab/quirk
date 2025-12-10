import { randomUUID } from "crypto"

import dayjs from "dayjs"
import VError from "verror"

import { IPrivyUserDataGateway } from "../../datagateway/privy-user.datagateway"
import { IUserEmbeddedWalletDataGateway } from "../../datagateway/user-embedded-wallet.datagateway"
import { PrivyUser } from "../../entity/old/privy-user.entity"
import { PrivyEmbeddedWallet, privyEmbeddedWalletSchema } from "../../entity/old/privy-wallet.entity"
import {
	CreateEmbeddedWalletParams,
	GetWalletByAddressParams,
	GetWalletByUserIdParams,
	UserEmbeddedWallet,
} from "../../entity/old/user-embedded-wallet.entity"
import { safeParse } from "../../utils/safe-parse"

/**
 * Embedded Wallet Usecase
 * Business logic for managing embedded wallets for ProductOwner users
 *
 * Handles two types of users:
 * 1. Non-Web3 users: Only have userId, we generate embedded wallet
 * 2. Web3 native users: Have existing non-custodial wallet, can link to embedded wallet
 */
export class EmbeddedWalletUsecase {
	constructor(
		private readonly privyUserRepository: IPrivyUserDataGateway,
		private readonly userWalletRepository: IUserEmbeddedWalletDataGateway,
	) {}

	/**
	 * Create embedded wallet for a product user
	 *
	 * Flow:
	 * 1. Check if user already exists in DB (fail if exists)
	 * 2. Create Privy user with embedded wallet and linked accounts
	 * 3. Store mapping in database
	 * 4. Return wallet info
	 *
	 * @param params.productId - ProductOwner's product ID
	 * @param params.userId - ProductOwner's app-specific user ID (e.g., "user123", "youtube-user-456")
	 * @param params.chainType - Blockchain type ("ethereum", "solana", etc.)
	 * @param params.linkedAccounts - Optional: Array of linked accounts (email, phone, wallet, OAuth, etc.)
	 * @param params.metadata - Optional: Additional metadata to store in Privy
	 *
	 * @returns User wallet info including embedded wallet address and Privy user ID
	 */
	public async createEmbeddedWallet(params: CreateEmbeddedWalletParams): Promise<{
		userWallet: UserEmbeddedWallet
		wallet: PrivyEmbeddedWallet
	}> {
		const { productId, userId, chainType, linkedAccounts, metadata = {} } = params

		// 1. Generate internal UUID FIRST (before creating Privy user)
		const internalUuid = randomUUID()

		// 2. Check if user already exists - fail if they do
		const existingWallet = await this.userWalletRepository.getByUserId(productId, userId)
		if (existingWallet) {
			throw new VError(
				{
					info: {
						event: "wallet_already_exists",
						productId,
						userId,
						existingPrivyUserId: existingWallet.privyUserId,
						existingWalletAddress: existingWallet.embeddedWalletAddress,
					},
				},
				"[EmbeddedWallet] User already has an embedded wallet. Use getEmbeddedWalletByUserId to retrieve it.",
			)
		}

		// 3. Build linked accounts array (custom_auth will include UUID)
		const privyLinkedAccounts: any[] = []

		if (linkedAccounts && linkedAccounts.length > 0) {
			// Use provided linked accounts
			for (const account of linkedAccounts) {
				switch (account.type) {
					case "email":
						privyLinkedAccounts.push({
							type: "email",
							address: account.address,
						})
						break
					case "phone":
						privyLinkedAccounts.push({
							type: "phone",
							phone_number: account.phoneNumber,
						})
						break
					case "wallet":
						privyLinkedAccounts.push({
							type: "wallet",
							address: account.address,
							chain_type: account.chainType,
						})
						break
					case "custom_auth":
						privyLinkedAccounts.push({
							type: "custom_auth",
							custom_user_id: account.customUserId,
						})
						break
					case "google_oauth":
					case "twitter_oauth":
					case "discord_oauth":
					case "github_oauth":
					case "tiktok_oauth":
					case "linkedin_oauth":
					case "spotify_oauth":
					case "instagram_oauth":
					case "apple_oauth":
						privyLinkedAccounts.push({
							type: account.type,
							subject: account.subject,
						})
						break
					case "farcaster":
						privyLinkedAccounts.push({
							type: "farcaster",
							fid: account.fid,
						})
						break
					case "telegram":
						privyLinkedAccounts.push({
							type: "telegram",
							telegram_user_id: account.telegramUserId,
						})
						break
					case "passkey":
						privyLinkedAccounts.push({
							type: "passkey",
						})
						break
					case "smart_wallet":
						privyLinkedAccounts.push({
							type: "smart_wallet",
							address: account.address,
							chain_type: account.chainType,
						})
						break
					case "cross_app":
						privyLinkedAccounts.push({
							type: "cross_app",
							subject: account.subject,
						})
						break
				}
			}
		} else {
			// Default: Create custom_auth account with productId:userId:uuid (includes UUID!)
			privyLinkedAccounts.push({
				type: "custom_auth",
				custom_user_id: `${productId}:${userId}:${internalUuid}`,
			})
		}

		// Store productId, userId, and UUID in Privy's custom metadata
		const customMetadata: Record<string, any> = {
			...metadata,
			productId,
			userId,
			internalUuid, // Store UUID in metadata for easy retrieval
			createdAt: dayjs().toISOString(),
		}

		// Create Privy user with embedded wallet
		const privyUser = await this.privyUserRepository.createUser({
			linkedAccounts: privyLinkedAccounts,
			wallets: [{ chainType }],
			customMetadata,
		})

		// Extract embedded wallet from Privy response
		const embeddedWallet = this.filterEmbeddedWallet(privyUser)

		// 4. Store mapping in database with SAME UUID as in Privy
		const userWallet = await this.userWalletRepository.create({
			id: internalUuid, // ← SAME UUID as in Privy's custom_user_id: productId:userId:uuid
			productId,
			userId,
			privyUserId: privyUser.id,
			embeddedWalletAddress: embeddedWallet.address,
			linkedWalletAddress: undefined, // Will be set if linking later
			chainType,
		})

		return {
			userWallet,
			wallet: embeddedWallet,
		}
	}

	/**
	 * Get embedded wallet by user ID
	 * HYBRID APPROACH: DB for UUID lookup, Privy for fresh wallet state
	 *
	 * Flow:
	 * 1. Query DB for UUID (fast, indexed)
	 * 2. Construct full custom_user_id: productId:userId:uuid
	 * 3. Query Privy with full custom_user_id for fresh state
	 *
	 * @param params.productId - ProductOwner's product ID
	 * @param params.userId - ProductOwner's app-specific user ID (external userId from API)
	 *
	 * @returns User wallet info with fresh data from Privy
	 */
	public async getEmbeddedWalletByUserId(params: GetWalletByUserIdParams): Promise<UserEmbeddedWallet> {
		const { productId, userId } = params

		// 1. Query database for UUID (fast lookup with index)
		const mapping = await this.userWalletRepository.getByUserId(productId, userId)

		if (!mapping) {
			throw new VError(
				{
					info: {
						event: "wallet_not_found",
						productId,
						userId,
					},
				},
				"[EmbeddedWallet] Wallet not found in database",
			)
		}

		// 2. Construct full custom_user_id with UUID
		const customUserId = `${productId}:${userId}:${mapping.id}`

		// 3. Query Privy directly for FRESH wallet state
		const privyUser = await this.privyUserRepository.getUserByCustomAuthId(customUserId)

		if (!privyUser) {
			throw new VError(
				{
					info: {
						event: "wallet_not_found_in_privy",
						productId,
						userId,
						customUserId,
						dbId: mapping.id,
					},
				},
				"[EmbeddedWallet] Wallet found in DB but not in Privy (data inconsistency)",
			)
		}

		// 4. Extract embedded wallet from fresh Privy data
		const embeddedWallet = this.filterEmbeddedWallet(privyUser)

		// 5. Extract metadata from Privy
		const metadata = privyUser.customMetadata || {}

		// 6. Return UserEmbeddedWallet with UUID from DB, fresh data from Privy
		return {
			id: mapping.id, // UUID from database (same as in Privy)
			productId: metadata.productId || productId,
			userId: metadata.userId || userId,
			privyUserId: privyUser.id,
			embeddedWalletAddress: embeddedWallet.address, // Fresh from Privy
			linkedWalletAddress: undefined, // TODO: Extract from linked accounts
			chainType: embeddedWallet.chainType, // Fresh from Privy
			createdAt: dayjs().toDate(),
			updatedAt: dayjs().toDate(), // Always fresh timestamp
		}
	}

	/**
	 * Get embedded wallet by wallet address
	 * HYBRID APPROACH: Query Privy for user, extract UUID from metadata
	 *
	 * Flow:
	 * 1. Query Privy by wallet address (get user with fresh state)
	 * 2. Extract UUID from Privy metadata
	 * 3. Return fresh wallet state with UUID
	 *
	 * @param params.productId - ProductOwner's product ID
	 * @param params.walletAddress - Wallet address (embedded OR linked)
	 *
	 * @returns User wallet info with fresh data from Privy
	 */
	public async getEmbeddedWalletByAddress(params: GetWalletByAddressParams): Promise<UserEmbeddedWallet> {
		const { productId, walletAddress } = params

		// 1. Query Privy directly by wallet address (already implemented!)
		const privyUser = await this.privyUserRepository.getUserByWalletAddress(walletAddress)

		if (!privyUser) {
			throw new VError(
				{
					info: {
						event: "wallet_not_found",
						productId,
						walletAddress,
					},
				},
				"[EmbeddedWallet] Wallet not found in Privy",
			)
		}

		// 2. Verify wallet belongs to correct product
		const metadata = privyUser.customMetadata || {}
		if (metadata.productId && metadata.productId !== productId) {
			throw new VError(
				{
					info: {
						event: "wallet_product_mismatch",
						productId,
						foundProductId: metadata.productId,
						walletAddress,
					},
				},
				"[EmbeddedWallet] Wallet belongs to different product",
			)
		}

		// 3. Get UUID from metadata (stored during wallet creation)
		const internalUuid = metadata.internalUuid

		if (!internalUuid) {
			throw new VError(
				{
					info: {
						event: "missing_internal_uuid",
						productId,
						walletAddress,
						privyUserId: privyUser.id,
					},
				},
				"[EmbeddedWallet] Wallet found but missing internal UUID in metadata",
			)
		}

		// 4. Extract embedded wallet from fresh Privy data
		const embeddedWallet = this.filterEmbeddedWallet(privyUser)

		// 5. Return UserEmbeddedWallet with UUID from metadata, fresh data from Privy
		return {
			id: internalUuid, // UUID from Privy metadata (same as in DB and custom_user_id)
			productId: metadata.productId || productId,
			userId: metadata.userId || "unknown",
			privyUserId: privyUser.id,
			embeddedWalletAddress: embeddedWallet.address, // Fresh from Privy
			linkedWalletAddress: undefined, // TODO: Extract linked wallet if exists
			chainType: embeddedWallet.chainType, // Fresh from Privy
			createdAt: dayjs(privyUser.createdAt || dayjs()).toDate(),
			updatedAt: dayjs().toDate(), // Always fresh timestamp
		}
	}

	/**
	 * Link existing non-custodial wallet to user's embedded wallet
	 * Used when web3 native user wants to connect their existing wallet
	 *
	 * @param productId - ProductOwner's product ID
	 * @param userId - ProductOwner's app-specific user ID
	 * @param walletAddress - User's existing non-custodial wallet address
	 *
	 * @returns Updated user wallet info
	 */
	public async linkWalletAddress(
		productId: string,
		userId: string,
		walletAddress: string,
	): Promise<UserEmbeddedWallet> {
		// 1. Get existing wallet mapping
		const existingWallet = await this.userWalletRepository.getByUserId(productId, userId)

		if (!existingWallet) {
			throw new VError(
				{
					info: {
						event: "wallet_not_found",
						productId,
						userId,
					},
				},
				"[EmbeddedWallet] User does not have an embedded wallet yet",
			)
		}

		// 2. Update database mapping
		const updatedWallet = await this.userWalletRepository.updateLinkedWalletAddress(productId, userId, walletAddress)

		// 3. TODO: Update Privy user's linked accounts
		// This would require adding the wallet to Privy's linked_accounts
		// For now, we only update our database

		return updatedWallet
	}

	/**
	 * Get detailed wallet info including Privy user details
	 *
	 * @param productId - ProductOwner's product ID
	 * @param userId - ProductOwner's app-specific user ID
	 *
	 * @returns Complete wallet and user info
	 */
	public async getDetailedWalletInfo(
		productId: string,
		userId: string,
	): Promise<{
		userWallet: UserEmbeddedWallet
		privyUser: PrivyUser
		embeddedWallet: PrivyEmbeddedWallet
	}> {
		// Get wallet mapping from DB
		const userWallet = await this.userWalletRepository.getByUserId(productId, userId)

		if (!userWallet) {
			throw new VError(
				{
					info: {
						event: "wallet_not_found",
						productId,
						userId,
					},
				},
				"[EmbeddedWallet] Wallet not found for user",
			)
		}

		// Get full Privy user details
		const privyUser = await this.privyUserRepository.getUserById(userWallet.privyUserId)

		if (!privyUser) {
			throw new VError(
				{
					info: {
						event: "privy_user_not_found",
						productId,
						userId,
						privyUserId: userWallet.privyUserId,
					},
				},
				"[EmbeddedWallet] Privy user not found",
			)
		}

		// Extract embedded wallet
		const embeddedWallet = this.filterEmbeddedWallet(privyUser)

		return {
			userWallet,
			privyUser,
			embeddedWallet,
		}
	}

	/**
	 * Extract delegated embedded wallet from user's linked accounts
	 * @private
	 */
	private filterEmbeddedWallet(user: PrivyUser): PrivyEmbeddedWallet {
		const wallet = user.linkedAccounts.find((account) => {
			return (
				account.type === "wallet" && account.walletClientType === "privy" && account.connectorType === "embedded"
				// Note: delegated can be false initially, will be true after first use
			)
		})

		if (wallet?.type !== "wallet") {
			throw new VError(
				{
					info: {
						userId: user.id,
						event: "embedded_wallet_not_found",
					},
				},
				"[EmbeddedWallet] Embedded wallet not found in user's linked accounts",
			)
		}

		const parsedWallet = safeParse(privyEmbeddedWalletSchema, wallet)
		if (!parsedWallet.success) {
			throw parsedWallet.error
		}

		return parsedWallet.result
	}
}
