import { DEFAULT_CHAIN, SWAP_CHAINS } from "@/constants/chain"
import { useAccount } from "@/hooks/useAccount"

export const useIsSwapChainId = (chainId: number | undefined): boolean => {
	if (chainId === undefined) {
		return true
	}
	return SWAP_CHAINS.map<number>((c) => c.id).includes(chainId)
}

export const useSwapChainId = () => {
	const { chainId } = useAccount()
	const isSupported = useIsSwapChainId(chainId)

	if (!isSupported || !chainId) return DEFAULT_CHAIN.id
	return chainId
}
