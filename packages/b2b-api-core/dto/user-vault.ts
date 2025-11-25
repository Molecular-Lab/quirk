/**
 * User-Vault Balance DTOs - Zod schemas for validation
 */

import { z } from "zod";

// ============================================
// REQUEST DTOs
// ============================================

export const ListVaultUsersDto = z.object({
	limit: z.string().optional(),
	offset: z.string().optional(),
});

// ============================================
// RESPONSE DTOs
// ============================================

export const UserBalanceDto = z.object({
	userId: z.string(),
	vaultId: z.string(),
	shares: z.string(),
	entryIndex: z.string(),
	effectiveBalance: z.string(),
	yieldEarned: z.string(),
});

export const VaultUserDto = z.object({
	userId: z.string(),
	clientUserId: z.string(),
	email: z.string().nullable(),
	shares: z.string(),
	balance: z.string(),
	yieldEarned: z.string(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type ListVaultUsersDto = z.infer<typeof ListVaultUsersDto>;
export type UserBalanceDto = z.infer<typeof UserBalanceDto>;
export type VaultUserDto = z.infer<typeof VaultUserDto>;
