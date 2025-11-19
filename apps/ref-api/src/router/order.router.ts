import { initServer } from "@ts-rest/fastify"

import { orderContract } from "@rabbitswap/api-core/contracts/order"
import { OrderSchema } from "@rabbitswap/api-core/dto"
import { LimitOrder, LimitOrderLastRecordedBlock } from "@rabbitswap/core/entity"

import { OrderService } from "@/service/order"

function getStatus(order: LimitOrder, lastRecordedBlock: LimitOrderLastRecordedBlock) {
	let status = order.status
	if (order.confirmedStatus === "CANCELED" || order.confirmedStatus === "COMPLETED") {
		status = order.confirmedStatus
	} else if (order.confirmedStatus === "REMOVED") {
		if (lastRecordedBlock.reorgBlockTimestamp > order.updatedAt) {
			status = "REMOVED"
		} else {
			status = order.status
		}
	} else {
		status = order.status
	}
	return status
}

export function createOrderRouter(
	s: ReturnType<typeof initServer>,
	{ orderService, chainId }: { orderService: OrderService; chainId: number },
) {
	return s.router(orderContract, {
		getOrder: async ({ params }) => {
			const order = await orderService.getOrder(chainId, params.orderId)
			if (!order) {
				return Promise.resolve({ status: 404, body: { message: "Order not found" } })
			}

			const lastRecordedBlock = await orderService.getLastRecordedBlock(chainId)
			if (!lastRecordedBlock) {
				return Promise.resolve({ status: 404, body: { message: "Order not found" } })
			}

			const status = getStatus(order, lastRecordedBlock)
			if (status === "REMOVED") {
				return Promise.resolve({ status: 404, body: { message: "Order not found" } })
			}

			const orderItem: OrderSchema = {
				orderId: order.orderId,
				orderOwner: order.userAddress,
				fromToken: order.fromToken,
				toToken: order.toToken,
				fromAmount: order.amount.split(".")[0] ?? "0",
				price: order.price.split(".")[0] ?? "0",
				minimumReceived: order.minimumReceived.split(".")[0] ?? "0",
				expiredAt: Math.floor(order.expiredAt.getTime() / 1000),
				status: status,
				orderTxHash: order.orderTxHash ?? null,
				orderTxTimestamp: order.createdAt.getTime() / 1000,
				tradeTxHash: order.tradeTxHash ?? null,
				tradeTxTimestamp: order.completedAt ? order.completedAt.getTime() / 1000 : null,
				cancelTxHash: order.cancelTxHash ?? null,
				cancelTxTimestamp: order.canceledAt ? order.canceledAt.getTime() / 1000 : null,
			}

			return Promise.resolve({
				status: 200,
				body: {
					order: orderItem,
				},
			})
		},

		getOrdersByWallet: async ({ params }) => {
			const lastRecordedBlock = await orderService.getLastRecordedBlock(chainId)
			if (!lastRecordedBlock) {
				return {
					status: 404,
					body: {
						message: "Order not found",
					},
				}
			}

			const orders = await orderService.getOrdersByWallet(chainId, params.walletAddress)

			const parsedOrders = orders
				.map((order) => {
					const status = getStatus(order, lastRecordedBlock)
					if (status === "REMOVED") {
						return null
					}
					const orderItem: OrderSchema = {
						orderId: order.orderId,
						orderOwner: order.userAddress,
						fromToken: order.fromToken,
						toToken: order.toToken,
						fromAmount: order.amount.split(".")[0] ?? "0",
						price: order.price.split(".")[0] ?? "0",
						minimumReceived: order.minimumReceived.split(".")[0] ?? "0",
						expiredAt: Math.floor(order.expiredAt.getTime() / 1000),
						status: status,
						orderTxHash: order.orderTxHash ?? null,
						orderTxTimestamp: order.createdAt.getTime() / 1000,
						tradeTxHash: order.tradeTxHash ?? null,
						tradeTxTimestamp: order.completedAt ? order.completedAt.getTime() / 1000 : null,
						cancelTxHash: order.cancelTxHash ?? null,
						cancelTxTimestamp: order.canceledAt ? order.canceledAt.getTime() / 1000 : null,
					}
					return orderItem
				})
				.filter((order) => order !== null)

			return {
				status: 200,
				body: {
					orders: parsedOrders,
				},
			}
		},
	})
}
