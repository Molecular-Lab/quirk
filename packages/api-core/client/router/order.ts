import { coreContract } from "../../contracts"
import { LimitOrderItem, parseOrderItem } from "../../dto/order"
import { APIError } from "../error"

import { Router } from "./router"

export class OrderRouter extends Router<typeof coreContract> {
	async getOrder(orderId: string): Promise<LimitOrderItem | null> {
		const response = await this.client.order.getOrder({ params: { orderId } })
		switch (response.status) {
			case 200: {
				return parseOrderItem(response.body.order)
			}
			case 404: {
				return null
			}
			default: {
				throw new APIError(response.status, "Failed to fetch order")
			}
		}
	}
	async getOrdersByWallet(walletAddress: string): Promise<LimitOrderItem[]> {
		const response = await this.client.order.getOrdersByWallet({ params: { walletAddress } })
		switch (response.status) {
			case 200: {
				return response.body.orders.map((order) => parseOrderItem(order))
			}
			default: {
				throw new APIError(response.status, "Failed to fetch orders by wallet")
			}
		}
	}
}
