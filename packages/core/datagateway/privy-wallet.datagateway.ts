import { PrivyEmbeddedWallet, PrivyUser, PrivyWallet } from "../entity"

/**
 * Privy Wallet Data Gateway Interface
 * Defines contract for wallet-related data operations
 */
export interface IPrivyWalletDataGateway {
	/**
	 * Get user by Privy user ID (DID)
	 * @param walletProviderUserId Privy user DID (e.g., 'privy:did:...')
	 * @returns Complete user object with linked accounts
	 */
	getUserByWalletProviderUserId(walletProviderUserId: string): Promise<PrivyUser>

	/**
	 * Get user by wallet address
	 * @param walletAddress Blockchain wallet address
	 * @returns Complete user object with linked accounts
	 */
	getUserByAddress(walletAddress: string): Promise<PrivyUser>

	/**
	 * Create a new wallet for a user
	 * @param userId Privy user DID
	 * @param chainType Chain type ('ethereum', 'solana', etc.)
	 * @returns Created wallet information
	 */
	createWallet(userId: string, chainType: string): Promise<PrivyWallet>

	/**
	 * Get wallet by wallet ID
	 * @param walletId Privy wallet ID
	 * @returns Wallet information
	 */
	getWalletById(walletId: string): Promise<PrivyWallet | null>

	/**
	 * Get all wallets for a user
	 * @param userId Privy user DID
	 * @returns Array of wallet information
	 */
	getWalletsByUserId(userId: string): Promise<PrivyWallet[]>
}
