import { useMemo, useRef, useState } from "react"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import { PoolTransactionItem, TransactionType } from "@rabbitswap/api-core/dto"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { Redirect } from "@/components/Redirect"
import { getExplorerLink } from "@/constants/explorer"
import { useSwapChainId } from "@/hooks/useChainId"
import { Pool } from "@/types/pool"

import { useColumn } from "./columns"
import { useTransactionData } from "./hooks/useTransactionData"
import { TypeFilter } from "./TypeFilter"

const alignLeftColumns = ["timestamp", "type"]

const placeholder: PoolTransactionItem[] = Array.from({ length: 10 }, () => {
	const x: PoolTransactionItem = {
		timestamp: 0, // use 0 so time column is empty
		txHash: "0x",
		type: "buy",
		token0Amount: "0",
		token1Amount: "0",
		valueUsd: "0",
		wallet: "0x",
	}
	return x
})

export const PoolTransactionTable: React.FC<{
	pool: Pool | undefined
	inverted: boolean
}> = ({ pool, inverted }) => {
	const [typeFilter, setTypeFilter] = useState<TransactionType[]>(["buy", "sell", "add", "remove"])
	const { data, isLoading } = useTransactionData(pool, typeFilter, inverted)
	const chainId = useSwapChainId()

	const columns = useColumn(isLoading, inverted, pool)
	const table = useReactTable<PoolTransactionItem>({
		data: isLoading ? placeholder : (data ?? []),
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	})

	const containerRef = useRef<HTMLDivElement>(null)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const rows = useMemo(() => table.getRowModel().rows, [data])

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 48,
		getScrollElement: () => containerRef.current,
		measureElement:
			typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
				? (element) => element.getBoundingClientRect().height
				: undefined,
		overscan: 2,
	})

	return (
		<div className="flex flex-col gap-6">
			<div className="text-2xl font-semibold">Transactions</div>
			<div className="overflow-x-auto rounded-[20px] border border-gray-100 bg-background font-medium dark:border-gray-800 dark:bg-background-dark">
				<div
					className="max-h-[calc(100dvh-140px)] overflow-y-auto md:max-h-[calc(100dvh-160px)] lg:max-h-[calc(100dvh-180px)] lg:max-w-[572px]"
					ref={containerRef}
				>
					<Table>
						<TableHeader className="sticky top-0 z-[1] w-full">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="flex w-full overflow-hidden px-4">
									{headerGroup.headers.map((header) => {
										return (
											<TableHead
												key={header.id}
												className="flex shrink-0 grow items-center whitespace-nowrap px-2"
												style={{
													width: header.column.getSize(),
												}}
											>
												{header.id === "type" ? (
													<TypeFilter filter={typeFilter} setFilter={setTypeFilter}>
														{flexRender(header.column.columnDef.header, header.getContext())}
													</TypeFilter>
												) : (
													<div
														className={cn(
															"flex w-full justify-end",
															alignLeftColumns.includes(header.id) && "justify-start",
														)}
													>
														{flexRender(header.column.columnDef.header, header.getContext())}
													</div>
												)}
											</TableHead>
										)
									})}
								</TableRow>
							))}
						</TableHeader>
						{rows.length === 0 ? (
							<TableBody className="flex w-full justify-center py-10 text-center text-gray-300">
								No Transaction in 24 hours
							</TableBody>
						) : (
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
										<Redirect key={row.id} to={getExplorerLink(chainId, row.original.txHash, "transaction")} hideArrow>
											<TableRow
												className="absolute flex w-full cursor-pointer items-center px-4 py-1"
												style={{
													top: virtualRow.start,
												}}
											>
												{row.getVisibleCells().map((cell) => (
													<TableCell
														key={cell.id}
														style={{
															width: cell.column.getSize(),
														}}
														className={cn(
															"flex shrink-0 grow",
															!alignLeftColumns.includes(cell.column.id) && "justify-end",
														)}
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										</Redirect>
									)
								})}
							</div>
						)}
					</Table>
				</div>
			</div>
		</div>
	)
}
