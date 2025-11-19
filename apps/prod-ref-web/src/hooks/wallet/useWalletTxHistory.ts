import { useEffect, useMemo } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs, { Dayjs } from "dayjs"
import { Address, Hash, PublicClient, isAddressEqual } from "viem"

import { WalletTransactionItem as _WalletTransactionItem } from "@rabbitswap/api-core/dto"

import apiClient from "@/api/core"
import { QueryKeys } from "@/config/queryKey"
import { useLimitOrders } from "@/feature/swap/limit/hooks/useLimitOrders"
import { getCachedToken } from "@/hooks/token/useToken"
import { useSwapChainId } from "@/hooks/useChainId"
import { useViemClient } from "@/hooks/wallet/useViemClient"
import { TokenAmount } from "@/types/tokenAmount"

interface MappedTokenPair {
	fromToken: Address
	fromTokenAmount: string
	toToken: Address
	toTokenAmount: string
}

export interface WalletTransactionItem
	extends Omit<_WalletTransactionItem, "token0" | "token1" | "token0Amount" | "token1Amount" | "timestamp" | "type"> {
	token0Amount: TokenAmount
	token1Amount: TokenAmount
	timestamp: Dayjs
	type: _WalletTransactionItem["type"] | "limit-create" | "limit-cancel" | "limit-exec" | "remove+collect"
	limitOrderId?: string // use for limit order txs
}

export const useWalletTxHistory = (walletAddress: Address | undefined) => {
	const chainId = useSwapChainId()
	const queryClient = useQueryClient()

	const query = useQuery<WalletTransactionItem[]>({
		queryKey: QueryKeys.wallet.txHistory(walletAddress),
		queryFn: async () => {
			if (!walletAddress) throw new Error("Wallet address is required")

			const txHistory = await apiClient.walletRouter.getWalletTxHistory(walletAddress)

			// merge same txHash
			const mergedTxHistory = txHistory.map((tx, _, arr) => {
				switch (tx.type) {
					case "buy":
					case "sell": {
						return mergeSwapTx(tx, arr)
					}
					case "remove":
					case "collectFee": {
						return mergeRemoveCollectTx(tx, arr)
					}
					default: {
						return tx
					}
				}
			}, [])

			// unique by txHash and tx type
			const uniqueTxHistory = mergedTxHistory.filter((tx, index, self) => {
				const idx = self.findIndex((t) => {
					const sameTxHash = t.txHash.toLowerCase() === tx.txHash.toLowerCase()
					const sameType = t.type === tx.type
					return sameTxHash && sameType
				})
				return idx === index
			})

			// map output
			const output = await Promise.all(
				uniqueTxHistory.map(async (tx) => {
					const token0 = await getCachedToken(queryClient, chainId, tx.token0)
					const token1 = await getCachedToken(queryClient, chainId, tx.token1)
					return {
						...tx,
						token0Amount: TokenAmount.fromWei(token0, tx.token0Amount),
						token1Amount: TokenAmount.fromWei(token1, tx.token1Amount),
						timestamp: dayjs.unix(tx.timestamp),
					}
				}),
			)

			return output
		},
		enabled: !!walletAddress,
		refetchInterval: 60 * 1000, // 1 min
	})

	return query
}

