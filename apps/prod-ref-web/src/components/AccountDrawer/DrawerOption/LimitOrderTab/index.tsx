import { useMemo, useState } from "react"

import { ChevronDown } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { AccountDrawerTabSkeleton } from "@/components/AccountDrawer/AccountDrawerTabSkeleton"
import { AnimateChangeInHeight } from "@/components/Animate/AnimateChangeInHeight"
import { useLimitOrders } from "@/feature/swap/limit/hooks/useLimitOrders"
import { useAccount } from "@/hooks/useAccount"

import { Empty } from "./Empty"
import { LimitOrderTabItem } from "./LimitOrderTabItem"

interface LimitOrderTabProps {}
export const LimitOrderTab: React.FC<LimitOrderTabProps> = () => {
	const { subAddress } = useAccount()
	const [hideClosed, setHideClosed] = useState(false)

	const { data, isLoading } = useLimitOrders(subAddress)

	const inactiveOrders = useMemo(() => {
		if (data === undefined || data.inactive.length === 0) {
			return <></>
		}
		return (
			<>
				<div className="mt-4 flex items-center justify-between">
					<div className="pl-1 text-sm font-normal leading-5 text-gray-600">
						Limit order history ({data.inactive.length})
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
				<AnimateChangeInHeight className="flex flex-col gap-3">
					{!hideClosed && data.inactive.map((order, i) => <LimitOrderTabItem key={i} order={order} />)}
				</AnimateChangeInHeight>
			</>
		)
	}, [data, hideClosed])

	const listItems = useMemo<React.ReactNode>(() => {
		if (data === undefined) {
			return <></>
		}

		if (data.active.length === 0) {
			return (
				<>
					<Empty />
					{inactiveOrders}
				</>
			)
		}

		return (
			<>
				{data.active.map((order, i) => (
					<LimitOrderTabItem key={i} order={order} />
				))}
				{inactiveOrders}
			</>
		)
	}, [data, inactiveOrders])

	if (isLoading) {
		return <AccountDrawerTabSkeleton />
	}

	return (
		<div className="flex h-full flex-col px-2 pb-4 md:px-4">
			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="flex flex-col gap-3">{listItems}</div>
			</div>
		</div>
	)
}
