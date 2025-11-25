import { useQueries, useQuery } from "@tanstack/react-query"
import { type Address, ContractFunctionExecutionError, getContract } from "viem"

import { poolAbi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { FeeAmount } from "@/constants/dex"
import { tokenPairSorter } from "@/feature/liquidity/tokenPairSorter"
import { useToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { Pool } from "@/types/pool"
import { EvmToken } from "@/types/tokens"
import { computePoolAddress } from "@/utils/pool"
import { getPublicClient } from "@/utils/publicClient"
import { getWrapped } from "@/utils/token"

const getPoolData = async <T0 extends EvmToken = EvmToken, T1 extends EvmToken = EvmToken>(
	poolAddress: Address | undefined,
	chainId: number,
	token0: T0 | undefined,
	token1: T1 | undefined,
	fee: number | undefined,
): Promise<Pool<T1, T0> | null> => {
	const publicClient = getPublicClient(chainId)
	if (!poolAddress || !token0 || !token1 || !fee) {
		return null
	}

	const poolContract = getContract({
		address: poolAddress,
		abi: poolAbi,
		client: publicClient,
	})

	let sqrtPriceX96: bigint
	let tick: number

	try {
		const ret = await poolContract.read.slot0()
		sqrtPriceX96 = ret[0]
		tick = ret[1]
	} catch (error) {
		if (error instanceof ContractFunctionExecutionError) {
			return null
		}
		throw error
	}

	const liquidity = await poolContract.read.liquidity()
	return new Pool({
		chainId: chainId,
		address: poolAddress,
		tokenPair: [token0, token1],
		fee: fee as FeeAmount,
		sqrtRatioX96: sqrtPriceX96,
		liquidity: liquidity,
		tickCurrent: tick,
	})
}

export const usePool = (
	[_tokenA, _tokenB]: [EvmToken | undefined, EvmToken | undefined],
	fee: number | undefined,
	_chainId?: number,
	_poolAddress?: Address,
) => {
	const tokenA = _tokenA ? getWrapped(_tokenA) : undefined
	const tokenB = _tokenB ? getWrapped(_tokenB) : undefined

	const [token0, token1] = tokenPairSorter(tokenA, tokenB)

	const defaultChainId = useSwapChainId()
	const chainId = _chainId ?? defaultChainId

	const poolAddress = _poolAddress ?? computePoolAddress(chainId, [token0?.address, token1?.address], fee)

	const query = useQuery<Pool | null>({
		queryKey: QueryKeys.pool.pool(poolAddress, chainId, {
			token0Address: token0?.address,
			token1Address: token1?.address,
			fee: fee,
		}),
		queryFn: async () => {
			const pool = await getPoolData(poolAddress, chainId, token0, token1, fee)
			return pool
		},
		enabled: !!chainId && !!poolAddress,
		refetchInterval: 10 * 1000, // 10 sec
	})
	return query
}

export const usePools = (
	chainId: number | undefined,
	pools: { tokenA: Token | undefined; tokenB: Token | undefined; fee: number }[],
) => {
	return useQueries({
		queries: pools
			.map(({ fee, tokenA: _tokenA, tokenB: _tokenB }) => {
				if (!chainId) return undefined
				const tokenA = _tokenA ? getWrapped(_tokenA) : undefined
				const tokenB = _tokenB ? getWrapped(_tokenB) : undefined
				const [token0, token1] = tokenPairSorter(tokenA, tokenB)
				const poolAddress = computePoolAddress(chainId, [token0?.address, token1?.address], fee)
				return {
					queryKey: QueryKeys.pool.pool(poolAddress, chainId, {
						token0Address: token0?.address,
						token1Address: token1?.address,
						fee: fee,
					}),
					queryFn: () => getPoolData(poolAddress, chainId, token0, token1, fee),
					enabled: !!chainId,
				}
			})
			.filter((query) => !!query),
		combine: (results) => {
			return {
				data: results.map((result) => result.data).filter((data) => !!data),
				isLoading: results.some((result) => result.isLoading),
			}
		},
	})
}

const useTokensByPoolAddress = (poolAddress: Address, chainId: number) => {
	const { publicClient } = useViemClient()
	const poolContract = getContract({
		address: poolAddress,
		abi: poolAbi,
		client: publicClient,
	})

	const query = useQuery<{
		token0Address: Address
		token1Address: Address
		fee: number
	}>({
		queryKey: QueryKeys.pool.tokensByPoolAddress(poolAddress, chainId),
		queryFn: async () => {
			const [t0, t1, poolFee] = await Promise.all([
				poolContract.read.token0(),
				poolContract.read.token1(),
				poolContract.read.fee(),
			])
			const result: {
				token0Address: Address
				token1Address: Address
				fee: number
			} = {
				token0Address: t0,
				token1Address: t1,
				fee: poolFee,
			}
			return result
		},
	})

	return query
}

export const usePoolByAddress = (poolAddress: Address, chainId: number) => {
	const { data: tokenByPoolAddr, isLoading, error } = useTokensByPoolAddress(poolAddress, chainId)

	const { data: token0 } = useToken(chainId, tokenByPoolAddr?.token0Address)
	const { data: token1 } = useToken(chainId, tokenByPoolAddr?.token1Address)

	const pool = usePool([token0, token1], tokenByPoolAddr?.fee, chainId, poolAddress)

	return {
		...pool,
		isLoading: pool.isLoading || isLoading,
		error: pool.error ?? error,
	}
}
