import { useMemo } from "react"

import { Button } from "@rabbitswap/ui/basic"

import { Link } from "@/router"
import { Position } from "@/types/position"
import { getUnwrapped, sortDisplayTokens } from "@/utils/token"

export const IncreaseLiquidity: React.FC<{
	position: Position
}> = ({ position }) => {
	const [quote, base] = useMemo(
		() => sortDisplayTokens([getUnwrapped(position.position.token0), getUnwrapped(position.position.token1)]),
		[position.position.token0, position.position.token1],
	)

	return (
		<Link
			to="/add/:currencyIdA/:currencyIdB/:feeAmount/:tokenId"
			params={{
				currencyIdA: quote.address,
				currencyIdB: base.address,
				feeAmount: position.position.fee.toString(),
				tokenId: position.position.tokenId.toString(),
			}}
			className="w-full"
		>
			<Button buttonColor="gray" className="w-full py-3">
				Increase Liquidity
			</Button>
		</Link>
	)
}
