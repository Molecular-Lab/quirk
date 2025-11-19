import { useMemo } from "react"

import { useEthereum } from "@particle-network/authkit"
import { useWallets } from "@particle-network/connectkit"
import { type PublicClient, type WalletClient, createWalletClient, custom } from "viem"

import { useAccountMode } from "@/feature/sub-account/context"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { getPublicClient } from "@/utils/publicClient"

export interface UseViemClientResult {
	publicClient: PublicClient
	walletClient: WalletClient | null
	mainWalletClient: WalletClient | null
	subWalletClient: WalletClient | null
}

export const useViemClient = (props?: { chainId: number | undefined }): UseViemClientResult => {
	const defaultChainId = useSwapChainId()
	const [primaryWallet] = useWallets()
	const { accountMode } = useAccountMode()
	const { subAddress } = useAccount()
	const { chainInfo: subChainInfo, provider: subProvider } = useEthereum()

	const chainId = useMemo(() => props?.chainId ?? defaultChainId, [props?.chainId, defaultChainId])

	const publicClient = useMemo<PublicClient>(() => {
		return getPublicClient(chainId)
	}, [chainId])

	const mainWalletClient = useMemo<WalletClient | null>(() => {
		return primaryWallet ? primaryWallet.getWalletClient() : null
	}, [primaryWallet])

	const subWalletClient = useMemo<WalletClient | null>(() => {
		if (!subAddress) return null
		return createWalletClient({
			account: subAddress,
			chain: subChainInfo,
			transport: custom(subProvider),
		})
	}, [subAddress, subChainInfo, subProvider])

	const walletClient = useMemo<WalletClient | null>(() => {
		switch (accountMode) {
			case "main": {
				return mainWalletClient
			}
			case "sub": {
				return subWalletClient
			}
		}
	}, [accountMode, mainWalletClient, subWalletClient])

	const clients = useMemo<UseViemClientResult>(() => {
		return {
			walletClient: walletClient,
			publicClient: publicClient,
			mainWalletClient: mainWalletClient,
			subWalletClient: subWalletClient,
		}
	}, [walletClient, publicClient, mainWalletClient, subWalletClient])

	return clients
}
