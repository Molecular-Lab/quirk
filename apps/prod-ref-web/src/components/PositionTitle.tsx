import { PoolFeeBadge, PoolTitle } from "@/components/PoolTitle"
import { RangeBadge } from "@/components/RangeBadge"
import { Position } from "@/types/position"

export const PositionTitle: React.FC<{ position?: Position }> = ({ position }) => {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<PoolTitle currencyQuote={position?.quote} currencyBase={position?.base} feeRate={position?.pool.fee} />
				<PoolFeeBadge position={position} />
			</div>
			<RangeBadge positionState={position?.positionState} />
		</div>
	)
}
