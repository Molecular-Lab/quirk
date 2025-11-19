import BigNumber from "bignumber.js"

import { Skeleton } from "@rabbitswap/ui/basic"

import { TokenIcon } from "@/components/TokenIcon"
import { TokenAmount } from "@/types/tokens"

interface FeeRowBaseProps {
	tokenAmount: TokenAmount | undefined
	tokenIconPosition: "left" | "right"
	tokenSuffix?: string
	showPercentage?: boolean
}

type FeeRowPercentageProps = { showPercentage: true; percentageIn100: number | undefined } | { showPercentage?: false }

type FeeRowProps = FeeRowBaseProps & FeeRowPercentageProps

export const FeeRow: React.FC<FeeRowProps> = ({ tokenAmount, tokenIconPosition, tokenSuffix, ...props }) => {
	const percentageDisplay = props.showPercentage ? (
		<>
			{props.percentageIn100 !== undefined && (
				<div className="w-8 text-right text-gray-950 dark:text-gray-50">{props.percentageIn100}%</div>
			)}
		</>
	) : (
		<></>
	)
	const formattedTokenAmount = tokenAmount?.bigNumber.gt(1) ? tokenAmount.toFixed(2) : tokenAmount?.toFixed(3)
	const isLoading = tokenAmount?.amount === undefined

	return (
		<div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
			<div className="flex items-center gap-3">
				{tokenIconPosition === "left" && (
					<TokenIcon token={tokenAmount?.token} className="size-5 text-[8px] font-medium" />
				)}
				<Skeleton isLoading={isLoading} width={120}>
					{tokenAmount?.token.symbol}
					{tokenSuffix ? ` ${tokenSuffix}` : ""}
				</Skeleton>
			</div>
			<div className="flex items-center gap-3">
				<Skeleton width={50} isLoading={isLoading}>
					{tokenAmount?.bigNumber.isZero() ? (
						"0"
					) : (
						<div>{tokenAmount?.bigNumber.lt(BigNumber(0.001)) ? "<0.001" : formattedTokenAmount}</div>
					)}
				</Skeleton>
				{percentageDisplay}
				{tokenIconPosition === "right" && (
					<TokenIcon token={tokenAmount?.token} className="size-5 text-[8px] font-medium" />
				)}
			</div>
		</div>
	)
}
