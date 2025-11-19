import { getAddress } from "viem"

import { wethAbi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { useDepositEthWarningModalStore } from "@/feature/sub-account/components/DepositEthWarningModal"
import { useAccountMode } from "@/feature/sub-account/context"
import { useChainTxMutation } from "@/hooks/transaction"
import { useSwapChainId } from "@/hooks/useChainId"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { EvmToken, TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { RabbitSwapNoEthError, checkNoEthError } from "@/utils/sub-account/error"
import { getChainToken } from "@/utils/token"

interface WrapParams {
	amount: TokenAmount
	chainId?: number
}

interface WrapResult {
	token: [EvmToken, EvmToken]
	amount: TokenAmount
	tx: Transaction
}

export const useWrapMutation = () => {
	const { accountMode } = useAccountMode()
	const { walletClient, publicClient } = useViemClient()
	const refetch = useRefetch()
	const txToast = useTxToast()

	const defaultChain = useSwapChainId()

	const { setIsOpen: setOpenDepositModal } = useDepositEthWarningModalStore()

	return useChainTxMutation({
		mutationFn: async (params: WrapParams): Promise<WrapResult> => {
			const chainId = params.chainId ?? defaultChain
			const { native, wrapped } = getChainEvmToken(chainId)

			if (!walletClient) {
				throw new Error("Wallet client is not initialized, please refresh page and try again.")
			}
			if (walletClient.chain?.id !== chainId) {
				throw new Error(`[Wrap] ChainId is not correct current:${walletClient.chain?.id} expected:${chainId}`)
			}
			if (!walletClient.account) {
				throw new Error("[Wrap] walletClient is not connected to an account")
			}

			if (accountMode === "sub") {
				const noEth = await checkNoEthError(walletClient.account.address, chainId)
				if (noEth) {
					setOpenDepositModal(true)
					throw new RabbitSwapNoEthError()
				}
			}

			const { request } = await publicClient.simulateContract({
				address: getAddress(wrapped.address),
				abi: wethAbi,
				functionName: "deposit",
				account: walletClient.account,
				value: params.amount.bigint,
			})

			const gas = await publicClient.estimateContractGas(request)
			const hash = await walletClient.writeContract({ ...request, gas })

			const tx = new Transaction({
				hash: hash,
				chainId: chainId,
				address: walletClient.account.address,
				data: undefined,
			})

			return {
				token: [native, wrapped],
				amount: params.amount,
				tx: tx,
			}
		},
		onSuccess: ({ tx, amount, token }) => {
			txToast.success({
				title: "Wrappped",
				description: `${amount.toFormat({ decimalPlaces: 3 })} ${token[0].symbol} for ${amount.toFormat({ decimalPlaces: 3 })} ${token[1].symbol}`,
				token: token,
				tx: tx,
			})
			refetch([
				QueryKeys.tokenBalance.token(tx.address, token[0].currencyId),
				QueryKeys.tokenBalance.token(tx.address, token[1].currencyId),
			])
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Wrap Error",
				description: error.message,
				tx: resp.tx,
			})
		},
	})
}
