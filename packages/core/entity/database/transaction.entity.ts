/**
 * Transaction Entities - Database Schema with Zod Validation
 * Deposits, Withdrawals, and Transaction Status
 */

import { z } from "zod"

/**
 * Transaction Status Enum
 */
export const transactionStatusSchema = z.enum([
	"pending",
	"processing",
	"completed",
	"failed",
	"expired",
	"batched",
	"staked",
])

export type TransactionStatus = z.infer<typeof transactionStatusSchema>

/**
 * Deposit Type Enum
 */
export const depositTypeSchema = z.enum(["fiat_onramp", "crypto_transfer", "card_payment", "bank_transfer"])

export type DepositType = z.infer<typeof depositTypeSchema>

/**
 * Deposit Transaction Schema
 */
export const depositTransactionSchema = z.object({
	id: z.string().uuid(),
	orderId: z.string().min(1),
	clientId: z.string().uuid(),
	userId: z.string().min(1),

	// Deposit details
	depositType: depositTypeSchema,
	paymentMethod: z.string().nullable(),

	// Amounts (stored as strings for precision)
	fiatAmount: z.string().regex(/^\d+(\.\d+)?$/),
	cryptoAmount: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),
	currency: z.string().length(3),
	cryptoCurrency: z.string().min(1),

	// Fees
	gatewayFee: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),
	proxifyFee: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),
	networkFee: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),
	totalFees: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),

	// Status
	status: transactionStatusSchema,

	// Gateway info
	gatewayOrderId: z.string().nullable(),
	gatewayStatus: z.string().nullable(),
	paymentUrl: z.string().url().nullable(),

	// Blockchain info
	txHash: z
		.string()
		.regex(/^0x[a-fA-F0-9]{64}$/)
		.nullable(),
	blockNumber: z.string().nullable(),

	// Error handling
	errorMessage: z.string().nullable(),
	errorCode: z.string().nullable(),

	// Timestamps
	expiresAt: z.date().nullable(),
	completedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export type DepositTransaction = z.infer<typeof depositTransactionSchema>

/**
 * Create Deposit Input Schema
 */
export const createDepositSchema = z.object({
	orderId: z.string().min(1, "Order ID is required"),
	clientId: z.string().uuid("Invalid client ID"),
	userId: z.string().min(1, "User ID is required"),
	depositType: depositTypeSchema,
	paymentMethod: z.string().nullable().optional(),
	fiatAmount: z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount"),
	currency: z.string().length(3, "Currency must be 3 characters"),
	cryptoCurrency: z.string().min(1, "Crypto currency is required"),
	expiresAt: z.date().nullable().optional(),
})

export type CreateDeposit = z.infer<typeof createDepositSchema>

/**
 * Withdrawal Transaction Schema
 */
export const withdrawalTransactionSchema = z.object({
	id: z.string().uuid(),
	orderId: z.string().min(1),
	clientId: z.string().uuid(),
	userId: z.string().min(1),

	// Withdrawal details
	requestedAmount: z.string().regex(/^\d+(\.\d+)?$/),
	actualAmount: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),
	currency: z.string().length(3),

	// Destination
	destinationAddress: z.string().min(1),
	destinationType: z.enum(["wallet", "bank", "card"]),

	// Fees
	withdrawalFee: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),
	networkFee: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),
	totalFees: z
		.string()
		.regex(/^\d+(\.\d+)?$/)
		.nullable(),

	// Status
	status: transactionStatusSchema,

	// Gateway info
	gatewayOrderId: z.string().nullable(),

	// Blockchain info
	txHash: z
		.string()
		.regex(/^0x[a-fA-F0-9]{64}$/)
		.nullable(),
	blockNumber: z.string().nullable(),

	// Error handling
	errorMessage: z.string().nullable(),
	errorCode: z.string().nullable(),

	// Timestamps
	processedAt: z.date().nullable(),
	completedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export type WithdrawalTransaction = z.infer<typeof withdrawalTransactionSchema>

/**
 * Create Withdrawal Input Schema
 */
export const createWithdrawalSchema = z.object({
	orderId: z.string().min(1, "Order ID is required"),
	clientId: z.string().uuid("Invalid client ID"),
	userId: z.string().min(1, "User ID is required"),
	requestedAmount: z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount"),
	currency: z.string().length(3, "Currency must be 3 characters"),
	destinationAddress: z.string().min(1, "Destination is required"),
	destinationType: z.enum(["wallet", "bank", "card"]),
})

export type CreateWithdrawal = z.infer<typeof createWithdrawalSchema>

/**
 * Queue Item Schemas
 */

export const queueStatusSchema = z.enum(["pending", "processing", "completed", "failed"])

export type QueueStatus = z.infer<typeof queueStatusSchema>

export const withdrawalQueueItemSchema = z.object({
	id: z.string().uuid(),
	clientId: z.string().uuid(),
	withdrawalTransactionId: z.string().uuid(),
	endUserVaultId: z.string().uuid(),
	amount: z.string().regex(/^\d+(\.\d+)?$/),
	status: queueStatusSchema,
	errorMessage: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export type WithdrawalQueueItem = z.infer<typeof withdrawalQueueItemSchema>
