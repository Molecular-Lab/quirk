/**
 * B2B Deposit Contract
 * Type-safe API definitions for deposit operations
 *
 * TWO SEPARATE DEPOSIT FLOWS:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * FLOW 4A: FIAT DEPOSIT (B2B Escrow → Traditional Gateway → On-ramp → Staking)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Use Case: Client (e.g., Shopify) has end-user's money in their traditional account
 * Example: User has $1000 in Shopify balance → Wants to earn yield
 *
 * Flow:
 * 1. Client calls: POST /deposits/fiat
 * 2. We initiate traditional payment gateway (Stripe, wire transfer, etc.)
 * 3. Client sends fiat from THEIR bank → OUR bank
 * 4. We use on-ramp provider (Circle, Coinbase) to convert fiat → USDC
 * 5. USDC goes to CLIENT's custodial wallet (Privy-managed)
 * 6. We mint shares for end-user
 * 7. Later: Batch job stakes USDC in DeFi protocols
 *
 * FLOW 4B: CRYPTO DEPOSIT (Direct Transfer)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Use Case: End-user already has USDC in their wallet
 *
 * Flow:
 * 1. Client calls: POST /deposits/crypto/initiate
 * 2. We return custodial wallet address
 * 3. User sends USDC directly to custodial wallet
 * 4. Client calls: POST /deposits/crypto/complete with txHash
 * 5. We verify on-chain transfer → Mint shares
 */

import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// ============================================
// FLOW 4A: FIAT DEPOSIT (Client Escrow → On-ramp)
// ============================================

/**
 * Initiate fiat deposit from client's traditional account
 *
 * Example: Shopify wants to deposit $1000 from their bank to earn yield for end-user
 */
const CreateFiatDepositSchema = z.object({
	userId: z.string().describe("End-user ID from client's system"),
	amount: z.string().describe("Fiat amount (e.g., '1000.00')"),
	currency: z.enum(["SGD", "USD", "EUR", "THB", "TWD", "KRW"]).describe("Fiat currency - determines which bank account to show"),
	tokenSymbol: z.string().default("USDC").describe("Target token (USDC, USDT, etc.)"),
	clientReference: z.string().optional().describe("Client's internal reference ID"),
});

const FiatDepositResponseSchema = z.object({
	orderId: z.string().describe("Proxify order ID for tracking"),
	status: z.enum(["pending"]),

	// Bank transfer payment instructions (currency-specific)
	paymentInstructions: z.object({
		paymentMethod: z.literal("bank_transfer"),
		currency: z.string(),
		amount: z.string(),
		reference: z.string().describe("CRITICAL: Must include this in bank transfer"),

		// Bank account details (currency-specific)
		bankName: z.string(),
		accountNumber: z.string(),
		accountName: z.string(),
		swiftCode: z.string(),
		bankCode: z.string().optional(),
		branchCode: z.string().optional(),
		routingNumber: z.string().optional(),
		iban: z.string().optional(),
		promptPayId: z.string().optional().describe("For THB only"),

		instructions: z.string(),
		paymentSessionUrl: z.string().describe("URL to payment session page"),
	}),

	expectedCryptoAmount: z.string().optional().describe("Expected USDC after conversion"),
	expiresAt: z.string().describe("Order expires after this time"),
	createdAt: z.string(),
});

/**
 * Complete fiat deposit (called by webhook after on-ramp completes)
 * This is typically called internally, not by client
 */
const CompleteFiatDepositSchema = z.object({
	cryptoAmount: z.string().describe("Actual USDC amount received"),
	chain: z.string(),
	tokenAddress: z.string(),
	transactionHash: z.string().describe("On-chain transaction hash"),
	gatewayFee: z.string().default("0"),
	proxifyFee: z.string().default("0"),
	networkFee: z.string().default("0"),
	totalFees: z.string().default("0"),
});

// ============================================
// FLOW 4B: CRYPTO DEPOSIT (Direct Transfer)
// ============================================

/**
 * Initiate crypto deposit (direct transfer)
 * Returns custodial wallet address for user to send tokens
 */
