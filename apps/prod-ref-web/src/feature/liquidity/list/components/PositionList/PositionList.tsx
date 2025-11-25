import { useMemo } from "react"

import { Button, Skeleton } from "@rabbitswap/ui/basic"
import { Eye, EyeOff } from "@rabbitswap/ui/icons"

import { PositionDetailInterface } from "@/types/position"

import { Empty } from "./Empty"
import { PositionListItem } from "./PositionListItem"

const POSITION_MOCK_ITEMS_COUNT = 5

interface PositionListProps {
	loading: boolean
	positions: PositionDetailInterface[] | undefined
	hideClosed: boolean
	toggleHideClosed: () => void
}

export const PositionList: React.FC<PositionListProps> = ({ loading, positions, hideClosed, toggleHideClosed }) => {
	const listItems = useMemo(() => {
		if (loading) {
			return (
				<div className="flex w-full flex-col gap-4">
					{Array.from({ length: POSITION_MOCK_ITEMS_COUNT }).map((_, i) => (
						<PositionListItem key={`loading-${i}`} isLoading={loading} tokenId={undefined} />
					))}
				</div>
			)
		}

		if (!positions || positions.length === 0) {
			return <Empty />
		}

		return (
			<div className="flex w-full flex-col gap-4">
				{positions.map((p) => (
					<PositionListItem isLoading={loading} key={p.tokenId.toString()} tokenId={p.tokenId} />
				))}
			</div>
		)
	}, [loading, positions])

	return (
		<>
			<div className="flex w-full flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-1.5">
					<div>Your positions</div>
					<Skeleton isLoading={loading} width={40}>
						({(positions ?? []).length})
					</Skeleton>
				</div>
				<Skeleton isLoading={loading} width={80}>
					<Button buttonType="text" buttonColor="primary" type="button" onClick={toggleHideClosed} className="p-0">
						{hideClosed ? (
							<>
								<Eye /> Show closed positions
							</>
						) : (
							<>
								<EyeOff /> Hide closed positions
							</>
						)}
					</Button>
				</Skeleton>
			</div>
			{listItems}
		</>
	)
}
