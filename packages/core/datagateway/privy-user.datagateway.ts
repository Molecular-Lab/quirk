import { PrivyUser } from "../entity"

/**
 * Privy User Data Gateway Interface
 * Defines contract for user-related data operations
 */
export interface IPrivyUserDataGateway {
	/**
	 * Create a new user with linked accounts
	 * @param params User creation parameters
	 * @returns Created user object
	 */
	createUser(params: {
		linkedAccounts?: {
			type: string
			address?: string
			email?: string
			phoneNumber?: string
		}[]
		wallets?: { chainType: string }[]
		customMetadata?: Record<string, any>
	}): Promise<PrivyUser>

	/**
	 * Get user by Privy user ID (DID)
	 * @param userId Privy user DID (e.g., 'privy:did:...')
	 * @returns User object
	 */
	getUserById(userId: string): Promise<PrivyUser | null>

	/**
	 * Get user by wallet address
	 * Searches Privy's database for a user with the given wallet address
	 * @param walletAddress Wallet address (embedded or linked)
	 * @returns User object
	 */
	getUserByWalletAddress(walletAddress: string): Promise<PrivyUser | null>

	/**
	 * Get user by custom auth ID
	 * Searches Privy's database for a user with the given custom_user_id
	 * @param customUserId Custom user ID from custom_auth linked account (e.g., "productId:userId")
	 * @returns User object or null if not found
	 */
	getUserByCustomAuthId(customUserId: string): Promise<PrivyUser | null>

	/**
	 * List users with pagination
	 * @param options Pagination options
	 * @returns Paginated user list
	 */
	listUsers(options?: { limit?: number; cursor?: string }): Promise<{
		users: PrivyUser[]
		nextCursor?: string
	}>
}
