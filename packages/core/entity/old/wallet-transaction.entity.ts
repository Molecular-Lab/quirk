import { z } from "zod"

/**
 * Supported chain types for transactions
 */
export const transactionChainTypeSchema = z.enum([
	"ethereum",
	"solana",
	"stellar",
	"cosmos",
	"sui",
	"tron",
	"bitcoin-segwit",
	"near",
	"ton",
	"starknet",
	"movement",
	"aptos",
])
export type TransactionChainType = z.infer<typeof transactionChainTypeSchema>

/**
 * Chain ID mapping for EVM chains
 */
export const ChainIds = {
	ETHEREUM_MAINNET: 1,
	ETHEREUM_SEPOLIA: 11155111,
	POLYGON_MAINNET: 137,
	POLYGON_AMOY: 80002,
	ARBITRUM_MAINNET: 42161,
	OPTIMISM_MAINNET: 10,
	BASE_MAINNET: 8453,
	BSC_MAINNET: 56,
	AVALANCHE_MAINNET: 43114,
} as const

/**
 * Transaction parameters for Ethereum/EVM chains
 */
export const ethereumTransactionParamsSchema = z.object({
	from: z.string(), // Wallet address
	to: z.string(), // Recipient address
	value: z.string().optional(), // Amount in wei (hex string)
	data: z.string().optional(), // Contract call data
	gas: z.string().optional(), // Gas limit
	gasPrice: z.string().optional(), // Gas price in wei
	maxFeePerGas: z.string().optional(), // EIP-1559
	maxPriorityFeePerGas: z.string().optional(), // EIP-1559
	nonce: z.number().optional(), // Transaction nonce
	chainId: z.number(), // Chain ID
})
export type EthereumTransactionParams = z.infer<typeof ethereumTransactionParamsSchema>

/**
 * Ethereum transaction result
 */
export const ethereumTransactionResultSchema = z.object({
	txHash: z.string(),
	chainId: z.number(),
	from: z.string(),
	to: z.string(),
	value: z.string().optional(),
	status: z.enum(["pending", "confirmed", "failed"]),
	blockNumber: z.number().optional(),
	timestamp: z.string(), // ISO timestamp
})
export type EthereumTransactionResult = z.infer<typeof ethereumTransactionResultSchema>

/**
 * Sign transaction parameters
 */
export const signTransactionParamsSchema = z.object({
	walletAddress: z.string(),
	transaction: ethereumTransactionParamsSchema,
})
export type SignTransactionParams = z.infer<typeof signTransactionParamsSchema>

/**
 * Send transaction parameters
 */
export const sendTransactionParamsSchema = z.object({
	walletAddress: z.string(),
	transaction: ethereumTransactionParamsSchema,
})
export type SendTransactionParams = z.infer<typeof sendTransactionParamsSchema>

/**
 * Get transaction status parameters
 */
export const getTransactionStatusParamsSchema = z.object({
	txHash: z.string(),
	chainId: z.number(),
})
export type GetTransactionStatusParams = z.infer<typeof getTransactionStatusParamsSchema>

/**
 * RPC request parameters
 */
export const rpcRequestParamsSchema = z.object({
	walletAddress: z.string(),
	chainId: z.number(),
	method: z.string(), // eth_sendTransaction, eth_signTransaction, etc.
	params: z.array(z.any()),
})
export type RpcRequestParams = z.infer<typeof rpcRequestParamsSchema>

/**
 * Transaction history entry
 */
export const transactionHistoryEntrySchema = z.object({
	id: z.string().uuid(),
	productId: z.string(),
	userId: z.string(),
	walletAddress: z.string(),
	txHash: z.string(),
	chainId: z.number(),
	from: z.string(),
	to: z.string(),
	value: z.string().optional(),
	data: z.string().optional(),
	status: z.enum(["pending", "confirmed", "failed"]),
	blockNumber: z.number().optional(),
	gasUsed: z.string().optional(),
	timestamp: z.string(), // ISO timestamp when transaction was created
})
export type TransactionHistoryEntry = z.infer<typeof transactionHistoryEntrySchema>
