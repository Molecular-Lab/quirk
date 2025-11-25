import { useEffect } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { partition } from "lodash"
import { Address } from "viem"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { getCachedToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { Price } from "@/types/price"
import { EvmToken, TokenAmount } from "@/types/tokens"

const ACTIVE_ORDER_STATUS: LimitOrderItem["status"][] = ["CREATED", "READY", "PENDING_CREATED", "EXPIRED"]

interface LimitOrdersResult {
	all: LimitOrderItem[]
	active: LimitOrderItem[]
	inactive: LimitOrderItem[]
}

export const useLimitOrders = (walletAddress: Address | undefined) => {
	const queryClient = useQueryClient()
	const chainId = useSwapChainId()

	const query = useQuery<LimitOrdersResult>({
		queryKey: QueryKeys.order.ordersByWallet(walletAddress),
		queryFn: async () => {
			if (!walletAddress) throw new Error("Wallet address is required")
			const response = await apiClient.orderRouter.getOrdersByWallet(walletAddress)

			// map response to LimitOrderItem
			const limitOrders = await Promise.all(
				response.map(async (order) => {
					const fromToken = await getCachedToken(queryClient, chainId, order.fromToken)
					const toToken = await getCachedToken(queryClient, chainId, order.toToken)

					const fromTokenAmount = TokenAmount.fromWei(fromToken, order.fromAmount)
					const toTokenAmount = TokenAmount.fromWei(toToken, order.minimumReceived)
					const expiredAt = dayjs.unix(order.expiredAt)
					const sorted: [EvmToken, EvmToken] =
						fromToken.compare(toToken) < 0 ? [fromToken, toToken] : [toToken, fromToken]
					const price = Price.fromSqrtRatio({
						base: sorted[0],
						quote: sorted[1],
						sqrtRatioX96: order.priceX96,
					})

					return {
						...order,
						fromTokenAmount,
						toTokenAmount,
						expiredAt,
						price,
					}
				}),
			)

			const [active, inactive] = partition(limitOrders, (order) => ACTIVE_ORDER_STATUS.includes(order.status))

			return {
				all: limitOrders,
				active: active,
				inactive: inactive,
			}
		},
		enabled: !!walletAddress,
	})

	// refetch 25 seconds after last updated
	useEffect(() => {
		if (!query.dataUpdatedAt) return
		const timeout = setTimeout(() => {
			void query.refetch()
		}, 25_000)
		return () => {
			clearTimeout(timeout)
		}
	}, [query])

	return query
}

// Helper functions for optimistic updates
export const upsertOptimisticOrder = (
	queryClient: ReturnType<typeof useQueryClient>,
	walletAddress: Address,
	order: LimitOrderItem,
) => {
	queryClient.setQueryData(QueryKeys.order.ordersByWallet(walletAddress), (old: LimitOrdersResult | undefined) => {
		if (!old) {
			const limitOrders = [order]
			const [active, inactive] = partition(limitOrders, (order) => ACTIVE_ORDER_STATUS.includes(order.status))
			return {
				all: limitOrders,
				active: active,
				inactive: inactive,
			}
		}

		// append to the front of the array
		const _limitOrders = [order, ...old.all]

		// unique by orderId
		const limitOrders = _limitOrders.filter((order, index, self) => {
			const idx = self.findIndex((t) => t.orderId === order.orderId)
			return idx === index
		})

		const [active, inactive] = partition(limitOrders, (order) => ACTIVE_ORDER_STATUS.includes(order.status))

		return {
			all: limitOrders,
			active: active,
			inactive: inactive,
		}
	})
}

export const deleteOptimisticOrder = (
	queryClient: ReturnType<typeof useQueryClient>,
	walletAddress: Address,
	orderId: string,
) => {
	queryClient.setQueryData(QueryKeys.order.ordersByWallet(walletAddress), (old: LimitOrdersResult | undefined) => {
		if (!old) return old
		const limitOrders = old.all.filter((order) => order.orderId !== orderId)
		const [active, inactive] = partition(limitOrders, (order) => ACTIVE_ORDER_STATUS.includes(order.status))
		return {
			all: limitOrders,
			active: active,
			inactive: inactive,
		}
	})
}
