import { ComponentProps, PropsWithChildren } from "react"

import { Badge, Button } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { WalletLabelWithIcon } from "@/components/Wallet/WalletLabel"
import { useAccountMode } from "@/feature/sub-account/context"
import { useAccount } from "@/hooks/useAccount"
import { useAccountDrawer } from "@/hooks/useAccountDrawer"
import { useConnectWallet } from "@/hooks/wallet/useConnectWallet"

interface ConnectWalletButtonProps extends PropsWithClassName, PropsWithChildren, ComponentProps<typeof Button> {}

export const ConnectEvmWalletButton: React.FC<ConnectWalletButtonProps> = ({
	className,
	children: _children,
	buttonType: _buttonType,
	buttonColor: _buttonColor,
	onClick: _onClick,
	...props
}) => {
	const { address } = useAccount()
	const connect = useConnectWallet()
	const { handleOpenDrawer } = useAccountDrawer()
	const { accountMode } = useAccountMode()

	const children =
		_children ??
		(address ? (
			<div className={cn("flex items-center gap-1.5")}>
				<WalletLabelWithIcon address={address} showAddress />
				<Badge
					variant="primary"
					type="translucent"
					size="small"
					className="h-6 px-3 py-1 font-medium text-primary-700 dark:text-primary-300 md:text-xs"
				>
					{accountMode === "sub" ? "Sub" : "Main"}
				</Badge>
			</div>
		) : (
			"Connect Wallet"
		))
	const buttonType = _buttonType ?? (address ? "outline" : "solid")
	const buttonColor = _buttonColor ?? (address ? "gray" : "primary")

	return (
		<>
			<Button
				buttonType={buttonType}
				buttonColor={buttonColor}
				onClick={(e) => {
					_onClick?.(e)
					if (address) handleOpenDrawer()
					else connect()
				}}
				className={className}
				{...props}
			>
				{children}
			</Button>
		</>
	)
}
