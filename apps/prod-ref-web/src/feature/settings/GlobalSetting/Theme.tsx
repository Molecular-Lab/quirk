import { Moon, Sun } from "lucide-react"

import { Label, RadioButtonGroup } from "@rabbitswap/ui/basic"
import { isTheme, useTheme } from "@rabbitswap/ui/providers"

export const ThemeSettingRow: React.FC = () => {
	const { theme, setTheme } = useTheme()

	return (
		<div className="flex items-center justify-between">
			<Label htmlFor="themeSetting" className="font-normal">
				Theme
			</Label>
			<RadioButtonGroup
				defaultValue={theme}
				options={[
					{ label: <Sun className="size-5 lg:size-6" />, value: "light" },
					{ label: <Moon className="size-5 lg:size-6" />, value: "dark" },
				]}
				onValueChange={(value: string) => {
					if (isTheme(value)) {
						setTheme(value)
					}
				}}
			/>
		</div>
	)
}
