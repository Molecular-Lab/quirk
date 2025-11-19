import { useMemo } from "react"

import { SettingsIcon } from "lucide-react"

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerTitle,
	DrawerTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { ConnectEvmWalletButton } from "@/components/Wallet/connectWallet/evmBtn"
import { ThemeSettingRow } from "@/feature/settings/GlobalSetting/Theme"
import { useAccount } from "@/hooks/useAccount"
import { useTxStore } from "@/store/txStore"

interface NavConnectWalletButtonProps extends PropsWithClassName {}

export const NavConnectWalletButton: React.FC<NavConnectWalletButtonProps> = ({ className }) => {
	const { isMdUp } = useBreakpoints()
	const { address } = useAccount()
	const { getPendingTxCount } = useTxStore()
	const pendingTxCount = getPendingTxCount(address)

	const buttonTitle = useMemo<React.ReactNode>(() => {
		if (!address) {
			return "Connect"
		}
		if (pendingTxCount > 0) {
			return `${pendingTxCount} Pending`
		}
		return undefined
	}, [address, pendingTxCount])

	const Container = useMemo(() => {
		if (isMdUp) {
			return {
				Container: Popover,
				Trigger: PopoverTrigger,
				Content: PopoverContent,
			}
		}
		return {
			Container: Drawer,
			Trigger: DrawerTrigger,
			Content: DrawerContent,
			Description: DrawerDescription,
			Title: DrawerTitle,
		}
	}, [isMdUp])

	return (
		<>
			<ConnectEvmWalletButton
				className={cn(
					"h-10 px-4 py-1.5 lg:h-12 lg:py-3",
					"lg:min-w-[140px]",
					address !== undefined && [
						"bg-gray-50 text-gray-950 hover:text-gray-950",
						"dark:bg-gray-900 dark:text-gray-50 dark:hover:text-gray-50",
					],
					pendingTxCount > 0 && "text-warning-darken",
					className,
				)}
				buttonType={address && pendingTxCount > 0 ? "outline" : undefined}
				loading={pendingTxCount > 0}
			>
				{buttonTitle}
			</ConnectEvmWalletButton>
			{!address && (
				<Container.Container>
					<Container.Trigger className="ml-3 lg:mr-2">
						<div className="aspect-square rounded-2xl px-0">
							<SettingsIcon strokeWidth={1.5} className="size-6" />
						</div>
					</Container.Trigger>
					<Container.Content>
						{Container.Title && <Container.Title />}
						{Container.Description && <Container.Description />}
						<ThemeSettingRow />
					</Container.Content>
				</Container.Container>
			)}
		</>
	)
}
