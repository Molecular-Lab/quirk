/**
 * B2B Deposit Contract
 * Type-safe API definitions for deposit operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const CreateDepositSchema = z.object({
	clientId: z.string(),
	userId: z.string(),
	vaultId: z.string(),
	amount: z.string(),
	transactionHash: z.string().optional(),
});

const CompleteDepositSchema = z.object({
	vaultId: z.string(),
	transactionHash: z.string(),
	blockNumber: z.number().optional(),
});

const FailDepositSchema = z.object({
	reason: z.string(),
});

const DepositResponseSchema = z.object({
	id: z.string(),
	clientId: z.string(),
	userId: z.string(),
	vaultId: z.string(),
	amount: z.string(),
	sharesMinted: z.string().optional(),
	status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
	transactionHash: z.string().optional(),
	createdAt: z.string(),
});

const DepositStatsSchema = z.object({
	totalDeposits: z.string(),
	completedDeposits: z.string(),
	totalAmount: z.string(),
	averageAmount: z.string(),
});

export const depositContract = c.router({
	// Create deposit
	create: {
		method: "POST",
		path: "/deposits",
		responses: {
			201: DepositResponseSchema,
			400: z.object({ error: z.string() }),
		},
		body: CreateDepositSchema,
		summary: "Create a new deposit transaction",
	},

	// Get deposit by ID
	getById: {
		method: "GET",
		path: "/deposits/:id",
		responses: {
			200: DepositResponseSchema,
			404: z.object({ error: z.string() }),
		},
		summary: "Get deposit by ID",
	},

	// Complete deposit
	complete: {
		method: "POST",
		path: "/deposits/:id/complete",
		responses: {
			200: DepositResponseSchema,
			400: z.object({ error: z.string() }),
		},
		body: CompleteDepositSchema,
		summary: "Mark deposit as completed and mint shares",
	},

	// Fail deposit
	fail: {
		method: "POST",
		path: "/deposits/:id/fail",
		responses: {
			200: DepositResponseSchema,
			400: z.object({ error: z.string() }),
		},
		body: FailDepositSchema,
		summary: "Mark deposit as failed",
	},

	// List deposits by client
	listByClient: {
		method: "GET",
		path: "/deposits/client/:clientId",
		query: z.object({
			limit: z.string().optional(),
			offset: z.string().optional(),
			status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
		}),
		responses: {
			200: z.array(DepositResponseSchema),
		},
		summary: "List deposits for a client",
	},

	// List deposits by user
	listByUser: {
		method: "GET",
		path: "/deposits/user/:userId",
		query: z.object({
			limit: z.string().optional(),
			offset: z.string().optional(),
		}),
		responses: {
			200: z.array(DepositResponseSchema),
		},
		summary: "List deposits for a user",
	},

	// Get deposit stats
	getStats: {
		method: "GET",
		path: "/deposits/stats/:clientId",
		query: z.object({
			vaultId: z.string().optional(),
		}),
		responses: {
			200: DepositStatsSchema,
		},
		summary: "Get deposit statistics for a client",
	},
});
