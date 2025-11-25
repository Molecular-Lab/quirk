import { useQuery } from "@tanstack/react-query"
import { Address, getAddress, zeroAddress } from "viem"

import { SwapPool } from "@rabbitswap/api-core/dto"

import { arkenClient } from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"
import { prepareSwapData } from "@/hooks/swap/arken/mapper"
import { QuoteError, QuoteParams, QuoteResult } from "@/hooks/swap/useQuote"
import { useAccount } from "@/hooks/useAccount"
import { Price } from "@/types/price"
import { getChainEvmToken } from "@/utils/token"

export const useArkenQuote = (params: QuoteParams) => {
	const { amountIn, amountOut, type } = params
	const {
		computed: { slippage },
	} = useTxSetting()

	// If recipient is not provided, use the current account address
	const { address } = useAccount()
	const recipient: Address | undefined = params.recipient ?? address

	const baseAmount = type === "EXACT_INPUT" ? amountIn : amountOut
	const quoteAmount = type === "EXACT_INPUT" ? amountOut : amountIn

	// if the token is eth & weth, don't fetch quote
	const isNativeAndWrapped =
		baseAmount && quoteAmount && getWrapped(baseAmount.token).equals(getWrapped(quoteAmount.token))

	// arken quote is only available for exact input
	const enableQuery = !!amountIn && !!amountOut && !isNativeAndWrapped && !disabled && type === "EXACT_INPUT"

	const query = useQuery<QuoteResult>({
		queryKey: QueryKeys.quote.arken(baseAmount, quoteAmount, type),
		queryFn: async () => {
			if (!amountIn || !amountOut) {
				throw new Error("[useQuote] Wrong usage")
			}
			const tokenIn = amountIn.token
			const tokenOut = amountOut.token

			if (tokenIn.chainId !== tokenOut.chainId) {
				throw new Error("Token In and Token Out must be on the same chain")
			}

			const { wrapped } = getChainEvmToken(tokenIn.chainId)

			const amount = String(type === "EXACT_INPUT" ? amountIn.bigint : amountOut.bigint)
			if (amount === "0") {
				throw new QuoteError(400, "AMOUNT_IS_ZERO", params)
			}

			try {
				const fromAddress = recipient ? getAddress(recipient) : zeroAddress

				const arkenQuoteRequest: Parameters<typeof arkenClient.arkenRouter.quote>[0] = {
					chainId: tokenIn.chainId,
					fromTokenAddress: tokenIn.isNative ? wrapped.address : tokenIn.address,
					toTokenAddress: tokenOut.isNative ? wrapped.address : tokenOut.address,
					amount: amountIn.amount?.toString() ?? "0",
					mode: "max_return",
					fromAddress: fromAddress,
					isSourceNative: tokenIn.isNative,
					isDestinationNative: tokenOut.isNative,
				}

				const res = await arkenClient.arkenRouter.quote(arkenQuoteRequest)

				const resAmountOut = type === "EXACT_INPUT" ? amountOut.newAmount(BigInt(res.toTokenAmount)) : amountOut
				const resAmountIn = type === "EXACT_OUTPUT" ? amountIn.newAmount(BigInt(res.fromTokenAmount)) : amountIn

				const quotePrice = new Price({
					quote: resAmountOut.token,
					base: resAmountIn.token,
					value: resAmountOut.bigNumber.div(resAmountIn.bigNumber),
				})

				const arkenRouteProtocol = await arkenClient.arkenRouter.getRouteProtocol()
				const tradeRoutes = arkenRouteProtocol.getTradeRoute(res)

				const { methodParams } = prepareSwapData(
					res,
					res.pyth?.map((e) => Buffer.from(e.updatedData, "base64")),
					tradeRoutes,
					{
						isSrcNative: tokenIn.isNative,
						isDestNative: tokenOut.isNative,
						recipient: fromAddress,
						slippage: slippage,
					},
				)

				const result: QuoteResult = {
					chainId: tokenIn.chainId,
					amountOut: resAmountOut,
					amountIn: resAmountIn,
					route: res.protocols.map((protocol) =>
						protocol.map<SwapPool>((p) => {
							const mappedPool: SwapPool = {
								address: getAddress(p.lpAddress),
								tokenIn: {
									address: getAddress(p.fromTokenAddress),
								},
								tokenOut: {
									address: getAddress(p.toTokenAddress),
								},
								fee: p.fee?.toString() ?? "0",
								amountIn: "0", // cannot map
								amountOut: "0", // cannot map
							}
							return mappedPool
						}),
					),
					methodParams: methodParams,
					type: type,
					quotePrice: quotePrice,
					// unused field
					poolFeeAmounts: [],
					params: params,
					rawQuote: res,
				}

				return result
			} catch {
				throw new QuoteError(400, "NO_ROUTE", params)
			}
		},
		enabled: enableQuery,
	})

	return query
}
