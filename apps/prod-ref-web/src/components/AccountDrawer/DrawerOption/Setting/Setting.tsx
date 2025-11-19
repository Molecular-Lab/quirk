import { SettingPageBaseProps } from "@/components/AccountDrawer/type"
import { ThemeSettingRow } from "@/feature/settings/GlobalSetting/Theme"

import { SettingTitle } from "./title"

interface SettingProps extends SettingPageBaseProps {}
export const Setting: React.FC<SettingProps> = ({ handleChangeSettingPage }) => {
	return (
		<div className="flex flex-col gap-6 px-4 py-6">
			<SettingTitle page="setting" backToPage="content" handleChangeSettingPage={handleChangeSettingPage} />

			{/* Theme setting */}
			<ThemeSettingRow />
		</div>
	)
}
