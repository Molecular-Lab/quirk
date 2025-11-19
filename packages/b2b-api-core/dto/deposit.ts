/**
 * Deposit DTOs - Zod schemas for validation
 */

import { z } from "zod";

// ============================================
// REQUEST DTOs
// ============================================

export const CreateDepositDto = z.object({
	clientId: z.string().uuid(),
	userId: z.string().uuid(),
	vaultId: z.string().uuid(),
	amount: z.string(),
	transactionHash: z.string().optional(),
});

export const CompleteDepositDto = z.object({
	transactionHash: z.string(),
	blockNumber: z.number().optional(),
});

export const FailDepositDto = z.object({
	reason: z.string(),
});

export const ListDepositsDto = z.object({
	limit: z.string().optional(),
	offset: z.string().optional(),
	status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
});

// ============================================
// RESPONSE DTOs
// ============================================

export const DepositDto = z.object({
	id: z.string(),
	clientId: z.string(),
	userId: z.string(),
	vaultId: z.string(),
	amount: z.string(),
	sharesMinted: z.string().nullable(),
	entryIndex: z.string().nullable(),
	status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
	transactionHash: z.string().nullable(),
	blockNumber: z.number().nullable(),
	failureReason: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const DepositStatsDto = z.object({
	totalDeposits: z.string(),
	completedDeposits: z.string(),
	totalAmount: z.string(),
	averageAmount: z.string(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateDepositDto = z.infer<typeof CreateDepositDto>;
export type CompleteDepositDto = z.infer<typeof CompleteDepositDto>;
export type FailDepositDto = z.infer<typeof FailDepositDto>;
export type ListDepositsDto = z.infer<typeof ListDepositsDto>;
export type DepositDto = z.infer<typeof DepositDto>;
export type DepositStatsDto = z.infer<typeof DepositStatsDto>;
