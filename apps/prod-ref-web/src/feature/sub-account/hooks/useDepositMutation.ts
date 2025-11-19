import { Address, erc20Abi, getAddress } from "viem"

import { useToaster } from "@rabbitswap/ui/basic"
import { shortenText } from "@rabbitswap/ui/utils"

import { QueryKeys } from "@/config/queryKey"
import { VIEM_CHAINS } from "@/constants/chain"
import { getEvmBalance } from "@/hooks/token/useBalance"
import { useChainTxMutation } from "@/hooks/transaction"
import { useAccount } from "@/hooks/useAccount"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { isUserRejectedError } from "@/utils/transaction"

export interface DepositTxData {
	amount: TokenAmount
	subAddress: Address
}

interface DepositResult {
	tx: Transaction<DepositTxData>
}

/**
 * transfer from main account to sub account
 */
export const useDepositMutation = () => {
	const toast = useToaster()
	const txToast = useTxToast()

	const { mainAddress, subAddress, chainId } = useAccount()
	const { mainWalletClient, publicClient } = useViemClient()
	const refetch = useRefetch()

	const mutation = useChainTxMutation({
		mutationFn: async ({ amount }: { amount: TokenAmount }): Promise<DepositResult> => {
			if (!mainAddress || !chainId || !mainWalletClient) throw new Error("[useDepositMutation] Wallet not connected")
			if (!subAddress) throw new Error("Missing receiver")

			const balance = await getEvmBalance(mainAddress, amount.token)
			if (balance.lt(amount)) throw new Error("Insufficient balance")

			if (amount.token.isNative) {
				// Native token transfer
				const params = {
					chain: VIEM_CHAINS[chainId],
					to: subAddress,
					account: mainAddress,
					value: amount.bigint,
				}

				// estimate gas
				const gas = await publicClient.estimateGas(params)

				const hash = await mainWalletClient.sendTransaction({
					gas,
					...params,
				})

				return {
					tx: new Transaction<DepositTxData>({
						hash: hash,
						chainId: chainId,
						address: mainAddress,
						data: { amount, subAddress },
					}),
				}
			} else {
				// ERC20 token transfer
				const { request } = await publicClient.simulateContract({
					address: getAddress(amount.token.address),
					abi: erc20Abi,
					functionName: "transfer",
					account: mainAddress,
					args: [subAddress, amount.bigint],
				})

				const gas = await publicClient.estimateContractGas(request)
				const hash = await mainWalletClient.writeContract({ ...request, gas })

				return {
					tx: new Transaction<DepositTxData>({
						hash: hash,
						chainId: chainId,
						address: mainAddress,
						data: { amount, subAddress },
					}),
				}
			}
		},
		onSuccess: ({ tx }) => {
			const { amount, subAddress } = tx.data
			txToast.success({
				title: "Deposited",
				description: `Deposited ${amount.toFormat({ decimalPlaces: 3, withUnit: true })} to ${shortenText({ text: subAddress })}`,
				token: amount.token,
				tx: tx,
			})
			refetch([
				QueryKeys.tokenBalance.token(tx.address, amount.token.currencyId),
				QueryKeys.tokenBalance.token(subAddress, amount.token.currencyId),
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
			toast.showPreset.error({
				title: "Deposit Error",
				description: error.message,
			})
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Deposit Error",
				description: error.message,
				tx: resp.tx,
			})
		},
	})
	return mutation
}
