import { useState } from "react"

import { ChevronDownIcon } from "lucide-react"

import { Button, Popover, PopoverContent, PopoverTrigger, RadioButtonGroup } from "@rabbitswap/ui/basic"

type MaxButtonValue = 0.25 | 0.5 | 0.75 | 1

const maxButtonOptions: { label: string; value: MaxButtonValue }[] = [
	{ value: 0.25, label: "25%" },
	{ value: 0.5, label: "50%" },
	{ value: 0.75, label: "75%" },
	{ value: 1, label: "Max" },
]

export const MaxButton: React.FC<{ onValueChange: (value: MaxButtonValue) => void }> = ({ onValueChange }) => {
	const [value, setValue] = useState<MaxButtonValue>(1)
	const [open, setOpen] = useState(false)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger>
				<Button
					size="sm"
					className="h-5 gap-1 !text-xs"
					onClick={() => {
						onValueChange(value)
					}}
				>
					{maxButtonOptions.find((v) => v.value === value)?.label ?? "Max"}
					<ChevronDownIcon className="size-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-fit rounded-lg p-2">
				<RadioButtonGroup
					value={value.toString()}
					size="sm"
					groupingStyle="gap"
					options={maxButtonOptions}
					className="!gap-1"
					itemClassName="!text-xs"
					onValueChange={(newV) => {
						const v = Number(newV) as MaxButtonValue
						setValue(v)
						onValueChange(v)
						setOpen(false)
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}
