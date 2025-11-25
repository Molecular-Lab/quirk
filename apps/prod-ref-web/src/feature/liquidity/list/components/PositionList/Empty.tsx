import { Inbox } from "@rabbitswap/ui/icons"

import { ConnectEvmWalletButton } from "@/components/Wallet/connectWallet/evmBtn"
import { useAccount } from "@/hooks/useAccount"

export const Empty: React.FC = () => {
	const { address } = useAccount()

	return (
		<div className="flex h-[240px] w-full flex-col items-center justify-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-900">
			<Inbox className="size-8" />
			<p className="text-center text-sm lg:text-base">Your active liquidity positions will appear here.</p>
			{!address && <ConnectEvmWalletButton className="mt-4" />}
		</div>
	)
}
