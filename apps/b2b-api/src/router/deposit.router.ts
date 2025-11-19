/**
 * Deposit Router - B2B deposit endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import type { DepositService } from "../service/deposit.service";
import { mapDepositToDto, mapDepositsToDto } from "../mapper/deposit.mapper";
import { logger } from "../logger";

export function createDepositRouter(
	s: ReturnType<typeof initServer>,
	depositService: DepositService
) {
	return s.router(b2bContract.deposit, {
		// POST /deposits - Create deposit
		create: async ({ body }) => {
			try {
				// Parse vaultId from request body to extract chain and tokenAddress
				// Format: "base-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
				const [chain, tokenAddress] = body.vaultId.split("-");

				if (!chain || !tokenAddress) {
					return {
						status: 400 as const,
						body: { error: "Invalid vaultId format. Expected: chain-tokenAddress" },
					};
				}

				const deposit = await depositService.createDeposit({
					clientId: body.clientId,
					userId: body.userId,
					depositType: "external",
					fiatAmount: body.amount,
					fiatCurrency: "USD",
					cryptoCurrency: "USDC",
					gatewayProvider: body.transactionHash,
				});

				return {
					status: 201 as const,
					body: {
						...mapDepositToDto(deposit),
						vaultId: body.vaultId, // Add vaultId from request
					},
				};
			} catch (error) {
				logger.error("Failed to create deposit", { error, body });
				return {
					status: 400 as const,
					body: { error: "Failed to create deposit" },
				};
			}
		},

		// GET /deposits/:id - Get deposit by ID
		getById: async ({ params }) => {
			try {
				const deposit = await depositService.getDepositByOrderId(params.id);

				if (!deposit) {
					return {
						status: 404 as const,
						body: { error: "Deposit not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapDepositToDto(deposit),
				};
			} catch (error) {
				logger.error("Failed to get deposit", { error, depositId: params.id });
				return {
					status: 404 as const,
					body: { error: "Deposit not found" },
				};
			}
		},

		// POST /deposits/:id/complete
		complete: async ({ params, body }) => {
			try {
				// Parse vaultId from request body to extract chain and tokenAddress
				const [chain, tokenAddress] = body.vaultId.split("-");

				if (!chain || !tokenAddress) {
					return {
						status: 400 as const,
						body: { error: "Invalid vaultId format. Expected: chain-tokenAddress" },
					};
				}

				// Get deposit to retrieve amount
				const deposit = await depositService.getDepositByOrderId(params.id);
				if (!deposit) {
					return {
						status: 404 as const,
						body: { error: "Deposit not found" },
					};
				}

				await depositService.completeDeposit({
					orderId: params.id,
					chain,
					tokenAddress,
					tokenSymbol: "USDC",
					cryptoAmount: deposit.fiatAmount || "1000000",
					gatewayFee: "0",
					proxifyFee: "0",
					networkFee: "0",
					totalFees: "0",
				});

				const completedDeposit = await depositService.getDepositByOrderId(params.id);
				return {
					status: 200 as const,
					body: {
						...mapDepositToDto(completedDeposit!, body.vaultId),
						transactionHash: body.transactionHash,
					},
				};
			} catch (error) {
				logger.error("Failed to complete deposit", { error, depositId: params.id });
				return {
					status: 400 as const,
					body: { error: "Failed to complete deposit" },
				};
			}
		},

		// POST /deposits/:id/fail
		fail: async ({ params, body }) => {
			try {
				await depositService.failDeposit(params.id, body.reason);

				const deposit = await depositService.getDepositByOrderId(params.id);
				return {
					status: 200 as const,
					body: mapDepositToDto(deposit!),
				};
			} catch (error) {
				logger.error("Failed to fail deposit", { error, depositId: params.id });
				return {
					status: 400 as const,
					body: { error: "Failed to fail deposit" },
				};
			}
		},

		// GET /deposits/client/:clientId
		listByClient: async ({ params, query }) => {
			try {
				const limit = query?.limit ? parseInt(query.limit) : 50;
				const offset = query?.offset ? parseInt(query.offset) : 0;

				const deposits = await depositService.listDepositsByClient(params.clientId, limit, offset);
				return {
					status: 200 as const,
					body: mapDepositsToDto(deposits),
				};
			} catch (error) {
				logger.error("Failed to list deposits", { error, clientId: params.clientId });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// GET /deposits/user/:userId
		listByUser: async ({ params, query }) => {
			try {
				const limit = query?.limit ? parseInt(query.limit) : 50;

				// Note: API contract uses userId, but UseCase needs clientId + userId
				// This is a simplification - in production, fetch user first to get clientId
				const deposits = await depositService.listDepositsByUser("", params.userId, limit);
				return {
					status: 200 as const,
					body: mapDepositsToDto(deposits),
				};
			} catch (error) {
				logger.error("Failed to list user deposits", { error, userId: params.userId });
				return {
					status: 200 as const,
					body: [],
				};
			}
		},

		// GET /deposits/stats/:clientId
		getStats: async ({ params }) => {
			try {
				// Simplified stats - in production, calculate from deposits
				return {
					status: 200 as const,
					body: {
						totalDeposits: "0",
						completedDeposits: "0",
						totalAmount: "0",
						averageAmount: "0",
					},
				};
			} catch (error) {
				logger.error("Failed to get deposit stats", { error, clientId: params.clientId });
				return {
					status: 200 as const,
					body: {
						totalDeposits: "0",
						completedDeposits: "0",
						totalAmount: "0",
						averageAmount: "0",
					},
				};
			}
		},
	});
};
