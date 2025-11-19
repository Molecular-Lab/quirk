import { LimitOrder, LimitOrderLastRecordedBlock, LimitOrderStatus } from "@rabbitswap/core/entity"

import { Logger } from "@/logger"
import { LimitOrderLastRecordedBlockRepository } from "@/repository/limit-order-last-recorded-block.repository"

import { LimitOrderRepository } from "../repository/limit-order.repository"

/**
 * This is service for limit order feature.
 * It's used to get the last recorded block, and also to get the order by order ID and by wallet address.
 */
export class OrderService {
	private readonly orderRepository: LimitOrderRepository
	private readonly lastRecordedBlockRepository: LimitOrderLastRecordedBlockRepository

	constructor(init: {
		orderRepository: LimitOrderRepository
		lastRecordedBlockRepository: LimitOrderLastRecordedBlockRepository
	}) {
		this.orderRepository = init.orderRepository
		this.lastRecordedBlockRepository = init.lastRecordedBlockRepository
	}

	/**
	 * Get the last recorded block for a given chain ID
	 * @param chainId
	 * @returns The last recorded block
	 */
	async getLastRecordedBlock(chainId: number): Promise<LimitOrderLastRecordedBlock | null> {
		const lastRecordedBlock = await this.lastRecordedBlockRepository.findByChainId(chainId)
		return lastRecordedBlock
	}

	/**
	 * Get the order by order ID
	 * @param chainId
	 * @param orderId
	 * @returns The order, or null if not found
	 */
	async getOrder(chainId: number, orderId: string): Promise<LimitOrder | null> {
		try {
			const result = await this.orderRepository.findOrderByChainIdAndOrderId(chainId, orderId)
			if (!result) return null

			const order: LimitOrder = {
				chainId: result.chainId,
				orderId: result.orderId,
				userAddress: result.userAddress,
				fromToken: result.fromToken,
				toToken: result.toToken,
				amount: result.amount,
				price: result.price,
				minimumReceived: result.minimumReceived,
				status: LimitOrderStatus.parse(result.status),
				confirmedStatus: LimitOrderStatus.parse(result.confirmedStatus),
				expiredAt: result.expiredAt,
				canceledAt: result.canceledAt ?? undefined,
				canceledBlockAt: result.canceledBlockAt ?? undefined,
				completedAt: result.completedAt ?? undefined,
				completedBlockAt: result.completedBlockAt ?? undefined,
				createdAt: result.createdAt ?? new Date(),
				updatedAt: result.updatedAt ?? new Date(),
				orderTxHash: result.orderTxHash ?? undefined,
				tradeTxHash: result.tradeTxHash ?? undefined,
				cancelTxHash: result.cancelTxHash ?? undefined,
			}

			return order
		} catch (error) {
			Logger.error("Error getting order", {
				event: "get_order_by_id",
				err: error,
			})
			return null
		}
	}

	/**
	 * Get the orders by wallet address
	 * @param chainId
	 * @param userAddress
	 * @returns The orders, or empty array if not found
	 */
	async getOrdersByWallet(chainId: number, userAddress: string): Promise<LimitOrder[]> {
		try {
			const results = await this.orderRepository.findOrderByChainIdAndUser(chainId, userAddress)

			// map to LimitOrder and sort by createdAt descending
			const orders = results
				.map<LimitOrder>((result) => {
					const x: LimitOrder = {
						chainId: result.chainId,
						orderId: result.orderId,
						userAddress: result.userAddress,
						fromToken: result.fromToken,
						toToken: result.toToken,
						amount: result.amount,
						price: result.price,
						minimumReceived: result.minimumReceived,
						status: LimitOrderStatus.parse(result.status),
						confirmedStatus: LimitOrderStatus.parse(result.confirmedStatus),
						expiredAt: result.expiredAt,
						canceledAt: result.canceledAt ?? undefined,
						canceledBlockAt: result.canceledBlockAt ?? undefined,
						completedAt: result.completedAt ?? undefined,
						completedBlockAt: result.completedBlockAt ?? undefined,
						createdAt: result.createdAt ?? new Date(),
						updatedAt: result.updatedAt ?? new Date(),
						orderTxHash: result.orderTxHash ?? undefined,
						tradeTxHash: result.tradeTxHash ?? undefined,
						cancelTxHash: result.cancelTxHash ?? undefined,
					}
					return x
				})
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

			return orders
		} catch (error) {
			Logger.error("Error getting orders by wallet", {
				event: "get_orders_by_wallet",
				err: error,
			})
			return []
		}
	}
}
