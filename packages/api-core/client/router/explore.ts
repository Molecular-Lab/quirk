import { coreContract } from "../../contracts"
import { PoolDataTimeframe, PoolSortBy, ProtocolChartTimeframe, SortDirection } from "../../dto"
import { APIError } from "../error"

import { Router } from "./router"

export class ExploreRouter extends Router<typeof coreContract> {
	async getTvlData() {
		const response = await this.client.explore.protocolTvl()

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch TVL")
			}
		}
	}

	async getVolumeData(timeframe: ProtocolChartTimeframe) {
		const response = await this.client.explore.protocolVolume({ query: { timeframe } })

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch volume")
			}
		}
	}

	async getPools(sortBy: PoolSortBy, sortDirection: SortDirection) {
		const response = await this.client.explore.pools({ query: { sortBy, sortDirection } })

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch pools")
			}
		}
	}

	async getPool(address: string) {
		const response = await this.client.explore.pool({ params: { address } })

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch pool")
			}
		}
	}

	async getPoolTicks(address: string) {
		const response = await this.client.explore.poolTicks({ params: { address } })

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch pool ticks")
			}
		}
	}

	async getPoolTransactions(address: string) {
		const response = await this.client.explore.poolTransactions({ params: { address } })

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch pool transactions")
			}
		}
	}

	async getPoolPrice(address: string, timeframe: PoolDataTimeframe) {
		const response = await this.client.explore.poolPrice({ params: { address }, query: { timeframe } })

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch pool price")
			}
		}
	}

	async getPoolVolume(address: string, timeframe: PoolDataTimeframe) {
		const response = await this.client.explore.poolVolume({ params: { address }, query: { timeframe } })

		switch (response.status) {
			case 200: {
				return response.body.result
			}
			default: {
				throw new APIError(response.status, "Failed to fetch pool volume")
			}
		}
	}
}
