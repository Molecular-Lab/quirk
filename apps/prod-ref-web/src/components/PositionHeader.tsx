import { PropsWithChildren } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { ArrowLeft } from "lucide-react"

import { Button } from "@rabbitswap/ui/basic"
import { cn } from "@rabbitswap/ui/utils"

import { TxSettingButton } from "@/feature/settings/TransactionSetting"
import { useNavigate } from "@/router"

interface PositionHeaderProps extends PropsWithChildren {
	title: string
	tokenId?: BigNumber
}

export const PositionHeader: React.FC<PositionHeaderProps> = ({ title, children, tokenId }) => {
	const navigate = useNavigate()
	const handleNavigateBack = () => {
		if (history.length > 1) {
			void navigate(-1)
		} else {
			if (tokenId) {
				void navigate("/pools/:tokenId", { params: { tokenId: tokenId.toString() } })
				return
			}
			void navigate("/pools")
		}
	}

	return (
		<div className="relative flex h-10 items-center">
			<div className="flex w-full items-center justify-between">
				<Button buttonType="text" buttonColor="gray" className="p-0" onClick={handleNavigateBack}>
					<ArrowLeft />
					Back
				</Button>

				<div className="flex items-center">
					{children}
					<TxSettingButton shorten />
				</div>
			</div>

			<h1
				className={cn(
					"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
					"mx-auto whitespace-nowrap break-keep text-center text-2xl font-medium lg:text-[32px]",
				)}
			>
				{title}
			</h1>
		</div>
	)
}
