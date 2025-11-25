import { Sql } from "postgres"

import { LimitOrderLastRecordedBlock } from "@rabbitswap/core/entity"
import { findByChainId } from "@rabbitswap/database/gen/limit_order_last_recorded_block_sql"

export class LimitOrderLastRecordedBlockRepository {
	constructor(private readonly sql: Sql) {}

	async findByChainId(chainId: number): Promise<LimitOrderLastRecordedBlock | null> {
		const row = await findByChainId(this.sql, {
			chainId: chainId.toString(),
		})

		if (!row) return null

		return {
			chainId: row.chainId,
			blockNumber: parseInt(row.blockNumber ?? "0", 10),
			blockTimestamp: row.blockTimestamp ?? new Date(),
			reorgBlockNumber: parseInt(row.reorgBlockNumber ?? "0", 10),
			reorgBlockTimestamp: row.reorgBlockTimestamp ?? new Date(),
		}
	}
}
