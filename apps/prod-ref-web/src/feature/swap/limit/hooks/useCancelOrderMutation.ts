import { useQueryClient } from "@tanstack/react-query"

import { limitOrderAbi } from "@rabbitswap/core/constants"
import { useToaster } from "@rabbitswap/ui/basic"

import { QueryKeys } from "@/config/queryKey"
import { DEFAULT_CHAIN } from "@/constants/chain"
import { VICTION_CONTRACT } from "@/constants/dex"
import { useAccountMode } from "@/feature/sub-account/context"
import { upsertOptimisticOrder } from "@/feature/swap/limit/hooks/useLimitOrders"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { useChainTxMutation } from "@/hooks/transaction"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { Transaction } from "@/types/transaction"
import { sortDisplayAmount } from "@/utils/token"
import { isUserRejectedError } from "@/utils/transaction"

export interface CancelOrderParams {
	order: LimitOrderItem
	chainId?: number
}

export interface CancelOrderTxData {
	order: LimitOrderItem
}

interface CancelOrderResult {
	tx: Transaction<CancelOrderTxData>
}

export const useCancelOrderMutation = () => {
	const { accountMode } = useAccountMode()
	const { walletClient, publicClient } = useViemClient()
	const toast = useToaster()
	const txToast = useTxToast()
	const refetch = useRefetch()
	const queryClient = useQueryClient()

	return useChainTxMutation({
		mutationFn: async (props: CancelOrderParams): Promise<CancelOrderResult> => {
			const chainId = props.chainId ?? DEFAULT_CHAIN
			const orderId = props.order.orderId
			if (accountMode !== "sub") {
				throw new Error("Wrong account mode detected, please switch to trading account.")
			}
			if (!walletClient) {
				throw new Error("Wallet client is not initialized, please refresh page and try again.")
			}
			if (walletClient.chain?.id !== chainId) {
				throw new Error("[CancelOrder] walletClient is not connected to the correct chain")
			}
			if (!walletClient.account) {
				throw new Error("[CancelOrder] walletClient is not connected to an account")
			}

			const { request } = await publicClient.simulateContract({
				address: VICTION_CONTRACT.limitOrder,
				abi: limitOrderAbi,
				functionName: "cancelOrder",
				account: walletClient.account,
				args: [orderId],
			})

			const gas = await publicClient.estimateContractGas(request)
			const hash = await walletClient.writeContract({ ...request, gas })

			const tx = new Transaction<CancelOrderTxData>({
				hash: hash,
				chainId: chainId,
				address: walletClient.account.address,
				data: {
					order: props.order,
				},
			})

			return {
				tx: tx,
			}
		},
		onError: (error) => {
			if (isUserRejectedError(error)) {
				toast.showPreset.info({
					title: "User rejected",
					description: "User rejected the request.",
				})
				return
			}
			toast.showPreset.error({
				title: "Cancel Order Failed",
				description: error.message,
			})
		},
		onSubmitted: ({ tx }) => {
			const { order } = tx.data
			// Update order status optimistically
			const newOrder: LimitOrderItem = {
				...order,
				status: "PENDING_CANCELED",
				cancelTxHash: tx.hash,
			}
			upsertOptimisticOrder(queryClient, tx.address, newOrder)
		},
		onSuccess: ({ tx }) => {
			const { order } = tx.data

			const [leftTokenAmount] = sortDisplayAmount([order.fromTokenAmount, order.toTokenAmount])
			const side = order.fromTokenAmount.token.equals(leftTokenAmount.token) ? "Sell" : "Buy"

			txToast.success({
				title: "Cancelled Order",
				description: `${side} ${leftTokenAmount.toFormat({ decimalPlaces: 3, withUnit: true })} cancelled`,
				token: [order.fromTokenAmount.token, order.toTokenAmount.token],
				tx: tx,
			})
			refetch([
				QueryKeys.tokenBalance.token(tx.address, order.fromTokenAmount.token.currencyId),
				QueryKeys.tokenBalance.token(tx.address, order.toTokenAmount.token.currencyId),
			])

			// Update order status optimistically
			const newOrder: LimitOrderItem = {
				...order,
				status: "CANCELED",
				cancelTxHash: tx.hash,
			}
			upsertOptimisticOrder(queryClient, tx.address, newOrder)
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Cancel Order Failed",
				description: error.message,
				tx: resp.tx,
			})

			// Update order status optimistically, revert to the original status
			upsertOptimisticOrder(queryClient, resp.tx.address, resp.tx.data.order)
		},
	})
}
