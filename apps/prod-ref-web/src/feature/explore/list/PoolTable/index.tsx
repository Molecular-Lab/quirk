import { useMemo, useRef } from "react"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { cn } from "@rabbitswap/ui/utils"

import { VIEM_CHAINS } from "@/constants/chain"
import { TableHeadCell } from "@/feature/explore/list/components/TableHeadCell"
import { useSwapChainId } from "@/hooks/useChainId"
import { useNavigate } from "@/router"

import { useColumn } from "./columns"
import { PoolStats, usePoolData } from "./usePoolData"

const alignLeftColumns = ["pool", "index"]

export const PoolTable: React.FC<{ search?: string }> = ({ search }) => {
	const { poolData, sorting, setSorting, isLoading } = usePoolData(search)
	const chainId = useSwapChainId()
	const chainName = useMemo(() => VIEM_CHAINS[chainId]?.name.toLowerCase() ?? "", [chainId])
	const { isLgUp } = useBreakpoints()

	const columns = useColumn(isLoading)
	const table = useReactTable<PoolStats | undefined>({
		data: poolData,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		state: {
			sorting,
		},
	})

	const navigate = useNavigate()
	const containerRef = useRef<HTMLDivElement>(null)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const rows = useMemo(() => table.getRowModel().rows, [poolData])

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => (isLgUp ? 62 : 60),
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
				<div
					className="max-h-[calc(100dvh-140px)] min-w-fit  overflow-y-auto md:max-h-[calc(100dvh-160px)] lg:max-h-[calc(100dvh-180px)]"
					ref={containerRef}
				>
					<Table>
						<TableHeader className="sticky top-0 z-[1] w-full">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="flex w-full overflow-hidden px-2">
									{headerGroup.headers.map((header) => (
										<TableHeadCell
											key={header.id}
											header={header}
											align={alignLeftColumns.includes(header.id) ? "left" : "right"}
										/>
									))}
								</TableRow>
							))}
						</TableHeader>
						{rows.length === 0 ? (
							<TableBody className="flex w-full justify-center py-10 text-center text-gray-300">
								No Pool Found
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
										<TableRow
											key={row.id}
											className="absolute flex w-full cursor-pointer items-center px-2"
											style={{
												top: virtualRow.start,
											}}
											onClick={() => {
												if (!row.original?.address) return
												void navigate("/explore/pools/:chainName/:poolAddress", {
													params: {
														chainName: chainName,
														poolAddress: row.original.address,
													},
												})
											}}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													style={{
														width: cell.column.getSize(),
													}}
													className={cn(
														"flex shrink-0 grow justify-end",
														alignLeftColumns.includes(cell.column.id) && "justify-start",
													)}
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									)
								})}
							</div>
						)}
					</Table>
				</div>
			</div>
			<div className="mt-4 text-center text-xs text-gray-400 lg:text-sm">
				Only pools with a TVL greater than 50 VIC will be displayed.
			</div>
		</>
	)
}
