import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { viction } from "viem/chains"

import { trc21Abi } from "@rabbitswap/core/constants"

import { VIC } from "@/constants/token"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { TokenAmount } from "@/types/tokens"

const TRC21_ISSUER_ADDRESS = "0x8c0faeb5c6bed2129b8674f262fd45c4e9468bee"

/**
 * read gas sponsored balance from TRC21 contract
 */
export const useGasSponsoredBalance = (address: Address | undefined) => {
	const { publicClient } = useViemClient({ chainId: viction.id })
	const query = useQuery({
		queryKey: ["gas-sponsored-balance", address?.toLowerCase()],
		queryFn: async () => {
			if (!address) throw new Error("address is required")
			const balance = await publicClient.readContract({
				abi: trc21Abi,
				address: TRC21_ISSUER_ADDRESS,
				functionName: "getTokenCapacity",
				args: [address],
			})
			return TokenAmount.fromWei(VIC, balance)
		},
		enabled: !!address,
	})
	return query
}
