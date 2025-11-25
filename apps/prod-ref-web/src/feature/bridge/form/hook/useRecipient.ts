import { useMemo } from "react"

import { isAddress } from "viem"

import { useBridgeStore } from "@/feature/bridge/form/store/bridgeStore"
import { useAccount } from "@/hooks/useAccount"

export const useRecipient = () => {
	const { customAddr } = useBridgeStore()
	const { address } = useAccount()

	const recipient = useMemo(() => {
		return isAddress(customAddr) ? customAddr : address
	}, [address, customAddr])

	const customAddressInvalid = useMemo(() => {
		return !!customAddr && !isAddress(customAddr)
	}, [customAddr])

	return { recipient, customAddressInvalid }
}
