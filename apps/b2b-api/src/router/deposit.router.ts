/**
 * Deposit Router - B2B deposit endpoints
 */

import type { initServer } from "@ts-rest/express";
import { b2bContract } from "@proxify/b2b-api-core";
import { getMockUSDCAddress } from "@proxify/core/constants";
import type { DepositService } from "../service/deposit.service";
import type { ClientService } from "../service/client.service";
import { mapDepositToDto, mapDepositsToDto } from "../mapper/deposit.mapper";
import { logger } from "../logger";
import { BankAccountService, getExchangeRate } from "../service/bank-account.service";

export function createDepositRouter(
	s: ReturnType<typeof initServer>,
	depositService: DepositService,
	clientService: ClientService
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

				// ✅ Validate currency is supported
				if (!BankAccountService.isCurrencySupported(body.currency)) {
					logger.error("Unsupported currency", { currency: body.currency });
					return {
						status: 400 as const,
						body: {
							success: false,
							error: `Currency ${body.currency} not supported. Supported currencies: ${BankAccountService.getSupportedCurrencies().join(", ")}`,
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

				// ✅ DEPOSITS: Always use PROXIFY's bank accounts (fixed, hardcoded)
				// Client's bank accounts (from Configure Settlement Banking) are for OFF-RAMP withdrawals only!
				// Flow: End-user sends money to PROXIFY's bank → Proxify mints shares
				const bankAccount = BankAccountService.getBankAccount(body.currency);

				logger.info("Using Proxify's bank account for deposit", {
					clientId,
					currency: body.currency,
					bankName: bankAccount.bankName
				});

				// ✅ Calculate expected crypto amount (fiat → USD → USDC)
				const exchangeRate = await getExchangeRate(body.currency, "USD");
				const usdAmount = parseFloat(body.amount) * exchangeRate;
				const expectedCryptoAmount = usdAmount.toFixed(2); // USDC 1:1 with USD

				// ✅ GENERATE ORDER ID (before creating deposit so we can use it in payment instructions)
				const orderId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

				// ✅ GENERATE PAYMENT INSTRUCTIONS (Currency-specific)
				// Flow: Client transfers to our bank → Bank webhook → We convert → Complete deposit
				const paymentSessionUrl = process.env.FRONTEND_URL
					? `${process.env.FRONTEND_URL}/payment-session/${orderId}`
					: `http://localhost:5173/payment-session/${orderId}`;

				// Extract bank details from Proxify's BankAccountService (camelCase format)
				const paymentInstructions = {
					paymentMethod: "bank_transfer" as const,
					currency: body.currency,
					amount: body.amount,
					reference: orderId,

					// Proxify's bank account details (from BankAccountService)
					bankName: bankAccount.bankName,
					accountNumber: bankAccount.accountNumber,
					accountName: bankAccount.accountName,
					swiftCode: bankAccount.swiftCode || "",
					bankCode: bankAccount.bankCode,
					branchCode: bankAccount.branchCode,
					routingNumber: bankAccount.routingNumber,
					iban: bankAccount.iban,
					promptPayId: bankAccount.promptPayId,

					instructions: bankAccount.instructions || `Please transfer ${body.amount} ${body.currency} to the bank account above. Use the reference number "${orderId}" in your transfer details.`,
					paymentSessionUrl,
				};

				// ✅ Create deposit WITH payment instructions stored in database
				const deposit = await depositService.createDeposit({
					orderId,
					clientId,
					userId: body.userId,
					depositType: "external",
					fiatAmount: body.amount,
					fiatCurrency: body.currency,
					cryptoCurrency: body.tokenSymbol,
					gatewayProvider: onRampProvider,
					paymentInstructions, // ✅ Store payment instructions in DB
					chain: "base", // Default chain for on-ramp
					tokenSymbol: body.tokenSymbol,
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				});

				logger.info("Deposit created in unified deposit_transactions table", { orderId });

				logger.info("Payment instructions generated", {
					orderId: deposit.orderId,
					currency: body.currency,
					amount: body.amount,
					bankName: bankAccount.bankName,
					expectedCryptoAmount,
					provider: onRampProvider,
				});

				return {
					status: 201 as const,
					body: {
						orderId: deposit.orderId,
						status: "pending" as const,
						paymentInstructions,
						expectedCryptoAmount,
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
				logger.info("Calling completeDeposit with:", {
					orderId: params.orderId,
					chain: "1", // Ethereum chain ID
					tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
					tokenSymbol: "USDC",
					cryptoAmount,
				});

				await depositService.completeDeposit({
					orderId: params.orderId,
					chain: "1", // Ethereum chain ID (must match vault creation)
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
					status: "completed"
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
				logger.error("Failed to mock confirm payment", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					orderId: params.orderId
				});
				return {
					status: 400 as const,
					body: {
						error: "Failed to confirm payment",
						details: error instanceof Error ? error.message : String(error)
					},
				};
			}
		},

		// POST /deposits/batch-complete - Batch complete deposits (Operations Dashboard)
		batchCompleteDeposits: async ({ body, req }) => {
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

				logger.info("Batch completing deposits", {
					orderIds: body.orderIds,
					count: body.orderIds.length,
					clientId,
				});

				const completedOrders: Array<{
					orderId: string;
					status: string;
					cryptoAmount: string;
					transferTxHash?: string;
				}> = [];

				let totalUSDC = 0;

				// Process each order
				for (const orderId of body.orderIds) {
					// 1. Get deposit from deposit_transactions table
					const deposit = await depositService.getDepositByOrderId(orderId);
					if (!deposit) {
						logger.warn(`Deposit not found in deposit_transactions: ${orderId}`);
						continue;
					}

					// 2. Verify deposit belongs to this client
					if (deposit.clientId !== clientId) {
						logger.warn(`Deposit ${orderId} does not belong to client ${clientId}`);
						continue;
					}

					// 3. Verify deposit is pending
					if (deposit.status !== "pending") {
						logger.warn(`Deposit ${orderId} is already ${deposit.status}`);
						continue;
					}

					// 4. Mock convert fiat → USDC (1:1 for USD)
					const exchangeRates: Record<string, number> = {
						THB: 35,
						SGD: 1.35,
						USD: 1,
						EUR: 0.92,
						TWD: 31,
						KRW: 1400,
					};

					const rate = exchangeRates[body.paidCurrency] || 1;
					const usdAmount = parseFloat(deposit.fiatAmount) / rate;
					const cryptoAmount = usdAmount.toFixed(2); // USDC 1:1 with USD

					// 5. Complete deposit in deposit_transactions table
					await depositService.completeDeposit({
						orderId: orderId,
						chain: "1", // Ethereum chain ID
						tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
						tokenSymbol: "USDC",
						cryptoAmount,
						gatewayFee: "0",
						proxifyFee: "0",
						networkFee: "0",
						totalFees: "0",
					});

					totalUSDC += parseFloat(cryptoAmount);

					completedOrders.push({
						orderId,
						status: "completed",
						cryptoAmount,
					});

					logger.info(`✅ Completed deposit: ${orderId} → ${cryptoAmount} USDC`);
				}

					// 6. Get client custodial wallet address
				const client = await clientService.getById(clientId);
				const custodialWallet = client?.privyWalletAddress || "0x0000000000000000000000000000000000000000";

				// 7. Execute USDC transfer to custodial wallet (RampToCustodial)
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				logger.info("🏦 RAMP TO CUSTODIAL - Minting MockUSDC (USDQ)");
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				// Execute the actual mint transaction using DepositService
				const chainId = process.env.CHAIN_ID || "11155111"; // Default: Sepolia (as string)
				const mockUSDCAddress = getMockUSDCAddress(Number(chainId) as 11155111); // Get address from constants

				logger.info(`📤 Transferring ${totalUSDC.toFixed(2)} USDC`);
				logger.info(`📍 To: ${custodialWallet}`);
				logger.info(`🔗 Chain: Sepolia Testnet (Chain ID: ${chainId})`);
				logger.info(`💰 Token: MockUSDC (USDQ) - ${mockUSDCAddress}`);
				logger.info(`📦 Orders processed: ${completedOrders.length}`);
				logger.info(`🔐 Client ID: ${clientId}`);

				let mintResult;
				try {
					mintResult = await depositService.mintTokensToCustodial(
						chainId,
						mockUSDCAddress,
						custodialWallet,
						totalUSDC.toFixed(2)
					);
				} catch (error) {
					logger.error("❌ Mint to custodial failed:", {
						error: error instanceof Error ? error.message : String(error),
						chainId,
						tokenAddress: mockUSDCAddress,
						custodialWallet,
						amount: totalUSDC.toFixed(2),
					});
					logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
					return {
						status: 500 as const,
						body: {
							error: "Failed to mint USDC to custodial wallet",
							details: error instanceof Error ? error.message : "Unknown error - check server logs",
						},
					};
				}

				logger.info("✅ Mint successful!");
				logger.info(`   Transaction: ${mintResult.txHash}`);
				logger.info(`   Block: ${mintResult.blockNumber}`);
				logger.info(`   Amount: ${mintResult.amountMinted} USDC`);
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				// Add transfer txHash to all completed orders
				const completedOrdersWithTxHash = completedOrders.map(order => ({
					...order,
					transferTxHash: mintResult.txHash,
				}));

				return {
					status: 200 as const,
					body: {
						success: true,
						completedOrders: completedOrdersWithTxHash,
						totalUSDC: totalUSDC.toFixed(2),
						custodialWallet,
						mockNote: `✅ ${completedOrders.length} deposits completed. ${totalUSDC.toFixed(2)} USDC minted to custodial wallet. TX: ${mintResult.txHash}`,
					},
				};
			} catch (error) {
				logger.error("Failed to batch complete deposits", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				});
				return {
					status: 400 as const,
					body: {
						error: "Failed to complete deposits",
						details: error instanceof Error ? error.message : String(error),
					},
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

		// ⚠️ IMPORTANT: Specific routes MUST come before parameterized routes
		// Otherwise Express will match /deposits/pending to /deposits/:orderId

		// GET /deposits/pending - List pending deposit orders (Operations Dashboard)
		// ⚠️ MUST be BEFORE getByOrderId to avoid route conflict
		listPending: async ({ req }) => {
			try {
				// ✅ Extract clientId from authenticated request
				const clientId = (req as any).client?.id;
				if (!clientId) {
					logger.error("Client ID missing from authenticated request");
					return {
						status: 401 as const,
						body: {
							deposits: [],
							summary: [],
						},
					};
				}

				logger.info("Fetching pending deposits", { clientId });

				// ✅ Get pending deposits from deposit_transactions table (for Operations Dashboard)
				const deposits = await depositService.listAllPendingDeposits();

				// Map deposits to full DepositResponseSchema format
				const mappedDeposits = deposits.map((deposit) => ({
					id: deposit.id,
					orderId: deposit.orderId,
					clientId: deposit.clientId,
					userId: deposit.userId,
					depositType: deposit.depositType as "external" | "internal",
					amount: deposit.fiatAmount,
					status: deposit.status as "pending" | "completed" | "failed",
					createdAt: deposit.createdAt ? deposit.createdAt.toISOString() : new Date().toISOString(),
					completedAt: deposit.completedAt ? deposit.completedAt.toISOString() : undefined,
					paymentInstructions: deposit.paymentInstructions || null,
					expectedCryptoAmount: deposit.cryptoAmount || undefined,
					expiresAt: deposit.expiresAt ? deposit.expiresAt.toISOString() : null,
				}));

				logger.info("Pending deposit orders fetched successfully", {
					clientId,
					orderCount: mappedDeposits.length,
				});

				return {
					status: 200 as const,
					body: {
						deposits: mappedDeposits,
						summary: [], // TODO: Calculate summary if needed
					},
				};
			} catch (error) {
				logger.error("Failed to list pending deposit orders", { error });
				return {
					status: 200 as const,
					body: {
						deposits: [],
						summary: [],
					},
				};
			}
		},

		// GET /deposits/stats/:clientId
		// ⚠️ MUST be before getByOrderId to avoid route conflict
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

		// GET /deposits/:orderId - Get deposit by order ID
		// ⚠️ MUST be LAST among GET /deposits/* routes to avoid catching specific paths
		getByOrderId: async ({ params }) => {
			try {
				const deposit = await depositService.getDepositByOrderId(params.orderId);

				if (!deposit) {
					return {
						status: 404 as const,
						body: { success: false, error: "Deposit not found" },
					};
				}

				// ✅ Fetch client's bank accounts from database
				const client = await clientService.getById(deposit.clientId);
				const clientBankAccounts = client?.bankAccounts || [];

				return {
					status: 200 as const,
					body: mapDepositToDto(deposit, clientBankAccounts),
				};
			} catch (error) {
				logger.error("Failed to get deposit", { error, orderId: params.orderId });
				return {
					status: 404 as const,
					body: { success: false, error: "Deposit not found" },
				};
			}
		},
	});
};
