import { useMemo, useRef } from "react"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { ConnectSubAccountButton } from "@/feature/sub-account/components/ConnectSubAccountButton"
import { useLimitOrderTable } from "@/feature/swap/limit/components/LimitOrders/context"
import { useLimitOrders } from "@/feature/swap/limit/hooks/useLimitOrders"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { useAccount } from "@/hooks/useAccount"
import { sortDisplayTokens } from "@/utils/token"

import { useColumn } from "../columns"

export const CurrentOrderTable: React.FC = () => {
	const { subAddress } = useAccount()
	const { data: limitOrdersData, isLoading } = useLimitOrders(subAddress)
	const { showOnlyThisPair } = useLimitOrderTable()
	const { amountLeft, amountRight } = useLimitStore()

	const baseOrders = useMemo(() => limitOrdersData?.active, [limitOrdersData])

	const filteredLimitOrdersData = useMemo(() => {
		const _leftToken = amountLeft?.token
		const _rightToken = amountRight?.token
		if (showOnlyThisPair && _leftToken && _rightToken) {
			return baseOrders?.filter((order) => {
				const [oLeftToken, oRightToken] = sortDisplayTokens([order.fromTokenAmount.token, order.toTokenAmount.token])
				const [leftToken, rightToken] = sortDisplayTokens([_leftToken, _rightToken])
				return oLeftToken.equals(leftToken) && oRightToken.equals(rightToken)
			})
		}
		return baseOrders
	}, [amountLeft?.token, amountRight?.token, baseOrders, showOnlyThisPair])

	const columns = useColumn({ isLoading: isLoading, orderState: "active" })
	const table = useReactTable<LimitOrderItem>({
		data: filteredLimitOrdersData ?? [],
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	})

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const rows = useMemo(() => table.getRowModel().rows, [filteredLimitOrdersData])
	const containerRef = useRef<HTMLDivElement>(null)

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 56,
		getScrollElement: () => containerRef.current,
		measureElement:
			typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
				? (element) => element.getBoundingClientRect().height
				: undefined,
		overscan: 2,
	})

	return (
		<>
			<div className="overflow-x-auto rounded-[20px] border border-gray-100 bg-background font-medium dark:border-gray-800 dark:bg-background-dark">
				<div className="max-h-[360px] min-w-fit overflow-y-auto" ref={containerRef}>
					<Table>
						<TableHeader className="sticky top-0 z-[1] w-full">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="flex w-full overflow-hidden px-2">
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											align="left"
											className="flex shrink-0 grow items-center whitespace-nowrap px-2"
											style={{
												width: header.column.getSize(),
											}}
										>
											{flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						{!subAddress && (
							<TableBody className="flex w-full justify-center py-10 text-center text-gray-300 dark:text-gray-700">
								<div className="flex flex-col items-center gap-2">
									<ConnectSubAccountButton size="sm" className="px-4 py-2 font-normal" />
								</div>
							</TableBody>
						)}
						{subAddress && rows.length === 0 && (
							<TableBody className="flex w-full justify-center py-10 text-center text-gray-300 dark:text-gray-700">
								<div className="flex flex-col items-center gap-2">No Orders</div>
							</TableBody>
						)}
						{subAddress && rows.length > 0 && (
							<div
								style={{
									height: `${rowVirtualizer.getTotalSize()}px`,
									position: "relative",
								}}
							>
								{rowVirtualizer.getVirtualItems().map((virtualRow) => {
									const row = rows[virtualRow.index]
									if (row === undefined) return <></>
									return (
										<TableRow
											key={row.id}
											className="absolute flex h-14 w-full items-center px-2"
											style={{
												top: virtualRow.start,
											}}
										>
											{row.getVisibleCells().map((cell) => {
												return (
													<TableCell
														key={cell.id}
														style={{
															width: cell.column.getSize(),
														}}
														className={cn("flex shrink-0 grow")}
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												)
											})}
										</TableRow>
									)
								})}
							</div>
						)}
					</Table>
				</div>
			</div>
		</>
	)
}
