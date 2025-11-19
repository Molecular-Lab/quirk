import { useEffect, useRef, useState } from "react"

import { Search } from "lucide-react"

import { Input } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useDebouncedSet } from "@/utils/hooks/useDebounced"

export const SearchButton: React.FC<{
	label: string
	value: string
	onChange: (search: string) => void
}> = ({ value, onChange, label }) => {
	const [isExpanded, setExpanded] = useState(false)
	const ref = useRef<HTMLInputElement>(null)

	const [val, setVal] = useDebouncedSet(value, onChange)

	useEffect(() => {
		if (isExpanded) {
			ref.current?.focus()
		}
	}, [isExpanded])

	return (
		<div
			className={cn(
				"flex size-9 items-center gap-2 overflow-hidden rounded-full p-2 font-medium transition-all lg:size-12 lg:p-3",
				"bg-gray-50 dark:bg-gray-900",
				isExpanded ? "w-[140px] sm:w-[180px] lg:w-[200px]" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
			)}
			onClick={() => {
				setExpanded(true)
			}}
		>
			<Search className="size-5 shrink-0 text-gray-400 lg:size-6" />
			<Input
				placeholder={`Search ${label}`}
				className={cn("h-auto border-none p-0 text-sm lg:text-base", !isExpanded && "w-0")}
				ref={ref}
				onBlur={() => {
					if (!val) setExpanded(false)
				}}
				value={val}
				onChange={(e) => {
					setVal(e.target.value)
				}}
			/>
		</div>
	)
}
