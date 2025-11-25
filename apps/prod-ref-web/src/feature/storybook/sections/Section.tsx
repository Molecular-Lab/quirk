import { PropsWithChildren } from "react"

import { Header, Separator } from "@rabbitswap/ui/basic"

interface StorybookSectionProps extends PropsWithChildren {
	title: string
}

export const StorybookSection: React.FC<StorybookSectionProps> = ({ title, children }) => {
	return (
		<div className="mb-8 flex w-full flex-col gap-2">
			<Header className="w-full">{title}</Header>
			<Separator className="mb-2" />
			{children}
		</div>
	)
}
