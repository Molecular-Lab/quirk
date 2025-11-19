/**
 * Withdrawal DTOs - Zod schemas for validation
 */

import { z } from "zod";

// ============================================
// REQUEST DTOs
// ============================================

export const CreateWithdrawalDto = z.object({
	clientId: z.string().uuid(),
	userId: z.string().uuid(),
	vaultId: z.string().uuid(),
	amount: z.string(),
});

export const CompleteWithdrawalDto = z.object({
	transactionHash: z.string(),
	blockNumber: z.number().optional(),
});

export const FailWithdrawalDto = z.object({
	reason: z.string(),
});

export const ListWithdrawalsDto = z.object({
	limit: z.string().optional(),
	offset: z.string().optional(),
	status: z.enum(["PENDING", "QUEUED", "COMPLETED", "FAILED"]).optional(),
});

// ============================================
// RESPONSE DTOs
// ============================================

export const WithdrawalDto = z.object({
	id: z.string(),
	clientId: z.string(),
	userId: z.string(),
	vaultId: z.string(),
	requestedAmount: z.string(),
	sharesBurned: z.string().nullable(),
	finalAmount: z.string().nullable(),
	exitIndex: z.string().nullable(),
	status: z.enum(["PENDING", "QUEUED", "COMPLETED", "FAILED"]),
	transactionHash: z.string().nullable(),
	blockNumber: z.number().nullable(),
	failureReason: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const WithdrawalStatsDto = z.object({
	totalWithdrawals: z.string(),
	completedWithdrawals: z.string(),
	totalAmount: z.string(),
	averageAmount: z.string(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateWithdrawalDto = z.infer<typeof CreateWithdrawalDto>;
export type CompleteWithdrawalDto = z.infer<typeof CompleteWithdrawalDto>;
export type FailWithdrawalDto = z.infer<typeof FailWithdrawalDto>;
export type ListWithdrawalsDto = z.infer<typeof ListWithdrawalsDto>;
export type WithdrawalDto = z.infer<typeof WithdrawalDto>;
export type WithdrawalStatsDto = z.infer<typeof WithdrawalStatsDto>;
