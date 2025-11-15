import type {
	EmbeddedWalletUsecase,
	CreateEmbeddedWalletParams,
	GetWalletByUserIdParams,
	GetWalletByAddressParams,
	UserEmbeddedWallet,
	PrivyEmbeddedWallet,
	PrivyUser,
} from "@proxify/core"

/**
 * Embedded Wallet Service
 * Thin wrapper around EmbeddedWalletUsecase
 * Provides service-level operations for API layer
 */
export class EmbeddedWalletService {
	constructor(private readonly embeddedWalletUsecase: EmbeddedWalletUsecase) {}

	/**
	 * Create embedded wallet for a user
	 */
	async createEmbeddedWallet(params: CreateEmbeddedWalletParams): Promise<{
		userWallet: UserEmbeddedWallet
		wallet: PrivyEmbeddedWallet
	}> {
		return this.embeddedWalletUsecase.createEmbeddedWallet(params)
	}

	/**
	 * Get wallet by productId + userId
	 */
	async getWalletByUserId(params: GetWalletByUserIdParams): Promise<UserEmbeddedWallet> {
		return this.embeddedWalletUsecase.getEmbeddedWalletByUserId(params)
	}

	/**
	 * Get wallet by productId + walletAddress
	 */
	async getWalletByAddress(params: GetWalletByAddressParams): Promise<UserEmbeddedWallet> {
		return this.embeddedWalletUsecase.getEmbeddedWalletByAddress(params)
	}

	/**
	 * Link wallet address to user
	 */
	async linkWalletAddress(productId: string, userId: string, walletAddress: string): Promise<UserEmbeddedWallet> {
		return this.embeddedWalletUsecase.linkWalletAddress(productId, userId, walletAddress)
	}

	/**
	 * Get detailed wallet info
	 */
	async getDetailedWalletInfo(productId: string, userId: string): Promise<{
		userWallet: UserEmbeddedWallet
		privyUser: PrivyUser
		embeddedWallet: PrivyEmbeddedWallet
	}> {
		return this.embeddedWalletUsecase.getDetailedWalletInfo(productId, userId)
	}
}
