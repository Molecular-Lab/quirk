/**
 * Withdrawal Router - B2B withdrawal endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import type { WithdrawalService } from "../service/withdrawal.service";
import { mapWithdrawalToDto, mapWithdrawalsToDto } from "../mapper/withdrawal.mapper";
import { logger } from "../logger";

export function createWithdrawalRouter(
	s: ReturnType<typeof initServer>,
	withdrawalService: WithdrawalService
) {
	return s.router(b2bContract.withdrawal, {
		// POST /withdrawals - Request withdrawal
		create: async ({ body, req }) => {
			try {
				// ✅ Extract clientId from authenticated request (set by API key middleware)
				const clientId = (req as any).client?.id;
				if (!clientId) {
					logger.error("Client ID missing from authenticated request");
					return {
						status: 401 as const,
						body: { error: "Authentication failed - client ID not found" },
					};
				}

				// Parse vaultId from request body to extract chain and tokenAddress
				// Format: "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
				// vaultId is optional in simplified architecture
				if (!body.vaultId) {
					return {
						status: 400 as const,
						body: { error: "vaultId is required" },
					};
				}

				const [chain, tokenAddress] = body.vaultId.split("-");

				if (!chain || !tokenAddress) {
					return {
						status: 400 as const,
						body: { error: "Invalid vaultId format. Expected: chain-tokenAddress" },
					};
				}

				logger.info("Requesting withdrawal", { clientId, userId: body.userId, vaultId: body.vaultId, amount: body.amount });

				const withdrawal = await withdrawalService.requestWithdrawal({
					clientId, // ✅ Use clientId from authenticated request
					userId: body.userId,
					chain: chain, // From vaultId
					tokenAddress: tokenAddress, // From vaultId
					amount: body.amount,
					orderId: `WTH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					destinationType: "client_balance",
				});

				return {
					status: 201 as const,
					body: {
						id: withdrawal.id,
						clientId: withdrawal.clientId,
						userId: withdrawal.userId,
						vaultId: body.vaultId, // Echo back from request
						requestedAmount: withdrawal.requestedAmount,
						sharesBurned: undefined, // TODO: Get from withdrawal response
						finalAmount: withdrawal.actualAmount || undefined,
						status: withdrawal.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: withdrawal.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to request withdrawal", { error, body });
				return {
					status: 400 as const,
					body: { error: "Failed to request withdrawal" },
				};
			}
		},

		// GET /withdrawals/:id
		getById: async ({ params }) => {
			try {
				const withdrawal = await withdrawalService.getWithdrawalByOrderId(params.id);

				if (!withdrawal) {
					return {
						status: 404 as const,
						body: { error: "Withdrawal not found" },
					};
				}

				// TODO: Get actual vaultId from user's vault record
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: {
						id: withdrawal.id,
						clientId: withdrawal.clientId,
						userId: withdrawal.userId,
						vaultId: vaultId,
						requestedAmount: withdrawal.requestedAmount,
						sharesBurned: undefined,
						finalAmount: withdrawal.actualAmount || undefined,
						status: withdrawal.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: withdrawal.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to get withdrawal", { error, withdrawalId: params.id });
				return {
					status: 404 as const,
					body: { error: "Withdrawal not found" },
				};
			}
		},		// POST /withdrawals/:id/complete
		complete: async ({ params, body }) => {
			try {
				await withdrawalService.completeWithdrawal(params.id);

				const withdrawal = await withdrawalService.getWithdrawalByOrderId(params.id);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: {
						id: withdrawal!.id,
						clientId: withdrawal!.clientId,
						userId: withdrawal!.userId,
						vaultId: vaultId,
						requestedAmount: withdrawal!.requestedAmount,
						sharesBurned: undefined,
						finalAmount: withdrawal!.actualAmount || undefined,
						status: withdrawal!.status.toUpperCase() as any,
						transactionHash: body.transactionHash,
						createdAt: withdrawal!.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to complete withdrawal", { error, withdrawalId: params.id });
				return {
					status: 400 as const,
					body: { error: "Failed to complete withdrawal" },
				};
			}
		},

		// POST /withdrawals/:id/fail
		fail: async ({ params, body }) => {
			try {
				await withdrawalService.failWithdrawal(params.id, body.reason);

				const withdrawal = await withdrawalService.getWithdrawalByOrderId(params.id);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: {
						id: withdrawal!.id,
						clientId: withdrawal!.clientId,
						userId: withdrawal!.userId,
						vaultId: vaultId,
						requestedAmount: withdrawal!.requestedAmount,
						sharesBurned: undefined,
						finalAmount: withdrawal!.actualAmount || undefined,
						status: withdrawal!.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: withdrawal!.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to fail withdrawal", { error, withdrawalId: params.id });
				return {
					status: 400 as const,
					body: { error: "Failed to fail withdrawal" },
				};
			}
		},

		// GET /withdrawals/client/:clientId
		listByClient: async ({ params, query }) => {
			try {
				const limit = query?.limit ? parseInt(query.limit) : 50;
				const offset = query?.offset ? parseInt(query.offset) : 0;

				const withdrawals = await withdrawalService.listWithdrawalsByClient(params.clientId, limit, offset);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: withdrawals.map(w => ({
						id: w.id,
						clientId: w.clientId,
						userId: w.userId,
						vaultId: vaultId,
						requestedAmount: w.requestedAmount,
						sharesBurned: undefined,
						finalAmount: w.actualAmount || undefined,
						status: w.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: w.createdAt.toISOString(),
					})),
				};
			} catch (error) {
				logger.error("Failed to list withdrawals", { error, clientId: params.clientId });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// GET /withdrawals/user/:userId
		listByUser: async ({ params, query }) => {
			try {
				const limit = query?.limit ? parseInt(query.limit) : 50;

				// Note: API contract uses userId, but UseCase needs clientId + userId
				// This is a simplification - in production, fetch user first to get clientId
				const withdrawals = await withdrawalService.listWithdrawalsByUser("", params.userId, limit);
				const vaultId = "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

				return {
					status: 200 as const,
					body: withdrawals.map(w => ({
						id: w.id,
						clientId: w.clientId,
						userId: w.userId,
						vaultId: vaultId,
						requestedAmount: w.requestedAmount,
						sharesBurned: undefined,
						finalAmount: w.actualAmount || undefined,
						status: w.status.toUpperCase() as any,
						transactionHash: undefined,
						createdAt: w.createdAt.toISOString(),
					})),
				};
			} catch (error) {
				logger.error("Failed to list user withdrawals", { error, userId: params.userId });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// GET /withdrawals/stats/:clientId
		getStats: async ({ params }) => {
			try {
				// Default to last 30 days
				const endDate = new Date();
				const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
				
				const stats = await withdrawalService.getWithdrawalStats(
					params.clientId,
					startDate,
					endDate
				);

				return {
					status: 200 as const,
					body: {
						totalWithdrawals: stats?.totalWithdrawals || "0",
						completedWithdrawals: stats?.completedWithdrawals || "0",
						totalAmount: stats?.totalVolume || "0",
						averageAmount: stats?.avgWithdrawalAmount || "0",
					},
				};
			} catch (error) {
				logger.error("Failed to get withdrawal stats", { error, clientId: params.clientId });
				return {
					status: 200 as const,
					body: {
						totalWithdrawals: "0",
						completedWithdrawals: "0",
						totalAmount: "0",
						averageAmount: "0",
					},
				};
			}
		},
	});
};
