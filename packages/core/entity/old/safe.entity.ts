import { z } from "zod"

import type { Address, Hash } from "viem"

const addressSchema = z.custom<Address>()

export const safeInfoSchema = z.object({
	address: addressSchema,
	chainId: z.union([z.string(), z.number(), z.bigint()]),
	owners: z.array(addressSchema),
	threshold: z.number(),
	nonce: z.number(),
})
export type SafeInfo = z.infer<typeof safeInfoSchema>

export const safeTransactionSchema = z.object({
	to: addressSchema,
	value: z.string(),
	data: z.string(),
	operation: z.union([z.literal(0), z.literal(1)]).optional(),
})
export type SafeTransaction = z.infer<typeof safeTransactionSchema>

export const safeTransactionResultSchema = z.object({
	safeTxHash: z.string(),
	nonce: z.number(),
	signatures: z.array(z.string()).optional(),
})
export type SafeTransactionResult = z.infer<typeof safeTransactionResultSchema>

export const transactionResultSchema = z.object({
	success: z.boolean(),
	txHash: z.custom<Hash>().optional(),
	safeTxHash: z.string().optional(),
	message: z.string().optional(),
})
export type TransactionResult = z.infer<typeof transactionResultSchema>

export interface TransactionMessageSet {
	success: string
	failure: string
	safeSuccess?: (result: SafeTransactionResult) => string
}

export interface SafeClientAdapter {
	getInfo(safeAddress: Address): Promise<SafeInfo>
	sendTransaction(tx: SafeTransaction): Promise<TransactionResult>
	executeTransaction(tx: SafeTransaction): Promise<Hash>
	signTransaction(tx: SafeTransaction): Promise<SafeTransactionResult>
	proposeTransaction(tx: SafeTransaction): Promise<SafeTransactionResult>
}
