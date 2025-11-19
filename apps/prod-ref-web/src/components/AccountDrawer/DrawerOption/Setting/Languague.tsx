import { SettingPageBaseProps } from "@/components/AccountDrawer/type"

import { SettingTitle } from "./title"

interface LanguagueProps extends SettingPageBaseProps {}
export const Languague: React.FC<LanguagueProps> = ({ handleChangeSettingPage }) => {
	return (
		<div className="flex flex-col gap-4">
			<SettingTitle page="language" backToPage="setting" handleChangeSettingPage={handleChangeSettingPage} />
			{/* TODO: not support for now, add setting here */}
			<></>
		</div>
	)
}
