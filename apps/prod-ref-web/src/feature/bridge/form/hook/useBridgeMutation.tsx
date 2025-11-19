import { getAddress, isAddress, pad, zeroAddress } from "viem"
import { viction } from "viem/chains"

import { proxyOFTV2Abi } from "@rabbitswap/core/constants"
import { useToaster } from "@rabbitswap/ui/basic"

import { QueryKeys } from "@/config/queryKey"
import { MappingLzChainId } from "@/constants/bridge"
import { VIEM_CHAINS } from "@/constants/chain"
import { useBridgeStore } from "@/feature/bridge/form/store/bridgeStore"
import { useChainTxMutation } from "@/hooks/transaction"
import { useAccount } from "@/hooks/useAccount"
import { useRefetch } from "@/hooks/useRefetch"
import { useTxToast } from "@/hooks/useTxToast"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { LzTransaction } from "@/types/lztransaction"
import { TokenAmount } from "@/types/tokens"
import { Transaction } from "@/types/transaction"
import { getPublicClient } from "@/utils/publicClient"
import { isUserRejectedError } from "@/utils/transaction"

import { useEstimateLzFee } from "./useEstimateLzFee"
import { getAdapterParams } from "./utils"

// NOTE: this mutation support only non-native token bridge
export const useBridgeMutation = () => {
	const { address } = useAccount()
	const { walletClient } = useViemClient()

	const toast = useToaster()
	const txToast = useTxToast()

	const refetch = useRefetch()

	const {
		destToken,
		sourceToken,
		customAddr,
		computed: { oftAddress },
	} = useBridgeStore()
	const { data: lzFee } = useEstimateLzFee()

	return useChainTxMutation({
		mutationFn: async () => {
			if (!walletClient) {
				throw new Error("Wallet client is not initialized, please refresh page and try again.")
			}
			if (walletClient.chain?.id !== sourceToken.token.chainId) {
				throw new Error("[Bridge] walletClient is not connected to the correct chain")
			}
			if (!walletClient.account) {
				throw new Error("[Bridge] walletClient is not connected to an account")
			}
			if (!sourceToken.amount) {
				throw new Error("[Bridge] sourceAmount is not defined")
			}
			if (!address) {
				throw new Error("[Bridge] account is not connect")
			}

			const receipient: string | undefined = customAddr || address
			// expected user error, must be readable
			if (!receipient) {
				throw new Error("Receipient is required")
			}
			if (!isAddress(receipient)) {
				throw new Error("Invalid receipient address")
			}

			const destLzChainId = MappingLzChainId[destToken.token.chainId]
			if (!destLzChainId) {
				throw new Error("[Bridge] Chain is not supported")
			}

			if (!oftAddress) {
				throw new Error("[Bridge] Token is not supported")
			}

			if (!lzFee) {
				throw new Error("Cannot estimate fee")
			}

			// unsupported native token
			if (sourceToken.token.isNative) {
				throw new Error("Native token bridge is not supported.")
			}

			const adapterParams = getAdapterParams(destToken.token.chainId, receipient)
			if (!adapterParams) {
				throw new Error("[Bridge] missing adapter params")
			}

			const publicClient = getPublicClient(sourceToken.token.chainId)

			const { request } = await publicClient.simulateContract({
				address: getAddress(oftAddress),
				abi: proxyOFTV2Abi,
				functionName: "sendFrom",
				account: walletClient.account,
				args: [
					address,
					destLzChainId,
					pad(receipient, { size: 32 }),
					sourceToken.amount,
					{
						refundAddress: address,
						zroPaymentAddress: zeroAddress,
						adapterParams: adapterParams,
					},
				],
				value: lzFee.nativeFee.amount,
			})

			const gas = await publicClient.estimateContractGas(request)
			const hash = await walletClient.writeContract({ ...request, gas })

			const tx = new Transaction<{
				token: [TokenAmount, TokenAmount]
			}>({
				hash: hash,
				chainId: sourceToken.token.chainId,
				address: walletClient.account.address,
				data: {
					token: [sourceToken, destToken],
				},
			})

			return {
				tx: tx,
				spender: oftAddress,
			}
		},
		onSuccess: ({ tx, spender }) => {
			const sourceToken = tx.data.token[0]
			const destToken = tx.data.token[1]
			const toastTitle = destToken.token.chainId === viction.id ? "Deposit Submitted" : "Withdraw Submitted"
			const toastDescription = `${destToken.toFormat({ withUnit: true })} deposited to ${VIEM_CHAINS[destToken.token.chainId]?.name}`
			txToast.success({
				title: toastTitle,
				description: toastDescription,
				token: destToken.token,
				tx: new LzTransaction(tx),
				showChainIcon: true,
			})
			refetch([
				QueryKeys.tokenBalance.token(tx.address, sourceToken.token.currencyId),
				QueryKeys.tokenBalance.token(tx.address, destToken.token.currencyId),
				QueryKeys.allowance(tx.address, sourceToken.token.currencyId, getAddress(spender)),
				QueryKeys.allowance(tx.address, destToken.token.currencyId, getAddress(spender)),
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
				title: "Bridging Token Error",
				description: error.message,
			})
		},
		onTxError: (error, { resp }) => {
			txToast.error({
				title: "Bridging Failed",
				description: error.message,
				tx: resp.tx,
			})
		},
	})
}
