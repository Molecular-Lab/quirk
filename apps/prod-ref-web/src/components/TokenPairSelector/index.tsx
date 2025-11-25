import { ComponentProps } from "react"

import { ChevronDown } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { EvmToken } from "@/types/tokens"

import { useSelectTokenPairModal } from "./hooks/useSelectTokenPairModal"
import { TokenPairItem } from "./TokenPairItem"

type TokenPairSelectorProps = Omit<ComponentProps<typeof Button>, "onSelect"> & {
	tokenPair?: [EvmToken, EvmToken]
	optionItems?: [EvmToken, EvmToken][]
	onSelect: (tokenPair: [EvmToken, EvmToken]) => void
}

export const TokenPairSelector: React.FC<TokenPairSelectorProps> = ({
	tokenPair,
	optionItems,
	onSelect,
	disabled,
	className,
	buttonColor,
	...props
}) => {
	const { open } = useSelectTokenPairModal()

	return (
		<Button
			className={cn(
				"flex h-10 shrink-0 items-center gap-2 rounded-full px-4 font-medium lg:h-12",
				tokenPair && [
					"bg-white hover:bg-gray-100 active:bg-gray-150",
					"disabled:bg-white disabled:text-gray-950 disabled:dark:bg-white disabled:dark:text-gray-950",
					"disabled:cursor-default disabled:pr-5",
				],
				className,
			)}
			buttonColor={buttonColor ?? "gray"}
			onClick={
				disabled
					? undefined
					: () => {
							open({
								onSelect: onSelect,
								optionItems: optionItems ?? [],
							})
						}
			}
			disabled={disabled}
			{...props}
		>
			{tokenPair ? (
				<>
					<TokenPairItem tokenPair={tokenPair} />
				</>
			) : (
				<div>Select token</div>
			)}
			{!disabled && <ChevronDown className="ml-auto" />}
		</Button>
	)
}
