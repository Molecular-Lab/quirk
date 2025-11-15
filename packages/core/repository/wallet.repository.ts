import { PrivyClient } from "@privy-io/node"
import VError from "verror"
import { IPrivyWalletDataGateway } from "../datagateway/privy-wallet.datagateway"
import { PrivyUser, privyUserSchema } from "../entity/privy-user.entity"
import { PrivyWallet, privyWalletSchema } from "../entity/privy-wallet.entity"
import { safeParse } from "../utils/safe-parse"

/**
 * Privy Wallet Repository
 * Implements wallet data gateway using Privy SDK
 */
export class PrivyWalletRepository implements IPrivyWalletDataGateway {
	constructor(private readonly privyClient: PrivyClient) {}

	/**
	 * Get user by wallet provider user ID (Privy DID)
	 */
	public async getUserByWalletProviderUserId(walletProviderUserId: string): Promise<PrivyUser> {
		const user = await this.privyClient.users().get(walletProviderUserId as any)

		const parsedPrivyUser = safeParse(privyUserSchema, user)
		if (!parsedPrivyUser.success) {
			throw new VError(
				{
					cause: parsedPrivyUser.error,
					info: {
						event: "parse_user_error",
						walletProviderUserId,
					},
				},
				"[Privy] Failed to parse user",
			)
		}

		return parsedPrivyUser.result
	}

	/**
	 * Get user by wallet address
	 */
	public async getUserByAddress(walletAddress: string): Promise<PrivyUser> {
		// Note: Privy SDK doesn't provide a direct getByAddress method on wallets()
		// This is a limitation we need to work around by iterating through users
		// or using a caching mechanism. For now, we throw an error.
		// TODO: Implement proper wallet address lookup when Privy SDK supports it
		// or implement a caching layer
		throw new VError(
			{
				info: {
					event: "method_not_implemented",
					walletAddress,
					reason: "Privy SDK does not provide direct wallet address lookup",
				},
			},
			"[Privy] getUserByAddress not yet implemented - requires custom indexing solution",
		)
	}

	/**
	 * Create a new wallet for a user
	 */
	public async createWallet(userId: string, chainType: string): Promise<PrivyWallet> {
		const { id, address, chain_type, created_at } = await this.privyClient.wallets().create({
			chain_type: chainType as any,
			owner: { user_id: userId },
		})

		const wallet = {
			id,
			address,
			chainType: chain_type,
			createdAt: created_at,
		}

		const parsedWallet = safeParse(privyWalletSchema, wallet)
		if (!parsedWallet.success) {
			throw new VError(
				{
					cause: parsedWallet.error,
					info: {
						event: "parse_wallet_error",
						userId,
						chainType,
					},
				},
				"[Privy] Failed to parse created wallet",
			)
		}

		return parsedWallet.result
	}

	/**
	 * Get wallet by wallet ID
	 */
	public async getWalletById(walletId: string): Promise<PrivyWallet | null> {
		try {
			const wallet = await this.privyClient.wallets().get(walletId)

			if (!wallet) {
				return null
			}

			const walletData = {
				id: wallet.id,
				address: wallet.address,
				chainType: wallet.chain_type,
				createdAt: wallet.created_at,
			}

			const parsedWallet = safeParse(privyWalletSchema, walletData)
			if (!parsedWallet.success) {
				throw new VError(
					{
						cause: parsedWallet.error,
						info: {
							event: "parse_wallet_error",
							walletId,
						},
					},
					"[Privy] Failed to parse wallet",
				)
			}

			return parsedWallet.result
		} catch (error) {
			// If wallet not found, return null
			if ((error as any)?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * Get all wallets for a user
	 */
	public async getWalletsByUserId(userId: string): Promise<PrivyWallet[]> {
		const user = await this.getUserByWalletProviderUserId(userId)

		const wallets: PrivyWallet[] = []

		for (const account of user.linkedAccounts) {
			if (account.type === "wallet" && account.address) {
				const wallet = {
					id: account.id || account.address,
					address: account.address,
					chainType: account.chainType || "ethereum",
					walletType: account.walletType,
					imported: account.imported,
					delegated: account.delegated,
				}

				const parsedWallet = safeParse(privyWalletSchema, wallet)
				if (parsedWallet.success) {
					wallets.push(parsedWallet.result)
				}
			}
		}

		return wallets
	}
}
