import { useMemo } from "react"

import { Header, flexRender } from "@tanstack/react-table"
import { ArrowDown, ArrowUp } from "lucide-react"

import { TableHead } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

export const TableHeadCell: React.FC<{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	header: Header<any, any>
	align?: "left" | "right"
}> = ({ header, align = "right" }) => {
	const isSortable = header.column.getCanSort()
	const isSorted = header.column.getIsSorted()

	const sortComponent: React.ReactNode = useMemo(() => {
		if (!isSortable) return null
		if (isSorted === false) return <div className="w-4" />
		if (isSorted === "asc") return <ArrowUp className="size-4" />
		return <ArrowDown className="size-4" />
	}, [isSortable, isSorted])

	return (
		<TableHead
			key={header.id}
			className="flex shrink-0 grow items-center whitespace-nowrap px-2"
			style={{
				width: header.column.getSize(),
			}}
		>
			<div
				className={cn(
					"flex w-full items-center justify-end gap-1",
					align === "left" && "justify-start",
					isSortable && "cursor-pointer",
				)}
				onClick={header.column.getToggleSortingHandler()}
			>
				{sortComponent}
				{flexRender(header.column.columnDef.header, header.getContext())}
			</div>
		</TableHead>
	)
}
