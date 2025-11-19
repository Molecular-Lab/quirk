import { Checkbox, Switch } from "@rabbitswap/ui/basic"

export const SectionCheckbox: React.FC = () => {
	return (
		<div className="grid grid-cols-2 gap-2">
			<div className="flex flex-col gap-2">
				<span>Enabled</span>
				<div className="flex gap-2">
					<Checkbox />
					<Checkbox checked={false} />
					<Checkbox checked />
				</div>
				<div className="flex gap-2">
					<Switch />
					<Switch checked={false} />
					<Switch checked />
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<span>Disabled</span>
				<div className="flex gap-2">
					<Checkbox disabled />
					<Checkbox disabled checked={false} />
					<Checkbox disabled checked />
				</div>
				<div className="flex gap-2">
					<Switch disabled checked={false} />
					<Switch disabled checked />
				</div>
			</div>
		</div>
	)
}
