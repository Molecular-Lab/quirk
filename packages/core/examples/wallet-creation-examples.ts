/**
 * Wallet Creation Examples
 * Demonstrates various ways to create embedded wallets with different linked account types
 */

import dayjs from "dayjs"
import type { CreateEmbeddedWalletParams } from "../entity/user-embedded-wallet.entity"

/**
 * Example 1: Basic wallet with custom auth (default)
 */
export const basicWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-123",
	chainType: "ethereum",
	// No linkedAccounts provided - will auto-create custom_auth account
}

/**
 * Example 2: Wallet with email authentication
 */
export const emailWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-456",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "email",
			address: "user@example.com",
		},
	],
}

/**
 * Example 3: Wallet with phone authentication
 */
export const phoneWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-789",
	chainType: "solana",
	linkedAccounts: [
		{
			type: "phone",
			phoneNumber: "+1234567890",
		},
	],
}

/**
 * Example 4: Wallet with existing external wallet (Web3 native user)
 */
export const web3NativeWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-web3-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "wallet",
			address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
			chainType: "ethereum",
		},
	],
}

/**
 * Example 5: Wallet with Google OAuth
 */
export const googleOAuthWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-google-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "google_oauth",
			subject: "google-user-id-123456",
		},
	],
}

/**
 * Example 6: Wallet with Twitter OAuth
 */
export const twitterOAuthWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-twitter-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "twitter_oauth",
			subject: "twitter-user-id-123456",
		},
	],
}

/**
 * Example 7: Wallet with Farcaster
 */
export const farcasterWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-farcaster-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "farcaster",
			fid: 12345,
		},
	],
}

/**
 * Example 8: Wallet with Telegram
 */
export const telegramWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-telegram-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "telegram",
			telegramUserId: "telegram-123456789",
		},
	],
}

/**
 * Example 9: Multi-chain wallet (Solana)
 */
export const solanaWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-solana-1",
	chainType: "solana",
	linkedAccounts: [
		{
			type: "email",
			address: "solana-user@example.com",
		},
	],
}

/**
 * Example 10: Wallet with multiple linked accounts
 * User can authenticate via email, external wallet, or Google
 */
export const multiAccountWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-multi-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "email",
			address: "user@example.com",
		},
		{
			type: "wallet",
			address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
			chainType: "ethereum",
		},
		{
			type: "google_oauth",
			subject: "google-user-id-123456",
		},
	],
	metadata: {
		premium: true,
		signupSource: "web",
	},
}

/**
 * Example 11: YouTube credential system (from your use case)
 */
export const youtubeCredentialExample: CreateEmbeddedWalletParams = {
	productId: "youtube_credential",
	userId: "uuid_1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "custom_auth",
			customUserId: "youtube_credential:uuid_1",
		},
	],
	metadata: {
		platform: "youtube",
		createdAt: dayjs().toISOString(),
	},
}

/**
 * Example 12: Discord bot with custom auth
 */
export const discordBotExample: CreateEmbeddedWalletParams = {
	productId: "discord-bot",
	userId: "discord-user-123",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "discord_oauth",
			subject: "discord-user-id-123456",
		},
	],
	metadata: {
		guildId: "123456789",
		username: "user#1234",
	},
}

/**
 * Example 13: Gaming platform with email
 */
export const gamingPlatformExample: CreateEmbeddedWalletParams = {
	productId: "my-game",
	userId: "player-12345",
	chainType: "aptos", // Gaming on Aptos
	linkedAccounts: [
		{
			type: "email",
			address: "player@game.com",
		},
	],
	metadata: {
		playerLevel: 42,
		achievements: ["first-win", "legendary-item"],
	},
}

/**
 * Example 14: Smart wallet creation
 */
export const smartWalletExample: CreateEmbeddedWalletParams = {
	productId: "my-app",
	userId: "user-smart-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "smart_wallet",
			address: "0x1234567890123456789012345678901234567890",
			chainType: "ethereum",
		},
	],
}

/**
 * Example 15: Cross-app user migration
 */
export const crossAppExample: CreateEmbeddedWalletParams = {
	productId: "my-new-app",
	userId: "migrated-user-1",
	chainType: "ethereum",
	linkedAccounts: [
		{
			type: "cross_app",
			subject: "old-app-user-id-123",
		},
	],
	metadata: {
		migratedFrom: "old-app",
		migratedAt: dayjs().toISOString(),
	},
}

// Type-safe examples array
export const allExamples: CreateEmbeddedWalletParams[] = [
	basicWalletExample,
	emailWalletExample,
	phoneWalletExample,
	web3NativeWalletExample,
	googleOAuthWalletExample,
	twitterOAuthWalletExample,
	farcasterWalletExample,
	telegramWalletExample,
	solanaWalletExample,
	multiAccountWalletExample,
	youtubeCredentialExample,
	discordBotExample,
	gamingPlatformExample,
	smartWalletExample,
	crossAppExample,
]
