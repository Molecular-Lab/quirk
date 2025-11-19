import { useMemo } from "react"
import { Link } from "react-router-dom"

import { type ColumnDef } from "@tanstack/react-table"

import { Skeleton } from "@rabbitswap/ui/basic"
import { shortenText } from "@rabbitswap/ui/utils"

import { getExplorerLink } from "@/constants/explorer"
import { CancelOrderButton } from "@/feature/swap/limit/components/CancelOrderButton"
import { ExpiryInfo } from "@/feature/swap/limit/components/LimitOrders/ExpiryInfo"
import { PriceInfo } from "@/feature/swap/limit/components/LimitOrders/PriceInfo"
import { LimitOrderItem } from "@/feature/swap/limit/types"

import { OrderInfo } from "./OrderInfo"
import { StatusBadge } from "./StatusBadge"

export const useColumn = ({ isLoading, orderState }: { isLoading: boolean; orderState: "active" | "inactive" }) => {
	const columns = useMemo<ColumnDef<LimitOrderItem>[]>(
		() => [
			{
				id: "order-info",
				header: "Order Info",
				cell: ({ row }) => {
					return <OrderInfo order={row.original} />
				},
				enableSorting: false,
				size: 200,
			},
			{
				id: "when",
				header: "When",
				cell: ({ row }) => {
					return <PriceInfo order={row.original} />
				},
				enableSorting: false,
				size: 120,
			},
			{
				id: "expire",
				header: "Expires",
				cell: ({ row }) => {
					if (orderState === "inactive" && row.original.status !== "EXPIRED")
						return <span className="text-xs text-gray-500">-</span>
					return (
						<Skeleton isLoading={isLoading} width="100%">
							<ExpiryInfo order={row.original} />
						</Skeleton>
					)
				},
				size: 160,
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => {
					return (
						<Skeleton isLoading={isLoading} width="100%" className="-my-1 flex w-fit items-center gap-x-3 gap-y-0.5">
							<StatusBadge status={row.original.status} className="px-2" />
						</Skeleton>
					)
				},
				size: 120,
				enableSorting: false,
			},
			{
				id: "txHash",
				header: orderState === "inactive" ? "Tx Hash" : "",
				cell: ({ row }) => {
					const showTradeTxHash = ["COMPLETED", "EXECUTED"].includes(row.original.status)
					const showCancelTxHash = !showTradeTxHash && ["CANCELED", "PENDING_CANCELED"].includes(row.original.status)
					return (
						<Skeleton isLoading={isLoading} width="100%">
							{showTradeTxHash && (
								<Link
									to={getExplorerLink(88, row.original.tradeTxHash, "transaction")}
									target="_blank"
									className="text-sm font-normal underline decoration-dotted"
								>
									{shortenText({ text: row.original.tradeTxHash })}
								</Link>
							)}
							{showCancelTxHash && (
								<Link
									to={getExplorerLink(88, row.original.cancelTxHash, "transaction")}
									target="_blank"
									className="text-sm font-normal underline decoration-dotted"
								>
									{shortenText({ text: row.original.cancelTxHash })}
								</Link>
							)}
						</Skeleton>
					)
				},
				size: 120,
				enableSorting: false,
			},
			{
				id: "action",
				header: "",
				cell: ({ row }) => {
					switch (row.original.status) {
						case "CREATED":
						case "READY": {
							return (
								<div className="-my-3 flex w-full items-center justify-end">
									<CancelOrderButton order={row.original} />
								</div>
							)
						}
						default: {
							return <></>
						}
					}
				},
				size: 60,
				enableSorting: false,
			},
		],
		[isLoading, orderState],
	)
	return columns
}
