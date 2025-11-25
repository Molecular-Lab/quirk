import { useCallback } from "react"

import { useModal } from "@particle-network/connectkit"

export const useConnectWallet = () => {
	const { setOpen } = useModal()
	return useCallback(() => {
		setOpen(true)
	}, [setOpen])
}
