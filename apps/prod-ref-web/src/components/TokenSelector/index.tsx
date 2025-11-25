import { ComponentProps } from "react"

import { ChevronDown } from "lucide-react"
import { Address } from "viem"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { useSelectTokenModal } from "@/components/TokenSelector/hooks/useSelectTokenModal"
import { EvmToken } from "@/types/tokens"

type TokenSelectorProps = Omit<ComponentProps<typeof Button>, "onSelect" | "children"> & {
	token?: EvmToken
	onSelect: (token: EvmToken) => void
	balanceWallet?: Address
	emptyStateLabel?: string
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
	token,
	onSelect,
	disabled,
	className,
	buttonColor,
	balanceWallet,
	emptyStateLabel = "Select token",
	...props
}) => {
	const { open } = useSelectTokenModal()

	return (
		<Button
			className={cn(
				"font-normal",
				"shrink-0",
				"flex items-center gap-1 lg:gap-2",
				"px-3 lg:px-4",
				"text-xs lg:text-sm",
				token && [
					"bg-white hover:bg-gray-100 active:bg-gray-150",
					"disabled:bg-white disabled:text-gray-950 disabled:dark:bg-white disabled:dark:text-gray-950",
					"disabled:cursor-default disabled:pr-5",
				],
				className,
			)}
			buttonColor={buttonColor ?? "secondary"}
			onClick={
				disabled
					? undefined
					: () => {
							open({ onSelect, balanceWallet })
						}
			}
			disabled={disabled}
			{...props}
		>
			{token ? (
				<>
					<TokenIcon token={token} className="size-6 text-[9px]" />
					<div>{token.symbol}</div>
				</>
			) : (
				<div>{emptyStateLabel}</div>
			)}
			{!disabled && <ChevronDown className="ml-auto" />}
		</Button>
	)
}
