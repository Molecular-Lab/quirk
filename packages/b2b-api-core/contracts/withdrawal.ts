/**
 * B2B Withdrawal Contract
 * Type-safe API definitions for withdrawal operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const CreateWithdrawalSchema = z.object({
	clientId: z.string(),
	userId: z.string(),
	vaultId: z.string(),
	amount: z.string(),
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
	vaultId: z.string(),
	requestedAmount: z.string(),
	sharesBurned: z.string().optional(),
	finalAmount: z.string().optional(),
	status: z.enum(["PENDING", "QUEUED", "COMPLETED", "FAILED"]),
	transactionHash: z.string().optional(),
	createdAt: z.string(),
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
