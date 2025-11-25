import { useQueries, useQueryClient } from "@tanstack/react-query"
import { type Address, getContract } from "viem"

import { poolAbi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { getCachedToken } from "@/hooks/token/useToken"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { Price } from "@/types/price"

export const useSpotPrices = (chainId: number | undefined, poolAddresses: Address[] | undefined) => {
	const { publicClient } = useViemClient({ chainId })
	const queryClient = useQueryClient()
	return useQueries({
		queries:
			poolAddresses?.map((poolAddress) => ({
				queryKey: QueryKeys.pool.spotPrice(poolAddress, chainId),
				queryFn: async (): Promise<Price> => {
					if (!chainId) throw new Error("[useSpotPrices] chainId is required")

					const poolContract = getContract({
						client: publicClient,
						address: poolAddress,
						abi: poolAbi,
					})

					const [res, token0Addr, token1Addr] = await Promise.all([
						poolContract.read.slot0(),
						poolContract.read.token0(),
						poolContract.read.token1(),
					])

					const token0 = await getCachedToken(queryClient, chainId, token0Addr)
					const token1 = await getCachedToken(queryClient, chainId, token1Addr)

					const price = Price.fromSqrtRatio({
						base: token0,
						quote: token1,
						sqrtRatioX96: res[0],
					})
					return price
				},
				enabled: !!chainId,
				refetchInterval: 10000, // refetch every 10 seconds
			})) ?? [],
		combine: (results) => {
			return {
				data: results.map((result) => result.data).filter((data) => !!data),
				isLoading: results.some((result) => result.isLoading),
			}
		},
	})
}
