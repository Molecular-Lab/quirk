import { LinkedID } from "@oneid-xyz/inspect"
import { useQuery } from "@tanstack/react-query"
import { Address, isAddress } from "viem"

import { QueryKeys } from "@/config/queryKey"
import { walletToLinksId } from "@/utils/oneId"

export const useWalletDomains = (walletAddress: Address | undefined) => {
	return useQuery<LinkedID[]>({
		queryKey: QueryKeys.wallet.domains(walletAddress),
		queryFn: async () => {
			if (!walletAddress) throw new Error("Wallet address is required")
			const domains = await walletToLinksId(walletAddress)
			return domains
		},
		enabled: !!walletAddress && isAddress(walletAddress),
	})
}
