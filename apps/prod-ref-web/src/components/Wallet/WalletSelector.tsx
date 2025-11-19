import { useState } from "react"

import { ChevronDown, Plus } from "lucide-react"
import { Address } from "viem"

import { Badge, Popover, PopoverContent, PopoverTrigger } from "@rabbitswap/ui/basic"
import { ClipboardCopy } from "@rabbitswap/ui/components"
import { cn, shortenText } from "@rabbitswap/ui/utils"

import { WalletAvatar } from "@/components/Wallet/WalletAvatar"
import { ConnectSubAccountButton } from "@/feature/sub-account/components/ConnectSubAccountButton"
import { useAccountMode } from "@/feature/sub-account/context"
import { useParticleLoginMutation } from "@/feature/sub-account/hooks/useParticleLoginMutation"
import { AccountMode } from "@/feature/sub-account/types"
import { useAccount } from "@/hooks/useAccount"
import { useWalletDomain } from "@/hooks/wallet/useWalletDomain"

export const WalletSelector: React.FC = () => {
	const { accountMode, setAccountMode } = useAccountMode()
	const { mainAddress, subAccountAddress, subAddress, address } = useAccount()
	const { mutateAsync: login } = useParticleLoginMutation()
	const [isOpen, setIsOpen] = useState(false)

	const accountModeFeatures = getAccountModeFeatures({ accountMode })
	const { selectedDomain } = useWalletDomain(address, ".rabbit", { startLength: 3, endLength: 1 })

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger className="w-full rounded-xl bg-gray-50 p-3 font-normal dark:bg-gray-950">
				<div className={cn("group flex items-center gap-2")}>
					{address && <WalletAvatar address={address} className="size-8 lg:size-10" />}
					<div className="flex w-full flex-col items-start font-medium">
						<div className={cn("text-[18px] leading-none", selectedDomain?.displayDomain && "text-sm")}>
							{selectedDomain?.displayDomain ?? shortenText({ text: address })}
						</div>
						<div className="flex items-center gap-1 text-xs text-primary-500 dark:text-primary-300">
							<div className="size-1.5 rounded-full bg-primary-500 dark:bg-primary-300" />
							{accountModeFeatures}
						</div>
					</div>
					<div className="ml-auto flex items-center gap-0.5">
						<Badge type="translucent" className="text-primary-700">
							{accountMode === "main" ? "Main" : "Sub"}
						</Badge>
						<ChevronDown className={cn("size-5 shrink-0 transition-transform", isOpen && "rotate-180")} />
					</div>
				</div>
			</PopoverTrigger>
			<PopoverContent className="flex min-w-[324px] flex-col gap-1">
				<div className="mb-3">Account</div>
				<AccountModeItem
					accountMode="main"
					address={mainAddress}
					isActive={accountMode === "main"}
					onClick={() => {
						if (accountMode === "main") return
						setAccountMode("main")
						setIsOpen(false)
					}}
				/>
				<AccountModeItem
					accountMode="sub"
					address={subAccountAddress}
					isActive={accountMode === "sub"}
					onClick={async () => {
						if (!subAddress) {
							await login()
						}
						if (accountMode === "sub") return
						setAccountMode("sub")
						setIsOpen(false)
					}}
				/>
				{!subAccountAddress && (
					<ConnectSubAccountButton className="mt-3 h-[44px] w-full">
						<Plus className="size-4" />
						Connect Trading Account
					</ConnectSubAccountButton>
				)}
			</PopoverContent>
		</Popover>
	)
}

function getAccountModeFeatures({ accountMode }: { accountMode: AccountMode }) {
	switch (accountMode) {
		case "main": {
			return "Swap Only"
		}
		case "sub": {
			return "Swap & Limit"
		}
		default: {
			throw new Error("Unknown account mode")
		}
	}
}

const AccountModeItem: React.FC<{
	accountMode: AccountMode
	address: Address | undefined
	onClick: () => void
	isActive: boolean
}> = ({ accountMode, address, onClick, isActive }) => {
	const { selectedDomain } = useWalletDomain(address, ".rabbit")

	if (!address) return null
	return (
		<div
			className={cn(
				"w-full rounded-xl border border-transparent p-3",
				!isActive && "cursor-pointer hover:border-gray-100 hover:dark:border-gray-800",
				isActive && "bg-gray-50 dark:bg-gray-950",
			)}
			onClick={onClick}
		>
			<div className={cn("group flex items-center gap-3")}>
				<WalletAvatar address={address} />
				<div className="flex w-full flex-col items-start font-medium">
					<div className="leading-none">{selectedDomain?.displayDomain ?? shortenText({ text: address })}</div>
					<div className="flex items-center gap-1 text-xs text-primary-500 dark:text-primary-300">
						<div className="size-1.5 rounded-full bg-primary-500 dark:bg-primary-300" />
						{getAccountModeFeatures({ accountMode })}
					</div>
				</div>
				<Badge type="translucent" className="ml-auto text-primary-700">
					{accountMode === "main" ? "Main" : "Sub"}
				</Badge>
				<ClipboardCopy
					text={address}
					className="size-4"
					containerClassName={cn(
						"rounded-full bg-background p-1.5 dark:bg-background-dark",
						!isActive && "bg-gray-50 dark:bg-gray-900",
					)}
				/>
			</div>
		</div>
	)
}
