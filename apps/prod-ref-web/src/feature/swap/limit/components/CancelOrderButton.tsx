import { Trash2 } from "lucide-react"
import { isAddressEqual } from "viem"

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@rabbitswap/ui/basic"
import { shortenText } from "@rabbitswap/ui/utils"

import { useAccountMode } from "@/feature/sub-account/context"
import { useCancelOrderModalStore } from "@/feature/swap/limit/components/CancelOrderModal/store"
import { LimitOrderItem } from "@/feature/swap/limit/types"
import { useAccount } from "@/hooks/useAccount"

export const CancelOrderButton: React.FC<{ order: LimitOrderItem | undefined }> = ({ order }) => {
	const { accountMode } = useAccountMode()
	const { subAddress } = useAccount()

	const { onOpen } = useCancelOrderModalStore()

	if (accountMode !== "sub" || !order || (subAddress && !isAddressEqual(order.orderOwner, subAddress))) {
		return (
			<Tooltip>
				<TooltipTrigger>
					<Button buttonType="text" buttonColor="gray" disabled className="size-4 p-0 lg:size-5">
						<Trash2 strokeWidth={1.5} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{(() => {
						if (accountMode !== "sub")
							return (
								<>
									Please switch to trading account to cancel order <br /> Owner:{" "}
									{shortenText({ text: order?.orderOwner })}
								</>
							)
						if (!order) return "No order selected"
						if (subAddress && !isAddressEqual(order.orderOwner, subAddress)) {
							return (
								<>
									You are not the owner of this order <br /> Owner: {shortenText({ text: order.orderOwner })}
								</>
							)
						}
						return ""
					})()}
				</TooltipContent>
			</Tooltip>
		)
	}
	return (
		<Button
			buttonType="text"
			buttonColor="gray"
			className="size-4 p-0 lg:size-5"
			onClick={() => {
				onOpen({ order })
			}}
		>
			<Trash2 strokeWidth={1.5} />
		</Button>
	)
}
