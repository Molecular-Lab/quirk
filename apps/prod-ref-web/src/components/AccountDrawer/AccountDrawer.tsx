import { useMemo, useState } from "react"

import { ChevronsRight } from "lucide-react"

import {
	Drawer,
	DrawerContent,
	DrawerContentProps,
	DrawerProps,
	Sheet,
	SheetContent,
	SheetContentProps,
	SheetProps,
} from "@rabbitswap/ui/basic"
import { useBreakpoints } from "@rabbitswap/ui/hooks"
import { cn } from "@rabbitswap/ui/utils"

import { useAccountDrawer } from "@/hooks/useAccountDrawer"

import { DefaultContent } from "./DrawerOption/DefaultContent"
import { Currency } from "./DrawerOption/Setting/Currency"
import { Languague } from "./DrawerOption/Setting/Languague"
import { Setting } from "./DrawerOption/Setting/Setting"
import { SubPageSetting } from "./type"

export const AccountDrawer: React.FC = () => {
	const { open, handleOpenDrawer, setOpen } = useAccountDrawer()
	const [openSetting, setOpenSetting] = useState<SubPageSetting>("content")

	const handleChangeSettingPage = (key: SubPageSetting) => {
		setOpenSetting(key)
	}

	// handleSelectRender will select which page should be render right now
	const mainContent = useMemo(() => {
		switch (openSetting) {
			case "content": {
				return <DefaultContent handleChangeSettingPage={handleChangeSettingPage} />
			}
			case "setting": {
				return <Setting handleChangeSettingPage={handleChangeSettingPage} />
			}
			case "currency": {
				return <Currency handleChangeSettingPage={handleChangeSettingPage} />
			}
			case "language": {
				return <Languague handleChangeSettingPage={handleChangeSettingPage} />
			}
		}
	}, [openSetting])

	const { isMdUp } = useBreakpoints()
	const Container = useMemo(() => {
		if (isMdUp)
			return {
				Container: (props: SheetProps) => <Sheet {...props} shouldCloseOnOverlayClick={false} modal={false} />,
				Content: (props: SheetContentProps) => (
					<SheetContent
						{...props}
						side="right"
						className={cn(
							"!fixed z-10",
							"!right-0 !top-0",
							"!h-full !w-[448px]",
							"pointer-events-auto overflow-hidden border-none shadow-none",
							"pl-12", // allocated for closer drawer
						)}
					/>
				),
			}

		return {
			Container: (props: DrawerProps) => <Drawer {...props} />,
			Content: ({ className, ...props }: DrawerContentProps) => (
				<DrawerContent className={cn("p-0", className)} {...props} />
			),
		}
	}, [isMdUp])

	return (
		<Container.Container
			open={open}
			onOpenChange={(open: boolean) => {
				setOpen(open)
			}}
		>
			<Container.Content>
				<div
					className={cn(
						"bg-background dark:bg-background-dark",
						"flex h-[80vh] flex-col gap-2",
						"md:h-full md:rounded-l-lg md:shadow-[0px_0px_8px_0px_#0000001F] dark:md:shadow-[0px_0px_8px_0px_#E7E7E71F]",
					)}
				>
					{mainContent}
					{/* drawer closer */}
					<div className="group">
						<div
							className={cn(
								"hidden md:block",
								"md:h-full md:w-12 md:rounded-l-lg",
								"absolute left-0 top-0 -z-10 cursor-pointer",
								"bg-inherit hover:bg-gray-50/60 dark:hover:bg-gray-800/40",
								"transition-all duration-300 ease-in-out hover:translate-x-1.5",
							)}
							onClick={handleOpenDrawer}
						>
							<div className="ml-2 flex w-full items-center pt-9 transition-all duration-300 ease-in-out group-hover:ml-3">
								<ChevronsRight className="size-6 text-gray-600" />
							</div>
						</div>
					</div>
				</div>
			</Container.Content>
		</Container.Container>
	)
}
