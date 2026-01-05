/**
 * Deposit Router - B2B deposit endpoints
 */

import type { initServer } from "@ts-rest/express";
import { randomBytes } from "crypto";
import { b2bContract } from "@quirk/b2b-api-core";
// Chain configuration constants
const BASE_MAINNET_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Real USDC on Base Mainnet
const ETH_SEPOLIA_MOCK_USDC = '0x2DA55f4c1eCEB0cEeB93ee598e852Bf24Abb8FcE'; // MockUSDC on Ethereum Sepolia
import type { DepositService } from "../service/deposit.service";
import type { ClientService } from "../service/client.service";
import type { VaultService } from "../service/vault.service";
import { mapDepositToDto, mapDepositsToDto } from "../mapper/deposit.mapper";
import { logger } from "../logger";
import { BankAccountService, getExchangeRate } from "../service/bank-account.service";
import { ENV } from "../env";

export function createDepositRouter(
	s: ReturnType<typeof initServer>,
	depositService: DepositService,
	clientService: ClientService,
	vaultService: VaultService
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
				const clientId = (req as any).apiKeyClient?.id;
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

				// ✅ INTERNAL ROUTING: Quirk decides which on-ramp to use based on currency
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
				// Flow: End-user sends money to PROXIFY's bank → Quirk mints shares
				const bankAccount = BankAccountService.getBankAccount(body.currency);

				logger.info("Using Quirk's bank account for deposit", {
					clientId,
					currency: body.currency,
					bankName: bankAccount.bankName
				});

				// ✅ Calculate expected crypto amount (fiat → USD → USDC)
				const exchangeRate = await getExchangeRate(body.currency, "USD");
				const usdAmount = parseFloat(body.amount) * exchangeRate;
				const expectedCryptoAmount = usdAmount.toFixed(2); // USDC 1:1 with USD

				// ✅ GENERATE ORDER ID (before creating deposit so we can use it in payment instructions)
				// Use crypto.randomBytes for cryptographically secure random IDs
				const randomId = randomBytes(6).toString('base64url'); // URL-safe base64, 8 chars
				const orderId = `DEP-${Date.now()}-${randomId}`;

				// ✅ GENERATE PAYMENT INSTRUCTIONS (Currency-specific)
				// Flow: Client transfers to our bank → Bank webhook → We convert → Complete deposit
				const paymentSessionUrl = process.env.FRONTEND_URL
					? `${process.env.FRONTEND_URL}/payment-session/${orderId}`
					: `http://localhost:5173/payment-session/${orderId}`;

				// Extract bank details from Quirk's BankAccountService (camelCase format)
				const paymentInstructions = {
					paymentMethod: "bank_transfer" as const,
					currency: body.currency,
					amount: body.amount,
					reference: orderId,

					// Quirk's bank account details (from BankAccountService)
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
					environment: body.environment || "sandbox", // ✅ Pass environment from request
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
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				logger.info("Mock payment confirmation", {
					orderId: params.orderId,
					bankTxId: body.bankTransactionId,
					amount: body.paidAmount,
					currency: body.paidCurrency,
					authType: apiKeyClient ? "api_key" : privySession ? "privy" : "none",
				});

				// 1. Get deposit
				const deposit = await depositService.getDepositByOrderId(params.orderId);
				if (!deposit) {
					return {
						status: 400 as const,
						body: { error: "Deposit not found - invalid order ID" },
					};
				}

				// 2. Verify authorization
				// For API key: deposit must belong to this client
				if (apiKeyClient) {
					if (deposit.clientId !== apiKeyClient.id) {
						logger.warn("API key client attempting to access another client's deposit", {
							apiKeyClientId: apiKeyClient.id,
							depositClientId: deposit.clientId,
						});
						return {
							status: 403 as const,
							body: { error: "Not authorized for this deposit" },
						};
					}
				}
				// For Privy: deposit must belong to one of the organization's products
				else if (privySession) {
					const productIds = privySession.products.map((p: any) => p.id);
					if (!productIds.includes(deposit.clientId)) {
						logger.warn("Privy user attempting to access deposit from outside organization", {
							privyOrgId: privySession.organizationId,
							depositClientId: deposit.clientId,
						});
						return {
							status: 403 as const,
							body: { error: "Not authorized for this deposit" },
						};
					}
				}
				// No auth found
				else {
					logger.error("Authentication missing for mock confirm deposit");
					return {
						status: 401 as const,
						body: { error: "Authentication required" },
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
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				// For Privy session: Use first product as default client
				// (Dashboard users can batch complete across all their products)
				const clientId = apiKeyClient?.id || privySession?.products[0]?.id;

				if (!clientId) {
					logger.error("Authentication missing for batch complete");
					return {
						status: 401 as const,
						body: { error: "Authentication required" },
					};
				}

				// DEBUG: Log authentication details
				logger.info("Batch completing deposits", {
					orderIds: body.orderIds,
					count: body.orderIds.length,
					clientId,
					authType: apiKeyClient?.id ? "api_key" : "privy",
					hasApiKeyClient: !!apiKeyClient,
					apiKeyClientId: apiKeyClient?.id,
					hasPrivySession: !!privySession,
					privyOrgId: privySession?.organizationId,
				});

				const completedOrders: Array<{
					orderId: string;
					status: string;
					cryptoAmount: string;
					transferTxHash?: string;
				}> = [];

				let totalUSDC = 0;
				let batchEnvironment: "sandbox" | "production" = "sandbox"; // Track environment for batch

				// Process each order
				for (const orderId of body.orderIds) {
					// 1. Get deposit from deposit_transactions table
					const deposit = await depositService.getDepositByOrderId(orderId);
					if (!deposit) {
						logger.warn(`Deposit not found in deposit_transactions: ${orderId}`);
						continue;
					}

					logger.info(`[Batch Complete] Processing deposit ${orderId}`, {
						depositClientId: deposit.clientId,
						depositStatus: deposit.status,
						authType: apiKeyClient?.id ? "api_key" : "privy",
					});

					// 2. Verify authorization
					let authorized = false;

					// For API key: deposit must belong to this client
					if (apiKeyClient?.id) {
						authorized = deposit.clientId === apiKeyClient.id;
						if (!authorized) {
							logger.warn(`Deposit ${orderId} does not belong to API key client ${apiKeyClient.id}`);
						}
					}
					// For Privy: deposit can belong to any of the organization's products
					else if (privySession) {
						// FIX: Use correct field names from privySession.products
						const clientIds = privySession.products.map((p: any) => p.id);

						logger.info(`[Batch Complete] Privy authorization check`, {
							orderId,
							depositClientId: deposit.clientId,
							privyProductClientIds: clientIds,
							privyProducts: privySession.products,
						});

						authorized = clientIds.includes(deposit.clientId);
						if (!authorized) {
							logger.warn(`Deposit ${orderId} not in Privy org's products`, {
								privyOrgId: privySession.organizationId,
								depositClientId: deposit.clientId,
								availableClientIds: clientIds,
							});
						}
					}

					if (!authorized) {
						logger.warn(`[Batch Complete] Deposit ${orderId} not authorized, skipping`);
						continue;
					}

					// 3. Verify deposit is pending
					if (deposit.status !== "pending") {
						logger.warn(`Deposit ${orderId} is already ${deposit.status}`);
						continue;
					}

					// 3.5. Track environment (first deposit sets the batch environment)
					const depositEnvironment = (deposit.environment as "sandbox" | "production") || "sandbox";
					if (completedOrders.length === 0) {
						batchEnvironment = depositEnvironment;
						logger.info(`[Batch Complete] Environment: ${batchEnvironment}`);
					} else if (depositEnvironment !== batchEnvironment) {
						logger.warn(`Deposit ${orderId} has different environment (${depositEnvironment}) than batch (${batchEnvironment}), skipping`);
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

				// Check if any orders were actually completed
				if (completedOrders.length === 0) {
					logger.warn("No deposits were completed (all were already processed or invalid)");
					return {
						status: 200 as const,
						body: {
							success: false,
							completedOrders: [],
							totalUSDC: "0.00",
							custodialWallet: "N/A",
							mockNote: "No deposits were completed - all orders were already processed or invalid",
						},
					};
				}

				// 6. Get vault custodial wallet address
				// Production: Base Mainnet (best DeFi yields)
				// Sandbox: Ethereum Sepolia (where MockUSDC is deployed)
				const chainId = batchEnvironment === "production" ? "8453" : "11155111"; // Base Mainnet : Ethereum Sepolia
				const usdcAddress = batchEnvironment === "production"
					? BASE_MAINNET_USDC // Real USDC on Base Mainnet
					: ETH_SEPOLIA_MOCK_USDC; // MockUSDC on Ethereum Sepolia

				const vault = await vaultService.getVaultByToken(clientId, chainId, usdcAddress, batchEnvironment);

				if (!vault || !vault.custodialWalletAddress) {
					logger.error("Vault or custodial wallet not found", { clientId, chainId, usdcAddress, batchEnvironment });
					return {
						status: 400 as const,
						body: {
							success: false,
							error: "Vault custodial wallet not configured. Please ensure vault is created with a Privy server wallet.",
							details: `clientId: ${clientId}, environment: ${batchEnvironment}`,
						},
					};
				}

				const custodialWallet = vault.custodialWalletAddress;
				logger.info(`✅ Using vault custodial wallet for ${batchEnvironment}: ${custodialWallet}`);

				// 7. Update Product Idle Balances (BEFORE blockchain mint)
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
				logger.info("💰 UPDATING PRODUCT IDLE BALANCES");
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				// Aggregate deposits by product (clientId)
				const depositsByProduct = new Map<string, number>();

				for (const order of completedOrders) {
					const deposit = await depositService.getDepositByOrderId(order.orderId);
					if (deposit) {
						const current = depositsByProduct.get(deposit.clientId) || 0;
						depositsByProduct.set(
							deposit.clientId,
							current + parseFloat(order.cryptoAmount)
						);
					}
				}

				// Update each product's idle balance
				for (const [productClientId, totalAmount] of depositsByProduct) {
					await clientService.addToIdleBalance(
						productClientId,
						totalAmount.toFixed(2)
					);
					logger.info(`✅ Updated idle balance`, {
						clientId: productClientId,
						amount: totalAmount.toFixed(2)
					});
				}

				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				// 8. Execute token operation based on environment
				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				let txHash: string | undefined;
				let amountProcessed: string | undefined;
				let oracleBalanceAfter: string | undefined;

				if (batchEnvironment === "production") {
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					// PRODUCTION: Transfer real USDC from oracle wallet (Base Mainnet)
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					logger.info("🏦 PRODUCTION: Transfer USDC from Oracle");
					logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

					const baseMainnetChainId = "8453"; // Base Mainnet (matches DeFi execution)
					const baseMainnetUSDCAddress = BASE_MAINNET_USDC; // Real USDC on Base
					const mainnetOracleKey = ENV.MAINNET_ORACLE_PRIVATE_KEY;

					if (!mainnetOracleKey) {
						logger.error("❌ MAINNET_ORACLE_PRIVATE_KEY not configured");
						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Production oracle not configured",
								details: "MAINNET_ORACLE_PRIVATE_KEY environment variable is required for production deposits",
							},
						};
					}

					logger.info(`📤 Transferring ${totalUSDC.toFixed(2)} USDC (PRODUCTION)`);
					logger.info(`📍 To: ${custodialWallet}`);
					logger.info(`🔗 Chain: Base Mainnet (Chain ID: ${baseMainnetChainId})`);
					logger.info(`💰 Token: USDC - ${baseMainnetUSDCAddress}`);
					logger.info(`📦 Orders processed: ${completedOrders.length}`);

					const transferResult = await depositService.transferFromOracle(
						baseMainnetChainId,
						baseMainnetUSDCAddress,
						custodialWallet,
						totalUSDC.toFixed(2),
						mainnetOracleKey,
						ENV.DEFI_RPC_URL || 'https://mainnet.base.org', // Base Mainnet RPC
					);

					if (!transferResult.success) {
						logger.error("❌ Transfer from oracle failed:", transferResult.error);
						logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

						// Handle insufficient balance case
						if (transferResult.status === "insufficient_balance") {
							return {
								status: 400 as const,
								body: {
									success: false,
									error: transferResult.error || "Insufficient oracle balance",
									details: `Oracle balance: ${transferResult.oracleBalance}, Required: ${transferResult.requiredAmount}`,
								},
							};
						}

						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Failed to transfer USDC from oracle",
								details: transferResult.error || "Unknown error - check server logs",
							},
						};
					}

					txHash = transferResult.txHash;
					amountProcessed = transferResult.amountTransferred;
					oracleBalanceAfter = transferResult.oracleBalanceAfter;

					logger.info("✅ Transfer successful!");
					logger.info(`   Transaction: ${txHash}`);
					logger.info(`   Amount: ${amountProcessed} USDC`);
					logger.info(`   Oracle Balance After: ${oracleBalanceAfter} USDC`);

				} else {
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					// SANDBOX: Mint MockUSDC on Ethereum Sepolia
					// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
					logger.info("🏦 SANDBOX: Minting MockUSDC");
					logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

					const ethSepoliaChainId = "11155111"; // Ethereum Sepolia (where MockUSDC is deployed)
					const mockUSDCAddress = ETH_SEPOLIA_MOCK_USDC;

					logger.info(`📤 Minting ${totalUSDC.toFixed(2)} USDC (SANDBOX)`);
					logger.info(`📍 To: ${custodialWallet}`);
					logger.info(`🔗 Chain: Ethereum Sepolia (Chain ID: ${ethSepoliaChainId})`);
					logger.info(`💰 Token: MockUSDC - ${mockUSDCAddress}`);
					logger.info(`📦 Orders processed: ${completedOrders.length}`);

					let mintResult;
					try {
						mintResult = await depositService.mintTokensToCustodial(
							ethSepoliaChainId,
							mockUSDCAddress,
							custodialWallet,
							totalUSDC.toFixed(2)
						);
					} catch (error) {
						logger.error("❌ Mint to custodial failed:", {
							error: error instanceof Error ? error.message : String(error),
							chainId: ethSepoliaChainId,
							tokenAddress: mockUSDCAddress,
							custodialWallet,
							amount: totalUSDC.toFixed(2),
						});
						logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
						return {
							status: 500 as const,
							body: {
								success: false,
								error: "Failed to mint USDC to custodial wallet",
								details: error instanceof Error ? error.message : "Unknown error - check server logs",
							},
						};
					}

					txHash = mintResult.txHash;
					amountProcessed = mintResult.amountMinted;

					logger.info("✅ Mint successful!");
					logger.info(`   Transaction: ${txHash}`);
					logger.info(`   Amount: ${amountProcessed} USDC`);
				}

				logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

				// ✅ Update transaction hash in database for all completed deposits
				if (txHash) {
					logger.info("📝 Updating transaction hashes in database...");
					for (const order of completedOrders) {
						try {
							await depositService.updateTransactionHash(order.orderId, txHash);
							logger.info(`   ✅ Updated ${order.orderId} with txHash: ${txHash.substring(0, 10)}...`);
						} catch (error) {
							logger.error(`   ❌ Failed to update txHash for ${order.orderId}:`, error);
						}
					}
				}

				// Add transfer txHash to all completed orders
				const completedOrdersWithTxHash = completedOrders.map(order => ({
					...order,
					transferTxHash: txHash,
				}));

				// Build response with environment-specific details
				const responseBody: any = {
					success: true,
					status: "completed",
					environment: batchEnvironment,
					completedOrders: completedOrdersWithTxHash,
					totalUSDC: totalUSDC.toFixed(2),
					custodialWallet,
					transferTxHash: txHash,
				};

				// Add oracle balance info for production
				if (batchEnvironment === "production" && oracleBalanceAfter) {
					responseBody.oracleBalanceAfter = oracleBalanceAfter;
				}

				// Add helpful note
				responseBody.mockNote = batchEnvironment === "production"
					? `✅ ${completedOrders.length} deposits completed. ${totalUSDC.toFixed(2)} USDC transferred from oracle. TX: ${txHash}`
					: `✅ ${completedOrders.length} deposits completed. ${totalUSDC.toFixed(2)} USDC minted (SANDBOX). TX: ${txHash}`;

				return {
					status: 200 as const,
					body: responseBody,
				};
			} catch (error) {
				logger.error("Failed to batch complete deposits", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				});
				return {
					status: 400 as const,
					body: {
						success: false,
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
				const clientId = (req as any).apiKeyClient?.id;
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
		listPending: async ({ query, req }) => {
			try {
				// Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				// ✅ Extract environment from query params
				const environment = query?.environment as "sandbox" | "production" | undefined;

				// For dashboard (Privy auth), show all deposits across all products
				if (privySession) {
					logger.info("Fetching pending deposits (Dashboard)", {
						privyOrgId: privySession.organizationId,
						productsCount: privySession.products.length,
						environment: environment || "all",
					});

					// Get ALL pending deposits (for all products under this organization)
					// ✅ Pass environment to filter at DB level
					const deposits = await depositService.listAllPendingDeposits(environment);

					// Filter to only deposits from this organization's products
					const productIds = privySession.products.map((p: any) => p.id);
					const filteredDeposits = deposits.filter((d) => productIds.includes(d.clientId));

					// Map deposits to response format
					const mappedDeposits = filteredDeposits.map((deposit) => ({
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

					logger.info("Pending deposits fetched successfully (Dashboard)", {
						privyOrgId: privySession.organizationId,
						orderCount: mappedDeposits.length,
					});

					return {
						status: 200 as const,
						body: {
							deposits: mappedDeposits,
							summary: [],
						},
					};
				}

				// For SDK (API key), show deposits for single client only
				if (apiKeyClient) {
					logger.info("Fetching pending deposits (SDK)", {
						clientId: apiKeyClient.id,
						environment: environment || "all",
					});

					// ✅ Pass environment to filter at DB level
					const deposits = await depositService.listAllPendingDeposits(environment);

					// Filter to only this client's deposits
					const filteredDeposits = deposits.filter((d) => d.clientId === apiKeyClient.id);

					const mappedDeposits = filteredDeposits.map((deposit) => ({
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

					logger.info("Pending deposits fetched successfully (SDK)", {
						clientId: apiKeyClient.id,
						orderCount: mappedDeposits.length,
					});

					return {
						status: 200 as const,
						body: {
							deposits: mappedDeposits,
							summary: [],
						},
					};
				}

				// Neither auth found
				logger.error("Authentication missing for list pending deposits");
				return {
					status: 401 as const,
					body: {
						error: "Authentication required",
					},
				};
			} catch (error) {
				logger.error("Failed to list pending deposit orders", { error });
				return {
					status: 500 as const,
					body: {
						error: "Failed to list pending deposits",
						details: error instanceof Error ? error.message : String(error),
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
					status: 500 as const,
					body: {
						error: "Failed to list client deposits",
						details: error instanceof Error ? error.message : String(error),
					},
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
					status: 500 as const,
					body: {
						error: "Failed to list user deposits",
						details: error instanceof Error ? error.message : String(error),
					},
				};
			}
		},

		// GET /deposits/:orderId - Get deposit by order ID
		// ⚠️ MUST be LAST among GET /deposits/* routes to avoid catching specific paths
		getByOrderId: async ({ params, req }) => {
			try {
				// ✅ Dual auth: Support both SDK (API key) and Dashboard (Privy)
				const apiKeyClient = (req as any).apiKeyClient;
				const privySession = (req as any).privy;

				const deposit = await depositService.getDepositByOrderId(params.orderId);

				if (!deposit) {
					return {
						status: 200 as const,
						body: {
							found: false,
							data: null,
							message: "Deposit not found",
						},
					};
				}

				// Verify authorization
				let authorized = false;

				// For API key: deposit must belong to this client
				if (apiKeyClient) {
					authorized = deposit.clientId === apiKeyClient.id;
					if (!authorized) {
						logger.warn("API key client attempting to access another client's deposit", {
							apiKeyClientId: apiKeyClient.id,
							depositClientId: deposit.clientId,
						});
						return {
							status: 403 as const,
							body: { success: false, error: "Not authorized for this deposit" },
						};
					}
				}
				// For Privy: deposit can belong to any of the organization's products
				else if (privySession) {
					const productIds = privySession.products.map((p: any) => p.id);
					authorized = productIds.includes(deposit.clientId);
					if (!authorized) {
						logger.warn("Privy user attempting to access deposit from outside organization", {
							privyOrgId: privySession.organizationId,
							depositClientId: deposit.clientId,
						});
						return {
							status: 403 as const,
							body: { success: false, error: "Not authorized for this deposit" },
						};
					}
				}
				// No auth found
				else {
					logger.error("Authentication missing for get deposit");
					return {
						status: 401 as const,
						body: { success: false, error: "Authentication required" },
					};
				}

				// ✅ Fetch client's bank accounts from database
				const client = await clientService.getById(deposit.clientId);
				const clientBankAccounts = client?.bankAccounts || [];

				return {
					status: 200 as const,
					body: {
						found: true,
						data: mapDepositToDto(deposit, clientBankAccounts),
						message: "Deposit found",
					},
				};
			} catch (error) {
				logger.error("Failed to get deposit", { error, orderId: params.orderId });
				return {
					status: 500 as const,
					body: { success: false, error: "Failed to get deposit" },
				};
			}
		},
	});
};
