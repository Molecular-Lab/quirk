import { z } from "zod"

/**
 * Privy Linked Account Entity
 * Represents various authentication methods linked to a user
 * Note: Privy API returns snake_case fields, we transform to camelCase
 */
export const privyLinkedAccountSchema = z
	.object({
		id: z.string().nullable().optional(),
		type: z.string().optional(), // 'email' | 'phone' | 'wallet' | 'google' | etc.
		address: z.string().optional(),
		chain_id: z.string().optional(),
		chain_type: z.string().optional(), // 'ethereum' | 'solana' | etc.
		wallet_type: z.string().optional(),
		wallet_client_type: z.string().optional(),
		connector_type: z.string().optional(),
		delegated: z.boolean().optional(),
		email: z.string().optional(),
		phone_number: z.string().optional(),
		verified_at: z.union([z.string(), z.number()]).optional(),
		imported: z.boolean().optional(),
		// NOTE: add more fields if needed
	})
	.transform((data) => ({
		id: data.id,
		type: data.type,
		address: data.address,
		chainId: data.chain_id,
		chainType: data.chain_type,
		walletType: data.wallet_type,
		walletClientType: data.wallet_client_type,
		connectorType: data.connector_type,
		delegated: data.delegated,
		email: data.email,
		phoneNumber: data.phone_number,
		verifiedAt: data.verified_at,
		imported: data.imported,
	}))
export type PrivyLinkedAccount = z.infer<typeof privyLinkedAccountSchema>

/**
 * Privy User Entity
 * Complete user object from Privy API
 * Note: Privy API returns snake_case fields, we transform to camelCase
 */
export const privyUserSchema = z
	.object({
		id: z.string(), // Privy DID (e.g., 'privy:did:...')
		created_at: z.union([z.string(), z.number()]).optional(),
		linked_accounts: z.array(privyLinkedAccountSchema),
		custom_metadata: z.record(z.string(), z.any()).optional(),
		// NOTE: add more fields if needed
	})
	.transform((data) => ({
		id: data.id,
		createdAt: data.created_at,
		linkedAccounts: data.linked_accounts,
		customMetadata: data.custom_metadata,
	}))
export type PrivyUser = z.infer<typeof privyUserSchema>
