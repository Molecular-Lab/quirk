import { Address, erc20Abi, getAddress } from "viem"

import { useToaster } from "@rabbitswap/ui/basic"
import { shortenText } from "@rabbitswap/ui/utils"

import { QueryKeys } from "@/config/queryKey"
import { VIEM_CHAINS } from "@/constants/chain"
import { useDepositEthWarningModalStore } from "@/feature/sub-account/components/DepositEthWarningModal"
import { getEvmBalance } from "@/hooks/token/useBalance"
import { useChainTxMutation } from "@/hooks/transaction"
import { useAccount } from "@/hooks/useAccount"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { RabbitSwapNoEthError, checkNoEthError, isNoEthError } from "@/utils/sub-account/error"
import { isUserRejectedError } from "@/utils/transaction"

export interface WithdrawTxData {
	amount: TokenAmount
	mainAddress: Address
}

interface WithdrawResult {
	tx: Transaction<WithdrawTxData>
}

/**
 * transfer from sub account to main account
 */
export const useWithdrawMutation = () => {
	const toast = useToaster()
	const txToast = useTxToast()

	const { mainAddress, subAddress, chainId } = useAccount()
	const { subWalletClient, publicClient } = useViemClient()
	const refetch = useRefetch()

	const { setIsOpen: setOpenDepositModal } = useDepositEthWarningModalStore()

	const mutation = useChainTxMutation({
		mutationFn: async ({ amount }: { amount: TokenAmount }): Promise<WithdrawResult> => {
			if (!subAddress || !chainId || !subWalletClient) throw new Error("[useWithdrawMutation] Wallet not connected")
			if (!mainAddress) throw new Error("Missing receiver")

			const noEth = await checkNoEthError(subAddress, chainId)
			if (noEth) {
				setOpenDepositModal(true)
				throw new RabbitSwapNoEthError()
			}

			const balance = await getEvmBalance(subAddress, amount.token)
			if (balance.lt(amount)) throw new Error("Insufficient balance")

			if (amount.token.isNative) {
				// Native token transfer
				const params = {
					chain: VIEM_CHAINS[chainId],
					to: mainAddress,
					account: subAddress,
					value: amount.bigint,
				}

				// estimate gas
				const gas = await publicClient.estimateGas(params)

				const hash = await subWalletClient.sendTransaction({
					gas,
					...params,
				})

				return {
					tx: new Transaction<WithdrawTxData>({
						hash: hash,
						chainId: chainId,
						address: subAddress,
						data: { amount, mainAddress },
					}),
				}
			} else {
				// ERC20 token transfer
				const { request } = await publicClient.simulateContract({
					address: getAddress(amount.token.address),
					abi: erc20Abi,
					functionName: "transfer",
					account: subAddress,
					args: [mainAddress, amount.bigint],
				})

				const gas = await publicClient.estimateContractGas(request)
				const hash = await subWalletClient.writeContract({ ...request, gas })

				return {
					tx: new Transaction<WithdrawTxData>({
						hash: hash,
						chainId: chainId,
						address: subAddress,
						data: { amount, mainAddress },
					}),
				}
			}
		},
		onSuccess: ({ tx }) => {
			const { amount, mainAddress } = tx.data
			txToast.success({
				title: "Withdrawn",
				description: `Withdrawn ${amount.toFormat({ decimalPlaces: 3, withUnit: true })} to ${shortenText({ text: mainAddress })}`,
				token: amount.token,
				tx: tx,
			})
			refetch([
				QueryKeys.tokenBalance.token(tx.address, amount.token.currencyId),
				QueryKeys.tokenBalance.token(mainAddress, amount.token.currencyId),
			])
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
				title: "Withdraw Error",
				description: error.message,
			})
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Withdraw Error",
				description: error.message,
				tx: resp.tx,
			})
		},
	})
	return mutation
}
