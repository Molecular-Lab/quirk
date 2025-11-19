import { useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { useQuery } from "@tanstack/react-query"
import {
	type Address,
	type ContractFunctionParameters,
	type ContractFunctionReturnType,
	getAddress,
	isAddress,
	isAddressEqual,
} from "viem"

import { positionManagerAbi } from "@rabbitswap/core/constants"

import { QueryKeys } from "@/config/queryKey"
import { FeeAmount, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "@/constants/dex"
import { usePool, usePools } from "@/hooks/liquidity/usePool"
import { useToken, useTokens } from "@/hooks/token/useToken"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { queryClient } from "@/providers/QueryProvider"
import { Position, PositionDetailInterface } from "@/types/position"
import { Token } from "@/types/token"
import { computePoolAddress } from "@/utils/pool"

const usePositionsFetcher = (chainId: number | undefined) => {
	const { publicClient } = useViemClient()

	const callContract = async (tokenIds: BigNumber[]): Promise<PositionDetailInterface[]> => {
		if (!chainId) {
			return []
		}
		const nftPositionManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
		if (!nftPositionManagerAddress) {
			return []
		}

		const [positionsResults, ownerOfResults] = await Promise.all([
			publicClient.multicall({
				contracts: tokenIds.map<ContractFunctionParameters<typeof positionManagerAbi, "view", "positions">>(
					(tokenId) => {
						const x: ContractFunctionParameters<typeof positionManagerAbi, "view", "positions"> = {
							address: nftPositionManagerAddress,
							abi: positionManagerAbi,
							functionName: "positions",
							args: [tokenId.toBigInt()],
						}
						return x
					},
				),
			}),
			publicClient.multicall({
				contracts: tokenIds.map<ContractFunctionParameters<typeof positionManagerAbi, "view", "ownerOf">>((tokenId) => {
					const x: ContractFunctionParameters<typeof positionManagerAbi, "view", "ownerOf"> = {
						address: nftPositionManagerAddress,
						abi: positionManagerAbi,
						functionName: "ownerOf",
						args: [tokenId.toBigInt()],
					}
					return x
				}),
			}),
		])

		if (positionsResults.length !== ownerOfResults.length) {
			throw new Error(
				`[usePositionsFetcher] Response length mismatch, positions: ${positionsResults.length}, ownerOf: ${ownerOfResults.length}`,
			)
		}

		return positionsResults
			.map<PositionDetailInterface | undefined>(({ status, result }, i) => {
				if (status === "success") {
					if (typeof result === "string" || typeof result === "bigint") {
						return undefined
					}
					const ownerOfRes = ownerOfResults[i]!
					const ownerAddress: ContractFunctionReturnType<typeof positionManagerAbi, "view", "ownerOf"> | undefined =
						ownerOfRes.status === "success" && typeof ownerOfRes.result === "string" && isAddress(ownerOfRes.result)
							? ownerOfRes.result
							: undefined
					const posDetail: PositionDetailInterface = {
						chainId: chainId,
						tokenId: tokenIds[i]!,
						ownerAddress: ownerAddress,
						nonce: BigNumber.from(result[0]),
						operator: result[1],
						token0: result[2],
						token1: result[3],
						fee: result[4] as FeeAmount,
						tickLower: result[5],
						tickUpper: result[6],
						liquidity: result[7],
						feeGrowthInside0LastX128: BigNumber.from(result[8]),
						feeGrowthInside1LastX128: BigNumber.from(result[9]),
						tokensOwed0: BigNumber.from(result[10]),
						tokensOwed1: BigNumber.from(result[11]),
					}
					return posDetail
				}
				return undefined
			})
			.filter((p) => !!p)
	}

	return { callContract }
}

const usePositionDetail = (tokenId: BigNumber | undefined, chainId: number | undefined) => {
	const { callContract: getV3PositionFromTokenIds } = usePositionsFetcher(chainId)

	const query = useQuery<PositionDetailInterface>({
		queryKey: QueryKeys.position.positionDetail(chainId, tokenId),
		queryFn: async () => {
			if (!tokenId) {
				throw new Error("[usePositionDetail] undefined tokenId")
			}
			const positions = await getV3PositionFromTokenIds([tokenId])
			return positions[0]!
		},
		enabled: !!chainId && !!tokenId?.toNumber(),
	})
	return query
}

interface PositionResult {
	data: Position | undefined
	isLoading: boolean
}
export const usePosition = (tokenId: BigNumber | undefined, chainId: number | undefined): PositionResult => {
	const { data: positionDetail, isLoading } = usePositionDetail(tokenId, chainId)
	const { data: token0, isLoading: isLoadingToken0 } = useToken(positionDetail?.chainId, positionDetail?.token0)
	const { data: token1, isLoading: isLoadingToken1 } = useToken(positionDetail?.chainId, positionDetail?.token1)
	const { data: pool, isLoading: isLoadingPool } = usePool(
		[token0, token1],
		positionDetail?.fee,
		positionDetail?.chainId,
	)

	const data = useMemo(() => {
		if (!pool || !positionDetail) {
			return undefined
		}
		return new Position({
			pool: pool,
			position: positionDetail,
		})
	}, [pool, positionDetail])

	return {
		data: data,
		isLoading: isLoading || isLoadingToken0 || isLoadingToken1 || isLoadingPool,
	}
}

export const useAddressPositionDetails = (address: Address | undefined, chainId: number | undefined) => {
	const { publicClient } = useViemClient()
	const { callContract: getV3PositionFromTokenIds } = usePositionsFetcher(chainId)

	const query = useQuery<PositionDetailInterface[]>({
		queryKey: QueryKeys.position.positionDetails(address, chainId),
		queryFn: async () => {
			if (!address || !chainId) {
				return []
			}
			const nftPositionManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
			if (!nftPositionManagerAddress) {
				return []
			}

			const tokenCount = await publicClient.readContract({
				address: nftPositionManagerAddress,
				abi: positionManagerAbi,
				functionName: "balanceOf",
				args: [getAddress(address)],
			})

			if (tokenCount === 0n) {
				return []
			}

			const tokenOfOwnerByIndexParam = Array.from({ length: Number(tokenCount) }).map<
				ContractFunctionParameters<typeof positionManagerAbi, "view", "tokenOfOwnerByIndex">
			>((_, i) => {
				const x: ContractFunctionParameters<typeof positionManagerAbi, "view", "tokenOfOwnerByIndex"> = {
					address: nftPositionManagerAddress,
					abi: positionManagerAbi,
					functionName: "tokenOfOwnerByIndex",
					args: [getAddress(address), BigInt(i)],
				}
				return x
			})

			const results = await publicClient.multicall({
				contracts: tokenOfOwnerByIndexParam,
			})

			const tokenIds = results
				.filter(({ status }) => status === "success")
				.map<BigNumber>(({ result }) => {
					return BigNumber.from(result)
				})

			const positions = await getV3PositionFromTokenIds(tokenIds)

			// cache data
			for (const position of positions) {
				queryClient.setQueryData(QueryKeys.position.positionDetail(chainId, position.tokenId), position)
			}

			return positions
		},
		enabled: !!address && !!chainId,
		refetchInterval: 10 * 1000, // 10 sec
	})

	return query
}

export const useAddressPositions = (address: Address | undefined, chainId: number | undefined) => {
	const { data: positionDetails, isLoading: isLoadingPositionDetails } = useAddressPositionDetails(address, chainId)

	const ccyIds = useMemo<string[]>(() => {
		if (!chainId) return []
		if (!positionDetails) return []
		const tokenAddrs = positionDetails.flatMap((position) => [position.token0, position.token1])
		const uniqueTokenAddrs = [...new Set(tokenAddrs)]
		return uniqueTokenAddrs.map((tokenAddr) => Token.formatCurrencyId(chainId, tokenAddr))
	}, [chainId, positionDetails])

	const { data: tokens, isLoading: isLoadingTokens } = useTokens(ccyIds)

	const poolInfos = useMemo<{ tokenA: Token; tokenB: Token; fee: FeeAmount }[]>(() => {
		if (!chainId) return []
		if (!positionDetails) return []
		const infos = positionDetails.map((position) => {
			const poolAddress = computePoolAddress(chainId, [position.token0, position.token1], position.fee)
			return {
				tokenA: position.token0,
				tokenB: position.token1,
				fee: position.fee,
				poolAddress: poolAddress,
			}
		})
		const uniquePools = infos.filter((info, index, self) => {
			const idx = self.findIndex((t) => t.poolAddress?.toLowerCase() === info.poolAddress?.toLowerCase())
			return idx === index
		})
		const mappedPools = uniquePools
			.map((pool) => {
				return {
					tokenA: tokens.find((token) => isAddressEqual(token.address, pool.tokenA)),
					tokenB: tokens.find((token) => isAddressEqual(token.address, pool.tokenB)),
					fee: pool.fee,
				}
			})
			.filter((pool) => !!pool.tokenA && !!pool.tokenB) as { tokenA: Token; tokenB: Token; fee: FeeAmount }[]
		return mappedPools
	}, [chainId, positionDetails, tokens])

	const { data: pools, isLoading: isLoadingPools } = usePools(chainId, poolInfos)

	const positions = useMemo(() => {
		const pos = positionDetails
			?.map((position) => {
				const pool = pools.find((pool) => {
					const sameToken0 = isAddressEqual(pool.token0.address, position.token0)
					const sameToken1 = isAddressEqual(pool.token1.address, position.token1)
					const sameFee = pool.fee === position.fee
					return sameToken0 && sameToken1 && sameFee
				})
				if (!pool) return undefined
				return new Position({
					pool: pool,
					position: position,
				})
			})
			.filter((p) => !!p)
		return pos
	}, [pools, positionDetails])

	return {
		data: positions,
		isLoading: isLoadingPositionDetails || isLoadingTokens || isLoadingPools,
	}
}
