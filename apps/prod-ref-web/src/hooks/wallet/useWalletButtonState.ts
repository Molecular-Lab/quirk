import { ComponentProps, useMemo } from "react"

import { Button } from "@rabbitswap/ui/basic"

import { VIEM_CHAINS } from "@/constants/chain"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { useConnectWallet } from "@/hooks/wallet/useConnectWallet"
import { useSwitchChain } from "@/hooks/wallet/useSwitchChain"

/**
 * Handle the state of the button which is related to wallet
 */
export const useWalletButtonState = () => {
	const account = useAccount()
	const connect = useConnectWallet()
	const { switchChain } = useSwitchChain()
	const chainId = useSwapChainId()

	const buttonState = useMemo<Partial<ComponentProps<typeof Button> | null>>(() => {
		// not connect the wallet
		if (!account.address) {
			return {
				onClick: connect,
				children: "Connect Wallet",
			}
		}

		// not correct chain
		if (account.chainId !== chainId) {
			return {
				children: `Connect to ${VIEM_CHAINS[chainId]!.name} Chain`,
				onClick: () => {
					switchChain(chainId)
				},
			}
		}

		return null
	}, [account.address, account.chainId, chainId, connect, switchChain])

	return buttonState
}
