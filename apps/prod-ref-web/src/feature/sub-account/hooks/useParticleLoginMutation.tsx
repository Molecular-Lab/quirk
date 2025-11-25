import { AuthType } from "@particle-network/auth-core"
import { useAuthCore, useConnect } from "@particle-network/authkit"
import { UseMutationOptions, useMutation } from "@tanstack/react-query"

import { useToaster } from "@rabbitswap/ui/basic"

import apiClient from "@/api/core"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { isUserRejectedError } from "@/utils/transaction"

export const useParticleLoginMutation = (options?: Pick<UseMutationOptions, "onSuccess" | "onError">) => {
	const { mainAddress } = useAccount()
	const chainId = useSwapChainId()
	const { walletClient } = useViemClient()
	const { userInfo } = useAuthCore()
	const { connect } = useConnect()

	const toast = useToaster()

	const mutation = useMutation({
		mutationFn: async () => {
			if (!mainAddress || !walletClient) throw new Error("Please connect wallet first")
			if (userInfo) throw new Error("You have already logged in")
			const signData = await apiClient.particleAuthRouter.getSignLoginData(chainId, mainAddress)

			const signature = await walletClient.signTypedData({
				account: mainAddress,
				domain: signData.domain,
				types: signData.types,
				primaryType: signData.primaryType,
				message: signData.message,
			})

			const jwtToken = await apiClient.particleAuthRouter.login(signData, signature)

			await connect({
				provider: AuthType.jwt,
				thirdpartyCode: jwtToken,
			})
		},
		onSuccess: (data, variables, context) => {
			options?.onSuccess?.(data, variables, context)
		},
		onError: (error, variables, context) => {
			if (isUserRejectedError(error)) {
				toast.showPreset.info({
					title: "User rejected",
					description: "User rejected the request.",
				})
				return
			}
			toast.showPreset.error({
				title: "Login failed",
				description: error.message,
			})
			options?.onError?.(error, variables, context)
		},
	})

	return mutation
}
