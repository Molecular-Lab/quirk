import { Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"

export const SectionTooltip: React.FC = () => {
	return (
		<Tooltip className="w-fit">
			<TooltipTrigger>Hover me</TooltipTrigger>
			<TooltipContent>This is tooltip</TooltipContent>
		</Tooltip>
	)
}
