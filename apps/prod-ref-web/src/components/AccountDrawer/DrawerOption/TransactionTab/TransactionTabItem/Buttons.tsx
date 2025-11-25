import { Link as ReactLink } from "react-router-dom"

import { Hash } from "viem"

import { Button, ShapeSkeleton } from "@rabbitswap/ui/basic"
import { ClipboardCopy } from "@rabbitswap/ui/components"
import { BlockSearch } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { getExplorerLink } from "@/constants/explorer"

export const Buttons: React.FC<{
	txHash: Hash | undefined
	chainId: number
	isLoading?: boolean
}> = ({ txHash, chainId, isLoading }) => {
	return (
		<div className="flex items-center gap-1">
			{isLoading ? (
				<ShapeSkeleton className="size-6 shrink-0 rounded-full" />
			) : (
				<div className="size-6 shrink-0 overflow-hidden rounded-full">
					<ClipboardCopy
						text={txHash}
						className={cn(
							"size-6 p-1.5 !text-rabbit-black dark:!text-white",
							"bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500",
						)}
					/>
				</div>
			)}
			{isLoading ? (
				<ShapeSkeleton className="size-6 shrink-0 rounded-full" />
			) : (
				<ReactLink to={txHash ? getExplorerLink(chainId, txHash, "transaction") : ""} target="_blank">
					<Button buttonColor="gray" size="sm" className="size-6">
						<BlockSearch className="shrink-0" />
					</Button>
				</ReactLink>
			)}
		</div>
	)
}
