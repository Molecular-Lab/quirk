import { Button } from "@rabbitswap/ui/basic"

import { Link } from "@/router"
import { Position } from "@/types/position"

export const DecreaseLiquidity: React.FC<{
	position: Position
}> = ({ position }) => {
	return (
		<Link to="/remove/:tokenId" params={{ tokenId: position.position.tokenId.toString() }} className="w-full">
			<Button className="w-full py-3">Remove Liquidity</Button>
		</Link>
	)
}
