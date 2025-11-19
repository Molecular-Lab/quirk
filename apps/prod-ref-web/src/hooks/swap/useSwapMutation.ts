import mixpanel from "mixpanel-browser"
import { type Address } from "viem"

import { useToaster } from "@rabbitswap/ui/basic"

import { QueryKeys } from "@/config/queryKey"
import { VIEM_CHAINS } from "@/constants/chain"
import { getMixpanelErrorProperties, getMixpanelEventKey } from "@/feature/analytics/mixpanel"
import { useDepositEthWarningModalStore } from "@/feature/sub-account/components/DepositEthWarningModal"
import { useAccountMode } from "@/feature/sub-account/context"
import { QuoteResult } from "@/hooks/swap/useQuote"
import { useChainTxMutation } from "@/hooks/transaction"
import { useInvalidate, useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { RabbitSwapNoEthError, checkNoEthError, isNoEthError } from "@/utils/sub-account/error"
import { isUserRejectedError } from "@/utils/transaction"

export type SwapParams = QuoteResult

export interface SwapResult {
	amount: [TokenAmount, TokenAmount]
	spender: Address
	tx: Transaction
}

export const useSwapMutation = () => {
	const { accountMode } = useAccountMode()
	const { walletClient, publicClient } = useViemClient()
	const toast = useToaster()
	const txToast = useTxToast()
	const refetch = useRefetch()
	const invalidate = useInvalidate()

	const { setIsOpen: setOpenDepositModal } = useDepositEthWarningModalStore()

	return useChainTxMutation({
		mutationFn: async (quoteResult: SwapParams): Promise<SwapResult> => {
			const to = quoteResult.methodParams.to
			const data = quoteResult.methodParams.data
			const value = quoteResult.methodParams.value
			const chainId = quoteResult.chainId
			const amount: [TokenAmount, TokenAmount] = [quoteResult.amountIn, quoteResult.amountOut]
			const route = quoteResult.route
			const routeCount = quoteResult.routeCount

			if (!walletClient) {
				throw new Error("Wallet client is not initialized, please refresh page and try again.")
			}
			if (walletClient.chain?.id !== chainId) {
				throw new Error("[Swap] walletClient is not connected to the correct chain")
			}
			if (!walletClient.account) {
				throw new Error("[Swap] walletClient is not connected to an account")
			}
			if (data === "0x" || data === "0x0") {
				throw new Error("[Swap] missing callData")
			}

			if (accountMode === "sub") {
				const noEth = await checkNoEthError(walletClient.account.address, chainId)
				if (noEth) {
					setOpenDepositModal(true)
					throw new RabbitSwapNoEthError()
				}
			}

			const params = {
				account: walletClient.account.address,
				to: to,
				data: data,
				value: value ? BigInt(value) : undefined,
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
			mixpanel.track(getMixpanelEventKey("swap-rabbit"), {
				txHash: tx.hash,
				fromAmount: amount[0].toFormat({ withUnit: true }),
				toAmount: amount[1].toFormat({ withUnit: true }),
				spender: to,
				data: data,
				value: value,
				route: route,
				routeCount: routeCount,
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
			if (isNoEthError(error)) {
				return
			}
			mixpanel.track(getMixpanelEventKey("swap-rabbit_error"), {
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

			invalidate([QueryKeys.quote.allRabbitswap(), QueryKeys.quote.allArken()])
		},
		onTxError: (error, { resp, params }) => {
			mixpanel.track(getMixpanelEventKey("swap-rabbit_tx_error"), {
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
