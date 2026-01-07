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

	// ✅ Fee deduction control (default: true)
	deductFees: z.boolean().optional().default(true),

	// ✅ Environment selection (default: sandbox)
	environment: z.enum(["sandbox", "production"]).optional().default("sandbox"),

	// ✅ Network selection (e.g., "sepolia", "mainnet")
	network: z.string().optional(),

	// ✅ Oracle address for withdrawals
	oracleAddress: z.string().optional(),
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
	environment: z.enum(["sandbox", "production"]).optional(),

	// Transaction info
	transactionHash: z.string().optional(),
	offRampReference: z.string().optional(), // For fiat withdrawals

	// ✅ Fee breakdown (optional - only present if yield was earned)
	feeBreakdown: z
		.object({
			totalYield: z.string(), // Total yield earned since deposit
			platformFee: z.string(), // Fee taken by Quirk platform
			clientFee: z.string(), // Fee taken by client
			userNetYield: z.string(), // Net yield received by user
			feesDeducted: z.boolean(), // Whether fees were deducted or deferred
			platformFeePercent: z.string(), // Platform fee % applied
			clientFeePercent: z.string(), // Client fee % applied
		})
		.optional(),

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

	// ⚠️ IMPORTANT: Specific routes MUST come before generic /:id routes
	// List pending withdrawals (Operations Dashboard)
	listPending: {
		method: "GET",
		path: "/withdrawals/pending",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional().describe("Filter by environment"),
		}),
		responses: {
			200: z.object({
				withdrawals: z.array(WithdrawalResponseSchema),
			}),
		},
		summary: "List pending withdrawals for Operations Dashboard",
	},

	// List withdrawals by client
	listByClient: {
		method: "GET",
		path: "/withdrawals/client/:clientId",
		query: z.object({
			limit: z.string().optional(),
			offset: z.string().optional(),
			status: z.enum(["PENDING", "QUEUED", "COMPLETED", "FAILED"]).optional(),
			environment: z.enum(["sandbox", "production"]).optional().describe("Filter by environment"),
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

	/**
	 * Batch complete withdrawals (Operations Dashboard)
	 * Completes multiple withdrawals and transfers USDC from custodial wallet back to oracle
	 */
	batchCompleteWithdrawals: {
		method: "POST",
		path: "/withdrawals/batch-complete",
		responses: {
			200: z.object({
				success: z.boolean(),
				status: z.string().optional(),
				environment: z.enum(["sandbox", "production"]).optional(),
				completedWithdrawals: z.array(z.object({
					withdrawalId: z.string(),
					status: z.string(),
					fiatAmount: z.string(),
					transferTxHash: z.string().optional(),
				})),
				failedWithdrawals: z.array(z.object({
					withdrawalId: z.string(),
					error: z.string(),
				})).optional(),
				totalProcessed: z.number(),
				totalAmount: z.string(),
				destinationCurrency: z.string(),
				transferTxHash: z.string().optional(),
				custodialBalance: z.string().optional(),
				custodialBalanceAfter: z.string().optional(),
				note: z.string().optional(),
			}),
			400: z.object({
				success: z.boolean(),
				error: z.string(),
				details: z.string().optional(),
			}),
			401: z.object({
				error: z.string(),
			}),
			500: z.object({
				success: z.boolean(),
				error: z.string(),
				details: z.string().optional(),
			}),
		},
		body: z.object({
			withdrawalIds: z.array(z.string()).min(1).describe("Array of withdrawal IDs to complete"),
			destinationCurrency: z.string().describe("Destination fiat currency (e.g., USD, SGD)"),
		}),
		summary: "Batch complete withdrawals (Operations Dashboard)",
	},

	// ⚠️ Generic routes with :id params MUST come LAST
	// Get withdrawal by ID
	getById: {
		method: "GET",
		path: "/withdrawals/:id",
		responses: {
			200: z.object({
				found: z.boolean(),
				data: WithdrawalResponseSchema.nullable(),
				message: z.string().optional(),
			}),
			500: z.object({ success: z.boolean(), error: z.string() }),
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
});