const InitiateCryptoDepositSchema = z.object({
	userId: z.string().describe("End-user ID from client's system"),
	chain: z.string().describe("Chain (8453 = Base, 1 = Ethereum, etc.)"),
	tokenAddress: z.string().describe("Token contract address"),
	tokenSymbol: z.string().describe("Token symbol (USDC, USDT, etc.)"),
	amount: z.string().describe("Amount to deposit (in token decimals)"),
});

const InitiateCryptoDepositResponseSchema = z.object({
	orderId: z.string().describe("Proxify order ID for tracking"),
	status: z.enum(["pending"]),

	// Transfer instructions
	custodialWalletAddress: z.string().describe("Send tokens to this address"),
	chain: z.string(),
	tokenAddress: z.string(),
	tokenSymbol: z.string(),
	expectedAmount: z.string(),

	expiresAt: z.string().describe("Deposit expires after this time"),
	createdAt: z.string(),
});

/**
 * Complete crypto deposit
 * Called by client after user sends tokens
 */
const CompleteCryptoDepositSchema = z.object({
	transactionHash: z.string().describe("On-chain transaction hash"),
});

const CompleteCryptoDepositResponseSchema = z.object({
	orderId: z.string(),
	status: z.enum(["completed", "failed"]),
	cryptoAmount: z.string().describe("Actual amount received"),
	sharesMinted: z.string().describe("Vault shares minted"),
	transactionHash: z.string(),
	verifiedAt: z.string(),
});

// ============================================
// SHARED SCHEMAS
// ============================================

const DepositResponseSchema = z.object({
	id: z.string(),
	orderId: z.string(),
	clientId: z.string(),
	userId: z.string(),
	depositType: z.enum(["external", "internal"]).describe("external = fiat/crypto, internal = client balance"),
	amount: z.string(),
	status: z.enum(["pending", "completed", "failed"]),
	createdAt: z.string(),
	completedAt: z.string().optional(),

	// ✅ Payment instructions (stored in DB, frozen at deposit creation)
	paymentInstructions: z.object({
		paymentMethod: z.literal("bank_transfer"),
		currency: z.string(),
		amount: z.string(),
		reference: z.string(),
		bankName: z.string(),
		accountNumber: z.string(),
		accountName: z.string(),
		swiftCode: z.string(),
		bankCode: z.string().optional(),
		branchCode: z.string().optional(),
		routingNumber: z.string().optional(),
		iban: z.string().optional(),
		promptPayId: z.string().optional(),
		instructions: z.string(),
		paymentSessionUrl: z.string(),
	}).optional().nullable(),

	expectedCryptoAmount: z.string().optional(),
	expiresAt: z.string().optional().nullable(),
});

const DepositStatsSchema = z.object({
	totalDeposits: z.string(),
	completedDeposits: z.string(),
	totalAmount: z.string(),
	averageAmount: z.string(),
});

const ErrorResponseSchema = z.object({
	success: z.boolean().default(false),
	error: z.string(),
});

// ============================================
// DEPOSIT CONTRACT
// ============================================

