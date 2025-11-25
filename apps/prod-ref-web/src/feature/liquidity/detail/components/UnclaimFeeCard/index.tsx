import React, { useState } from "react"

import { BigNumber as BigNumJs } from "bignumber.js"

import { Switch } from "@rabbitswap/ui/basic"

import { FeeRow } from "@/feature/liquidity/components"
import { useUsdPositionFee } from "@/hooks/liquidity/useUsdPositionFee"
import { useSwapChainId } from "@/hooks/useChainId"
import { Position } from "@/types/position"
import { TokenAmount } from "@/types/tokens"
import { formatFiatValue } from "@/utils/number"
import { getChainEvmToken } from "@/utils/token"

import { CollectFeeBtn } from "./CollectFeeBtn"

interface UnclaimedFeeCardProps {
	position: Position
	isPositionOwner: boolean
	quote: TokenAmount | undefined
	base: TokenAmount | undefined
}

export const UnclaimedFeeCard: React.FC<UnclaimedFeeCardProps> = ({ isPositionOwner, quote, base, position }) => {
	const chainId = useSwapChainId()
	const { native: nativeWrappedCurrency } = getChainEvmToken(chainId)

	const [receiveWETH, setReceiveWETH] = useState(false)
	const showCollectAsWeth = position.showCollectAsWeth

	const { total: unclaimedValue } = useUsdPositionFee(position.position.tokenId, chainId)

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-end justify-between">
				<div className="flex flex-col gap-2">
					<div>Unclaimed fees</div>
					<div className="text-2xl lg:text-[32px]">{formatFiatValue(unclaimedValue, { minPrecision: 6 })}</div>
				</div>
				{(unclaimedValue ?? BigNumJs(0)).gt(0) && quote && base && (
					<CollectFeeBtn
						disabled={!isPositionOwner}
						unclaimedValue={unclaimedValue ?? BigNumJs(0)}
						quote={quote.unwrapped}
						base={base.unwrapped}
						tokenId={position.position.tokenId}
						receiveWETH={receiveWETH}
					/>
				)}
			</div>
			<div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
				{quote && <FeeRow tokenAmount={receiveWETH ? quote : quote.unwrapped} tokenIconPosition="left" />}
				{base && <FeeRow tokenAmount={receiveWETH ? base : base.unwrapped} tokenIconPosition="left" />}
			</div>
			{showCollectAsWeth &&
				isPositionOwner &&
				((quote?.bigNumber.gt(0) ?? false) || (base?.bigNumber.gt(0) ?? false)) && (
					<div className="flex items-center justify-between">
						<div>Collect as {nativeWrappedCurrency.symbol}</div>
						<Switch checked={receiveWETH} onCheckedChange={setReceiveWETH} />
					</div>
				)}
		</div>
	)
}
