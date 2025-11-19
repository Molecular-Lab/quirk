import { useMemo } from "react"

import { type ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"

import { Button, Skeleton } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { InfoTooltip } from "@/components/InfoTooltip"
import { PoolTitle } from "@/components/PoolTitle"
import { Link } from "@/router"
import { formatDisplayNumber, formatFiatValue } from "@/utils/number"
import { getUnwrapped, sortDisplayTokens } from "@/utils/token"

import { PoolStats } from "./usePoolData"

export const useColumn = (isLoading: boolean) => {
	const columns = useMemo<ColumnDef<PoolStats | undefined>[]>(
		() => [
			{
				id: "index",
				header: "#",
				cell: ({ row }) => {
					return <div className="!text-xs text-gray-500">{row.index + 1}</div>
				},
				enableSorting: false,
				size: 20,
			},
			{
				id: "pool",
				header: "Pool",
				cell: ({ row }) => {
					const [token0, token1] = sortDisplayTokens([row.original?.token0, row.original?.token1])
					const feeRate = row.original?.feeRate
					return (
						<div className="flex items-center gap-2 lg:gap-3">
							<PoolTitle
								currencyQuote={getUnwrapped(token0)}
								currencyBase={getUnwrapped(token1)}
								feeRate={feeRate}
								titleClassName="text-base"
								iconClassName="size-7 lg:size-8"
							/>
						</div>
					)
				},
				enableSorting: false,
				size: 224,
			},
			{
				accessorKey: "totalValueLockedUsd",
				header: "TVL",
				cell: ({ row }) => {
					const totalValueLockedUsd = row.original?.totalValueLockedUsd
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{totalValueLockedUsd ? formatFiatValue(totalValueLockedUsd) : "-"}
						</Skeleton>
					)
				},
				size: 100,
			},
			{
				accessorKey: "apr",
				header: () => (
					<div className="flex items-center gap-1">
						APR
						<InfoTooltip>Annualized based on 1 day fees</InfoTooltip>
					</div>
				),
				cell: ({ row }) => {
					const apr = row.original?.apr
					return (
						<Skeleton
							isLoading={isLoading}
							width={60}
							className={cn("text-right", apr && apr > 0 && "text-number-positive")}
						>
							{apr ? `${apr.toFixed(2)}%` : "-"}
						</Skeleton>
					)
				},
				size: 100,
			},
			{
				accessorKey: "volume24HUsd",
				header: "Volume (24H)",
				cell: ({ row }) => {
					const volume24HUsd = row.original?.volume24HUsd
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{volume24HUsd ? `$${formatDisplayNumber(volume24HUsd, { precision: 2, toFixed: true })}` : "-"}
						</Skeleton>
					)
				},
				size: 140,
			},
			{
				accessorKey: "fee24HUsd",
				header: "Fees (24H)",
				cell: ({ row }) => {
					const fee24HUsd = row.original?.fee24HUsd
					return (
						<Skeleton isLoading={isLoading} width={60} className="text-right">
							{fee24HUsd ? formatFiatValue(fee24HUsd) : "-"}
						</Skeleton>
					)
				},
				size: 110,
			},
			{
				id: "action",
				accessorKey: "pool",
				header: "",
				cell: ({ row }) => {
					const token0 = row.original?.token0
					const token1 = row.original?.token1
					const feeRate = row.original?.feeRate

					const [quote, base] = sortDisplayTokens([getUnwrapped(token0), getUnwrapped(token1)])

					return (
						<div className="-my-3 flex items-center justify-end">
							<Link
								to="/add/:currencyIdA/:currencyIdB/:feeAmount"
								params={{
									currencyIdA: quote?.address ?? "",
									currencyIdB: base?.address ?? "",
									feeAmount: feeRate?.toString() ?? "",
								}}
								onClick={(e) => {
									e.stopPropagation()
								}}
							>
								<Button size="sm" className="p-1.5" disabled={isLoading}>
									<Plus className="size-3" strokeWidth={2.5} />
								</Button>
							</Link>
						</div>
					)
				},
				size: 60,
				enableSorting: false,
			},
		],
		[isLoading],
	)

	return columns
}
