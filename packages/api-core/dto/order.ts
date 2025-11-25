import { z } from "zod"

import { Address, Hash, Hex } from "../entity"

export const OrderStatusEnum = z.enum(["CREATED", "READY", "EXECUTED", "COMPLETED", "CANCELED", "EXPIRED"])

export type OrderStatus = z.infer<typeof OrderStatusEnum>

export const OptimisticOrderStatusEnum = z.enum(["PENDING_CREATED", "PENDING_CANCELED"])

export type OptimisticOrderStatus = z.infer<typeof OptimisticOrderStatusEnum>

export const OrderSchema = z.object({
	orderId: z.string(),
	fromToken: z.string(),
	toToken: z.string(),
	fromAmount: z.string(), // bigint
	price: z.string(), // bigint
	minimumReceived: z.string(), // bigint
	expiredAt: z.number(), // unix
	status: OrderStatusEnum,
	orderTxHash: z.string().nullable(),
	orderTxTimestamp: z.number().nullable(), // unix
	tradeTxHash: z.string().nullable(),
	tradeTxTimestamp: z.number().nullable(), // unix
	cancelTxHash: z.string().nullable(),
	cancelTxTimestamp: z.number().nullable(), // unix
	orderOwner: z.string(),
})

export type OrderSchema = z.infer<typeof OrderSchema>

export interface LimitOrderItem {
	orderId: Hex
	fromToken: Address
	toToken: Address
	fromAmount: bigint
	priceX96: bigint
	minimumReceived: bigint
	expiredAt: number // unix
	status: OrderStatus | OptimisticOrderStatus
	orderTxHash: Hash | undefined
	orderTxTimestamp: number | undefined
	tradeTxHash: Hash | undefined
	tradeTxTimestamp: number | undefined
	cancelTxHash: Hash | undefined
	cancelTxTimestamp: number | undefined
	orderOwner: Address
}

export function parseOrderItem(order: OrderSchema): LimitOrderItem {
	const x: LimitOrderItem = {
		orderId: order.orderId as Hex,
		fromToken: order.fromToken as Address,
		toToken: order.toToken as Address,
		fromAmount: BigInt(order.fromAmount),
		priceX96: BigInt(order.price),
		minimumReceived: BigInt(order.minimumReceived),
		expiredAt: order.expiredAt,
		status: order.status,
		orderTxHash: order.orderTxHash as Hash | undefined,
		orderTxTimestamp: order.orderTxTimestamp ?? undefined,
		tradeTxHash: order.tradeTxHash as Hash | undefined,
		tradeTxTimestamp: order.tradeTxTimestamp ?? undefined,
		cancelTxHash: order.cancelTxHash as Hash | undefined,
		cancelTxTimestamp: order.cancelTxTimestamp ?? undefined,
		orderOwner: order.orderOwner as Address,
	}
	return x
}
