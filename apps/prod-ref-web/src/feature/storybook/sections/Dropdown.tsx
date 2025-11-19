import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@rabbitswap/ui/basic"

export const SectionDropdown: React.FC = () => {
	return (
		<Select>
			<SelectTrigger>
				<SelectValue placeholder="Dropdown placeholder" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem value="a">Option A</SelectItem>
					<SelectItem value="b">Option B</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	)
}
