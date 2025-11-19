import { VICTION_CONTRACT } from "@/constants/dex"
import { CreateOrderParams, useCreateOrderMutation } from "@/feature/swap/limit/hooks/useCreateOrderMutation"
import { useLimitProcessStore } from "@/feature/swap/limit/store/limitProcessStore"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { useApproveMutation } from "@/hooks/token/useApproveMutation"

export const useConfirmMutation = () => {
	const { mutateAsync: createOrderMutation } = useCreateOrderMutation()
	const { mutateAsync: approveMutation } = useApproveMutation()
	const { setProcess, setCreateOrderTx, setType, setAmounts } = useLimitProcessStore()
	const { reset } = useLimitStore()

	const {
		computed: { amountIn, amountOut },
		priceCondition,
		expiresAt,
	} = useLimitStore()

	return {
		placeOrder: () => {
			if (!amountIn || !amountOut || !priceCondition) {
				throw new Error("[Limit-PlaceOrder] amountIn, amountOut, price is not available")
			}
			const createParams: CreateOrderParams = {
				amount: [amountIn, amountOut],
				price: priceCondition,
				expiredAt: expiresAt,
			}

			void createOrderMutation(createParams, {
				onInit: (data) => {
					setAmounts(data.amount)
					setProcess("ORDER_SIGNING")
				},
				onError: () => {
					setProcess("ORDER_FAILED")

					// if user reject swap after approving, change the process to single
					setType("single")
				},
				onSubmitted: (data) => {
					setProcess("ORDER_SUBMITTED")
					setCreateOrderTx(data.tx)
					reset()
				},
				onSuccess: (data) => {
					setProcess("ORDER_SUCCESS")
					setCreateOrderTx(data.tx)
				},
				onTxError: (_, { resp }) => {
					setProcess("ORDER_FAILED")
					setCreateOrderTx(resp.tx)
				},
			})
		},
		approve: () => {
			if (!amountIn) {
				throw new Error("[Limit-Approve] amountIn is not available")
			}
			void approveMutation(
				{
					token: amountIn.token,
					spender: VICTION_CONTRACT.limitOrder,
				},
				{
					onInit: () => {
						setProcess("APPROVE_SIGNING")
					},
					onError: () => {
						setProcess("REVIEWING")
					},
					onSubmitted: () => {
						setProcess("APPROVE_SUBMITTED")
					},
					onTxError: () => {
						setProcess("REVIEWING")
					},
				},
			)
		},
	}
}
