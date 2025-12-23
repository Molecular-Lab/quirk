/**
 * Explorer Contract
 * Type-safe API definitions for transparency/explorer pages
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// Protocol allocation breakdown
const ProtocolAllocationSchema = z.object({
	protocol: z.string(), // "Aave", "Morpho", "Compound"
	allocation: z.number(), // Percentage (e.g., 70 for 70%)
	apy: z.string(), // Current APY for this protocol
	tvl: z.string(), // Total value in this protocol
});

// Public explorer response (client-level transparency)
const PublicExplorerSchema = z.object({
	clientId: z.string(),
	companyName: z.string(),

	// Overall statistics
	totalTvl: z.string(), // Total value locked across all end-users
	totalUsers: z.number(), // Number of active end-users
	overallApy: z.string(), // Weighted average APY

	// Strategy breakdown
	allocations: z.array(ProtocolAllocationSchema),

	// Growth data (last 30 days)
	growthData: z.array(z.object({
		date: z.string(), // ISO date
		tvl: z.string(),
		apy: z.string(),
	})).optional(),

	// Investment strategy type
	strategyType: z.string().optional(), // "Conservative", "Moderate", "Aggressive", "Custom"

	// Metadata
	lastUpdated: z.string(),
});

// Private explorer response (end-user specific report)
const PrivateExplorerSchema = z.object({
	userId: z.string(),
	clientUserId: z.string(),

	// Personal statistics
	totalBalance: z.string(),
	totalDeposited: z.string(),
	totalYieldEarned: z.string(),
	currentApy: z.string(),

	// Where user's money is allocated (same as client strategy)
	allocations: z.array(ProtocolAllocationSchema),

	// Personal growth history
	performanceHistory: z.array(z.object({
		date: z.string(),
		balance: z.string(),
		yieldEarned: z.string(),
	})).optional(),

	// Activity summary
	depositCount: z.number(),
	withdrawalCount: z.number(),
	firstDepositAt: z.string().nullable(),
	lastActivityAt: z.string().nullable(),

	// Status
	status: z.enum(['pending_onboarding', 'active', 'suspended']),
	accountAge: z.string(), // e.g., "14 days"

	// Metadata
	lastUpdated: z.string(),
});

export const explorerContract = c.router({
	// Public explorer - Anyone can see client's overall transparency
	getPublicExplorer: {
		method: "GET",
		path: "/explorer/:clientId",
		responses: {
			200: z.object({
				success: z.boolean(),
				data: PublicExplorerSchema,
			}),
			404: z.object({ error: z.string() }),
			500: z.object({ error: z.string() }),
		},
		summary: "Get public transparency data for a client",
	},

	// Private explorer - End-user's personal report
	getPrivateExplorer: {
		method: "GET",
		path: "/explorer/:clientId/:clientUserId",
		responses: {
			200: z.object({
				success: z.boolean(),
				data: PrivateExplorerSchema,
			}),
			404: z.object({ error: z.string() }),
			500: z.object({ error: z.string() }),
		},
		summary: "Get private report for a specific end-user",
	},
});
