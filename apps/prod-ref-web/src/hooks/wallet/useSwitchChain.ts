import { useCallback } from "react"

import { solana } from "@particle-network/auth-core"
import { useEthereum } from "@particle-network/authkit"
import { useSwitchChain as useParticleSwitchChain } from "@particle-network/connectkit"

import { useAccountMode } from "@/feature/sub-account/context"

export const useSwitchChain = () => {
	const { accountMode } = useAccountMode()
	const { switchChain: switchChainMainAddress } = useParticleSwitchChain()
	const { switchChain: switchChainSubAddress } = useEthereum()

	const switchChain = useCallback(
		(toChainId: number) => {
			switch (accountMode) {
				case "main": {
					switchChainMainAddress({ chainId: toChainId })
					break
				}
				case "sub": {
					void switchChainSubAddress(toChainId)
				}
			}
		},
		[accountMode, switchChainMainAddress, switchChainSubAddress],
	)

	return {
		switchChain,
	}
}
