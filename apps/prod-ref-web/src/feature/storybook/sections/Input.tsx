import { Star } from "lucide-react"

import { Input } from "@rabbitswap/ui/basic"

export const SectionInput: React.FC = () => {
	return (
		<div className="grid w-full gap-2">
			<Input placeholder="Placeholder" />
			<Input placeholder="Placeholder" addonBefore={<Star className="size-4 fill-gray-300 text-gray-300" />} />
			<Input placeholder="Placeholder" error />
			<Input placeholder="Placeholder" loading />
			<Input placeholder="Placeholder" success />
			<Input placeholder="Placeholder" disabled />
		</div>
	)
}
