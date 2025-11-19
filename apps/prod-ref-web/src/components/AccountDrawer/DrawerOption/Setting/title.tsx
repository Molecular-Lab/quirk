import { ArrowLeft } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { SettingPageBaseProps, SubPageSetting, SubPageSettingName } from "@/components/AccountDrawer/type"

interface SettingTitleProps extends SettingPageBaseProps {
	page: SubPageSetting
	backToPage: SubPageSetting
}
export const SettingTitle: React.FC<SettingTitleProps> = ({ page, backToPage, handleChangeSettingPage }) => {
	return (
		<div className="relative flex h-6 justify-between">
			<Button
				buttonType="text"
				buttonColor="gray"
				onClick={() => {
					handleChangeSettingPage(backToPage)
				}}
				className="p-0"
			>
				<ArrowLeft className="size-6" />
			</Button>
			<div className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", "font-medium")}>
				{SubPageSettingName[page]}
			</div>
			<div />
		</div>
	)
}
