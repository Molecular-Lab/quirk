import { useMemo, useRef } from "react"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { cn } from "@rabbitswap/ui/utils"

import { TableHeadCell } from "@/feature/explore/list/components/TableHeadCell"
import { TokenData, useTokenData } from "@/feature/explore/list/hooks/useTokenData"

import { useColumn } from "./columns"

const alignLeftColumns = ["token-name", "index"]

export const TokenTable: React.FC<{ search?: string }> = ({ search }) => {
	const { tokenData, sorting, setSorting, isLoading } = useTokenData(search)
	const columns = useColumn(isLoading)
	const { isLgUp } = useBreakpoints()

	const table = useReactTable<TokenData | undefined>({
		data: tokenData,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		state: {
			sorting,
		},
	})

	const containerRef = useRef<HTMLDivElement>(null)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const rows = useMemo(() => table.getRowModel().rows, [tokenData])

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => (isLgUp ? 56 : 48),
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
					className="max-h-[calc(100dvh-140px)] min-w-fit overflow-y-auto md:max-h-[calc(100dvh-160px)] lg:max-h-[calc(100dvh-180px)]"
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
								No Token Found
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
											className="absolute flex w-full items-center px-2"
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
									)
								})}
							</div>
						)}
					</Table>
				</div>
			</div>
			<div className="mt-4 text-center text-xs text-gray-400 lg:text-sm">
				Only tokens with pools that have a TVL greater than 50 VIC will be displayed.
			</div>
		</>
	)
}
