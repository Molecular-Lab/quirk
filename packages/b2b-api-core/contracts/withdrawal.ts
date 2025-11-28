/**
 * B2B Withdrawal Contract
 * Type-safe API definitions for withdrawal operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// End-user's bank account for direct fiat withdrawal
const EndUserBankAccountSchema = z.object({
	currency: z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"]),
	bank_name: z.string(),
	account_number: z.string(),
	account_name: z.string(),
	bank_details: z.record(z.any()).optional(), // JSONB: {swift_code, bank_code, branch_code, etc.}
});

const CreateWithdrawalSchema = z.object({
	clientId: z.string().optional(), // ✅ Optional - extracted from API key auth
	userId: z.string(),
	vaultId: z.string().optional(), // Optional for simplified architecture
	amount: z.string(),
	
	// ✅ NEW: Withdrawal method selection
	withdrawal_method: z.enum(["crypto", "fiat_to_client", "fiat_to_end_user"]).default("crypto"),
	
	// For crypto withdrawal
	destination_address: z.string().optional(), // Required for crypto
	chain: z.string().optional(), // e.g., "8453" for Base
	token_address: z.string().optional(),
	
	// For fiat withdrawal
	destination_currency: z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"]).optional(),
	
	// For fiat_to_end_user only
	end_user_bank_account: EndUserBankAccountSchema.optional(),
});

const CompleteWithdrawalSchema = z.object({
	transactionHash: z.string(),
	blockNumber: z.number().optional(),
});

const FailWithdrawalSchema = z.object({
	reason: z.string(),
});

const WithdrawalResponseSchema = z.object({
	id: z.string(),
	clientId: z.string(),
	userId: z.string(),
	vaultId: z.string().optional(),
	requestedAmount: z.string(),
	sharesBurned: z.string().optional(),
	finalAmount: z.string().optional(),
	status: z.enum(["PENDING", "QUEUED", "PROCESSING", "COMPLETED", "FAILED"]),
	
	// Withdrawal method info
	withdrawal_method: z.enum(["crypto", "fiat_to_client", "fiat_to_end_user"]).optional(),
	destination_currency: z.string().optional(),
	destination_address: z.string().optional(),
	
	// Transaction info
	transactionHash: z.string().optional(),
	offRampReference: z.string().optional(), // For fiat withdrawals
	
	createdAt: z.string(),
	completedAt: z.string().optional(),
});

const WithdrawalStatsSchema = z.object({
	totalWithdrawals: z.string(),
	completedWithdrawals: z.string(),
	totalAmount: z.string(),
	averageAmount: z.string(),
});

export const withdrawalContract = c.router({
	// Request withdrawal
	create: {
		method: "POST",
		path: "/withdrawals",
		responses: {
			201: WithdrawalResponseSchema,
			400: z.object({ error: z.string() }),
		},
		body: CreateWithdrawalSchema,
		summary: "Request a new withdrawal",
	},

	// Get withdrawal by ID
	getById: {
		method: "GET",
		path: "/withdrawals/:id",
		responses: {
			200: WithdrawalResponseSchema,
			404: z.object({ error: z.string() }),
		},
		summary: "Get withdrawal by ID",
	},

	// Complete withdrawal
	complete: {
		method: "POST",
		path: "/withdrawals/:id/complete",
		responses: {
			200: WithdrawalResponseSchema,
			400: z.object({ error: z.string() }),
		},
		body: CompleteWithdrawalSchema,
		summary: "Mark withdrawal as completed",
	},

	// Fail withdrawal
	fail: {
		method: "POST",
		path: "/withdrawals/:id/fail",
		responses: {
			200: WithdrawalResponseSchema,
			400: z.object({ error: z.string() }),
		},
		body: FailWithdrawalSchema,
		summary: "Mark withdrawal as failed and restore shares",
	},

	// List withdrawals by client
	listByClient: {
		method: "GET",
		path: "/withdrawals/client/:clientId",
		query: z.object({
			limit: z.string().optional(),
			offset: z.string().optional(),
			status: z.enum(["PENDING", "QUEUED", "COMPLETED", "FAILED"]).optional(),
		}),
		responses: {
			200: z.array(WithdrawalResponseSchema),
		},
		summary: "List withdrawals for a client",
	},

	// List withdrawals by user
	listByUser: {
		method: "GET",
		path: "/withdrawals/user/:userId",
		query: z.object({
			limit: z.string().optional(),
			offset: z.string().optional(),
		}),
		responses: {
			200: z.array(WithdrawalResponseSchema),
		},
		summary: "List withdrawals for a user",
	},

	// Get withdrawal stats
	getStats: {
		method: "GET",
		path: "/withdrawals/stats/:clientId",
		query: z.object({
			vaultId: z.string().optional(),
		}),
		responses: {
			200: WithdrawalStatsSchema,
		},
		summary: "Get withdrawal statistics for a client",
	},
});
