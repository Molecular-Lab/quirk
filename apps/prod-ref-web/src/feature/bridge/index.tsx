import { Tabs, TabsList, TabsTrigger } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { CustomAddressInput } from "./components/CustomAddressInput"
import { PowerByBanner } from "./components/PowerByBanner"
import { SwapChain } from "./components/SwapChain"
import { BridgeForm } from "./form"
import { useBridgeStore } from "./form/store/bridgeStore"

const tabs = [
	{ title: "Deposit", value: "deposit" },
	{ title: "Withdraw", value: "withdraw" },
] as const

export const BridgePage: React.FC = () => {
	const { tab, switchSides } = useBridgeStore()

	return (
		<>
			<Tabs defaultValue={tabs[0].value} value={tab} onValueChange={switchSides} className="flex w-full flex-col gap-6">
				<div className="flex items-center justify-between">
					{/* <TabsList className="flex items-center gap-3">
						{tabs.map((item, i) => (
							<TabsTrigger
								key={i}
								value={item.value}
								className={cn(
									"rounded-full py-1.5 data-[state=active]:bg-gray-50 data-[state=active]:px-6 dark:data-[state=active]:bg-gray-900",
									"text-base lg:text-[18px]/6",
								)}
							>
								{item.title}
							</TabsTrigger>
						))}
					</TabsList> */}
				</div>
				<SwapChain showChainName />
				<BridgeForm />
			</Tabs>
			<div className="mt-6 lg:mt-9">
				<PowerByBanner />
			</div>
		</>
	)
}
