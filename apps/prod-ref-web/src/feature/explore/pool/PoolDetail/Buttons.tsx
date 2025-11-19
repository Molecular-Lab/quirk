import { useMemo } from "react"

import { LinkIcon, Share2Icon } from "lucide-react"
import qs from "qs"

import { Button, Popover, PopoverContent, PopoverTrigger, ShapeSkeleton } from "@rabbitswap/ui/basic"
import { useCopyToClipboard } from "@rabbitswap/ui/hooks"
import { Check } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { SwapSearchParams } from "@/feature/swap/hooks/useSwapSearchParams"
import { Link } from "@/router"
import { Pool } from "@/types/pool"
import { sortDisplayTokens } from "@/utils/token"

export const MainButtonsSection: React.FC<{ pool: Pool | undefined }> = ({ pool }) => {
	const swapSearchParam = useMemo<SwapSearchParams>(() => {
		return {
			tokenIn: pool?.token0.address,
			tokenOut: pool?.token1.address,
		}
	}, [pool])

	const [quote, base] = useMemo(() => {
		if (!pool) return [undefined, undefined]
		return sortDisplayTokens([pool.token0, pool.token1])
	}, [pool])

	return (
		<div
			className={cn(
				"z-10 w-full lg:z-0",
				"fixed bottom-4 left-1/2 -translate-x-1/2 px-2",
				"lg:static lg:bottom-auto lg:left-auto lg:translate-x-0 lg:px-0",
			)}
		>
			<div
				className={cn(
					"grid grid-cols-2 gap-2",
					"p-3 lg:p-0",
					"rounded-xl lg:rounded-none",
					"border border-gray-100 lg:border-none",
					"bg-background dark:bg-background-dark",
					"lg:bg-transparent lg:dark:bg-transparent",
				)}
			>
				{pool ? (
					<Link
						to={{
							pathname: "/swap",
							search: qs.stringify(swapSearchParam),
						}}
						className="w-full"
					>
						<Button buttonColor="gray" className="w-full">
							Swap
						</Button>
					</Link>
				) : (
					<ShapeSkeleton className="h-9 w-full rounded-full" />
				)}
				{pool && quote ? (
					<Link
						to="/add/:currencyIdA/:currencyIdB/:feeAmount"
						params={{
							currencyIdA: quote.address,
							currencyIdB: base.address,
							feeAmount: pool.fee.toString(),
						}}
						className="w-full"
					>
						<Button className="w-full">+ Add Liquidity</Button>
					</Link>
				) : (
					<ShapeSkeleton className="h-9 w-full rounded-full" />
				)}
			</div>
		</div>
	)
}

export const TitleButtonsSection: React.FC = () => {
	const { handleCopy, copied } = useCopyToClipboard(window.location.href)

	return (
		<div className="flex items-center gap-2">
			<Popover>
				<PopoverTrigger>
					<Button buttonColor="gray" className="p-2">
						<Share2Icon className="size-3" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="max-w-36 p-3">
					<div
						className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 lg:text-sm"
						onClick={handleCopy}
					>
						{copied ? (
							<>
								<Check className={cn("size-3 shrink-0 text-sm text-success")} />
								<span>Copied</span>
							</>
						) : (
							<>
								<LinkIcon className="size-3" />
								<span>Copy link</span>
							</>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
