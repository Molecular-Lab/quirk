import { useMemo } from "react"

import { Settings2Icon, TriangleAlert } from "lucide-react"

import { Drawer, DrawerContent, DrawerTrigger, Popover, PopoverContent, PopoverTrigger } from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { Deadline } from "@/feature/settings/TransactionSetting/Deadline"
import { Slippage } from "@/feature/settings/TransactionSetting/Slippage"
import { useTxSetting } from "@/feature/settings/TransactionSetting/store/txSettingStore"

export const TxSettingButton: React.FC<PropsWithClassName<{ shorten?: boolean }>> = ({ shorten, className }) => {
	const {
		internalState,
		computed: { slippage, slippageWarning },
	} = useTxSetting()

	const { isMdUp } = useBreakpoints()

	const Container = useMemo(() => {
		if (isMdUp)
			return {
				Container: Popover,
				Trigger: PopoverTrigger,
				Content: PopoverContent,
			}

		return {
			Container: Drawer,
			Trigger: DrawerTrigger,
			Content: DrawerContent,
		}
	}, [isMdUp])

	return (
		<Container.Container>
			<Container.Trigger
				className={cn(
					"flex items-center gap-1 rounded-lg text-xs",
					!internalState.autoSlippage && ["bg-gray-50 py-0.5 dark:bg-gray-800", shorten ? "px-2" : "pl-2 pr-0.5"],
					slippageWarning && "bg-warning/30 text-warning-darken",
					className,
				)}
			>
				{!internalState.autoSlippage && !shorten && <>{slippage}% slippage</>}
				{slippageWarning ? (
					<TriangleAlert strokeWidth={1.5} className="aspect-square h-5 shrink-0 lg:h-6" />
				) : (
					<Settings2Icon strokeWidth={1.5} className="aspect-square h-5 shrink-0 lg:h-6" />
				)}
			</Container.Trigger>
			<Container.Content
				align="end"
				className={cn(
					"flex flex-col gap-3 rounded-xl border-none shadow-[0px_0px_8px_0px_#0000001F] lg:gap-4",
					isMdUp ? "w-[300px]" : "w-full rounded-b-none p-6 pt-0",
				)}
				onOpenAutoFocus={(e) => {
					e.preventDefault()
				}}
			>
				<Slippage />
				<Deadline />
			</Container.Content>
		</Container.Container>
	)
}
