import { Dayjs } from "dayjs"

import { Skeleton } from "@rabbitswap/ui/basic"

export const TimestampDisplay: React.FC<{
	timestamp: Dayjs | undefined
	isLoading?: boolean
}> = ({ isLoading, timestamp }) => {
	return (
		<Skeleton isLoading={isLoading} width={120} className="text-2xs text-gray-600 dark:text-gray-400">
			{timestamp?.format("DD MMM YYYY HH:mm:ss")}
		</Skeleton>
	)
}
