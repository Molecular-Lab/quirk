import { type Sql } from "postgres"

import { findOrderByChainIdAndOrderId, findOrderByChainIdAndUser } from "@rabbitswap/database/gen/limit_order_sql"

export class LimitOrderRepository {
	constructor(private readonly sql: Sql) {}

	async findOrderByChainIdAndOrderId(chainId: number, orderId: string) {
		const result = await findOrderByChainIdAndOrderId(this.sql, {
			chainId: chainId.toString(),
			orderId: orderId,
		})

		return result
	}

	async findOrderByChainIdAndUser(chainId: number, userAddress: string) {
		const result = await findOrderByChainIdAndUser(this.sql, {
			chainId: chainId.toString(),
			userAddress: userAddress,
		})

		return result
	}
}
