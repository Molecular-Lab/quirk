/**
 * User DTOs - Zod schemas for validation
 */

import { z } from "zod";

// ============================================
// REQUEST DTOs
// ============================================

export const CreateUserDto = z.object({
	clientId: z.string(), // ✅ Accept both productId (prod_xxx) and UUID
	clientUserId: z.string(),
	email: z.string().email().optional(),
	walletAddress: z.string().optional(),
});

export const ListUsersByClientDto = z.object({
	limit: z.string().optional(),
	offset: z.string().optional(),
});

// ============================================
// RESPONSE DTOs
// ============================================

export const UserDto = z.object({
	id: z.string(),
	clientId: z.string(),
	clientUserId: z.string(),
	email: z.string().nullable(),
	walletAddress: z.string().nullable(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string().optional(),
	vaults: z.array(z.object({
		vaultId: z.string(),
		chain: z.string(),
		tokenSymbol: z.string(),
		tokenAddress: z.string(),
		shares: z.string(),
		effectiveBalance: z.string(),
		yieldEarned: z.string(),
	})).optional(), // ✅ Added vaults array to response
});

export const VaultPositionDto = z.object({
	vaultId: z.string(),
	tokenSymbol: z.string(),
	shares: z.string(),
	balance: z.string(),
	yieldEarned: z.string(),
});

export const UserPortfolioDto = z.object({
	userId: z.string(),
	totalBalance: z.string(),
	totalYieldEarned: z.string(),
	vaults: z.array(VaultPositionDto),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateUserDto = z.infer<typeof CreateUserDto>;
export type ListUsersByClientDto = z.infer<typeof ListUsersByClientDto>;
export type UserDto = z.infer<typeof UserDto>;
export type VaultPositionDto = z.infer<typeof VaultPositionDto>;
export type UserPortfolioDto = z.infer<typeof UserPortfolioDto>;
