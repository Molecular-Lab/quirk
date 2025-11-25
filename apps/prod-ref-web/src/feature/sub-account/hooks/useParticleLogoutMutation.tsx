import { useAuthCore, useConnect } from "@particle-network/authkit"
import { useMutation } from "@tanstack/react-query"

import { useToaster } from "@rabbitswap/ui/basic"

import { useAccountMode } from "@/feature/sub-account/context"
import { isUserRejectedError } from "@/utils/transaction"

export const useParticleLogoutMutation = () => {
	const { userInfo } = useAuthCore()
	const { disconnect } = useConnect()
	const { setAccountMode } = useAccountMode()
	const toast = useToaster()

	const mutation = useMutation({
		mutationFn: async () => {
			// skip if not connected
			if (!userInfo) return
			await disconnect()
		},
		onSuccess: () => {
			setAccountMode("main")
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
				title: "Logout failed",
				description: error.message,
			})
		},
	})

	return mutation
}
