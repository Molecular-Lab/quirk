import { initContract } from "@ts-rest/core"
import { z } from "zod"

import {
	APIResponse,
	ChartData,
	ErrorResponse,
	ExplorePoolStats,
	PoolData,
	PoolDataTimeframe,
	PoolSortBy,
	PoolTransactionItem,
	ProtocolChartTimeframe,
	SortDirection,
	TickData,
} from "../dto"

const c = initContract()
export const exploreContract = c.router({
	protocolTvl: {
		method: "GET",
		path: "/explore/tvl",
		responses: {
			200: c.type<APIResponse<ChartData[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
	protocolVolume: {
		method: "GET",
		path: "/explore/volume",
		query: z.object({
			timeframe: ProtocolChartTimeframe,
		}),
		responses: {
			200: c.type<APIResponse<ChartData[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
	pools: {
		method: "GET",
		path: "/explore/pools",
		query: z.object({
			sortBy: PoolSortBy,
			sortDirection: SortDirection,
		}),
		responses: {
			200: c.type<APIResponse<PoolData[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
	pool: {
		method: "GET",
		path: "/explore/pools/:address/stats",
		responses: {
			200: c.type<APIResponse<ExplorePoolStats>>(),
			400: c.type<ErrorResponse>(),
		},
	},
	poolTicks: {
		method: "GET",
		path: "/explore/pools/:address/ticks",
		responses: {
			200: c.type<APIResponse<TickData[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
	poolPrice: {
		method: "GET",
		path: "/explore/pools/:address/price",
		query: z.object({
			timeframe: PoolDataTimeframe,
		}),
		responses: {
			200: c.type<APIResponse<ChartData[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
	poolVolume: {
		method: "GET",
		path: "/explore/pools/:address/volume",
		query: z.object({
			timeframe: PoolDataTimeframe,
		}),
		responses: {
			200: c.type<APIResponse<ChartData[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
	poolTransactions: {
		method: "GET",
		path: "/explore/pools/:address/transactions",
		responses: {
			200: c.type<APIResponse<PoolTransactionItem[]>>(),
			400: c.type<ErrorResponse>(),
		},
	},
})
