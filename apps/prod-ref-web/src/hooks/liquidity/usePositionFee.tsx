import { BigNumber } from "@ethersproject/bignumber"
import { useQuery } from "@tanstack/react-query"
import { type Address } from "viem"

import { positionManagerAbi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "@/constants/dex"
import { MAX_UINT128 } from "@/constants/ethersBigNum"
import { useViemClient } from "@/hooks/wallet/useViemClient"

interface PositionFee {
	amount0: bigint
	amount1: bigint
}

export const usePositionFee = (tokenId: BigNumber, chainId: number | undefined, owner?: Address) => {
	const { publicClient } = useViemClient()

	const query = useQuery<PositionFee | null>({
		queryKey: QueryKeys.position.positionFee(chainId, tokenId),
		queryFn: async () => {
			if (!chainId || !owner) {
				return null
			}
			const nftPositionManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
			if (!nftPositionManagerAddress) {
				return null
			}

			const result = await publicClient.simulateContract({
				address: nftPositionManagerAddress,
				abi: positionManagerAbi,
				functionName: "collect",
				args: [
					{
						tokenId: tokenId.toBigInt(),
						recipient: owner,
						amount0Max: MAX_UINT128.toBigInt(),
						amount1Max: MAX_UINT128.toBigInt(),
					},
				],
				account: owner,
			})

			const r: PositionFee = {
				amount0: result.result[0],
				amount1: result.result[1],
			}

			return r
		},
		enabled: !!chainId && !!tokenId.toNumber() && !!owner,
	})
	return query
}
