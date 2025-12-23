/**
 * B2B User-Vault Balance Contract
 * Type-safe API definitions for user vault balance operations
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

const UserBalanceResponseSchema = z.object({
	userId: z.string(),
	vaultId: z.string(),
	shares: z.string(),
	entryIndex: z.string(),
	effectiveBalance: z.string(),
	yieldEarned: z.string(),
});

const VaultUserSchema = z.object({
	userId: z.string(),
	clientUserId: z.string(),
	shares: z.string(),
	balance: z.string(),
	yieldEarned: z.string(),
});

export const userVaultContract = c.router({
	// Get user balance in vault (with environment support)
	getBalance: {
		method: "GET",
		path: "/balances/:userId/vault/:vaultId",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional().default("sandbox"),
		}),
		responses: {
			200: z.object({
				found: z.boolean(),
				data: UserBalanceResponseSchema.nullable(),
				message: z.string().optional(),
			}),
			500: z.object({ success: z.boolean(), error: z.string() }),
		},
		summary: "Get user balance in specific vault for given environment",
	},

	// List vault users (with environment support)
	listVaultUsers: {
		method: "GET",
		path: "/balances/vault/:vaultId/users",
		query: z.object({
			environment: z.enum(["sandbox", "production"]).optional().default("sandbox"),
			limit: z.string().optional(),
			offset: z.string().optional(),
		}),
		responses: {
			200: z.array(VaultUserSchema),
		},
		summary: "List all users in a vault with balances for given environment",
	},
});
