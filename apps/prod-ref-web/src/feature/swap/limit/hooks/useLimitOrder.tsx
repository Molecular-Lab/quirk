import { useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { getCachedToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { Price } from "@/types/price"
import { EvmToken, TokenAmount } from "@/types/tokens"

export const useLimitOrder = (orderId: string) => {
	const queryClient = useQueryClient()
	const chainId = useSwapChainId()

	return useQuery<LimitOrderItem | null>({
		queryKey: QueryKeys.order.orderById(orderId),
		queryFn: async () => {
			const order = await apiClient.orderRouter.getOrder(orderId)
			if (!order) return null

			// map response to LimitOrderItem

			const fromToken = await getCachedToken(queryClient, chainId, order.fromToken)
			const toToken = await getCachedToken(queryClient, chainId, order.toToken)

			const fromTokenAmount = TokenAmount.fromWei(fromToken, order.fromAmount)
			const toTokenAmount = TokenAmount.fromWei(toToken, order.minimumReceived)
			const expiredAt = dayjs.unix(order.expiredAt)
			const sorted: [EvmToken, EvmToken] = fromToken.compare(toToken) < 0 ? [fromToken, toToken] : [toToken, fromToken]
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
		},
		enabled: !!orderId,
		refetchInterval: 5_000,
	})
}