export const useWalletLimitOrderTxHistory = (address: Address | undefined) => {
	const { publicClient } = useViemClient()
	const { data: limitOrders, ...rest } = useLimitOrders(address)

	const query = useQuery<WalletTransactionItem[]>({
		queryKey: QueryKeys.wallet.limitOrderTxHistory(address),
		queryFn: async () => {
			if (limitOrders === undefined) throw new Error("Limit orders not found")

			const txGroups = await Promise.all(
				limitOrders.all.map<Promise<WalletTransactionItem[]>>(async (order) => {
					// patch order tx timestamp, if order tx timestamp is missing or is before cancel tx timestamp or trade tx timestamp
					if (
						order.orderTxHash &&
						(order.orderTxTimestamp === undefined ||
							(order.cancelTxTimestamp !== undefined && order.orderTxTimestamp > order.cancelTxTimestamp) ||
							(order.tradeTxTimestamp !== undefined && order.orderTxTimestamp > order.tradeTxTimestamp))
					) {
						order.orderTxTimestamp = await getTxTimestamp(order.orderTxHash, publicClient)
					}
					// patch cancel tx timestamp, if cancel tx timestamp is missing
					if (order.cancelTxHash && order.cancelTxTimestamp === undefined) {
						order.cancelTxTimestamp = await getTxTimestamp(order.cancelTxHash, publicClient)
					}
					// patch trade tx timestamp, if trade tx timestamp is missing
					if (order.tradeTxHash && order.tradeTxTimestamp === undefined) {
						order.tradeTxTimestamp = await getTxTimestamp(order.tradeTxHash, publicClient)
					}

					const createTx: WalletTransactionItem | undefined = order.orderTxHash
						? {
								timestamp: dayjs.unix(order.orderTxTimestamp ?? 0),
								txHash: order.orderTxHash,
								type: "limit-create",
								token0Amount: order.fromTokenAmount,
								token1Amount: order.toTokenAmount,
								walletAddress: address ?? "0x",
								poolAddress: "0x", // ignore
								valueUsd: "0", // ignore
								limitOrderId: order.orderId,
							}
						: undefined

					const cancelTx: WalletTransactionItem | undefined = order.cancelTxHash
						? {
								timestamp: dayjs.unix(order.cancelTxTimestamp ?? 0),
								txHash: order.cancelTxHash,
								type: "limit-cancel",
								token0Amount: order.fromTokenAmount,
								token1Amount: order.toTokenAmount,
								walletAddress: address ?? "0x",
								poolAddress: "0x", // ignore
								valueUsd: "0", // ignore
								limitOrderId: order.orderId,
							}
						: undefined

					const executeTx: WalletTransactionItem | undefined = order.tradeTxHash
						? {
								timestamp: dayjs.unix(order.tradeTxTimestamp ?? 0),
								txHash: order.tradeTxHash,
								type: "limit-exec",
								token0Amount: order.fromTokenAmount,
								token1Amount: order.toTokenAmount,
								walletAddress: address ?? "0x",
								poolAddress: "0x", // ignore
								valueUsd: "0", // ignore
								limitOrderId: order.orderId,
							}
						: undefined
					return [createTx, cancelTx, executeTx].filter((x) => x !== undefined)
				}),
			)
			const txs = txGroups.flat()
			return txs
		},
		enabled: !!address && limitOrders !== undefined,
	})

	useEffect(() => {
		void query.refetch()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [limitOrders])

	return {
		...rest,
		isLoading: query.isLoading || rest.isLoading,
		data: query.data,
	}
}

async function getTxTimestamp(txHash: Hash, publicClient: PublicClient): Promise<number> {
	const receipt = await publicClient.getTransactionReceipt({
		hash: txHash,
	})
	const blockNumber = receipt.blockNumber
	const blockInfo = await publicClient.getBlock({
		blockNumber: blockNumber,
	})
	return Number(blockInfo.timestamp)
}

function mergeSwapTx(tx: _WalletTransactionItem, arr: _WalletTransactionItem[]): _WalletTransactionItem {
	const existingTxs = arr.filter((t) => t.txHash.toLowerCase() === tx.txHash.toLowerCase())
	if (existingTxs.length === 0) return tx
	if (existingTxs.length === 1) return tx

	const tokenList = existingTxs
		.map<MappedTokenPair | undefined>((t) => {
			switch (t.type) {
				case "sell": {
					return {
						fromToken: t.token0,
						fromTokenAmount: t.token0Amount,
						toToken: t.token1,
						toTokenAmount: t.token1Amount,
					}
				}
				case "buy": {
					return {
						fromToken: t.token1,
						fromTokenAmount: t.token1Amount,
						toToken: t.token0,
						toTokenAmount: t.token0Amount,
					}
				}
				default: {
					return undefined
				}
			}
		})
		.filter((t) => t !== undefined)

	if (tokenList.length === 0) return tx

	const fromTokens = tokenList.map((t) => t.fromToken)
	const toTokens = tokenList.map((t) => t.toToken)

	const fromToken = fromTokens.find((t) => !toTokens.some((tt) => isAddressEqual(tt, t)))
	const toToken = toTokens.find((t) => !fromTokens.some((tt) => isAddressEqual(tt, t)))

	if (!fromToken || !toToken) return tx

	const fromTokenAmount = tokenList.find((t) => isAddressEqual(t.fromToken, fromToken))?.fromTokenAmount ?? "0"
	const toTokenAmount = tokenList.find((t) => isAddressEqual(t.toToken, toToken))?.toTokenAmount ?? "0"

	const result: _WalletTransactionItem = {
		...tx,
		type: "sell", // always return sell when merge swap tx
		token0: fromToken,
		token0Amount: fromTokenAmount,
		token1: toToken,
		token1Amount: toTokenAmount,
	}

	return result
}

interface RemoveCollectTx extends Omit<_WalletTransactionItem, "type"> {
	type: _WalletTransactionItem["type"] | "remove+collect"
}

function mergeRemoveCollectTx(tx: _WalletTransactionItem, arr: _WalletTransactionItem[]): RemoveCollectTx {
	const existingTxs = arr.filter((t) => t.txHash.toLowerCase() === tx.txHash.toLowerCase())
	if (existingTxs.length === 0) return tx
	if (existingTxs.length === 1) return tx

	return {
		...tx,
		type: "remove+collect",
	}
}

export const useWalletAllTxHistory = (walletAddress: Address | undefined) => {
	const { data: coreTxs, isLoading: isLoadingCoreTxs } = useWalletTxHistory(walletAddress)
	const { data: limitOrderTxs, isLoading: isLoadingLimitOrderTxs } = useWalletLimitOrderTxHistory(walletAddress)

	const txs = useMemo<WalletTransactionItem[] | undefined>(() => {
		if (coreTxs === undefined && limitOrderTxs === undefined) return undefined
		return [...(coreTxs ?? []), ...(limitOrderTxs ?? [])].sort((a, b) => {
			return b.timestamp.diff(a.timestamp)
		})
	}, [coreTxs, limitOrderTxs])

	return {
		coreTxs: coreTxs,
		limitOrderTxs: limitOrderTxs,
		txs: txs,
		isLoadingCoreTxs: isLoadingCoreTxs,
		isLoadingLimitOrderTxs: isLoadingLimitOrderTxs,
		isLoading: isLoadingCoreTxs || isLoadingLimitOrderTxs,
	}
}
