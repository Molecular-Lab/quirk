import { useQuery, useQueryClient } from "@tanstack/react-query"
import { type Address } from "viem"

import { APIError } from "@rabbitswap/api-core/client"
import { ArkenQuoteResponse } from "@rabbitswap/api-core/client/arken-client/dto"
import { MethodParameters, QuoteResponse, SwapPool } from "@rabbitswap/api-core/dto"
import { QuoteType } from "@rabbitswap/api-core/entity"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"
import { getCachedToken } from "@/hooks/token/useToken"
import { useAccount } from "@/hooks/useAccount"
import { Price } from "@/types/price"
import { TokenAmount } from "@/types/tokens"
import { getWrapped } from "@/utils/token"

export interface QuoteParams {
	amountIn: TokenAmount | undefined
	amountOut: TokenAmount | undefined
	type: QuoteType
	recipient?: Address
	disabled?: boolean
}

export interface QuoteResult {
	chainId: number
	amountOut: TokenAmount
	amountIn: TokenAmount
	poolFeeAmounts: TokenAmount[]
	route: SwapPool[][]
	methodParams: MethodParameters
	type: QuoteType
	quotePrice: Price
	params: QuoteParams
	routeCount?: number
	rawQuote: QuoteResponse | ArkenQuoteResponse
}

export class QuoteError extends APIError<"NO_ROUTE" | "NOT_ENOUGH_LIQUIDITY"> {
	name = "QuoteError"
	constructor(
		public status: number,
		message: string,
		public request: QuoteParams,
	) {
		super(status, message)
	}
}

export const useQuote = (params: QuoteParams) => {
	const { amountIn, amountOut, type, disabled } = params
	const {
		computed: { slippage, deadline },
	} = useTxSetting()
	const queryClient = useQueryClient()

	// If recipient is not provided, use the current account address
	const { address } = useAccount()
	const recipient: Address | undefined = params.recipient ?? address

	const baseAmount = type === "EXACT_INPUT" ? amountIn : amountOut
	const quoteAmount = type === "EXACT_INPUT" ? amountOut : amountIn

	// if the token is eth & weth, don't fetch quote
	const isNativeAndWrapped =
		baseAmount && quoteAmount && getWrapped(baseAmount.token).equals(getWrapped(quoteAmount.token))

	return useQuery<QuoteResult>({
		queryKey: QueryKeys.quote.rabbitswap(baseAmount, quoteAmount, type, slippage, deadline, recipient),
		queryFn: async () => {
			if (!amountIn || !amountOut) {
				throw new Error("[useQuote] Wrong usage")
			}
			const tokenIn = amountIn.token
			const tokenOut = amountOut.token

			const amount = String(type === "EXACT_INPUT" ? amountIn.bigint : amountOut.bigint)
			if (amount === "0") {
				throw new QuoteError(400, "AMOUNT_IS_ZERO", params)
			}

			try {
				const { quote: res, routeCount } = await apiClient.swapRouter.getQuote({
					tokenInChainId: tokenIn.chainId,
					tokenIn: tokenIn.isNative ? "ETH" : tokenIn.address,
					tokenOutChainId: tokenOut.chainId,
					tokenOut: tokenOut.isNative ? "ETH" : tokenOut.address,
					type: type,
					amount: amount,
					slippageTolerance: String(slippage),
					deadline: deadline,
					swapper: recipient,
					withPoolFee: true,
				})

				const resAmountOut = type === "EXACT_INPUT" ? amountOut.newAmount(BigInt(res.output.amount)) : amountOut
				const resAmountIn = type === "EXACT_OUTPUT" ? amountIn.newAmount(BigInt(res.input.amount)) : amountIn

				const quotePrice = new Price({
					quote: resAmountOut.token,
					base: resAmountIn.token,
					value: resAmountOut.bigNumber.div(resAmountIn.bigNumber),
				})

				const result: QuoteResult = {
					chainId: res.chainId,
					amountOut: resAmountOut,
					amountIn: resAmountIn,
					poolFeeAmounts: await Promise.all(
						res.poolFeeAmounts.map(
							async (fee) =>
								new TokenAmount({
									token: await getCachedToken(queryClient, res.chainId, fee.token),
									amount: BigInt(fee.value),
								}),
						),
					),
					route: res.route,
					methodParams: res.methodParameters,
					type: type,
					quotePrice: quotePrice,
					routeCount: routeCount,
					params: params,
					rawQuote: res,
				}

				return result
			} catch {
				throw new QuoteError(400, "NO_ROUTE", params)
			}
		},
		enabled: !!amountIn && !!amountOut && !isNativeAndWrapped && !disabled,
	})
}
