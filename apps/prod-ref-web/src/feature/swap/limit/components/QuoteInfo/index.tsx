import { AnimatePresence } from "framer-motion"

import { RabbitSwap, Thunder } from "@rabbitswap/ui/icons"
import { cn } from "@rabbitswap/ui/utils"

import { AnimateHeight } from "@/components/Animate/AnimateHeight"
import { InfoItem } from "@/feature/swap/components/Info/InfoItem"
import { LimitOrderRate } from "@/feature/swap/components/Info/LimitOrderRate"
import { QuoteRoute } from "@/feature/swap/components/Info/QuoteRoute"
import { useLimitStore } from "@/feature/swap/limit/store/limitStore"

export type LimitQuoteInfoType = "RATE" | "EXPIRY" | "FEE" | "ROUTING"

export const LimitQuoteInfo: React.FC<{ types: LimitQuoteInfoType[] }> = ({ types }) => {
	return (
		<div className="flex w-full flex-col">
			<AnimatePresence initial={false}>
				{types.map((type) => (
					<AnimateHeight key={type}>
						<LimitInfoItem infoType={type} />
					</AnimateHeight>
				))}
			</AnimatePresence>
		</div>
	)
}

export const LimitInfoItem: React.FC<{ infoType: LimitQuoteInfoType }> = ({ infoType }) => {
	const {
		priceCondition,
		expiresAt,
		computed: { amountIn, amountOut },
	} = useLimitStore()

	switch (infoType) {
		case "RATE": {
			return (
				<InfoItem title="Limit Price">
					<LimitOrderRate price={priceCondition} />
				</InfoItem>
			)
		}

		case "EXPIRY": {
			return <InfoItem title="Expiry">{expiresAt.format("MMMM D, YYYY h:mm A Z")}</InfoItem>
		}

		case "FEE": {
			return (
				<>
					{/* <InfoItem
						title="Fee"
						tooltip="This fee is applied to selected token pairs to enhance the trading experience on Rabbit Swap. This fee is already included in the quoted amount provided."
					>
						{poolFee}
					</InfoItem> */}

					<InfoItem
						title="Network Cost"
						tooltip="The network fee for this transaction is sponsored by the protocol, so no additional cost will be incurred on your end."
					>
						<div className="flex items-center gap-0.5">
							<Thunder className="size-4" />
							Gas Sponsored
						</div>
					</InfoItem>
				</>
			)
		}

		case "ROUTING": {
			return (
				<InfoItem
					title="Order Routing"
					tooltipContentClassName={cn("max-w-[min(400px,95vw)]")}
					tooltip={
						<div className="flex min-w-[200px] flex-col gap-2">
							<QuoteRoute
								amountIn={amountIn}
								amountOut={amountOut}
								route={undefined}
								chainId={amountIn?.token.chainId}
							/>
						</div>
					}
				>
					<div className="flex items-center gap-1.5">
						<RabbitSwap className="size-4" />
						RabbitSwap API
					</div>
				</InfoItem>
			)
		}

		default: {
			return null
		}
	}
}
