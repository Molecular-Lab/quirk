import { PrivyClient } from "@privy-io/node"
import VError from "verror"
import { IPrivyUserDataGateway } from "../datagateway/privy-user.datagateway"
import { PrivyUser, privyUserSchema } from "../entity/privy-user.entity"
import { safeParse } from "../utils/safe-parse"

/**
 * Privy User Repository
 * Implements user data gateway using Privy SDK
 */
export class PrivyUserRepository implements IPrivyUserDataGateway {
	constructor(private readonly privyClient: PrivyClient) {}

	/**
	 * Create a new user with linked accounts and embedded wallets
	 */
	public async createUser(params: {
		linkedAccounts?: Array<{
			type: string
			address?: string
			email?: string
			phoneNumber?: string
			custom_user_id?: string
		}>
		wallets?: Array<{ chainType: string }>
		customMetadata?: Record<string, any>
	}): Promise<PrivyUser> {
		// Convert wallets to Privy SDK format
		const wallets: any[] = []
		if (params.wallets) {
			for (const wallet of params.wallets) {
				wallets.push({ chain_type: wallet.chainType })
			}
		}

		// Create user via Privy SDK
		// Note: Privy API requires linked_accounts to have at least 1 item OR be omitted entirely
		const createParams: any = {
			wallets: wallets, // Wallets array is required
			custom_metadata: params.customMetadata,
		}

		// Only add linked_accounts if we have at least one
		if (params.linkedAccounts && params.linkedAccounts.length > 0) {
			createParams.linked_accounts = params.linkedAccounts
		}

		const user = await this.privyClient.users().create(createParams)

		// Validate response with Zod
		const parsedUser = safeParse(privyUserSchema, user)
		if (!parsedUser.success) {
			throw new VError(
				{
					cause: parsedUser.error,
					info: {
						event: "parse_user_error",
						params,
					},
				},
				"[Privy] Failed to parse created user",
			)
		}

		return parsedUser.result
	}

	/**
	 * Get user by user ID
	 */
	public async getUserById(userId: string): Promise<PrivyUser | null> {
		try {
			const user = await this.privyClient.users().get(userId as any)

			if (!user) {
				return null
			}

			const parsedUser = safeParse(privyUserSchema, user)
			if (!parsedUser.success) {
				throw new VError(
					{
						cause: parsedUser.error,
						info: {
							event: "parse_user_error",
							userId,
						},
					},
					"[Privy] Failed to parse user",
				)
			}

			return parsedUser.result
		} catch (error) {
			// If user not found, return null
			if ((error as any)?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * Get user by wallet address
	 * Searches Privy's database for a user with the given wallet address
	 */
	public async getUserByWalletAddress(walletAddress: string): Promise<PrivyUser | null> {
		try {
			// Privy SDK method to get user by wallet address
			const user = await this.privyClient.users().getByWalletAddress({ address: walletAddress })

			if (!user) {
				return null
			}

			const parsedUser = safeParse(privyUserSchema, user)
			if (!parsedUser.success) {
				throw new VError(
					{
						cause: parsedUser.error,
						info: {
							event: "parse_user_error",
							walletAddress,
						},
					},
					"[Privy] Failed to parse user from wallet address",
				)
			}

			return parsedUser.result
		} catch (error) {
			// If user not found, return null
			if ((error as any)?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * Get user by custom auth ID
	 * Searches Privy's database for a user with the given custom_user_id
	 */
	public async getUserByCustomAuthId(customUserId: string): Promise<PrivyUser | null> {
		try {
			// Privy SDK method to get user by custom auth ID
			const user = await this.privyClient.users().getByCustomAuthID({ custom_user_id: customUserId })

			if (!user) {
				return null
			}

			const parsedUser = safeParse(privyUserSchema, user)
			if (!parsedUser.success) {
				throw new VError(
					{
						cause: parsedUser.error,
						info: {
							event: "parse_user_error",
							customUserId,
						},
					},
					"[Privy] Failed to parse user from custom auth ID",
				)
			}

			return parsedUser.result
		} catch (error) {
			// If user not found, return null
			if ((error as any)?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * List users with pagination
	 */
	public async listUsers(options?: {
		limit?: number
		cursor?: string
	}): Promise<{
		users: PrivyUser[]
		nextCursor?: string
	}> {
		const { limit = 50, cursor } = options || {}

		const result = await this.privyClient.users().list({
			limit,
			cursor,
		})

		const users: PrivyUser[] = []

		for (const userData of result.data) {
			const parsedUser = safeParse(privyUserSchema, userData)
			if (parsedUser.success) {
				users.push(parsedUser.result)
			}
		}

		return {
			users,
			nextCursor: result.next_cursor,
		}
	}
}
