/**
 * B2B User Contract
 * Type-safe API definitions for end-user operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const CreateUserSchema = z.object({
	clientId: z.string(),
	clientUserId: z.string(),
	email: z.string().optional(),
	walletAddress: z.string().optional(),
});

const UserResponseSchema = z.object({
	id: z.string(),
	clientId: z.string(),
	clientUserId: z.string(),
	email: z.string().optional(),
	walletAddress: z.string().optional(),
	isActive: z.boolean(),
	createdAt: z.string(),
});

const UserPortfolioSchema = z.object({
	userId: z.string(),
	totalBalance: z.string(),
	totalYieldEarned: z.string(),
	vaults: z.array(z.object({
		vaultId: z.string(),
		tokenSymbol: z.string(),
		shares: z.string(),
		balance: z.string(),
		yieldEarned: z.string(),
	})),
});

export const userContract = c.router({
	// Create or get user
	getOrCreate: {
		method: "POST",
		path: "/users",
		responses: {
			200: UserResponseSchema,
			400: z.object({ error: z.string() }),
		},
		body: CreateUserSchema,
		summary: "Create new user or get existing",
	},

	// Get user by ID
	getById: {
		method: "GET",
		path: "/users/:id",
		responses: {
			200: UserResponseSchema,
			404: z.object({ error: z.string() }),
		},
		summary: "Get user by ID",
	},

	// Get user by client and client user ID
	getByClientUserId: {
		method: "GET",
		path: "/users/client/:clientId/user/:clientUserId",
		responses: {
			200: UserResponseSchema,
			404: z.object({ error: z.string() }),
		},
		summary: "Get user by client and client user ID",
	},

	// List users by client
	listByClient: {
		method: "GET",
		path: "/users/client/:clientId",
		query: z.object({
			limit: z.string().optional(),
			offset: z.string().optional(),
		}),
		responses: {
			200: z.array(UserResponseSchema),
		},
		summary: "List users for a client",
	},

	// Get user portfolio
	getPortfolio: {
		method: "GET",
		path: "/users/:userId/portfolio",
		responses: {
			200: UserPortfolioSchema,
			404: z.object({ error: z.string() }),
		},
		summary: "Get user portfolio across all vaults",
	},

	// Get user balance (simplified - filters by chain/token)
	getBalance: {
		method: "GET",
		path: "/users/:userId/balance",
		query: z.object({
			chain: z.string().optional(),
			token: z.string().optional(),
		}),
		responses: {
			200: z.object({
				balance: z.string(),
				currency: z.string(),
				yield_earned: z.string(),
				apy: z.string(),
				status: z.string(),
				shares: z.string(),
				entry_index: z.string(),
				current_index: z.string(),
			}),
			404: z.object({ error: z.string() }),
		},
		summary: "Get user balance for specific vault (filtered by chain/token)",
	},

	// List user vaults
	listVaults: {
		method: "GET",
		path: "/users/:userId/vaults",
		responses: {
			200: z.object({
				vaults: z.array(z.object({
					chain: z.string(),
					token: z.string(),
					balance: z.string(),
					yield_earned: z.string(),
					apy: z.string(),
					shares: z.string(),
					status: z.string(),
				})),
			}),
			404: z.object({ error: z.string() }),
		},
		summary: "List all vaults for a user across chains/tokens",
	},
});
