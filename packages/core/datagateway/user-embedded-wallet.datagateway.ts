import { UserEmbeddedWallet } from "../entity/old/user-embedded-wallet.entity"

/**
 * User Embedded Wallet DataGateway
 * Interface for database operations on user-embedded-wallet mapping
 *
 * This is a separate datagateway from Privy operations because:
 * 1. Privy SDK doesn't support efficient querying by custom metadata
 * 2. We need fast lookups by productId + userId or productId + walletAddress
 * 3. This maps ProductOwner's userId to Privy's userId and wallet addresses
 */
export interface IUserEmbeddedWalletDataGateway {
	/**
	 * Create a new user-wallet mapping
	 * @param params.id - Internal UUID (generated before Privy user creation, included in custom_user_id)
	 */
	create(params: {
		id: string // Internal UUID (same as in Privy's custom_user_id: productId:userId:uuid)
		productId: string
		userId: string
		privyUserId: string
		embeddedWalletAddress: string
		linkedWalletAddress?: string
		chainType: string
	}): Promise<UserEmbeddedWallet>

	/**
	 * Get wallet mapping by productId + userId
	 * Primary method for non-web3 apps
	 */
	getByUserId(productId: string, userId: string): Promise<UserEmbeddedWallet | null>

	/**
	 * Get wallet mapping by productId + embedded wallet address
	 */
	getByEmbeddedWalletAddress(productId: string, walletAddress: string): Promise<UserEmbeddedWallet | null>

	/**
	 * Get wallet mapping by productId + linked wallet address
	 * Used for web3 native apps where user connects with existing wallet
	 */
	getByLinkedWalletAddress(productId: string, walletAddress: string): Promise<UserEmbeddedWallet | null>

	/**
	 * Get wallet mapping by productId + any wallet address (embedded OR linked)
	 * Convenience method that checks both
	 */
	getByAnyWalletAddress(productId: string, walletAddress: string): Promise<UserEmbeddedWallet | null>

	/**
	 * Update linked wallet address for a user
	 * Used when web3 native user wants to link their existing wallet
	 */
	updateLinkedWalletAddress(productId: string, userId: string, linkedWalletAddress: string): Promise<UserEmbeddedWallet>

	/**
	 * List all wallet mappings for a product (with pagination)
	 */
	listByProduct(
		productId: string,
		options?: {
			limit?: number
			offset?: number
		},
	): Promise<{
		wallets: UserEmbeddedWallet[]
		total: number
	}>

	/**
	 * Delete a wallet mapping (rarely used, for cleanup)
	 */
	delete(productId: string, userId: string): Promise<void>
}
