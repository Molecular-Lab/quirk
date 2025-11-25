import { PropsWithChildren } from "react"

import { BigNumber } from "@ethersproject/bignumber"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@rabbitswap/ui/basic"

import { TxSettingButton } from "@/feature/settings/TransactionSetting"

interface AddLiquidityHeaderProps extends PropsWithChildren {
	title: string
	tokenId?: BigNumber
}

export const AddLiquidityHeader: React.FC<AddLiquidityHeaderProps> = ({ title, children }) => {
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
				<div>{title}</div>
				<div className="flex items-center">
					{children}
					<TxSettingButton shorten />
				</div>
			</div>
		</div>
	)
}
