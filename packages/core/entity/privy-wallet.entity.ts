import { z } from "zod"

/**
 * Privy Embedded Wallet Entity
 * Represents a delegated embedded wallet controlled by Privy
 * Note: This schema accepts already-transformed camelCase data from privyLinkedAccountSchema
 */
export const privyEmbeddedWalletSchema = z.object({
	id: z.string().nullable().optional(),
	type: z.string(), // 'wallet'
	address: z.string(),
	chainId: z.string().optional(),
	chainType: z.string(), // 'ethereum' | 'solana' | etc.
	walletType: z.string().optional(),
	walletClientType: z.string().optional(), // 'privy'
	connectorType: z.string().optional(), // 'embedded'
	delegated: z.boolean().optional(), // Can be false initially
	createdAt: z.union([z.string(), z.number()]).optional(),
	verifiedAt: z.union([z.string(), z.number()]).optional(),
	imported: z.boolean().optional(),
	email: z.string().optional(),
	phoneNumber: z.string().optional(),
	// NOTE: add more fields if needed
})
export type PrivyEmbeddedWallet = z.infer<typeof privyEmbeddedWalletSchema>

/**
 * Privy Wallet Entity
 * General wallet entity (embedded or external)
 */
export const privyWalletSchema = z.object({
	id: z.string(),
	address: z.string(),
	chainType: z.string(),
	createdAt: z.union([z.string(), z.number()]).optional(),
	walletType: z.string().optional(),
	imported: z.boolean().optional(),
	delegated: z.boolean().optional(),
})
export type PrivyWallet = z.infer<typeof privyWalletSchema>
