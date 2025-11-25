import { Wallet } from "lucide-react"

import { Input, Popover, PopoverContent, PopoverTrigger } from "@rabbitswap/ui/basic"

import { useBridgeStore } from "../form/store/bridgeStore"

export const CustomAddressInput: React.FC = () => {
	const { customAddr, setCustomAddr } = useBridgeStore()

	return (
		<Popover>
			<PopoverTrigger className="relative">
				<Wallet className="size-6" />
				{customAddr && (
					<div className="absolute -right-2 top-0 size-2 shrink-0 animate-pulse rounded-full bg-primary-600" />
				)}
			</PopoverTrigger>
			<PopoverContent align="end" className="min-w-[335px] p-6">
				<div className="flex flex-col gap-4 text-sm font-medium lg:text-base">
					<div>Custom Destination Address</div>
					<Input
						placeholder="0x73cA....0406"
						value={customAddr}
						className="w-full rounded-md outline-none"
						onChange={(e) => {
							setCustomAddr(e.target.value)
						}}
						autoFocus
					/>
				</div>
			</PopoverContent>
		</Popover>
	)
}
