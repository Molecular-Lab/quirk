import { useMemo } from "react"

import { ArrowUpDown, Check } from "lucide-react"

import { Spinner } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { useAccountMode } from "@/feature/sub-account/context"
import { TradingMode } from "@/feature/swap/types"
import { TokenAmount } from "@/types/tokens"

export interface SwapStepProps {
	tradingMode: TradingMode
	amountIn: TokenAmount | undefined
	approve?: TxStatus
	swap?: TxStatus
}

export const SwapStep: React.FC<SwapStepProps> = ({ approve = "success", swap = "init", amountIn, tradingMode }) => {
	const { accountMode } = useAccountMode()

	const approveTextMap = useMemo<Record<TxStatus, string>>(() => {
		switch (accountMode) {
			case "main": {
				return {
					init: "Approve",
					signing: "Approve in Wallet",
					pending: "Approving...",
					success: `Approved ${amountIn?.token.symbol}`,
				}
			}
			case "sub": {
				return {
					init: "Approving...",
					signing: "Approving...",
					pending: "Approving...",
					success: `Approved ${amountIn?.token.symbol}`,
				}
			}
			default: {
				throw new Error("Invalid account mode")
			}
		}
	}, [accountMode, amountIn?.token.symbol])

	const swapTextMap = useMemo<Record<TxStatus, string>>(() => {
		switch (accountMode) {
			case "main": {
				return {
					init: "Confirm Swap",
					signing: "Confirm swap in wallet",
					pending: "Swapping...",
					success: "Swapped",
				}
			}
			case "sub": {
				if (tradingMode === "limit") {
					return {
						init: "Placing order...",
						signing: "Placing order...",
						pending: "Placing order...",
						success: "Order placed",
					}
				}
				return {
					init: "Swapping...",
					signing: "Swapping...",
					pending: "Swapping...",
					success: "Swapped",
				}
			}
			default: {
				throw new Error("Invalid account mode")
			}
		}
	}, [accountMode, tradingMode])

	return (
		<div className="flex flex-col gap-1.5">
			<Step text={approveTextMap} icon={<TokenIcon token={amountIn?.token} className="size-6" />} status={approve} />
			<div className="ml-[11px] h-2 w-0.5 bg-gray-300" />
			<Step
				text={swapTextMap}
				icon={
					<div className="flex size-6 items-center justify-center rounded-full bg-primary-600 text-white">
						<ArrowUpDown className="size-3.5" strokeWidth={2.5} />
					</div>
				}
				status={swap}
			/>
		</div>
	)
}

type TxStatus = "init" | "signing" | "pending" | "success"
export const Step: React.FC<{
	status: TxStatus
	icon?: React.ReactNode
	text: Record<TxStatus, string>
}> = ({ status, icon, text }) => {
	return (
		<div className="flex items-center gap-4">
			<div className={cn("relative", (status === "init" || status === "success") && "opacity-50 grayscale")}>
				{status === "signing" && (
					<div className="absolute left-1 top-1 z-[-1] size-4 animate-ping rounded-full border border-primary-800" />
				)}
				{status === "pending" ? <Spinner className="size-6 text-primary-300" /> : icon}
			</div>
			<div className={cn("text-sm font-medium", (status === "init" || status === "success") && "opacity-50 grayscale")}>
				{text[status]}
			</div>
			<div className="grow" />
			{status === "success" && <Check className="size-4 text-success" strokeWidth={3} />}
		</div>
	)
}
