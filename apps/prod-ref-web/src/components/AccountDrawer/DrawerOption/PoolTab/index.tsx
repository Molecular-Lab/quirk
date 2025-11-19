import { useMemo } from "react"

import { useLocalStorage } from "localstore"
import { ChevronDown } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { Spinner } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { useAddressPositionDetails } from "@/hooks/liquidity/usePosition"
import { useAccount } from "@/hooks/useAccount"
import { useSwapChainId } from "@/hooks/useChainId"
import { PositionDetailInterface } from "@/types/position"

import { Empty } from "./Empty"
import { PoolTabItem } from "./PoolTabItem"

export const PoolTab: React.FC = () => {
	const { address } = useAccount()
	const chainId = useSwapChainId()
	const [hideClosed, setHideClosed] = useLocalStorage("hide-closed-positions", false)

	const { data: positions, isLoading: isLoadingAddressPos } = useAddressPositionDetails(address, chainId)

	// grouping open & close position
	const [displayPositionList, closePositionList] = useMemo(() => {
		const filteredPositions: PositionDetailInterface[] = []
		const closedPositions: PositionDetailInterface[] = []
		if (positions) {
			for (const pos of positions) {
				if (pos.liquidity === 0n) {
					closedPositions.push(pos)
				} else {
					filteredPositions.push(pos)
				}
			}
		}

		return [filteredPositions, closedPositions]
	}, [positions])

	const closePositionElement = useMemo<React.ReactNode>(() => {
		if (closePositionList.length === 0) {
			return <></>
		}
		return (
			<>
				<div className="mt-2 flex items-center justify-between px-2 pt-4 md:px-6">
					<div className="text-sm font-normal leading-5 text-gray-600">
						Closed Positions ({closePositionList.length})
					</div>
					<Button
						buttonColor="gray"
						className="flex h-8 items-center gap-1 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
						onClick={() => {
							setHideClosed((prev) => !prev)
						}}
					>
						<div>Show</div>
						<ChevronDown className={cn("size-4", "transition-transform", !hideClosed && `rotate-180`)} />
					</Button>
				</div>
				<AnimateChangeInHeight className="flex flex-col pt-4">
					{!hideClosed && closePositionList.map((item, i) => <PoolTabItem tokenId={item.tokenId} key={i} />)}
				</AnimateChangeInHeight>
			</>
		)
	}, [closePositionList, hideClosed, setHideClosed])

	const listItems = useMemo<React.ReactNode>(() => {
		// - No pool
		if (displayPositionList.length === 0) {
			return (
				<>
					<Empty />
					{closePositionElement}
				</>
			)
		}

		// - Display position list
		return (
			<>
				{displayPositionList.map((item, i) => (
					<PoolTabItem tokenId={item.tokenId} key={i} />
				))}
				{closePositionElement}
			</>
		)
	}, [displayPositionList, closePositionElement])

	// Loading state
	if (isLoadingAddressPos) {
		return (
			<div className="mt-8 flex w-full flex-col items-center gap-1 px-6">
				<Spinner className="size-6 shrink-0 text-primary-100" />
			</div>
		)
	}

	return (
		<div className="flex h-full flex-col">
			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="flex flex-col">{listItems}</div>
			</div>
		</div>
	)
}
