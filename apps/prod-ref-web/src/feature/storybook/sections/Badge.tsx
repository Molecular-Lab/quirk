import { Badge } from "@rabbitswap/ui/basic"

export const SectionBadge: React.FC = () => {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex flex-wrap gap-2">
				<Badge variant="primary" type="solid">
					Badge
				</Badge>
				<Badge variant="secondary" type="solid">
					Badge
				</Badge>
				<Badge variant="error" type="solid">
					Badge
				</Badge>
				<Badge variant="warning" type="solid">
					Badge
				</Badge>
				<Badge variant="success" type="solid">
					Badge
				</Badge>
				<Badge variant="gray" type="solid">
					Badge
				</Badge>
			</div>
			<div className="flex flex-wrap gap-2">
				<Badge variant="primary" type="translucent">
					Badge
				</Badge>
				<Badge variant="secondary" type="translucent">
					Badge
				</Badge>
				<Badge variant="error" type="translucent">
					Badge
				</Badge>
				<Badge variant="warning" type="translucent">
					Badge
				</Badge>
				<Badge variant="success" type="translucent">
					Badge
				</Badge>
				<Badge variant="gray" type="translucent">
					Badge
				</Badge>
			</div>
		</div>
	)
}
