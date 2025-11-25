import ReactTimeAgo from "react-time-ago"

import { LimitOrderItem } from "@/feature/swap/limit/types"

export const ExpiryInfo: React.FC<{ order: LimitOrderItem | undefined }> = ({ order }) => {
	if (!order) {
		return <></>
	}

	return (
		<div className="flex flex-col">
			<ReactTimeAgo date={order.expiredAt.toDate()} />
			<div className="text-2xs text-gray-400 dark:text-gray-600">{order.expiredAt.format("MMM D, YYYY h:mm A Z")}</div>
		</div>
	)
}
