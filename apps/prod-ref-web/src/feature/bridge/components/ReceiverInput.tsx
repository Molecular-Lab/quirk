import { Input } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { useBridgeStore } from "../form/store/bridgeStore"
import { solana } from "@particle-network/auth-core"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAccount } from "@particle-network/connectkit"
import { useEffect, useMemo } from "react"

export const BridgeReciever: React.FC = () => {
	const { destToken, customAddr, setCustomAddr } = useBridgeStore()
	const solanaWallet = useWallet()
	const { address } = useAccount()

	const defaultAddress = useMemo(() => {
		return destToken.token.chainId === solana.id
			? (solanaWallet.publicKey?.toString() ?? "Connect Sol wallet")
			: (address?.toString() ?? "Connect Wallet")
	}, [solanaWallet.publicKey, destToken.token.chainId, setCustomAddr])

	useEffect(() => {
		setCustomAddr(defaultAddress || "")
	}, [defaultAddress, destToken.token.chainId, setCustomAddr])

	return (
		<>
			<div className={cn("flex w-full flex-col justify-between gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-925")}>
				<div className="flex flex-col gap-4 text-sm font-medium lg:text-base">
					<div>Custom Destination Address</div>
					<Input
						placeholder="0x73cA....0406"
						value={customAddr}
						className="w-full rounded-md outline-none flex justify-end "
						onChange={(e) => {
							setCustomAddr(e.target.value)
						}}
						autoFocus
					/>
				</div>
			</div>
		</>
	)
}