export const depositContract = c.router({
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// FLOW 4A: FIAT DEPOSIT ENDPOINTS
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * Create fiat deposit order
	 * Client (e.g., Shopify) initiates deposit from their traditional account
	 */
	createFiatDeposit: {
		method: "POST",
		path: "/deposits/fiat",
		responses: {
			201: FiatDepositResponseSchema,
			400: ErrorResponseSchema,
		},
		body: CreateFiatDepositSchema,
		summary: "Create fiat deposit (client's escrow → on-ramp → staking)",
	},

	/**
	 * Complete fiat deposit (internal/webhook)
	 * Called after on-ramp provider completes conversion
	 */
	completeFiatDeposit: {
		method: "POST",
		path: "/deposits/fiat/:orderId/complete",
		responses: {
			200: z.object({
				success: z.boolean(),
				orderId: z.string(),
				sharesMinted: z.string(),
			}),
			400: ErrorResponseSchema,
		},
		body: CompleteFiatDepositSchema,
		summary: "Complete fiat deposit (called by webhook)",
	},

	/**
	 * Mock confirm fiat payment (DEMO ONLY)
	 * Simulates bank payment confirmation for testing
	 */
	mockConfirmFiatDeposit: {
		method: "POST",
		path: "/deposits/fiat/:orderId/mock-confirm",
		responses: {
			200: z.object({
				success: z.boolean(),
				orderId: z.string(),
				status: z.string(),
				cryptoAmount: z.string(),
				mockNote: z.string(),
			}),
			400: ErrorResponseSchema,
			404: z.object({ error: z.string() }),
		},
		body: z.object({
			bankTransactionId: z.string().describe("Mock bank transaction ID"),
			paidAmount: z.string().describe("Amount paid"),
			paidCurrency: z.string().describe("Currency paid"),
		}),
		summary: "Mock payment confirmation (demo only - replaces bank webhook)",
	},

	/**
	 * Batch complete deposits (Operations Dashboard)
	 * Completes multiple orders and transfers USDC to custodial wallet
	 */
	batchCompleteDeposits: {
		method: "POST",
		path: "/deposits/batch-complete",
		responses: {
			200: z.object({
				success: z.boolean(),
				completedOrders: z.array(z.object({
					orderId: z.string(),
					status: z.string(),
					cryptoAmount: z.string(),
					transferTxHash: z.string().optional(),
				})),
				totalUSDC: z.string(),
				custodialWallet: z.string(),
				mockNote: z.string(),
			}),
			400: ErrorResponseSchema,
		},
		body: z.object({
			orderIds: z.array(z.string()).describe("Array of order IDs to complete"),
			paidCurrency: z.string().default("USD").describe("Currency paid"),
		}),
		summary: "Batch complete deposits and transfer USDC to custodial wallet",
	},

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// FLOW 4B: CRYPTO DEPOSIT ENDPOINTS
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * Initiate crypto deposit
	 * Returns custodial wallet address for user to send tokens
	 */
	initiateCryptoDeposit: {
		method: "POST",
		path: "/deposits/crypto/initiate",
		responses: {
			201: InitiateCryptoDepositResponseSchema,
			400: ErrorResponseSchema,
		},
		body: InitiateCryptoDepositSchema,
		summary: "Initiate crypto deposit (returns wallet address)",
	},

	/**
	 * Complete crypto deposit
	 * Called after user sends tokens, with transaction hash
	 */
	completeCryptoDeposit: {
		method: "POST",
		path: "/deposits/crypto/:orderId/complete",
		responses: {
			200: CompleteCryptoDepositResponseSchema,
			400: ErrorResponseSchema,
		},
		body: CompleteCryptoDepositSchema,
		summary: "Complete crypto deposit (verify & mint shares)",
	},

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// SHARED QUERY ENDPOINTS
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	/**
	 * List pending deposits (for automated banking flow demo)
	 * Returns pending deposits grouped by currency for bulk processing
	 *
	 * ⚠️ MUST be before getByOrderId to avoid route conflict
	 */
	listPending: {
		method: "GET",
		path: "/deposits/pending",
		responses: {
			200: z.object({
				deposits: z.array(DepositResponseSchema),
				summary: z.array(z.object({
					currency: z.string(),
					count: z.number(),
					totalAmount: z.string(),
				})),
			}),
		},
		summary: "List pending deposits with summary by currency",
	},

	/**
	 * Get deposit stats
	 * ⚠️ MUST be before getByOrderId to avoid route conflict
	 */
	getStats: {
		method: "GET",
		path: "/deposits/stats/:clientId",
		responses: {
			200: DepositStatsSchema,
		},
		summary: "Get deposit statistics for a client",
	},

	/**
	 * List deposits by client
	 */
	listByClient: {
		method: "GET",
		path: "/deposits/client/:clientId",
		query: z.object({
			limit: z.string().optional(),
			offset: z.string().optional(),
			status: z.enum(["pending", "completed", "failed"]).optional(),
		}),
		responses: {
			200: z.array(DepositResponseSchema),
		},
		summary: "List deposits for a client",
	},

	/**
	 * List deposits by user
	 */
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

	/**
	 * Get deposit by order ID
	 * ⚠️ MUST be LAST among GET /deposits/* routes to avoid catching specific paths
	 */
	getByOrderId: {
		method: "GET",
		path: "/deposits/:orderId",
		responses: {
			200: DepositResponseSchema,
			404: ErrorResponseSchema,
		},
		summary: "Get deposit by order ID",
	},
});
