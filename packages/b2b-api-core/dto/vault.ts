/**
 * Vault DTOs - Zod schemas for validation
 */

import { z } from "zod";

// ============================================
// REQUEST DTOs
// ============================================

export const CreateVaultDto = z.object({
	clientId: z.string().uuid(),
	tokenSymbol: z.string(),
	tokenAddress: z.string(),
	chainId: z.number(),
	vaultName: z.string().optional(),
});

export const UpdateIndexDto = z.object({
	yieldAmount: z.string(),
});

export const MarkFundsAsStakedDto = z.object({
	amount: z.string(),
});

// ============================================
// RESPONSE DTOs
// ============================================

export const VaultDto = z.object({
	id: z.string(),
	clientId: z.string(),
	tokenSymbol: z.string(),
	tokenAddress: z.string(),
	chainId: z.number(),
	vaultIndex: z.string(),
	totalShares: z.string(),
	totalStakedBalance: z.string(),
	pendingDepositBalance: z.string().optional(),
	cumulativeYield: z.string().optional(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const UpdateIndexResponseDto = z.object({
	newIndex: z.string(),
	yieldPerShare: z.string(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateVaultDto = z.infer<typeof CreateVaultDto>;
export type UpdateIndexDto = z.infer<typeof UpdateIndexDto>;
export type MarkFundsAsStakedDto = z.infer<typeof MarkFundsAsStakedDto>;
export type VaultDto = z.infer<typeof VaultDto>;
export type UpdateIndexResponseDto = z.infer<typeof UpdateIndexResponseDto>;
