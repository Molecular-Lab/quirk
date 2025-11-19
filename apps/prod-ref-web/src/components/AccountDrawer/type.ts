export type SubPageSetting = "content" | "currency" | "setting" | "language"

export const SubPageSettingName: Record<SubPageSetting, string> = {
	content: "Content",
	currency: "Currency",
	setting: "Setting",
	language: "Language",
}

export interface SettingPageBaseProps {
	handleChangeSettingPage: (key: SubPageSetting) => void
}
