import { useQueryClient } from "@tanstack/react-query"
import { Dayjs } from "dayjs"
import { getAddress, isAddressEqual } from "viem"

import { limitOrderAbi } from "@rabbitswap/core/constants"
import { useToaster } from "@rabbitswap/ui/basic"

import { QueryKeys } from "@/config/queryKey"
import { DEFAULT_CHAIN } from "@/constants/chain"
import { VICTION_CONTRACT } from "@/constants/dex"
import { useDepositEthWarningModalStore } from "@/feature/sub-account/components/DepositEthWarningModal"
import { useAccountMode } from "@/feature/sub-account/context"
import { deleteOptimisticOrder, upsertOptimisticOrder } from "@/feature/swap/limit/hooks/useLimitOrders"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { useChainTxMutation } from "@/hooks/transaction"
import { useAccount } from "@/hooks/useAccount"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { RabbitSwapNoEthError, checkNoEthError, isNoEthError } from "@/utils/sub-account/error"
import { isUserRejectedError } from "@/utils/transaction"

export interface CreateOrderParams {
	amount: [TokenAmount, TokenAmount]
	price: Price
	expiredAt: Dayjs
	chainId?: number
}

export interface CreateOrderTxData {
	order: LimitOrderItem
}

interface CreateOrderResult {
	tx: Transaction<CreateOrderTxData>
}

export const useCreateOrderMutation = () => {
	const { accountMode } = useAccountMode()
	const { subAddress } = useAccount()
	const { walletClient, publicClient } = useViemClient()
	const toast = useToaster()
	const txToast = useTxToast()
	const refetch = useRefetch()
	const queryClient = useQueryClient()

	const { setIsOpen: setOpenDepositModal } = useDepositEthWarningModalStore()

	return useChainTxMutation({
		mutationFn: async (props: CreateOrderParams): Promise<CreateOrderResult> => {
			const chainId = props.chainId ?? DEFAULT_CHAIN.id
			if (accountMode !== "sub" || !subAddress) {
				throw new Error("Wrong account mode detected, please switch to trading account.")
			}
			if (!walletClient) {
				throw new Error("Wallet client is not initialized, please refresh page and try again.")
			}
			if (walletClient.chain?.id !== chainId) {
				throw new Error(
					`[CreateOrder] walletClient is not connected to the correct chain (connected to ${walletClient.chain?.id}, expected ${chainId})`,
				)
			}
			if (!walletClient.account) {
				throw new Error("[CreateOrder] walletClient is not connected to an account")
			}
			if (!isAddressEqual(walletClient.account.address, subAddress)) {
				throw new Error("Wallet client is not connected to the sub-account, please refresh page and try again.")
			}

			const noEth = await checkNoEthError(walletClient.account.address, chainId)
			if (noEth) {
				setOpenDepositModal(true)
				throw new RabbitSwapNoEthError()
			}

			const [amountIn, amountOut] = props.amount
			const value = amountIn.token.isNative ? amountIn.bigint : BigInt(0)

			const { request, result } = await publicClient.simulateContract({
				address: VICTION_CONTRACT.limitOrder,
				abi: limitOrderAbi,
				functionName: "createOrder",
				account: walletClient.account,
				args: [
					getAddress(amountIn.token.address),
					getAddress(amountOut.token.address),
					amountIn.bigint,
					BigInt(props.price.sqrtRatioX96.toString()),
					amountOut.bigint,
					BigInt(props.expiredAt.unix()),
				],
				value: value,
			})

			const gas = await publicClient.estimateContractGas(request)
			const hash = await walletClient.writeContract({ ...request, gas })

			const order: LimitOrderItem = {
				orderId: result,
				fromTokenAmount: amountIn,
				toTokenAmount: amountOut,
				price: props.price,
				expiredAt: props.expiredAt,
				status: "PENDING_CREATED",
				orderTxHash: hash,
				tradeTxHash: undefined,
				cancelTxHash: undefined,
				orderOwner: walletClient.account.address,
				orderTxTimestamp: undefined, // will be set later
				tradeTxTimestamp: undefined,
				cancelTxTimestamp: undefined,
			}

			const tx = new Transaction<CreateOrderTxData>({
				hash: hash,
				chainId: chainId,
				address: walletClient.account.address,
				data: {
					order: order,
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
			if (isNoEthError(error)) {
				return
			}
			toast.showPreset.error({
				title: "Create Order Failed",
				description: error.message,
			})
		},
		onSubmitted: ({ tx }) => {
			const { order } = tx.data
			const newOrder: LimitOrderItem = {
				...order,
				status: "PENDING_CREATED",
			}
			upsertOptimisticOrder(queryClient, tx.address, newOrder)
		},
		onSuccess: ({ tx }) => {
			const { order } = tx.data
			txToast.success({
				title: "Created Order",
				description: `Order of ${order.fromTokenAmount.toFormat({ decimalPlaces: 3, withUnit: true })} for at least ${order.toTokenAmount.toFormat({ decimalPlaces: 3, withUnit: true })} has been created`,
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
				status: "CREATED",
			}
			upsertOptimisticOrder(queryClient, tx.address, newOrder)
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Create Order Failed",
				description: error.message,
				tx: resp.tx,
			})
			deleteOptimisticOrder(queryClient, resp.tx.address, resp.tx.data.order.orderId)
		},
	})
}
