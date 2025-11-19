import { LiquidityAmountInput } from "@/feature/liquidity/components"
import { SingleSideWarningBox } from "@/feature/liquidity/components/SingleSideWarningBox"
import { EvmToken } from "@/types/tokens"

import { useAddLiquidityStore } from "../../store/useAddLiquidityStore"

interface DepositAmountSectionProps {
	tickCurrent: number | undefined
	tokenA: EvmToken | undefined
}

export const DepositAmountSection: React.FC<DepositAmountSectionProps> = ({ tickCurrent, tokenA }) => {
	const { token0Amount, setToken0Amount, token1Amount, setToken1Amount, tickLower, tickUpper, setInputSide } =
		useAddLiquidityStore()

	const token0AmountInput =
		tickUpper === undefined || tickCurrent === undefined || tickCurrent < tickUpper ? (
			<LiquidityAmountInput
				value={token0Amount}
				onChange={(amt) => {
					setToken0Amount((prev) => (prev?.token.equals(amt.token) ? amt : prev))
					setInputSide("token0")
				}}
			/>
		) : null

	const token1AmountInput =
		tickLower === undefined || tickCurrent === undefined || tickLower < tickCurrent ? (
			<LiquidityAmountInput
				value={token1Amount}
				onChange={(amt) => {
					setToken1Amount((prev) => (prev?.token.equals(amt.token) ? amt : prev))
					setInputSide("token1")
				}}
			/>
		) : null

	return (
		<div className="flex flex-col gap-2">
			{tokenA?.equals(token0Amount?.token) ? (
				<>
					{token0AmountInput}
					{token1AmountInput}
				</>
			) : (
				<>
					{token1AmountInput}
					{token0AmountInput}
				</>
			)}
			{(!token0AmountInput || !token1AmountInput) && <SingleSideWarningBox />}
		</div>
	)
}
