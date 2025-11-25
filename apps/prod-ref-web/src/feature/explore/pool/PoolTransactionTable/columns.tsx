import { useCallback, useMemo } from "react"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowDown } from "lucide-react"

import { PoolTransactionItem, TransactionType } from "@rabbitswap/api-core/dto"
import { Skeleton } from "@rabbitswap/ui/basic"
import { cn, shortenText } from "@rabbitswap/ui/utils"

import { Pool } from "@/types/pool"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"

import { TimeColumn } from "./TimeColumn"

export const useColumn = (isLoading: boolean, inverted: boolean, pool: Pool | undefined) => {
	const getTypeDisplayText = useCallback(
		(type: TransactionType | undefined) => {
			if (!type || !pool) return undefined
			switch (type) {
				case "add": {
					return "Add"
				}
				case "remove": {
					return "Remove"
				}
				case "buy": {
					return inverted ? `Sell ${pool.token1.symbol}` : `Buy ${pool.token0.symbol}`
				}
				case "sell": {
					return inverted ? `Buy ${pool.token1.symbol}` : `Sell ${pool.token0.symbol}`
				}
				default: {
					return undefined
				}
			}
		},
		[inverted, pool],
	)

	const [tokenLeft, tokenRight] = useMemo(
		() => (inverted ? [pool?.token1, pool?.token0] : [pool?.token0, pool?.token1]),
		[inverted, pool],
	)

	const columns = useMemo<ColumnDef<PoolTransactionItem>[]>(
		() => [
			{
				accessorKey: "timestamp",
				header: () => (
					<div className="flex gap-1">
						<ArrowDown className="size-4" /> Time
					</div>
				),
				cell: ({ row }) => {
					const { timestamp } = row.original
					return <TimeColumn timestamp={timestamp} />
				},
				enableSorting: false,
				size: 100,
			},
			{
				accessorKey: "type",
				header: "Type",
				cell: ({ row }) => {
					const { type } = row.original
					const text = getTypeDisplayText(type)
					return (
						<Skeleton
							isLoading={isLoading}
							width={60}
							className={cn(
								"flex items-center gap-3",
								text?.includes("Buy") || text?.includes("Add") ? "text-number-positive" : "text-number-negative",
							)}
						>
							{text}
						</Skeleton>
					)
				},
				size: 120,
			},
			{
				accessorKey: "usd",
				header: "USD",
				cell: ({ row }) => {
					const { valueUsd } = row.original
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{valueUsd ? formatFiatValue(valueUsd) : "-"}
						</Skeleton>
					)
				},
				size: 100,
			},
			{
				accessorKey: "token0Amount",
				header: tokenLeft?.symbol,
				cell: ({ row }) => {
					const amount = inverted ? row.original.token1Amount : row.original.token0Amount
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{tokenLeft && TokenAmount.fromWei(tokenLeft, amount).toFormat({ decimalPlaces: 2 })}
						</Skeleton>
					)
				},
				size: 100,
			},
			{
				accessorKey: "token1Amount",
				header: tokenRight?.symbol,
				cell: ({ row }) => {
					const amount = inverted ? row.original.token0Amount : row.original.token1Amount
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{tokenRight && TokenAmount.fromWei(tokenRight, amount).toFormat({ decimalPlaces: 2 })}
						</Skeleton>
					)
				},
				size: 100,
			},
			{
				accessorKey: "wallet",
				header: "Wallet",
				cell: ({ row }) => {
					const { wallet } = row.original
					return (
						<Skeleton isLoading={isLoading} width={80} className="text-right">
							{shortenText({ text: wallet })}
						</Skeleton>
					)
				},
				size: 140,
			},
		],
		[tokenLeft, tokenRight, getTypeDisplayText, isLoading, inverted],
	)

	return columns
}
