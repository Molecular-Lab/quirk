import { useIsPoolOutOfSync } from "@/hooks/liquidity/useIsPoolOutOfSync"
import { Pool } from "@/types/pool"

import { OutOfSync } from "./OutOfSync"

interface LiquidityPoolWarningBoxProps {
	pool: Pool | null | undefined
}

export const LiquidityPoolWarningBox: React.FC<LiquidityPoolWarningBoxProps> = ({ pool }) => {
	const outOfSync: boolean = useIsPoolOutOfSync(pool?.token0Price)

	return <>{outOfSync && <OutOfSync />}</>
}
