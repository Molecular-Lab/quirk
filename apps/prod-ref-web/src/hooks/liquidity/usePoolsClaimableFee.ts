import { useQuery } from "@tanstack/react-query"
import { getContract } from "viem"

import { poolAbi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { PoolStats } from "@/feature/explore/list/PoolTable/usePoolData"
import { useViemClient } from "@/hooks/wallet/useViemClient"

export interface PoolStatsWithClaimableFee extends PoolStats {
	protocolFees: {
		token0: bigint
		token1: bigint
	}
}

export const usePoolClaimableFee = (pool: PoolStats) => {
	const { publicClient } = useViemClient()
	const poolAddress = pool.address

	return useQuery<PoolStatsWithClaimableFee>({
		queryKey: QueryKeys.pool.poolClaimableFee(poolAddress),
		queryFn: async () => {
			const poolContract = getContract({
				address: poolAddress,
				abi: poolAbi,
				client: publicClient,
			})
			const [protocolFees] = await Promise.all([poolContract.read.protocolFees()])
			const res: PoolStatsWithClaimableFee = {
				...pool,
				protocolFees: {
					token0: protocolFees[0],
					token1: protocolFees[1],
				},
			}
			return res
		},
	})
}
