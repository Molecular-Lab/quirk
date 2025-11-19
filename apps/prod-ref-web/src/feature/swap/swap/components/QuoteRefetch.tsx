import { useCallback, useEffect, useState } from "react"

import { CircleProgress, Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { QueryKeys } from "@/config/queryKey"
import { useSwapQuote } from "@/feature/swap/swap/hooks/useSwapQuote"
import { useSwapStore } from "@/feature/swap/swap/store/swapStore"
import { useInvalidate } from "@/hooks/useRefetch"
import { getWrapped } from "@/utils/token"

const totalTime = 10000 // 10 seconds
const intervalTime = 10 // 10 ms
const progressPerInterval = intervalTime / totalTime

export const QuoteRefetch: React.FC = () => {
	const invalidate = useInvalidate()
	const { data, isFetching } = useSwapQuote()
	const {
		amountIn,
		amountOut,
		computed: { typing },
	} = useSwapStore()

	const handleRefetch = useCallback(() => {
		invalidate([QueryKeys.quote.allRabbitswap(), QueryKeys.quote.allArken()])
	}, [invalidate])

	const [progress, setProgress] = useState(0)

	// Update progress
	useEffect(() => {
		if (typing || !data || isFetching) {
			setProgress(0)
			return
		}

		const interval = setInterval(() => {
			setProgress((prev) => prev + progressPerInterval)
		}, intervalTime)

		return () => {
			clearInterval(interval)
		}
	}, [typing, data, isFetching])

	// Refetch when progress is 100%
	useEffect(() => {
		if (progress >= 1) handleRefetch()
	}, [handleRefetch, progress])

	const isNativeAndWrapped = amountIn && amountOut && getWrapped(amountIn.token).equals(getWrapped(amountOut.token))

	if (!amountIn || !amountOut || (amountIn.bigint === 0n && amountOut.bigint === 0n) || isNativeAndWrapped) return null

	return (
		<Tooltip>
			<TooltipTrigger>
				<button onClick={handleRefetch} disabled={isFetching}>
					{isFetching ? (
						<CircleProgress
							progress={0.75}
							className={cn("size-[22px] animate-spin text-transparent")}
							strokeColor="#7FC5FA88"
							strokeWidth={6}
						/>
					) : (
						<CircleProgress
							progress={progress}
							className={cn("size-[22px] text-gray-100 dark:text-gray-900")}
							strokeColor="#7FC5FA"
							strokeWidth={6}
						/>
					)}
				</button>
			</TooltipTrigger>
			<TooltipContent className={cn("max-w-[min(250px,95vw)] p-3")}>
				Auto-refresh every 10 seconds. Click to refresh immediately.
			</TooltipContent>
		</Tooltip>
	)
}
