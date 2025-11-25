import { Link } from "react-router-dom"

import { InfoIcon } from "lucide-react"

import { Button, RadioButtonGroup } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { DepositPlusButton } from "@/components/Deposit"
import { TokenBalance } from "@/components/TokenAmountInput"
import { TokenAmountSlider } from "@/components/TokenAmountSlider"
import { TokenPairSelector } from "@/components/TokenPairSelector"
import { LimitOrderInput } from "@/feature/swap/components/LimitOrderInput"
import { SwapTitle } from "@/feature/swap/components/SwapTitle"
import { PriceConditionInput } from "@/feature/swap/limit/components/PriceConditionInput"
import { LIMIT_ORDER_TOKEN_PAIRS } from "@/feature/swap/limit/condition"
import { LimitConfirmModal } from "@/feature/swap/limit/confirm"
import { useInitToken } from "@/feature/swap/limit/form/hooks/useInitToken"
import { useLimitOrderState } from "@/feature/swap/limit/form/hooks/useLimitOrderState"
import { useAccount } from "@/hooks/useAccount"
import { TokenAmount } from "@/types/tokens"

import { ExpiresIn, useLimitStore } from "../store/limitStore"

export const LimitForm: React.FC = () => {
	const { subAddress } = useAccount()

	const {
		setType,
		amountLeft,
		setAmountLeft,
		amountRight,
		setAmountRight,
		priceCondition,
		setPriceCondition,
		expiresIn,
		setExpiresIn,
		side,
		setSide,
		setTyping,
		computed: { amountIn },
	} = useLimitStore()

	const { currentPoolPrice, quoteLoading } = useLimitOrderState()

	const {
		buttonState: { className: btnClassName, ...buttonState },
		openReview,
		setOpenReview,
	} = useLimitOrderState()
	useInitToken()

	return (
		<div className="mx-auto flex w-full max-w-[560px] flex-col gap-2 lg:min-w-[396px] lg:max-w-[420px] lg:gap-3">
			<SwapTitle mode="limit" />
			<div className="flex w-full flex-col gap-2">
				<div className="flex w-full flex-col gap-2">
					<div className="flex flex-wrap items-center justify-between gap-y-1">
						<TokenPairSelector
							className={cn("px-3 lg:px-3", amountLeft && amountRight && "px-1")}
							tokenPair={amountLeft && amountRight ? [amountLeft.token, amountRight.token] : undefined}
							optionItems={LIMIT_ORDER_TOKEN_PAIRS}
							onSelect={(tokenPair) => {
								setAmountLeft(TokenAmount.fromString(tokenPair[0]))
								setAmountRight(() => TokenAmount.fromString(tokenPair[1]))
							}}
						/>
						<div className="grow lg:mx-2" />
						<div className="flex items-center gap-1">
							<TokenBalance value={amountIn?.token} hideMaxButton showUnit className="leading-5" />
							<DepositPlusButton token={amountIn?.token} />
						</div>
					</div>
					{/* side */}
					<div
						className={cn(
							"flex w-full items-center gap-2 rounded-full p-1 lg:p-2",
							"border border-gray-200 dark:border-gray-800",
						)}
					>
						<Button
							className={cn(
								"w-full",
								"py-1.5 lg:py-2",
								side !== "Buy" &&
									"bg-background hover:bg-gray-100 active:bg-gray-200 dark:bg-background-dark dark:hover:bg-gray-800 dark:active:bg-gray-700",
							)}
							buttonColor={side === "Buy" ? "positive" : "gray"}
							onClick={() => {
								if (side === "Buy") return
								setSide("Buy")
							}}
						>
							Buy
						</Button>
						<Button
							className={cn(
								"w-full",
								"py-1.5 lg:py-2",
								side !== "Sell" &&
									"bg-background hover:bg-gray-100 active:bg-gray-200 dark:bg-background-dark dark:hover:bg-gray-800 dark:active:bg-gray-700",
							)}
							buttonColor={side === "Sell" ? "negative" : "gray"}
							onClick={() => {
								if (side === "Sell") return
								setSide("Sell")
							}}
						>
							Sell
						</Button>
					</div>
					{/* price condition */}
					<PriceConditionInput
						side={side}
						marketPrice={currentPoolPrice}
						value={priceCondition}
						setValue={(v) => {
							setPriceCondition(() => v)
						}}
					/>
					{/* Inputs */}
					<LimitOrderInput
						side={side}
						value={amountLeft}
						onChange={(amount) => {
							if (amountLeft && amount.string !== amountLeft.string) setType("EXACT_LEFT")
							setAmountLeft(amount)
						}}
						label="Amount"
						isLoading={quoteLoading}
						setTyping={setTyping("amountLeft")}
					/>
					<TokenAmountSlider
						value={amountIn}
						onValueChange={(tokenAmt) => {
							if (tokenAmt?.token.equals(amountLeft?.token)) {
								setType("EXACT_LEFT")
								setAmountLeft(tokenAmt)
							}
							if (tokenAmt?.token.equals(amountRight?.token)) {
								setType("EXACT_RIGHT")
								setAmountRight(() => tokenAmt)
							}
						}}
					/>
					<LimitOrderInput
						side={side}
						value={amountRight}
						onChange={(amount) => {
							if (amountRight && amount.string !== amountRight.string) setType("EXACT_RIGHT")
							setAmountRight(() => amount)
						}}
						label="Total"
						isLoading={quoteLoading}
						setTyping={setTyping("amountRight")}
					/>
				</div>
			</div>
			<div className="flex items-center justify-between gap-3">
				<div className="text-sm font-medium text-gray-600 dark:text-gray-400 lg:text-base">Expires in</div>
				<RadioButtonGroup
					buttonStyle="outline"
					buttonColor="gray"
					groupingStyle="gap"
					size="sm"
					className="gap-1"
					itemClassName={cn("px-2.5 py-1 lg:px-3 lg:py-1.5 lg:font-medium")}
					value={expiresIn}
					onValueChange={(value) => {
						setExpiresIn(value as ExpiresIn)
					}}
					options={[
						{ label: "1 Day", value: "1d" },
						{ label: "1 Week", value: "1w" },
						{ label: "1 Month", value: "1m" },
						{ label: "1 Year", value: "1y" },
					]}
				/>
			</div>
			{!subAddress && (
				<div className="flex items-center gap-3 rounded-lg bg-primary/30 p-4 text-xs text-primary-700 dark:text-primary-300">
					<InfoIcon className="size-4" />
					<div>
						You need to create sub-accounts before placing a limit order.{" "}
						<Link to="/learn-more" className="whitespace-nowrap underline">
							Learn more
						</Link>
					</div>
				</div>
			)}

			{/* Action Button */}
			<Button
				className={cn("mt-3 h-10 w-full text-sm font-medium lg:h-12 lg:text-base", btnClassName)}
				{...buttonState}
			/>

			<LimitConfirmModal
				open={openReview}
				onClose={() => {
					setOpenReview(false)
				}}
			/>
		</div>
	)
}
