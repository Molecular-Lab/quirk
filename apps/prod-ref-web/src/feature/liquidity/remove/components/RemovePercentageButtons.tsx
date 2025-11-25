import React from "react"

import { Button } from "@rabbitswap/ui/basic"

const OPTIONS: { label: string; value: number }[] = [
	{ label: "25%", value: 25 },
	{ label: "50%", value: 50 },
	{ label: "75%", value: 75 },
	{ label: "Max", value: 100 },
]

interface RemovePercentageButtonsProps {
	onClick: (v: number) => void
}

export const RemovePercentageButtons: React.FC<RemovePercentageButtonsProps> = ({ onClick }) => {
	return (
		<div id="remove-percentage-buttons" className="flex gap-1">
			{OPTIONS.map((option) => {
				return (
					<Button
						key={`${option.label}-${option.value}`}
						buttonType="filled"
						onClick={() => {
							onClick(option.value)
						}}
						className="rounded-lg text-primary-700"
					>
						{option.label}
					</Button>
				)
			})}
		</div>
	)
}
