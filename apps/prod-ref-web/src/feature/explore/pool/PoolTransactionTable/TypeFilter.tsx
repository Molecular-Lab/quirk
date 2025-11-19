import { PropsWithChildren, useState } from "react"

import { ChevronsUpDown } from "lucide-react"

import { TransactionType } from "@rabbitswap/api-core/dto"
import { Checkbox, Popover, PopoverContent, PopoverTrigger } from "@rabbitswap/ui/basic"

const filters = [
	{ label: "Buy", value: "buy" },
	{ label: "Sell", value: "sell" },
	{ label: "Remove", value: "remove" },
	{ label: "Add", value: "add" },
] as const

interface TypeFilterProps extends PropsWithChildren {
	filter: TransactionType[]
	setFilter: (value: TransactionType[]) => void
}

export const TypeFilter: React.FC<TypeFilterProps> = ({ children, filter, setFilter }) => {
	const [isOpen, setOpen] = useState(false)

	return (
		<Popover open={isOpen} onOpenChange={setOpen}>
			<PopoverTrigger className="flex gap-0.5">
				<ChevronsUpDown className="size-4" />
				{children}
			</PopoverTrigger>
			<PopoverContent align="start" className="mt-2 flex flex-col gap-2 text-base">
				{filters.map(({ label, value }) => {
					const isSelected = filter.includes(value)
					return (
						<div
							key={value}
							className="flex cursor-pointer items-center justify-between rounded-lg py-2 pl-2 pr-1 hover:bg-gray-50"
							onClick={() => {
								if (isSelected) {
									setFilter(filter.filter((f) => f !== value))
								} else {
									setFilter([...filter, value])
								}
								setOpen(false)
							}}
						>
							{label}
							<Checkbox checked={isSelected} />
						</div>
					)
				})}
			</PopoverContent>
		</Popover>
	)
}
