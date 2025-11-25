import { useEffect, useState } from "react"

import { useDisconnect } from "@particle-network/connectkit"
import { LogOut, SettingsIcon } from "lucide-react"

import { Button, ScrollArea, SheetTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@proxify/ui/basic"
import { Spinner } from "@proxify/ui/icons"
import { cn } from "@proxify/ui/utils"

import { MyNetWorth } from "@/components/AccountDrawer/DrawerOption/MyBalance"
import { ReceiveBox } from "@/components/AccountDrawer/DrawerOption/ReceiveBox"
import { TokenTab } from "@/components/AccountDrawer/DrawerOption/TokenTab"
import { SettingPageBaseProps } from "@/components/AccountDrawer/type"
import { DepositBox } from "@/components/Deposit"
import { WalletSelector } from "@/components/Wallet/WalletSelector"
import { WithdrawBox } from "@/components/Withdraw/WithdrawBox"
import { useAccountMode } from "@/feature/sub-account/context"
import { AccountMode } from "@/feature/sub-account/types"
import { useAccount } from "@/hooks/useAccount"
import { useAccountDrawer } from "@/hooks/useAccountDrawer"

import { LimitOrderTab } from "./LimitOrderTab"
import { PoolTab } from "./PoolTab"
import { TransactionTab } from "./TransactionTab"

type TabValue = "tokens" | "pool" | "limit-order" | "transactions"

const tabs: {
	title: string
	value: TabValue
	component: React.ReactNode
	allowed: AccountMode[]
}[] = [
	{ title: "Tokens", value: "tokens", component: <TokenTab />, allowed: ["main", "sub"] },
	{ title: "Pool", value: "pool", component: <PoolTab />, allowed: ["main"] },
	{ title: "Limits", value: "limit-order", component: <LimitOrderTab />, allowed: ["sub"] },
	{ title: "Transactions", value: "transactions", component: <TransactionTab />, allowed: ["main", "sub"] },
]

interface DefaultContentProps extends SettingPageBaseProps {}

/**
 * main drawer content, with header, action buttons, and tabs
 */
export const DefaultContent: React.FC<DefaultContentProps> = ({ handleChangeSettingPage }) => {
	const { status, disconnectAsync } = useDisconnect()
	const { handleOpenDrawer } = useAccountDrawer()
	const { accountMode } = useAccountMode()
	const { address } = useAccount()

	const allowedTabs = tabs.filter((tab) => tab.allowed.includes(accountMode))

	const [tabValue, setTabValue] = useState<TabValue>(allowedTabs[0]?.value ?? "tokens")

	useEffect(() => {
		if (accountMode === "sub" && tabValue === "pool") {
			setTabValue("tokens")
		}
		if (accountMode === "main" && tabValue === "limit-order") {
			setTabValue("tokens")
		}
	}, [accountMode, tabValue])

	const handleDisconnect = async () => {
		await disconnectAsync()
		handleOpenDrawer()
	}
	return (
		<div className="flex h-full flex-col md:pt-3">
			<SheetTitle className={cn("flex items-center justify-between gap-x-2", "mb-3 h-16 px-2 md:px-6 md:py-2")}>
				<WalletSelector />

				<div className="flex gap-3">
					<SettingsIcon
						onClick={() => {
							handleChangeSettingPage("setting")
						}}
						className="size-6 cursor-pointer hover:text-primary-600"
						strokeWidth={1.5}
					/>
					<Button
						buttonType="text"
						className="group p-0 text-gray-950 dark:text-white"
						onClick={status === "loading" ? undefined : handleDisconnect}
					>
						{status === "loading" ? (
							<Spinner className="size-6 shrink-0 text-primary-100" />
						) : (
							<LogOut className="size-6 shrink-0" strokeWidth={1.5} />
						)}
					</Button>
				</div>
			</SheetTitle>
			<div className="flex h-full flex-col gap-4">
				{/* account balance */}
				<MyNetWorth className="px-2 md:mb-1 md:px-6" address={address} />

				{/* buttons section */}
				{accountMode === "main" && (
					<div className="flex h-10 gap-2 px-2 md:mb-1 md:h-12 md:px-6">
						<ReceiveBox />
					</div>
				)}
				{accountMode === "sub" && (
					<div className="flex h-10 gap-2 px-2 md:mb-1 md:h-12 md:px-6">
						<DepositBox />
						<WithdrawBox />
					</div>
				)}

				{/* tab section */}
				<div className="flex-1 overflow-hidden">
					<Tabs
						value={tabValue}
						onValueChange={(value) => {
							setTabValue(value as TabValue)
						}}
						className="flex h-full flex-col"
					>
						<TabsList className="flex gap-6 px-2 md:px-6">
							{allowedTabs.map((item, i) => (
								<TabsTrigger key={i} value={item.value} className="lg:text-base">
									{item.title}
								</TabsTrigger>
							))}
						</TabsList>
						<ScrollArea className={cn("mb-20 flex-1 overflow-y-auto")}>
							{tabs.map((item, i) => (
								<TabsContent className="flex-1" value={item.value} key={i}>
									{item.component}
								</TabsContent>
							))}
						</ScrollArea>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
