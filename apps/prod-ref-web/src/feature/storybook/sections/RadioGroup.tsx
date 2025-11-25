import { RadioButtonGroup } from "@rabbitswap/ui/basic"

export const SectionRadioGroup: React.FC = () => {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center gap-2">
				<RadioButtonGroup
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					size="sm"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					options={[
						{ label: "Auto", value: "A" },
						{ label: "Custom", value: "B" },
					]}
				/>
			</div>

			<div>Size</div>
			<div className="flex flex-wrap items-center gap-2">
				<RadioButtonGroup
					size="sm"
					defaultValue="Default"
					options={[
						{ label: "Default", value: "Default" },
						{ label: "Custom", value: "B" },
						{ label: "Other", value: "C" },
					]}
				/>
				<RadioButtonGroup
					defaultValue="Default"
					options={[
						{ label: "Default", value: "Default" },
						{ label: "Custom", value: "B" },
						{ label: "Other", value: "C" },
					]}
				/>
				<RadioButtonGroup
					size="lg"
					defaultValue="Default"
					options={[
						{ label: "Default", value: "Default" },
						{ label: "Custom", value: "B" },
						{ label: "Other", value: "C" },
					]}
				/>
			</div>

			<div>Hug Solid</div>
			<div className="grid grid-cols-4 gap-2">
				<RadioButtonGroup
					groupingStyle="hug"
					buttonColor="primary"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="hug"
					buttonColor="secondary"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="hug"
					buttonColor="gray"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
			</div>

			<div>Hug Outline</div>
			<div className="grid grid-cols-4 gap-2">
				<RadioButtonGroup
					groupingStyle="hug"
					buttonColor="primary"
					buttonStyle="outline"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="hug"
					buttonColor="secondary"
					buttonStyle="outline"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="hug"
					buttonColor="gray"
					buttonStyle="outline"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
			</div>

			<div>Gap Solid</div>
			<div className="grid grid-cols-4 gap-2">
				<RadioButtonGroup
					groupingStyle="gap"
					buttonColor="primary"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="gap"
					buttonColor="secondary"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="gap"
					buttonColor="gray"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
			</div>

			<div>Gap Outline</div>
			<div className="grid grid-cols-4 gap-2">
				<RadioButtonGroup
					groupingStyle="gap"
					buttonColor="primary"
					buttonStyle="outline"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="gap"
					buttonColor="secondary"
					buttonStyle="outline"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
				<RadioButtonGroup
					groupingStyle="gap"
					buttonColor="gray"
					buttonStyle="outline"
					options={[
						{ label: "A", value: "A" },
						{ label: "B", value: "B" },
						{ label: "C", value: "C" },
					]}
				/>
			</div>
		</div>
	)
}
