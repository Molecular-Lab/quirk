import BigNumber from "bignumber.js"

import { Skeleton } from "@rabbitswap/ui/basic"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { TokenIcon } from "@/components/TokenIcon"
import { TokenAmount } from "@/types/tokens"

interface PoolRowBaseProps {
	tokenAmount: TokenAmount | undefined
	tokenPrefix?: string
	tokenIconPosition: "left" | "right"
}

type PoolRowPercentageProps = { showPercentage: true; percentageIn100: number | undefined } | { showPercentage?: false }

type PoolRowProps = PropsWithClassName<PoolRowBaseProps & PoolRowPercentageProps>

export const PoolRow: React.FC<PoolRowProps> = ({
	tokenAmount,
	tokenPrefix,
	tokenIconPosition,
	className,
	...props
}) => {
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

	return (
		<div className={cn("flex items-center justify-between text-sm text-gray-500 dark:text-gray-400", className)}>
			<div className="flex items-center gap-3">
				{tokenIconPosition === "left" && (
					<TokenIcon token={tokenAmount?.token} className="size-5 text-[8px] font-medium" />
				)}
				<Skeleton isLoading={!tokenAmount} width={120}>
					{tokenPrefix ? `${tokenPrefix} ` : ""}
					{tokenAmount?.token.symbol}
				</Skeleton>
			</div>
			<div className="flex items-center gap-3">
				<Skeleton width={50} isLoading={!tokenAmount}>
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
