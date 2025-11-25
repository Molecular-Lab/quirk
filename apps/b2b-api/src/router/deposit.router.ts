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
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// FLOW 4A: FIAT DEPOSIT ENDPOINTS
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

		// POST /deposits/fiat - Create fiat deposit
		createFiatDeposit: async ({ body, req }) => {
			try {
				logger.info("Creating fiat deposit", { body });

				// ✅ Extract clientId from authenticated request
				const clientId = (req as any).client?.id;
				if (!clientId) {
					logger.error("Client ID missing from authenticated request");
					return {
						status: 401 as const,
						body: {
							success: false,
							error: "Authentication failed - client ID not found",
						},
					};
				}

				// ✅ INTERNAL ROUTING: Proxify decides which on-ramp to use based on currency
				let onRampProvider = "proxify_gateway";

				// Smart routing based on currency
				if (body.currency === "THB") {
					onRampProvider = "scbx"; // Thai baht → SCBX partnership
				} else if (body.currency === "USD" || body.currency === "SGD") {
					onRampProvider = "circle"; // USD/SGD → Circle partnership
				} else {
					onRampProvider = "proxify_gateway"; // Others → Our own gateway
				}

				logger.info("Routing deposit to on-ramp provider", {
					currency: body.currency,
					amount: body.amount,
					selectedProvider: onRampProvider,
				});

				const deposit = await depositService.createDeposit({
					clientId,
					userId: body.userId,
					depositType: "external",
					fiatAmount: body.amount,
					fiatCurrency: body.currency,
					cryptoCurrency: body.tokenSymbol,
					gatewayProvider: onRampProvider,
				});

				// ✅ GENERATE PAYMENT INSTRUCTIONS (Region-specific)
				// Flow: Client transfers to our bank → Bank webhook → We convert → Complete deposit
				const paymentInstructions: any = {
					method: "bank_transfer",
					amount: body.amount,
					currency: body.currency,
					reference: deposit.orderId,
				};

				// Region-specific bank account routing
				if (body.currency === "THB") {
					// ✅ Thai Baht → SCBX/Thai bank partnership
					paymentInstructions.bankName = "Siam Commercial Bank (SCBX)";
					paymentInstructions.accountNumber = "XXX-X-XXXXX-X";
					paymentInstructions.accountName = "Proxify Gateway (Thailand) Co., Ltd.";
					paymentInstructions.swiftCode = "SICOTHBK";
					paymentInstructions.promptPayId = "0123456789"; // PromptPay QR option
					paymentInstructions.instructions = `Option 1 (Instant): Scan PromptPay QR or use ID: 0123456789\nOption 2 (Bank Transfer): Transfer to account above\nIMPORTANT: Include reference: ${deposit.orderId}`;
				} else if (body.currency === "SGD") {
					// ✅ Singapore Dollar → Local bank
					paymentInstructions.bankName = "DBS Bank (Singapore)";
					paymentInstructions.accountNumber = "XXX-XXXXX-X";
					paymentInstructions.accountName = "Proxify Gateway Pte. Ltd.";
					paymentInstructions.swiftCode = "DBSSSGSG";
					paymentInstructions.instructions = `Transfer ${body.amount} SGD to the account above. Include reference: ${deposit.orderId}`;
				} else {
					// ✅ Other currencies (USD, EUR, etc.) → Main account
					paymentInstructions.bankName = "Kasikorn Bank";
					paymentInstructions.accountNumber = "123-4-56789-0";
					paymentInstructions.accountName = "Proxify Gateway Co., Ltd.";
					paymentInstructions.swiftCode = "KASITHBK";
					paymentInstructions.instructions = `Transfer ${body.amount} ${body.currency} to the account above. Include reference: ${deposit.orderId}`;
				}

				logger.info("Payment instructions generated", {
					orderId: deposit.orderId,
					currency: body.currency,
					amount: body.amount,
					provider: onRampProvider,
				});

				return {
					status: 201 as const,
					body: {
						orderId: deposit.orderId,
						status: "pending" as const,
						paymentInstructions,
						expectedCryptoAmount: body.amount, // TODO: Calculate actual conversion rate
						expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
						createdAt: deposit.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to create fiat deposit", { error, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: "Failed to create fiat deposit",
					},
				};
			}
		},

		// POST /deposits/fiat/:orderId/mock-confirm - Mock payment confirmation (DEMO)
		mockConfirmFiatDeposit: async ({ params, body, req }) => {
			try {
				// ✅ Extract clientId from API key
				const clientId = (req as any).client?.id;
				if (!clientId) {
					logger.error("Client ID missing from authenticated request");
					return {
						status: 401 as const,
						body: { error: "Authentication failed" },
					};
				}

				logger.info("Mock payment confirmation", {
					orderId: params.orderId,
					bankTxId: body.bankTransactionId,
					amount: body.paidAmount,
					currency: body.paidCurrency,
				});

				// 1. Get deposit
				const deposit = await depositService.getDepositByOrderId(params.orderId);
				if (!deposit) {
					return {
						status: 404 as const,
						body: { error: "Deposit not found" },
					};
				}

				// 2. Verify deposit belongs to this client
				if (deposit.clientId !== clientId) {
					return {
						status: 403 as const,
						body: { error: "Not authorized for this deposit" },
					};
				}

				// 3. Verify deposit is pending
				if (deposit.status !== "pending") {
					return {
						status: 400 as const,
						body: { error: `Deposit is already ${deposit.status}` },
					};
				}

				// 4. Verify amount matches
				if (deposit.fiatAmount !== body.paidAmount) {
					return {
						status: 400 as const,
						body: { error: `Amount mismatch. Expected: ${deposit.fiatAmount}, Paid: ${body.paidAmount}` },
					};
				}

				// 5. Mock convert fiat → USDC
				// TODO: Use real exchange rate API (CoinGecko, etc.)
				const exchangeRates: Record<string, number> = {
					THB: 35, // 1 USD = 35 THB
					SGD: 1.35, // 1 USD = 1.35 SGD
					USD: 1,
					EUR: 0.92, // 1 USD = 0.92 EUR
				};

				const rate = exchangeRates[body.paidCurrency] || 1;
				const usdAmount = parseFloat(body.paidAmount) / rate;
				const cryptoAmount = usdAmount.toFixed(2); // USDC 1:1 with USD

				logger.info("Mock fiat→USDC conversion", {
					fiat: `${body.paidAmount} ${body.paidCurrency}`,
					crypto: `${cryptoAmount} USDC`,
					exchangeRate: rate,
				});

				// 6. Complete deposit
				await depositService.completeDeposit({
					orderId: params.orderId,
					chain: "ethereum", // Default chain
					tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
					tokenSymbol: "USDC",
					cryptoAmount,
					gatewayFee: "0",
					proxifyFee: "0",
					networkFee: "0",
					totalFees: "0",
				});

				logger.info("Mock payment confirmed successfully", {
					orderId: params.orderId,
					cryptoAmount,
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						orderId: params.orderId,
						status: "completed",
						cryptoAmount,
						mockNote: "✅ Payment confirmed (DEMO MODE - in production, bank webhook does this automatically)",
					},
				};
			} catch (error) {
				logger.error("Failed to mock confirm payment", { error, orderId: params.orderId });
				return {
					status: 400 as const,
					body: { error: "Failed to confirm payment" },
				};
			}
		},

		// POST /deposits/fiat/:orderId/complete - Complete fiat deposit (webhook)
		completeFiatDeposit: async ({ params, body }) => {
			try {
				logger.info("Completing fiat deposit", { orderId: params.orderId, body });

				await depositService.completeDeposit({
					orderId: params.orderId,
					chain: body.chain,
					tokenAddress: body.tokenAddress,
					tokenSymbol: "USDC",
					cryptoAmount: body.cryptoAmount,
					gatewayFee: body.gatewayFee,
					proxifyFee: body.proxifyFee,
					networkFee: body.networkFee,
					totalFees: body.totalFees,
				});

				return {
					status: 200 as const,
					body: {
						success: true,
						orderId: params.orderId,
						sharesMinted: "0", // TODO: Calculate from service
					},
				};
			} catch (error) {
				logger.error("Failed to complete fiat deposit", { error, orderId: params.orderId });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: "Failed to complete fiat deposit",
					},
				};
			}
		},

		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// FLOW 4B: CRYPTO DEPOSIT ENDPOINTS
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

		// POST /deposits/crypto/initiate - Initiate crypto deposit
		initiateCryptoDeposit: async ({ body, req }) => {
			try {
				logger.info("Initiating crypto deposit", { body });

				// ✅ Extract clientId from authenticated request
				const clientId = (req as any).client?.id;
				if (!clientId) {
					logger.error("Client ID missing from authenticated request");
					return {
						status: 401 as const,
						body: {
							success: false,
							error: "Authentication failed - client ID not found",
						},
					};
				}

				const deposit = await depositService.createDeposit({
					clientId,
					userId: body.userId,
					depositType: "external",
					fiatAmount: body.amount,
					fiatCurrency: "USD",
					cryptoCurrency: body.tokenSymbol,
					gatewayProvider: "crypto_direct",
				});

				return {
					status: 201 as const,
					body: {
						orderId: deposit.orderId,
						status: "pending" as const,
						custodialWalletAddress: "0x3F450bC83942c44d38C0Be82CAe8194ce8FE5FE5", // TODO: Get from vault
						chain: body.chain,
						tokenAddress: body.tokenAddress,
						tokenSymbol: body.tokenSymbol,
						expectedAmount: body.amount,
						expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
						createdAt: deposit.createdAt.toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to initiate crypto deposit", { error, body });
				return {
					status: 400 as const,
					body: {
						success: false,
						error: "Failed to initiate crypto deposit",
					},
				};
			}
		},

		// POST /deposits/crypto/:orderId/complete - Complete crypto deposit
		completeCryptoDeposit: async ({ params, body }) => {
			try {
				logger.info("Completing crypto deposit", { orderId: params.orderId, body });

				// TODO: Verify transaction on-chain
				// TODO: Get deposit to extract chain/token info
				// TODO: Call completeDeposit with proper params

				return {
					status: 200 as const,
					body: {
						orderId: params.orderId,
						status: "completed" as const,
						cryptoAmount: "1000", // TODO: Get from transaction
						sharesMinted: "0", // TODO: Calculate from service
						transactionHash: body.transactionHash,
						verifiedAt: new Date().toISOString(),
					},
				};
			} catch (error) {
				logger.error("Failed to complete crypto deposit", { error, orderId: params.orderId });
				return {
					status: 200 as const,
					body: {
						orderId: params.orderId,
						status: "failed" as const,
						cryptoAmount: "0",
						sharesMinted: "0",
						transactionHash: body.transactionHash,
						verifiedAt: new Date().toISOString(),
					},
				};
			}
		},

		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
		// SHARED QUERY ENDPOINTS
		// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

		// GET /deposits/:orderId - Get deposit by order ID
		getByOrderId: async ({ params }) => {
			try {
				const deposit = await depositService.getDepositByOrderId(params.orderId);

				if (!deposit) {
					return {
						status: 404 as const,
						body: { success: false, error: "Deposit not found" },
					};
				}

				return {
					status: 200 as const,
					body: mapDepositToDto(deposit),
				};
			} catch (error) {
				logger.error("Failed to get deposit", { error, orderId: params.orderId });
				return {
					status: 404 as const,
					body: { success: false, error: "Deposit not found" },
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
