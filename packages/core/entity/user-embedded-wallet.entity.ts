import { z } from "zod"

/**
 * User Embedded Wallet Entity
 * Maps ProductOwner users to their embedded wallets
 *
 * This entity bridges:
 * 1. ProductOwner's userId (app-specific identifier)
 * 2. Privy's user ID (DID)
 * 3. Generated embedded wallet address
 * 4. Optional linked non-custodial wallet address (for web3 native users)
 */

export const userEmbeddedWalletSchema = z.object({
	id: z.string().uuid(),

	// Product identification
	productId: z.string(),

	// User identification (ProductOwner's app-specific user ID)
	userId: z.string(),

	// Privy identification
	privyUserId: z.string(),

	// Wallet addresses
	embeddedWalletAddress: z.string(), // Generated custodial wallet by Privy
	linkedWalletAddress: z.string().nullable().optional(), // User's existing non-custodial wallet (optional)

	// Blockchain info
	chainType: z.string(), // "ethereum", "solana", etc.

	// Timestamps
	createdAt: z.union([z.string(), z.date()]),
	updatedAt: z.union([z.string(), z.date()]),
})

export type UserEmbeddedWallet = z.infer<typeof userEmbeddedWalletSchema>

/**
 * Supported chain types for wallet creation
 */
export const chainTypeSchema = z.enum([
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
])

/**
 * Linked account types supported by Privy
 */
export const linkedAccountTypeSchema = z.enum([
	"email",
	"phone",
	"wallet",
	"custom_auth",
	"google_oauth",
	"twitter_oauth",
	"discord_oauth",
	"github_oauth",
	"tiktok_oauth",
	"linkedin_oauth",
	"spotify_oauth",
	"instagram_oauth",
	"apple_oauth",
	"farcaster",
	"telegram",
	"passkey",
	"cross_app",
	"smart_wallet",
])

/**
 * Linked account schema for wallet creation
 */
export const linkedAccountSchema = z.discriminatedUnion("type", [
	// Email account
	z.object({
		type: z.literal("email"),
		address: z.string().email(),
	}),
	// Phone account
	z.object({
		type: z.literal("phone"),
		phoneNumber: z.string(),
	}),
	// Wallet account (external, non-custodial)
	z.object({
		type: z.literal("wallet"),
		address: z.string(),
		chainType: chainTypeSchema,
	}),
	// Custom auth (for custom authentication systems)
	z.object({
		type: z.literal("custom_auth"),
		customUserId: z.string(),
	}),
	// OAuth providers
	z.object({
		type: z.enum([
			"google_oauth",
			"twitter_oauth",
			"discord_oauth",
			"github_oauth",
			"tiktok_oauth",
			"linkedin_oauth",
			"spotify_oauth",
			"instagram_oauth",
			"apple_oauth",
		]),
		subject: z.string(), // OAuth subject/user ID
	}),
	// Farcaster
	z.object({
		type: z.literal("farcaster"),
		fid: z.number(), // Farcaster ID
	}),
	// Telegram
	z.object({
		type: z.literal("telegram"),
		telegramUserId: z.string(),
	}),
	// Passkey
	z.object({
		type: z.literal("passkey"),
		// Passkey-specific fields (if needed)
	}),
	// Smart wallet
	z.object({
		type: z.literal("smart_wallet"),
		address: z.string(),
		chainType: chainTypeSchema,
	}),
	// Cross app
	z.object({
		type: z.literal("cross_app"),
		subject: z.string(),
	}),
])

export type LinkedAccount = z.infer<typeof linkedAccountSchema>

/**
 * Parameters for creating an embedded wallet
 */
export const createEmbeddedWalletParamsSchema = z.object({
	// Product & User identification
	productId: z.string().min(1, "productId is required"),
	userId: z.string().min(1, "userId is required"),

	// Blockchain config - support multiple chain types
	chainType: chainTypeSchema,

	// Optional: Link existing accounts (email, phone, wallet, OAuth, etc.)
	// If not provided, will create custom_auth account by default
	linkedAccounts: z.array(linkedAccountSchema).optional(),

	// Optional: Additional metadata
	metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateEmbeddedWalletParams = z.infer<typeof createEmbeddedWalletParamsSchema>

/**
 * Query parameters for getting embedded wallet by user ID
 */
export const getWalletByUserIdParamsSchema = z.object({
	productId: z.string(),
	userId: z.string(),
})

export type GetWalletByUserIdParams = z.infer<typeof getWalletByUserIdParamsSchema>

/**
 * Query parameters for getting embedded wallet by wallet address
 * Used for web3 native apps where user connects with existing wallet
 */
export const getWalletByAddressParamsSchema = z.object({
	productId: z.string(),
	walletAddress: z.string(), // Can be embedded OR linked wallet address
})

export type GetWalletByAddressParams = z.infer<typeof getWalletByAddressParamsSchema>
