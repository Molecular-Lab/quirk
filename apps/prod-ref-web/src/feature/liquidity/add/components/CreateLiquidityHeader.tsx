import { PropsWithChildren } from "react"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@rabbitswap/ui/basic"

interface CreateLiquidityHeaderProps extends PropsWithChildren {
	title: string
}

export const CreateLiquidityHeader: React.FC<CreateLiquidityHeaderProps> = ({ title, children }) => {
	return (
		<div className="flex w-full flex-col gap-5">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/pools">Your positions</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{title}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<div className="flex w-full items-center justify-between text-xl font-medium lg:text-[32px]">
				<div className="flex w-full items-center">{children}</div>
			</div>
		</div>
	)
}
