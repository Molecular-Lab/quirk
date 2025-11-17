import type { Request, Response } from "express"
import dayjs from "dayjs"
import type { DIContainer } from "../di/container"
import { logger } from "../config/logger"

/**
 * Embedded Wallet Controller
 * Handles HTTP requests for embedded wallet operations
 */
export class EmbeddedWalletController {
	constructor(private readonly container: DIContainer) {}

	/**
	 * POST /api/v1/wallets/create
	 * Create embedded wallet for a user with dynamic linked accounts
	 *
	 * Body: {
	 *   productId: string                      - Your product/app identifier
	 *   userId: string                         - Your app-specific user identifier
	 *   chainType: ChainType                   - Blockchain for the embedded wallet
	 *   linkedAccounts?: Array<LinkedAccount>  - Optional: authentication methods
	 *   metadata?: Record<string, any>         - Optional: custom metadata
	 * }
	 *
	 * Supported chainType values:
	 *   'ethereum' | 'solana' | 'stellar' | 'cosmos' | 'sui' | 'tron' | 
	 *   'bitcoin-segwit' | 'near' | 'ton' | 'starknet' | 'movement' | 'aptos'
	 *
	 * LinkedAccount examples:
	 *   Email:        { type: 'email', address: 'user@example.com' }
	 *   Phone:        { type: 'phone', phoneNumber: '+1234567890' }
	 *   Wallet:       { type: 'wallet', address: '0x...', chainType: 'ethereum' }
	 *   Custom Auth:  { type: 'custom_auth', customUserId: 'my-user-123' }
	 *   Google:       { type: 'google_oauth', subject: 'google-user-id' }
	 *   Twitter:      { type: 'twitter_oauth', subject: 'twitter-user-id' }
	 *   Discord:      { type: 'discord_oauth', subject: 'discord-user-id' }
	 *   Farcaster:    { type: 'farcaster', fid: 12345 }
	 *   Telegram:     { type: 'telegram', telegramUserId: 'telegram-user-id' }
	 *
	 * Example request:
	 * {
	 *   "productId": "youtube_credential",
	 *   "userId": "uuid_2",
	 *   "chainType": "ethereum",           // ⚠️ Must be a blockchain type!
	 *   "linkedAccounts": [{
	 *     "type": "email",
	 *     "address": "user@example.com"
	 *   }]
	 * }
	 */
	async createWallet(req: Request, res: Response): Promise<void> {
		const { productId, userId, chainType, linkedAccounts, metadata } = req.body

		logger.info("🔨 [CreateWallet] Starting wallet creation", {
			productId,
			userId,
			chainType,
			linkedAccountsCount: linkedAccounts?.length || 0,
			linkedAccountTypes: linkedAccounts?.map((acc: any) => acc.type) || [],
		})

		try {
			// Basic validation
			if (!productId || !chainType) {
				logger.warn("⚠️  [CreateWallet] Validation failed - missing required fields", {
					productId: !!productId,
					userId: !!userId,
					chainType: !!chainType,
					hasLinkedAccounts: !!linkedAccounts?.length,
				})

				res.status(400).json({
					success: false,
					message: "Missing required fields: productId, chainType",
				})
				return
			}

			// If no userId, must have linkedAccounts to generate one
			if (!userId && (!linkedAccounts || linkedAccounts.length === 0)) {
				logger.warn("⚠️  [CreateWallet] No userId and no linkedAccounts provided", {
					productId,
				})

				res.status(400).json({
					success: false,
					message: "Must provide either 'userId' OR 'linkedAccounts' (to auto-generate userId from email/phone)",
				})
				return
			}

			// Auto-generate userId from linked account if not provided
			let finalUserId = userId
			if (!finalUserId && linkedAccounts && linkedAccounts.length > 0) {
				const firstAccount = linkedAccounts[0]
				switch (firstAccount.type) {
					case "email":
						finalUserId = `email:${firstAccount.address}`
						logger.info("🔄 [CreateWallet] Auto-generated userId from email", { finalUserId })
						break
					case "phone":
						finalUserId = `phone:${firstAccount.phoneNumber}`
						logger.info("🔄 [CreateWallet] Auto-generated userId from phone", { finalUserId })
						break
					case "wallet":
						finalUserId = `wallet:${firstAccount.address}`
						logger.info("🔄 [CreateWallet] Auto-generated userId from wallet", { finalUserId })
						break
					case "custom_auth":
						finalUserId = firstAccount.customUserId
						logger.info("🔄 [CreateWallet] Auto-generated userId from custom_auth", { finalUserId })
						break
					default:
						finalUserId = `${firstAccount.type}:${firstAccount.subject || firstAccount.fid || firstAccount.telegramUserId || "unknown"}`
						logger.info("🔄 [CreateWallet] Auto-generated userId from linked account", { finalUserId })
				}
			}

			// Validate chainType
			const validChainTypes = [
				"ethereum",
				"solana",
				"stellar",
				"cosmos",
				"sui",
				"tron",
				"bitcoin-segwit",
				"near",
				"ton",
				"starknet",
				"movement",
				"aptos",
			]
			if (!validChainTypes.includes(chainType)) {
				logger.warn("⚠️  [CreateWallet] Invalid chainType", {
					chainType,
					validChainTypes,
				})

				res.status(400).json({
					success: false,
					message: `Invalid chainType: ${chainType}. Must be one of: ${validChainTypes.join(", ")}`,
				})
				return
			}

			// Validate linkedAccounts structure if provided
			if (linkedAccounts) {
				if (!Array.isArray(linkedAccounts)) {
					logger.warn("⚠️  [CreateWallet] linkedAccounts must be an array", {
						linkedAccounts: typeof linkedAccounts,
					})

					res.status(400).json({
						success: false,
						message: "linkedAccounts must be an array",
					})
					return
				}

				// Validate each linked account has required fields
				for (const account of linkedAccounts) {
					if (!account.type) {
						logger.warn("⚠️  [CreateWallet] Linked account missing type", { account })

						res.status(400).json({
							success: false,
							message: "Each linked account must have a 'type' field",
						})
						return
					}

					// Type-specific validation
					switch (account.type) {
						case "email":
							if (!account.address) {
								res.status(400).json({
									success: false,
									message: "Email linked account requires 'address' field",
								})
								return
							}
							break
						case "phone":
							if (!account.phoneNumber) {
								res.status(400).json({
									success: false,
									message: "Phone linked account requires 'phoneNumber' field",
								})
								return
							}
							break
						case "wallet":
						case "smart_wallet":
							if (!account.address || !account.chainType) {
								res.status(400).json({
									success: false,
									message: `${account.type} linked account requires 'address' and 'chainType' fields`,
								})
								return
							}
							break
						case "custom_auth":
							if (!account.customUserId) {
								res.status(400).json({
									success: false,
									message: "custom_auth linked account requires 'customUserId' field",
								})
								return
							}
							break
						case "farcaster":
							if (!account.fid) {
								res.status(400).json({
									success: false,
									message: "farcaster linked account requires 'fid' field",
								})
								return
							}
							break
						case "telegram":
							if (!account.telegramUserId) {
								res.status(400).json({
									success: false,
									message: "telegram linked account requires 'telegramUserId' field",
								})
								return
							}
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
						case "cross_app":
							if (!account.subject) {
								res.status(400).json({
									success: false,
									message: `${account.type} linked account requires 'subject' field`,
								})
								return
							}
							break
					}
				}
			}

			const result = await this.container.embeddedWalletService.createEmbeddedWallet({
				productId,
				userId: finalUserId,
				chainType,
				linkedAccounts,
				metadata,
			})

			logger.info("✅ [CreateWallet] Wallet created successfully", {
				productId,
				userId: finalUserId,
				walletAddress: result.wallet.address,
				privyUserId: result.userWallet.privyUserId,
				chainType: result.userWallet.chainType,
			})

			res.status(201).json({
				success: true,
				data: {
					userId: result.userWallet.userId,
					walletAddress: result.wallet.address,
					linkedWalletAddress: result.userWallet.linkedWalletAddress,
					privyUserId: result.userWallet.privyUserId,
					chainType: result.userWallet.chainType,
					createdAt: result.userWallet.createdAt,
				},
			})
		} catch (error) {
			logger.error("❌ [CreateWallet] Failed to create wallet", {
				productId,
				userId,
				chainType,
				error: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
			})

			res.status(500).json({
				success: false,
				message: "Failed to create embedded wallet",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	/**
	 * GET /api/v1/wallets/user/:productId/:userId
	 * Get wallet by userId
	 */
	async getWalletByUserId(req: Request, res: Response): Promise<void> {
		const { productId, userId } = req.params

		logger.info("🔍 [GetWalletByUserId] Fetching wallet by userId", {
			productId,
			userId,
		})

		try {
			const wallet = await this.container.embeddedWalletService.getWalletByUserId({
				productId,
				userId,
			})

			logger.info("✅ [GetWalletByUserId] Wallet found", {
				productId,
				userId,
				walletAddress: wallet.embeddedWalletAddress,
				privyUserId: wallet.privyUserId,
			})

			res.json({
				success: true,
				data: {
					userId: wallet.userId,
					walletAddress: wallet.embeddedWalletAddress,
					linkedWalletAddress: wallet.linkedWalletAddress,
					privyUserId: wallet.privyUserId,
					chainType: wallet.chainType,
					createdAt: wallet.createdAt,
				},
			})
		} catch (error) {
			logger.error("❌ [GetWalletByUserId] Wallet not found", {
				productId,
				userId,
				error: error instanceof Error ? error.message : "Unknown error",
			})

			res.status(404).json({
				success: false,
				message: "Wallet not found",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	/**
	 * GET /api/v1/wallets/address/:productId/:walletAddress
	 * Get wallet by wallet address
	 */
	async getWalletByAddress(req: Request, res: Response): Promise<void> {
		const { productId, walletAddress } = req.params

		logger.info("🔍 [GetWalletByAddress] Fetching wallet by address", {
			productId,
			walletAddress,
		})

		try {
			const wallet = await this.container.embeddedWalletService.getWalletByAddress({
				productId,
				walletAddress,
			})

			logger.info("✅ [GetWalletByAddress] Wallet found", {
				productId,
				walletAddress,
				userId: wallet.userId,
				privyUserId: wallet.privyUserId,
			})

			res.json({
				success: true,
				data: {
					userId: wallet.userId,
					walletAddress: wallet.embeddedWalletAddress,
					linkedWalletAddress: wallet.linkedWalletAddress,
					privyUserId: wallet.privyUserId,
					chainType: wallet.chainType,
					createdAt: wallet.createdAt,
				},
			})
		} catch (error) {
			logger.error("❌ [GetWalletByAddress] Wallet not found", {
				productId,
				walletAddress,
				error: error instanceof Error ? error.message : "Unknown error",
			})

			res.status(404).json({
				success: false,
				message: "Wallet not found",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	/**
	 * PUT /api/v1/wallets/link
	 * Link wallet address to user
	 *
	 * Body: {
	 *   productId: string
	 *   userId: string
	 *   walletAddress: string
	 * }
	 */
	async linkWallet(req: Request, res: Response): Promise<void> {
		const { productId, userId, walletAddress } = req.body

		logger.info("🔗 [LinkWallet] Linking wallet address to user", {
			productId,
			userId,
			walletAddress,
		})

		try {
			// Validation
			if (!productId || !userId || !walletAddress) {
				logger.warn("⚠️  [LinkWallet] Validation failed - missing required fields", {
					productId: !!productId,
					userId: !!userId,
					walletAddress: !!walletAddress,
				})

				res.status(400).json({
					success: false,
					message: "Missing required fields: productId, userId, walletAddress",
				})
				return
			}

			const wallet = await this.container.embeddedWalletService.linkWalletAddress(productId, userId, walletAddress)

			logger.info("✅ [LinkWallet] Wallet linked successfully", {
				productId,
				userId,
				linkedWalletAddress: wallet.linkedWalletAddress,
			})

			res.json({
				success: true,
				data: {
					userId: wallet.userId,
					walletAddress: wallet.embeddedWalletAddress,
					linkedWalletAddress: wallet.linkedWalletAddress,
					privyUserId: wallet.privyUserId,
					chainType: wallet.chainType,
					updatedAt: wallet.updatedAt,
				},
			})
		} catch (error) {
			logger.error("❌ [LinkWallet] Failed to link wallet", {
				productId,
				userId,
				walletAddress,
				error: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : undefined,
			})

			res.status(500).json({
				success: false,
				message: "Failed to link wallet",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	/**
	 * GET /api/v1/wallets/details/:productId/:userId
	 * Get detailed wallet info including Privy user details
	 */
	async getWalletDetails(req: Request, res: Response): Promise<void> {
		const { productId, userId } = req.params

		logger.info("📊 [GetWalletDetails] Fetching detailed wallet info", {
			productId,
			userId,
		})

		try {
			const details = await this.container.embeddedWalletService.getDetailedWalletInfo(productId, userId)

			logger.info("✅ [GetWalletDetails] Detailed info retrieved", {
				productId,
				userId,
				walletAddress: details.embeddedWallet.address,
				linkedAccountsCount: details.privyUser.linkedAccounts.length,
			})

			res.json({
				success: true,
				data: {
					userWallet: {
						userId: details.userWallet.userId,
						walletAddress: details.userWallet.embeddedWalletAddress,
						linkedWalletAddress: details.userWallet.linkedWalletAddress,
						chainType: details.userWallet.chainType,
						createdAt: details.userWallet.createdAt,
					},
					privyUser: {
						id: details.privyUser.id,
						createdAt: details.privyUser.createdAt,
						linkedAccounts: details.privyUser.linkedAccounts,
						customMetadata: details.privyUser.customMetadata,
					},
					embeddedWallet: {
						address: details.embeddedWallet.address,
						chainType: details.embeddedWallet.chainType,
						delegated: details.embeddedWallet.delegated,
					},
				},
			})
		} catch (error) {
			logger.error("❌ [GetWalletDetails] Failed to retrieve wallet details", {
				productId,
				userId,
				error: error instanceof Error ? error.message : "Unknown error",
			})

			res.status(404).json({
				success: false,
				message: "Wallet details not found",
				error: error instanceof Error ? error.message : "Unknown error",
			})
		}
	}

	/**
	 * GET /health
	 * Health check endpoint
	 */
	async healthCheck(_req: Request, res: Response): Promise<void> {
		logger.info("💚 [HealthCheck] Health check requested")

		res.json({
			success: true,
			message: "Privy API Test is running!",
			timestamp: dayjs().toISOString(),
		})
	}
}
