import { SettingPageBaseProps } from "@/components/AccountDrawer/type"

import { SettingTitle } from "./title"

interface CurrencyProps extends SettingPageBaseProps {}
export const Currency: React.FC<CurrencyProps> = ({ handleChangeSettingPage }) => {
	return (
		<div className="flex flex-col gap-4">
			<SettingTitle page="currency" backToPage="setting" handleChangeSettingPage={handleChangeSettingPage} />
			{/* TODO: not support for now, add setting here */}
			<></>
		</div>
	)
}
