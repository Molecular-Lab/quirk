import mixpanel from "mixpanel-browser"
import { Hex } from "viem"

import { ArkenQuoteResponse } from "@rabbitswap/api-core/client/arken-client/dto"
import { useToaster } from "@rabbitswap/ui/basic"

import { arkenClient } from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { VIEM_CHAINS } from "@/constants/chain"
import { getMixpanelErrorProperties, getMixpanelEventKey } from "@/feature/analytics/mixpanel"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"
import { prepareSwapData } from "@/hooks/swap/arken/mapper"
import { SwapParams, SwapResult } from "@/hooks/swap/useSwapMutation"
import { useChainTxMutation } from "@/hooks/transaction"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { Token } from "@/types/token"
import { TokenAmount } from "@/types/tokenAmount"
import { Transaction } from "@/types/transaction"
import { isUserRejectedError } from "@/utils/transaction"

import { getPriceUpdateBytes, getPriceUpdateFee } from "./pyth-network-price"

export const useArkenSwapMutation = () => {
	const { walletClient, publicClient } = useViemClient()
	const toast = useToaster()
	const txToast = useTxToast()
	const refetch = useRefetch()

	const {
		computed: { slippage },
	} = useTxSetting()

	return useChainTxMutation({
		mutationFn: async (quoteResult: SwapParams): Promise<SwapResult> => {
			const to = quoteResult.methodParams.to
			const data = quoteResult.methodParams.data
			const value = quoteResult.methodParams.value
			const chainId = quoteResult.chainId
			const amount: [TokenAmount, TokenAmount] = [quoteResult.amountIn, quoteResult.amountOut]
			const route = quoteResult.route

			if (!walletClient) {
				throw new Error("Wallet client is not initialized, please refresh page and try again.")
			}
			if (walletClient.chain?.id !== chainId) {
				throw new Error("[ArkenSwap] walletClient is not connected to the correct chain")
			}
			if (!walletClient.account) {
				throw new Error("[ArkenSwap] walletClient is not connected to an account")
			}
			if (data === "0x" || data === "0x0") {
				throw new Error("[ArkenSwap] missing callData")
			}

			let callData: Hex = data
			let valueWithUpdateFee: bigint | undefined = value ? BigInt(value) : undefined

			const quoteRes = quoteResult.rawQuote as ArkenQuoteResponse
			// get pyth update data again and replace rawData
			if (!quoteRes.isOutSide && quoteRes.pyth) {
				const tokenPriceIds: string[] = quoteRes.pyth.flatMap((p) => [p.baseTokenPriceId, p.quoteTokenPriceId])
				const uniqueTokenPriceIds = [...new Set(tokenPriceIds)]

				const priceUpdateBytes: Buffer[][] = await getPriceUpdateBytes(uniqueTokenPriceIds)
				const updateFee = await getPriceUpdateFee(publicClient, priceUpdateBytes)

				const arkenRouteProtocol = await arkenClient.arkenRouter.getRouteProtocol()
				const tradeRoutes = arkenRouteProtocol.getTradeRoute(quoteRes)

				// encode new calldata
				const { methodParams } = prepareSwapData(quoteRes, priceUpdateBytes[0], tradeRoutes, {
					isSrcNative: quoteResult.amountIn.token.isNative,
					isDestNative: quoteResult.amountOut.token.isNative,
					recipient: walletClient.account.address,
					slippage: slippage,
				})
				callData = methodParams.data
				valueWithUpdateFee = BigInt(methodParams.value) + updateFee
			}

			const params = {
				account: walletClient.account.address,
				to: to,
				data: callData,
				value: valueWithUpdateFee,
			} as const

			const gas = await publicClient.estimateGas(params)

			const hash = await walletClient.sendTransaction({
				gas: gas,
				chain: VIEM_CHAINS[chainId],
				...params,
			})

			const tx = new Transaction({
				hash: hash,
				chainId: chainId,
				address: walletClient.account.address,
				data: amount,
			})

			const result: SwapResult = {
				amount: amount,
				spender: to,
				tx: tx,
			}

			// track swap event
			mixpanel.track(getMixpanelEventKey("swap-arken"), {
				txHash: tx.hash,
				fromAmount: amount[0].toFormat({ withUnit: true }),
				toAmount: amount[1].toFormat({ withUnit: true }),
				spender: to,
				data: callData,
				value: valueWithUpdateFee,
				route: route,
				rawQuote: quoteResult,
			})

			return result
		},
		onError: (error, params) => {
			if (isUserRejectedError(error)) {
				toast.showPreset.info({
					title: "User rejected",
					description: "User rejected the request.",
				})
				return
			}
			mixpanel.track(getMixpanelEventKey("swap-arken_error"), {
				fromAmount: params.amountIn.toFormat({ withUnit: true }),
				toAmount: params.amountOut.toFormat({ withUnit: true }),
				spender: params.methodParams.to,
				data: params.methodParams.data,
				value: params.methodParams.value,
				route: params.route,
				rawQuote: params.rawQuote,
				...getMixpanelErrorProperties(error),
			})
			toast.showPreset.error({
				title: "Swap Failed",
				description: error.message,
			})
		},
		onSuccess: ({ tx, amount, spender }) => {
			const token: [EvmToken, EvmToken] = [amount[0].token, amount[1].token]
			txToast.success({
				title: "Swapped",
				description: `${amount[0].toFormat({ decimalPlaces: 3, withUnit: true })} for ${amount[1].toFormat({ decimalPlaces: 3, withUnit: true })}`,
				token: token,
				tx: tx,
			})
			refetch([
				QueryKeys.tokenBalance.token(tx.address, token[0].currencyId),
				QueryKeys.tokenBalance.token(tx.address, token[1].currencyId),
				QueryKeys.allowance(tx.address, token[0].currencyId, spender),
				QueryKeys.allowance(tx.address, token[1].currencyId, spender),
			])
		},
		onTxError: (error, { resp, params }) => {
			mixpanel.track(getMixpanelEventKey("swap-arken_tx_error"), {
				txHash: resp.tx.hash,
				fromAmount: params.amountIn.toFormat({ withUnit: true }),
				toAmount: params.amountOut.toFormat({ withUnit: true }),
				spender: params.methodParams.to,
				data: params.methodParams.data,
				value: params.methodParams.value,
				route: params.route,
				rawQuote: params.rawQuote,
				...getMixpanelErrorProperties(error),
				txId: resp.tx.txId,
			})
			txToast.error({
				title: "Swap Failed",
				description: error.message,
				tx: resp.tx,
			})
		},
	})
}
