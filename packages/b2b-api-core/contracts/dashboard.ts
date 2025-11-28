/**
 * Dashboard Contract - Client dashboard metrics API
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const dashboardContract = c.router({
	getMetrics: {
		method: "GET",
		path: "/dashboard/metrics",
		responses: {
			200: z.object({
				success: z.boolean(),
				clientId: z.string(),
				fundStages: z.object({
					available: z.string(), // Stage 1: In custodial, ready to stake
					staked: z.string(), // Stage 2: Deployed to DeFi
					total: z.string(), // Total AUM
				}),
				revenue: z.object({
					total: z.string(), // Total yield earned
					clientShare: z.string(), // Client's portion
					endUserShare: z.string(), // End-users' portion
					clientSharePercent: z.string(), // % the client takes
				}),
				stats: z.object({
					totalUsers: z.number(),
					activeUsers: z.number(),
					apy: z.string(),
					vaults: z.number(),
				}),
				strategies: z.array(
					z.object({
						category: z.string(),
						target: z.number(),
						allocated: z.number(),
						isActive: z.boolean(),
					})
				),
			}),
			400: z.object({
				success: z.boolean(),
				error: z.string(),
			}),
			500: z.object({
				success: z.boolean(),
				error: z.string(),
			}),
		},
		query: z.object({
			clientId: z.string().optional(),
		}),
		summary: "Get client dashboard metrics (fund stages, revenue, strategies)",
	},
});
