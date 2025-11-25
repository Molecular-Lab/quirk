import { type Address, erc20Abi, maxUint256 } from "viem"

import { usdtMainnetAbi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { USDT_MAINNET } from "@/constants/token"
import { useDepositEthWarningModalStore } from "@/feature/sub-account/components/DepositEthWarningModal"
import { useAccountMode } from "@/feature/sub-account/context"
import { useChainTxMutation } from "@/hooks/transaction"
import { useSwapChainId } from "@/hooks/useChainId"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { EvmToken } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { getPublicClient } from "@/utils/publicClient"
import { RabbitSwapNoEthError, checkNoEthError } from "@/utils/sub-account/error"

export interface ApproveParams {
	spender: Address | undefined
	token: Token
	amount?: bigint
}

export const useApproveMutation = () => {
	const chainId = useSwapChainId()
	const { accountMode } = useAccountMode()
	const { walletClient } = useViemClient()
	const txToast = useTxToast()
	const refetch = useRefetch()

	const { setIsOpen: setOpenDepositModal } = useDepositEthWarningModalStore()

	return useChainTxMutation({
		mutationFn: async (params: ApproveParams) => {
			if (!walletClient) {
				throw new Error("Wallet client is not initialized, please refresh page and try again.")
			}
			if (!params.spender) {
				throw new Error("[Approve] Spender is required")
			}
			if (walletClient.chain?.id !== params.token.chainId) {
				throw new Error(
					`[Approve] ChainId is not correct current:${walletClient.chain?.id} expected:${params.token.chainId}`,
				)
			}
			if (!walletClient.account) {
				throw new Error("[Approve] walletClient is not connected to an account")
			}

			const publicClient = getPublicClient(params.token.chainId)

			if (accountMode === "sub") {
				const noEth = await checkNoEthError(walletClient.account.address, chainId)
				if (noEth) {
					setOpenDepositModal(true)
					throw new RabbitSwapNoEthError()
				}
			}

			const approveAmount = params.amount ?? maxUint256

			const abi = params.token.equals(USDT_MAINNET) ? usdtMainnetAbi : erc20Abi

			const { request } = await publicClient.simulateContract({
				address: getAddress(params.token.address),
				abi: abi,
				functionName: "approve",
				account: walletClient.account,
				args: [params.spender, approveAmount],
			})

			const gas = await publicClient.estimateContractGas(request)
			const hash = await walletClient.writeContract({ ...request, gas })

			const tx = new Transaction({
				hash: hash,
				chainId: params.token.chainId,
				address: walletClient.account.address,
				data: undefined,
			})

			return {
				tx: tx,
				token: params.token,
				spender: params.spender,
			}
		},
		onSuccess: ({ token, tx, spender }) => {
			txToast.success({
				title: "Approved",
				description: token.symbol ?? "",
				token: token,
				tx: tx,
			})

			refetch([
				QueryKeys.allowance(tx.address, token.currencyId, spender),
				QueryKeys.tokenBalance.token(tx.address, token.currencyId),
			])
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Approve Failed",
				description: error.message,
				tx: resp.tx,
			})
		},
	})
}
